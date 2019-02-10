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
import { HttpClient} from '@angular/common/http';

//import { CodeBuild } from 'aws-sdk';

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
  lwaWindow: Window;
  ignore: boolean = false;
  formName: string = "walkthrough";

  @ViewChild('slider') slider: Slides;

  constructor(public nav: NavController, private platform: Platform, private alertCtrl: AlertController, public loadingCtrl: LoadingController, public iab: InAppBrowser,
    public modalCtrl: ModalController, private device: Device, private http: HttpClient, public RestService: RestService)
    {this.main_page = { component: TabsNavigationPage };
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
      this.RestService.Profiles[i].imageURL = './assets/images/listing/Family/300x300AddImageWithText.jpg';
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
            self.RestService.Profiles[keyArray[results.key]].imageURL = './assets/images/listing/Family/300x300AddImageWithText.jpg';
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
    console.log('Str Key from getPicURL ' + strKey);
    var params = {Bucket: 'logoshealthuserdata', Key: strKey, Expires: 3600};

    s3.getSignedUrl('getObject', params, function (err, url) {
      if (err) {
        console.log('Str Key from getPicURL2 ' + strKey);
        console.log('Err in getSignedUrl from getUserPics for strKey ' + strKey + ', ' + err);
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

  checkHash(event) {
    console.log("from Check Hash: Window - ", this.lwaWindow);
    console.log("event from checkHash", event);
  }

  public login() {
    const LWA_PROXY = "https://logoshealth.github.io";
    const LWA_PROXY_AT = "https://logoshealth.github.io/getAT.html";
    const LWA_PROXY_AT_MOBILE = "https://logoshealth.github.io/getATMobile.html";
    const LWA_PROXY_RETURN = "https://logoshealth.github.io/complete.html";
    //const LWA_CLIENT = "amzn1.application-oa2-client.b7a978f5efc248a098d2c0588dfb8392";
    var atURL;

    alert('Welcome to LogosHealth!  Internal Release v0.0.19');
    //console.log("Starting Login Process v100");
    //console.log("Platforms:" + this.platform.platforms());
    this.platform.ready().then(() => {
      var self = this;
      //var options = { scope : 'profile', popup : 'false', response_type: 'code' };
      this.presentLoadingDefault();
      if (this.platform.is("core")) {
        console.log('Moving to authorize v100');
        var eventMethod = window.addEventListener ? "addEventListener" : "attachEvent";
        var eventer = window[eventMethod];
        var messageEvent = eventMethod == "attachEvent" ? "onmessage" : "message";
        var firstLoopDone = false;
        // Listen to message from child window
        eventer(messageEvent,function(e) {
         if(!self.ignore) {
          var key = e.message ? "message" : "data";
          var data = e[key];
          console.log('Event Handled!!! data = ', data);
          //console.log('Event Handled!!! event = ', e);
          console.log('Event Handled!!! event data ', e.data);
          if (!firstLoopDone) {
            var LWAcodeURL = e.data;
            var LWAcode = self.getCode(LWAcodeURL);
            console.log('LWA CODE '+ LWAcode);
            newWindow.close();
            atURL = LWA_PROXY_AT + "?code=" + LWAcode;
            console.log('var atURL: ' + atURL);
            let newWindow2 = window.open(atURL, 'LogosHealth Login with Amazon', "menubar=1,resizable=1,width=660px,height=390px,top=0,left=0");
            self.lwaWindow = newWindow2;
            newWindow2.focus();
            firstLoopDone = true;
          } else {
            self.lwaWindow.close();
            self.ignore = true;
            //messageEvent = eventMethod == "detachEvent" ? "onmessage" : "message";
            //eventMethod = window.removeEventListener ? "addEventListener" : "attachEvent";
            var returnAuth = e.data;
            var jsonObject = JSON.parse(returnAuth);
            console.log('jsonObject', jsonObject);
            console.log('jsonObject.access_token', jsonObject.access_token);
            console.log('jsonObject.refresh_token', jsonObject.refresh_token);
            var token = jsonObject.access_token;
            var refreshToken = jsonObject.refresh_token;
            if (token !== undefined && token !== null && token !== "") {
              self.RestService.AuthData.accessToken = token;
              self.RestService.AuthData.refreshToken = refreshToken;
              console.log('Successfully set token for Browser!!!' + token);
              accountInfo.setKey(token);
              amazon.Login.retrieveProfile(token, function(response) {
                console.log('Response from android amazon.login: ', response);
                self.RestService.AuthData.email = response.profile.PrimaryEmail;
                accountInfo.setEmail(response.profile.PrimaryEmail);
              });
            } else {
              console.log('Token error');
              alert('There is an error in authenticating your account.  Please try again later.');
              self.loading.dismiss();
            }

          }
        }
        },false);

        let newWindow = window.open(LWA_PROXY, 'LogosHealth Login with Amazon', "menubar=1,resizable=1,width=660px,height=390px,top=0,left=0");
        this.lwaWindow = newWindow;
        newWindow.focus();

      } else if (this.platform.is("android")) {
        console.log('Calling AmazonLoginPlugin from Android v100');
        //const LWA_CLIENT = "amzn1.application-oa2-client.b7a978f5efc248a098d2c0588dfb8392";
        //const LWA_PROXY = "https://logoshealth.github.io";
        //const LWA_PROXY_AT = "https://logoshealth.github.io/getAT.html";
        //const LWA_PROXY_RETURN = "https://logoshealth.github.io/complete.html";
        const browser = this.iab.create(LWA_PROXY, '_blank');

        browser.on('loadstop').subscribe(e => {
          //alert('LoadStop from Browser called');
          if (e.url.includes(LWA_PROXY_RETURN)) {
            //browser.close();
            if (e.url.includes(LWA_PROXY_RETURN)) {
              var code = self.getCode(e.url);
              var atURL = LWA_PROXY_AT_MOBILE + "?code=" + code;
              var readCount = 0;
              const browser2 = self.iab.create(atURL, '_blank');

              browser2.on('loaderror').subscribe(e => {
                console.log('Error Loading Final Auth Window ', e);
                alert('Error Loading Final Auth Window ' + e.message);
              });

              browser2.on('loadstop').subscribe(e => {
                  //alert("url from final auth android: " + e.url);
                  if (e.url.includes("access_token")) {
                    browser2.close();
                    var token = self.getAccessToken(e.url);
                    var refreshToken = self.getRefreshToken(e.url);
                    if (token !== 'Error') {
                      self.RestService.AuthData.accessToken = token;
                      self.RestService.AuthData.refreshToken = refreshToken;
                      console.log('Successfully set token for Android!!!' + token);
                      accountInfo.setKey(token);
                      amazon.Login.retrieveProfile(token, function(response) {
                        console.log('Response from android amazon.login: ', response);
                        self.RestService.AuthData.email = response.profile.PrimaryEmail;
                        accountInfo.setEmail(response.profile.PrimaryEmail);
                      });
                    } else {
                      alert('There is an error in authenticating your account.  Please try again later. ' + e.url);
                      alert('Token error');
                      self.loading.dismiss();
                    }
                  } else {
                    readCount = readCount + 1;
                    console.log('Read Count for Final url change: ' + readCount);
                    //self.loading.dismiss();
                  }
              });

            } else {
              alert('Error in first level authentication return for Android');
              self.loading.dismiss();
            }
          }
       });
      }
    });
  }

  handleReturnedHash(hashVal, valType) {
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

    if (!(valType in vals)) {
      console.log('No ' + valType + ' in handleReturnedHash');
      return "Error";
    } else {
      return vals[valType];
    }
  }

  getCode(url) {
    var startVal = url.indexOf("code=") + 5;
    var endVal = url.search("&");
    var fragment = url.substring(startVal, endVal);
    console.log('URL from getCode: ' + url);
    console.log('Fragment from getCode: ' + fragment);
    return fragment;
  }

  getAccessToken(url) {
    var startVal = url.indexOf("access_token=") + 13;
    var endVal = url.indexOf("&", startVal);
    var fragment = url.substring(startVal, endVal);
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
    console.log('URL from getRefreshToken: ' + url);
    console.log('Fragment from getRefreshToken: ' + fragment);
    return fragment;
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

  presentLoadingDefault() {
    this.loading = this.loadingCtrl.create({
    spinner: 'hide',
    content: `
      <div class="custom-spinner-container">
        <div class="custom-spinner-box">
           <img src="assets/images/stickManCursor3.gif" width="50" height="50" />
           Loading...
        </div>
      </div>`,
    });

    this.loading.present();

    setTimeout(() => {
      this.loading.dismiss();
      //console.log('Timeout for spinner called ' + this.formName);
    }, 100000);
  }

}
