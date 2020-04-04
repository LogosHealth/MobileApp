/// <reference types="aws-sdk" />
import { Injectable } from '@angular/core';
import * as AWSme from 'aws-sdk';
import * as AWS from 'aws-sdk';
import { NavController, Platform, AlertController } from 'ionic-angular';
import { WalkthroughPage } from '../../pages/walkthrough/walkthrough';
import { InAppBrowser } from '@ionic-native/in-app-browser';

var moment = require('moment-timezone');

var apigClientFactory = require('aws-api-gateway-client').default;
var profiles = [];
var results = [];
var cognitoIdentity;
var AuthData = {} as AuthData;
var currentProfile: number;
var userId: number;
var deviceUUID: string;
var refreshProfiles: Boolean;
var nav: NavController;
var alertCtrl: AlertController;
var notifyCount: number;
var subscriptionCount: number;

interface AuthData {
    key: string,
    email: string,
    cognitoId: string,
    accessKeyId: string,
    expiration: Date,
    secretKey: string,
    sessionToken:string,
    accessCode:string,
    accessToken:string,
    refreshToken:string
};

@Injectable()

export class RestService {
    public AuthData: AuthData;
    public AWSRestFactory:any;
    public AWS: any;
    public CognitoIdentity: any;
    public Profiles: any;
    public results: any;
    public currentProfile: number = 0;
    public refreshProfiles: Boolean = false;
    public nav: NavController;
    public alertCtrl: AlertController;
    public deviceUUID: string;
    public userId: number;
    public refreshParent: boolean = false;
    public notifyCount: number = 0;
    public subscriptionCount: number = 0;

    constructor(public iab: InAppBrowser, private platform: Platform) {
        this.AWS = AWSme;
        this.AWSRestFactory = apigClientFactory;
        this.Profiles = profiles;
        this.results = results;
        this.AuthData = AuthData;
        this.CognitoIdentity = cognitoIdentity;
        this.currentProfile = currentProfile;
        this.refreshProfiles = refreshProfiles;
        this.nav = nav;
        this.alertCtrl = alertCtrl;
        this.deviceUUID = deviceUUID;
        this.userId = userId;
        this.notifyCount = notifyCount;
        this.subscriptionCount = subscriptionCount;
    }

    getUserById (inputid) {
      var foundObj = false;
      //console.log("curUserObj currentProfile:" + this.currentProfile);
      //console.log("curUserObj profiles.length:" + this.Profiles.length);
      for (var j = 0; j < this.Profiles.length; j++) {
          if (this.Profiles[j].profileid == inputid) {
              foundObj = true;
              return this.Profiles[j];
          }
      }
      if (!foundObj) {
        return null;
      }
    }

    //Returns only real profiles
    getRealProfiles() {
      var realProfiles = [];

      for (var j = 0; j < this.Profiles.length; j++) {
        if (this.Profiles[j].issample == 'N') {
            realProfiles.push(this.Profiles[j]);
        }
      }
      return realProfiles;
    }

    curUserObj (callback) {
      var foundObj = false;
      //console.log("curUserObj currentProfile:" + this.currentProfile);
      //console.log("curUserObj profiles.length:" + this.Profiles.length);
      for (var j = 0; j < this.Profiles.length; j++) {
          if (this.Profiles[j].profileid == this.userId) {
              foundObj = true;
              callback(null, this.Profiles[j]);
          }
      }
      if (!foundObj) {
          callback('Current User Not Found', null);
      }
    }


    curProfileObj (callback) {
        var foundObj = false;
        //console.log("curProfileObj currentProfile:" + this.currentProfile);
        //console.log("curProfileObj profiles.length:" + this.Profiles.length);
        for (var j = 0; j < this.Profiles.length; j++) {
            if (this.Profiles[j].profileid == this.currentProfile) {
                foundObj = true;
                callback(null, this.Profiles[j]);
            }
        }
        if (!foundObj) {
            callback('No Active Profile', null);
        }
    }

    refreshCredentials(callback) {
      console.log('Refresh Credentials Test - Started!');
      const LWA_PROXY_REFRESH = "https://logoshealth.github.io/getRefresh.html";
      const LWA_PROXY_REFRESH_MOBILE = "https://logoshealth.github.io/getRefreshMobile.html";
      var self = this;
      var key;
      var urlSend;

      if (this.platform.is("core")) {
        var eventMethod = window.addEventListener ? "addEventListener" : "attachEvent";
        var eventer = window[eventMethod];
        var messageEvent = eventMethod == "attachEvent" ? "onmessage" : "message";
        // Listen to message from child window
        eventer(messageEvent,function(e) {
          key = e.message ? "message" : "data";
          var data = e[key];
          console.log('Event Handled!!! data = ', data);
          //console.log('Event Handled!!! event = ', e);
          console.log('Event Handled!!! event data ', e.data);
          var returnAuth = e.data;
          var jsonObject = JSON.parse(returnAuth);
          console.log('RestService refresh from Browser jsonObject', jsonObject);
          console.log('RestService refresh from Browser jsonObject.access_token', jsonObject.access_token);
          console.log('RestService refresh from Browser jsonObject.refresh_token', jsonObject.refresh_token);
          newWindow.close();
          var token = jsonObject.access_token;
          var refreshToken = jsonObject.refresh_token;
          if (token !== undefined && token !== null && token !== "") {
            self.AuthData.key = token;
            self.AuthData.refreshToken = refreshToken;
            console.log('Successfully set token from refresh token for Browser!!!' + token);

            key = self.AuthData.key;

            self.AWS.config.region = 'us-east-1';
            self.AWS.config.credentials = new AWS.CognitoIdentityCredentials({
              IdentityPoolId: 'us-east-1_CmQLhXc1P',
              Logins: {'www.amazon.com': key}
            });

            self.CognitoIdentity = new AWS.CognitoIdentity();
            var cognitoIdentity = self.CognitoIdentity;

            var params = {
              IdentityPoolId: 'us-east-1:7a457959-5bc7-4134-9370-a008ab517339', /* required */
              Logins: {'www.amazon.com': key}
            };
            cognitoIdentity.getId(params, function(err, data) {
              if (err) {
                console.log("cognitoidentity.getID error = " + err);
                alert ("Application time out - For your data protection, please login again.");
                callback('Error', null);
              } else {
               self.AuthData.cognitoId = data.IdentityId;
               //alert ("cognitoidentity.getID success = " + data.IdentityId ); // successful response

               var params2 = {
                 IdentityId: self.AuthData.cognitoId, /* required */
                 Logins: {'www.amazon.com': key}
               };
               cognitoIdentity.getCredentialsForIdentity(params2, function(err, data) {
                 if (err) {
                  console.log('Error in getCred: ' + err); // an error occurred
                  alert("Application time out - For your data protection, please login again."); // an error occurred
                  callback('Error', null);
                } else {
                  console.log('Browser Credentials Successfully Refreshed!!!');
                  self.AuthData.expiration = data.Credentials.Expiration;
                  self.AuthData.sessionToken = data.Credentials.SessionToken;
                  self.AuthData.accessKeyId = data.Credentials.AccessKeyId;
                  self.AuthData.secretKey = data.Credentials.SecretKey;
                  console.log('From Refresh Browser Credentials - Expiration: ' + self.AuthData.expiration);
                  callback(null, 'Success');
                 } // successful response
               });
             }
           });
          } else {
            alert('Refresh Token failure: ' + token); // an error occurred
            return false;
            //Put error handling Token access failure code -- goto app restart
          }
        },false);

        urlSend = LWA_PROXY_REFRESH + "?refresh_token=" + self.AuthData.refreshToken;
        console.log('Refresh URL for Browser: ' + urlSend);
        let newWindow = window.open(urlSend, 'LogosHealth Login Refresh', 'toolbar=no,status=no,menubar=no,scrollbars=no,resizable=no,left=10000, top=10000, width=10, height=10, visible=none');
        newWindow.focus();
      } else if (this.platform.is("android") || this.platform.is("ios")) {
        var readCount = 0;
        urlSend = LWA_PROXY_REFRESH_MOBILE + "?refresh_token=" + self.AuthData.refreshToken;
        const browser = this.iab.create(urlSend, '_blank');
        browser.hide();
        browser.on('loadstop').subscribe(e => {
          if (e.url.includes("access_token")) {
            browser.close();
            var token = self.getAccessToken(e.url);
            var refreshToken = self.getRefreshToken(e.url);
            if (token !== 'Error') {
              self.AuthData.key = token;
              self.AuthData.refreshToken = refreshToken;
              console.log('Successfully refreshed token for Android!!!' + token);
              var key = self.AuthData.key;
              self.AWS.config.region = 'us-east-1';
              self.AWS.config.credentials = new AWS.CognitoIdentityCredentials({
                IdentityPoolId: 'us-east-1_CmQLhXc1P',
                Logins: {'www.amazon.com': key}
              });
              self.CognitoIdentity = new AWS.CognitoIdentity();
              var cognitoIdentity = self.CognitoIdentity;
              var params = {
                IdentityPoolId: 'us-east-1:7a457959-5bc7-4134-9370-a008ab517339', /* required */
                Logins: {'www.amazon.com': key}
              };
              cognitoIdentity.getId(params, function(err, data) {
                if (err) {
                  console.log("cognitoidentity.getID error = " + err);
                  alert("Application time out - For your data protection, please login again."); // an error occurred
                  callback('Error', null);
                } else {
                 self.AuthData.cognitoId = data.IdentityId;
                 var params2 = {
                   IdentityId: self.AuthData.cognitoId, /* required */
                   Logins: {'www.amazon.com': key}
                 };
                 cognitoIdentity.getCredentialsForIdentity(params2, function(err, data) {
                   if (err) {
                    console.log('Error in getCred: ' + err); // an error occurred
                    alert("Application time out - For your data protection, please login again."); // an error occurred
                    callback('Error', null);
                  } else {
                    console.log('Browser Credentials Successfully Refreshed!!!');
                    self.AuthData.expiration = data.Credentials.Expiration;
                    self.AuthData.sessionToken = data.Credentials.SessionToken;
                    self.AuthData.accessKeyId = data.Credentials.AccessKeyId;
                    self.AuthData.secretKey = data.Credentials.SecretKey;
                    console.log('From Refresh Browser Credentials - Expiration: ' + self.AuthData.expiration);
                    callback(null, 'Success');
                   } // successful response
                 });
                }
              });
             } else {
              alert('There is an error in authenticating your account.  Please try again later. ' + e.url);
              return false;
            }
          } else {
            readCount = readCount + 1;
            console.log('Read Count for Token Refresh url change: ' + readCount);
            console.log('Current URL from read count: ' + e.url);
            //self.loading.dismiss();
          }
        });
      }
    }

  getAccessToken(url) {
    var startVal = url.indexOf("access_token=") + 13;
    var endVal = url.indexOf("&", startVal);
    var fragment = url.substring(startVal, endVal);
    if (fragment.substring(4, 7) == '%7C') {
      fragment = fragment.substring(0, 4) + '|' + fragment.substring(7);
      //alert('Access Token updated: ' + fragment);
    }
    console.log('URL from getAceessToken: ' + url);
    console.log('Fragment from getAceessToken: ' + fragment);
    if (fragment !== undefined && fragment !== null && fragment !== "") {
      return fragment;
    } else {
      return "Error";
    }
  }

  getRefreshToken(url) {
    var startVal = url.indexOf("refresh_token=") + 14;
      //var endVal = url.indexOf("&", startVal);
    var fragment = url.substring(startVal);
    if (fragment.substring(4, 6) == '%7C') {
      fragment = fragment.substring(0, 4) + '|' + fragment.substring(7);
      //alert('Refresh Token updated: ' + fragment);
    }
    console.log('URL from getRefreshToken: ' + url);
    console.log('Fragment from getRefreshToken: ' + fragment);
    return fragment;
  }

  public restart() {
    console.log('Need to login again!!! - Credentials expired');
    this.nav.setRoot(WalkthroughPage);
  }

  async appRestart() {
    //const shouldLeave = await this.messageTimeout();
    this.restart();
  }

  messageTimeout(): Promise<Boolean> {
      let resolveLeaving;
      const canLeave = new Promise<Boolean>(resolve => resolveLeaving = resolve);
      const alert = this.alertCtrl.create({
        title: 'User Session Expired',
        message: 'For your data security, please reauthenticate after one hour of inactivity.  Click OK to continue.',
        buttons: [
          {
            text: 'OK',
            handler: () => resolveLeaving(true)
          }
        ]
      });
      alert.present();
      return canLeave;
  }

  public refreshCheck() {
    var dtNow = moment(new Date());
    var dtExpiration = moment(this.AuthData.expiration);
    //var dtExpiration = dtNow;  //for testing
    var self = this;

    if (dtNow > dtExpiration) {
      this.refreshCredentials(function(err, results) {
        if (err) {
          console.log('Need to login again!!! - Credentials expired from refreshCheck');
          self.appRestart();
        } else {
          console.log('From refreshCheck - Credentials refreshed!');
        }
      });
    }
  }

  public accountInfoObj(callback) {
    var key = "";
    var email = "";
    var cognitoId = "";
    var accessKeyId = "";
    var expiration;
    var secretKey = "";
    var sessionToken = "";

    return {
      getKey   : function()  { return key; },
      setKey   : function(p) { if(p !== undefined) {key = p}; callback(key, email); },
      getEmail : function()  { return email; },
      setEmail : function(p) { if(p !== undefined) {email = p}; callback(key, email); },
      getCognitoId   : function()  { return cognitoId; },
      setCognitoId : function(p) { if(p !== undefined) {cognitoId = p};},
      getSessionToken   : function()  { return sessionToken; },
      setSessionToken : function(p) { if(p !== undefined) {sessionToken = p};},
      getAccessKeyId   : function()  { return accessKeyId; },
      setAccessKeyId : function(p) { if(p !== undefined) {accessKeyId = p};},
      getExpiration   : function()  { return expiration; },
      setExpiration : function(p) { if(p !== undefined) {expiration = p};},
      getSecretKey   : function()  { return secretKey; },
      setSecretKey : function(p) { if(p !== undefined) {secretKey = p};}
    };
  }
}
