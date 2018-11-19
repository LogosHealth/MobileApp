/// <reference types="aws-sdk" />
import { Component, ViewChild, OnInit } from '@angular/core';
import { NavController, Slides, Platform, LoadingController, ModalController } from 'ionic-angular';
import { InAppBrowser } from '@ionic-native/in-app-browser';
import { Device } from '@ionic-native/device';

import { FormChooseProfile } from '../formChooseProfile/formChooseProfile'
import { LoginPage } from '../login/login';
import { SignupPage } from '../signup/signup';
import { AlertController } from 'ionic-angular';
import {Observable} from "rxjs/Observable";
import { TabsNavigationPage } from '../tabs-navigation/tabs-navigation';

import * as AWS from 'aws-sdk';
import { RestService } from '../../app/services/restService.service';

declare var window: any;
declare var amazon: any;
//declare const AmazonLoginPlugin: any;
var accountInfo;

interface AccountProfile {
  profileid: number,
  accountid: number,
  firstname: string,
  lastname: string}

@Component({
  selector: 'walkthrough-page',
  templateUrl: 'walkthrough.html',
})

export class WalkthroughPage implements OnInit {

  AccountProfiles$: Observable<AccountProfile[]>;
  lastSlide = false;
  loading: any;
  main_page: { component: any };

  @ViewChild('slider') slider: Slides;

  constructor(public nav: NavController, private platform: Platform, private alertCtrl: AlertController, public loadingCtrl: LoadingController, public iab: InAppBrowser,
    public modalCtrl: ModalController, private device: Device, public RestService: RestService) {this.main_page = { component: TabsNavigationPage };

  }

  getProfiles () {
    var self = this;
    var email = accountInfo.getEmail();
    var token = accountInfo.getSessionToken();
    var accessKey = accountInfo.getAccessKeyId();
    var secretKey = accountInfo.getSecretKey();
    //var cognitoId = accountInfo.getCognitoId();

    var config = {
      invokeUrl: "https://ap6oiuyew6.execute-api.us-east-1.amazonaws.com/dev/GetProfilesByEmail",
      accessKey: accessKey,
      secretKey: secretKey,
      sessionToken: token,
      region:'us-east-1'
    };
    var apigClient = this.RestService.AWSRestFactory.newClient(config);
    var params = {
      //email: accountInfo.getEmail()
    };
    var pathTemplate = '';
    var method = 'GET';
    var additionalParams = {
        queryParams: {
            email: email
        }
    };
    var body = '';

    apigClient.invokeApi(params, pathTemplate, method, additionalParams, body)
    .then(function(result){
      //console.log(result.data);
      var resultData = JSON.stringify(result.data);
      self.RestService.Profiles = result.data;
      console.log('Get Profiles results: ', resultData);
      if (self.RestService.Profiles == undefined || self.RestService.Profiles == null || self.RestService.Profiles.length == 0 ) {
        console.log('Need to add create new user here.');
        //*********************ADD CREATE USER ******************************/

      } else {
        self.getUserPics();
      }
    }).catch( function(result){
        alert('There is an error retrieving your information.  Technical support has been notified.  Please try again later');
        console.log('Get Profiles error results: ', result);
    });
  }


 getUserPics() {
  var blnHasPics = false;
  var params;
  var strKey;
  var profCount;
  var profActual = 0;
  var self;

  console.log('Begin getUserPics');
  for (var i = 0; i < this.RestService.Profiles.length; i++) {
    if (this.RestService.Profiles[i].image == 'AWS') {
      blnHasPics = true;
    } else {
      this.RestService.Profiles[i].imageURL = this.RestService.Profiles[i].image;
    }
  }

  if (blnHasPics) {
    var bucketRegion = 'us-east-1';
    var keyArray = [];

    this.RestService.AWS.config.update({
      region: bucketRegion,
      accessKeyId: accountInfo.getAccessKeyId(),
      secretAccessKey: accountInfo.getSecretKey(),
      sessionToken: accountInfo.getSessionToken(),
    });

    profCount = this.RestService.Profiles.length;
    self = this;
    for (var i = 0; i < this.RestService.Profiles.length; i++) {
      if (this.RestService.Profiles[i].image == 'AWS') {
        strKey = this.RestService.Profiles[i].accountid + "/" + this.RestService.Profiles[i].profileid + "/profilepic.jpeg";
        keyArray[strKey] = i;
        console.log('Str Key for profile: ' + this.RestService.Profiles[i].title + ', id - ' + this.RestService.Profiles[i].profileid + ' is ' + strKey);
        this.getPicURL(strKey, function(err, results) {
          if (err) {
            profActual = profActual + 1;
            if (profActual == profCount) {
              self.checkUserCount();
            } else {
              console.log('getUserPics getURL loop3 (err loop) - profActual = ' + profActual + ', profCount = ' + profCount);
            }
          } else {
            self.RestService.Profiles[keyArray[results.key]].imageURL = results.url;
            //alert('Get URL: ' + results.url);
            profActual = profActual + 1;
            if (profActual == profCount) {
              self.checkUserCount();
            } else {
              console.log('getUserPics getURL loop1  - profActual = ' + profActual + ', profCount = ' + profCount);
            }
          }
        });
      } else {
        profActual = profActual + 1;
        if (profActual == profCount) {
          this.checkUserCount();
        } else {
          console.log('getUserPics getURL loop2  - profActual = ' + profActual + ', profCount = ' + profCount);
        }
      }
    }
  } else {
    this.checkUserCount();
  }

 }

  getPicURL(strKey, callback) {
    var returnObj;

    const s3 = new this.RestService.AWS.S3();

    var params = {Bucket: 'logoshealthuserdata', Key: strKey, Expires: 3600};

    s3.getSignedUrl('getObject', params, function (err, url) {
      if (err) {
        console.log('Err in getSignedUrl from getUserPics: ' + err);
        callback(err, null);
      } else {
        returnObj = {
          key: strKey,
          url: url,
        }
        callback(null, returnObj);
      }
    });
  }

 checkUserCount() {
   if (this.RestService.Profiles.length > 1) {
    this.getUser();
  } else {
    this.RestService.userId = this.RestService.Profiles[0].profileid;
    console.log('Only one user for account: setting as default');
    this.nav.setRoot(this.main_page.component);
    this.loading.dismiss();
  }
 }


  getUser() {
    var self = this;
    var token = accountInfo.getSessionToken();
    var accessKey = accountInfo.getAccessKeyId();
    var secretKey = accountInfo.getSecretKey();

    var uuid = this.device.uuid;
    console.log('Device: ', this.device);
    if (uuid == null) {
      uuid = 'Testing';
    }
    this.RestService.deviceUUID = uuid;
    console.log('GetUser deviceid: ' + this.RestService.deviceUUID);

    var config = {
      invokeUrl: "https://ap6oiuyew6.execute-api.us-east-1.amazonaws.com/dev/UserByDevice",
      accessKey: accessKey,
      secretKey: secretKey,
      sessionToken: token,
      region:'us-east-1'
    };
    var apigClient = this.RestService.AWSRestFactory.newClient(config);
    var params = {
      //email: accountInfo.getEmail()
    };
    var pathTemplate = '';
    var method = 'GET';
    var additionalParams = {
        queryParams: {
            accountid: this.RestService.Profiles[0].accountid,
            deviceid: uuid
        }
    };
    var body = '';

    apigClient.invokeApi(params, pathTemplate, method, additionalParams, body)
    .then(function(result){
      //console.log(result.data);
      var resultData = JSON.stringify(result.data);
      //console.log('Default User ID for device: ', result);
      if (result.data.result !== 'No user selected') {
        self.RestService.userId = result.data.result;
        self.nav.setRoot(self.main_page.component);
        self.loading.dismiss();
      } else {
        self.getDefaultUser();
      }
    }).catch( function(result){
      console.log('Get User error results: ', result);
    });
  }

  getDefaultUser() {
    let profileModal = this.modalCtrl.create(FormChooseProfile);

    profileModal.onDidDismiss(data => {
      console.log('Data from getDefaultUser: ', data);
      if (this.RestService.userId !== undefined && this.RestService.userId !== null && this.RestService.userId > 0) {
        this.nav.setRoot(this.main_page.component);
        this.loading.dismiss();
      } else {
        alert('Error in setting getDefaultUser');
        this.loading.dismiss();
      }
    });

    profileModal.present();
  }

  ngOnInit() {
    //alert("ngOnInit begin");
    this.RestService.nav = this.nav;
    this.RestService.alertCtrl = this.alertCtrl;
    var self = this;
    console.log("Starting Walkthrough ngOnInit");

    accountInfo = this.accountInfoObj(function(key, email) {
      if (key !== "" && email !=="") {
        self.RestService.AWS.config.region = 'us-east-1';
        self.RestService.AWS.config.credentials = new AWS.CognitoIdentityCredentials({
            IdentityPoolId: 'us-east-1_CmQLhXc1P',
            Logins: {'www.amazon.com': key}
        });
        self.RestService.CognitoIdentity = new AWS.CognitoIdentity();
        var cognitoIdentity = self.RestService.CognitoIdentity;

        var params = {
          IdentityPoolId: 'us-east-1:7a457959-5bc7-4134-9370-a008ab517339', /* required */
          //AccountId: 'STRING_VALUE',
          Logins: {'www.amazon.com': key}
        };
        //alert ("params = " + params.Logins["www.amazon.com"]);
        console.log("params = " + params.Logins["www.amazon.com"]);
        cognitoIdentity.getId(params, function(err, data) {
          if (err) {
            alert ("cognitoidentity.getID error = " + err);
            self.loading.dismiss();
          } else {
            accountInfo.setCognitoId(data.IdentityId);
            self.RestService.AuthData.cognitoId = data.IdentityId;
            //alert ("cognitoidentity.getID success = " + data.IdentityId ); // successful response

            var params2 = {
              IdentityId: accountInfo.getCognitoId(), /* required */
              Logins: {'www.amazon.com': key}
            };
            cognitoIdentity.getCredentialsForIdentity(params2, function(err, data) {
              if (err) {
                alert('Error in getCred: ' + err); // an error occurred
              } else {
                accountInfo.setExpiration(data.Credentials.Expiration);
                self.RestService.AuthData.expiration = data.Credentials.Expiration;
                accountInfo.setSessionToken(data.Credentials.SessionToken);
                self.RestService.AuthData.sessionToken = data.Credentials.SessionToken;
                accountInfo.setAccessKeyId(data.Credentials.AccessKeyId);
                self.RestService.AuthData.accessKeyId = data.Credentials.AccessKeyId;
                accountInfo.setSecretKey(data.Credentials.SecretKey);
                self.RestService.AuthData.secretKey = data.Credentials.SecretKey;

                //alert('Expiration: ' +  accountInfo.getExpiration());
                //alert('Success in getCred Session Token: ' + data.Credentials.SessionToken);
                self.getProfiles();
              } // successful response
            });
          }
        });
      }
    });
    window.onAmazonLoginReady = function() {
      amazon.Login.setClientId('amzn1.application-oa2-client.b7a978f5efc248a098d2c0588dfb8392');
      console.log("In Window.onAmazonLoginReady");
    };
    (function(d) {
      var a = d.createElement('script'); a.type = 'text/javascript';
      a.async = true; a.id = 'amazon-login-sdk';
      a.src = 'https://api-cdn.amazon.com/sdk/login1.js';
      d.getElementById('amazon-root').appendChild(a);
    })(document);
  }

  skipIntro() {
    // You can skip to main app
    // this.nav.setRoot(TabsNavigationPage);

    // Or you can skip to last slide (login/signup slide)
    this.lastSlide = true;
    this.slider.slideTo(this.slider.length());
  }

  onSlideChanged() {
    // If it's the last slide, then hide the 'Skip' button on the header
    this.lastSlide = this.slider.isEnd();
  }

  goToLogin() {
    this.nav.push(LoginPage);
  }

  goToSignup() {
    this.nav.push(SignupPage);
  }

  public login() {
    console.log("Starting Login Process v100");
    console.log("Platforms:" + this.platform.platforms());
    this.platform.ready().then(() => {
      var self = this;
      var options = { scope : 'profile', popup : 'false' };
      self.loading = self.loadingCtrl.create();
      self.loading.present();
      console.log('Moving to authorize v100');
      if (this.platform.is("core")) {
        amazon.Login.authorize(options,function(response) {
          if ( response.error ) {
            alert('oauth error ' + response.error);
            self.loading.dismiss();
          } else {
            console.log('Successfully authorized: ', response);
            self.RestService.AuthData.key = response.access_token;
            accountInfo.setKey(response.access_token);
            amazon.Login.retrieveProfile(response.access_token, function(response) {
              console.log('Response from web amazon.login: ', response);
              self.RestService.AuthData.email = response.profile.PrimaryEmail;
              accountInfo.setEmail(response.profile.PrimaryEmail);
            });
          }
        });
      } else if (this.platform.is("android")) {
        var options = { scope : 'profile', popup : 'false' };
        console.log('Calling AmazonLoginPlugin from Android v100');
        //const LWA_CLIENT = "amzn1.application-oa2-client.b7a978f5efc248a098d2c0588dfb8392";
        const LWA_PROXY = "https://logoshealth.github.io";
        const LWA_PROXY_RETURN = "https://logoshealth.github.io/complete.html";

        const browser = this.iab.create(LWA_PROXY, '_blank');
        browser.on('loadstop').subscribe(e => {
          if (e.url.includes(LWA_PROXY_RETURN)) {
            browser.close();
            if (e.url.includes(LWA_PROXY_RETURN)) {
              var token = this.handleReturnedHash(e.url);
              if (token !== 'Error') {
                token = token.replace("%7C", "|");
                console.log('Successfully set token for Android!!!' + token);
                accountInfo.setKey(token);
                amazon.Login.retrieveProfile(token, function(response) {
                  console.log('Response from android amazon.login: ', response);
                  self.RestService.AuthData.email = response.profile.PrimaryEmail;
                  accountInfo.setEmail(response.profile.PrimaryEmail);
                });

/*
                const getProfileURL = "https://api.amazon.com/user/profile?access_token=" + token;
                const browser2 = this.iab.create( getProfileURL, '_blank', "hidden=yes");
                browser2.on('loadstop').subscribe(e => {
                  if (e.url.includes("email")) {
                    browser.close();
                  }
                });
                accountInfo.setEmail("anaerobicbug@hotmail.com");
*/

              } else {
                console.log('Token error');
                self.loading.dismiss();
              }
            }
          }
       });
      }
    });
  }

  handleReturnedHash(hashVal) {
    var fragment = hashVal.split("#");
    console.log('Fragment from handleReturnedHash: ' + fragment);
    if (fragment.length < 2) {
      return "Error";
    }
    var valarray = fragment[1].split('&');
    var vals = [];
    valarray.forEach(function (valpair, index, array) {
      var subvals = valpair.split('=');
      vals[subvals[0]] = subvals[1];
    });

    if (!("access_token" in vals)) {
      console.log('No Access Token in handleReturnedHash');
      return "Error";
    } else {
      return vals["access_token"];
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
