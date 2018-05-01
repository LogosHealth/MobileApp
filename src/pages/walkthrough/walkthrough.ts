/// <reference types="aws-sdk" />
import { Component, ViewChild, OnInit } from '@angular/core';
import { NavController, Slides, Platform } from 'ionic-angular';

import { LoginPage } from '../login/login';
import { SignupPage } from '../signup/signup';
import { AlertController } from 'ionic-angular';
import {Observable} from "rxjs/Observable";
import { TabsNavigationPage } from '../tabs-navigation/tabs-navigation';

import * as AWS from 'aws-sdk';
import { RestService } from '../../app/services/restService.service';
//var apigClientFactory = require('aws-api-gateway-client').default;

declare var window: any;
declare var amazon: any;
declare var response: any;
var accountInfo;

interface AccountProfile {
  profileid: number,
  accountid: number,
  firstname: string,
  lastname: string}

@Component({
  selector: 'walkthrough-page',
  templateUrl: 'walkthrough.html',
  //selector: 'app-root',
//  template: `
//      <ul *ngIf="AccountProfiles$ | async as profiles else noData">
//          <li *ngFor="let profile of profiles">
//              {{profle.profileId}}
//              {{profle.firstname}}
//          </li> 
//      </ul>
//      <ng-template #noData>No Data Available</ng-template>`
})

export class WalkthroughPage implements OnInit {

  AccountProfiles$: Observable<AccountProfile[]>;
  lastSlide = false;
  main_page: { component: any };

  @ViewChild('slider') slider: Slides;

  constructor(public nav: NavController, private platform: Platform, private alertCtrl: AlertController, 
    public RestService: RestService) {this.main_page = { component: TabsNavigationPage };

  }
  
  getProfiles () {
    var self = this;
    var email = accountInfo.getEmail();
    var token = accountInfo.getSessionToken();
    var accessKey = accountInfo.getAccessKeyId();
    var secretKey = accountInfo.getSecretKey(); 
    var cognitoId = accountInfo.getCognitoId();

    //alert("Token: " + token);
    //console.log("Token: " + token);
    //alert("AccessKey: " + accessKey);
    //console.log("AccessKey: " + accessKey);
    //alert("SecretKey: " + secretKey);
    //console.log("SecretKey: " + secretKey);
    //alert("Cognito ID: " + cognitoId);
    //console.log("Cognito ID: " + cognitoId);
        
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
//        headers: {
          //"x-api-key": accountInfo.getSessionToken()
          //'Access-Control-Allow-Methods':'DELETE,GET,HEAD,OPTIONS,PATCH,POST,PUT',
          //'Access-Control-Allow-Origin': '*',
          //'Access-Control-Allow-Headers':'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'
  //      },
        queryParams: {
            email: accountInfo.getEmail()
        }
    };
    var body = '';

    apigClient.invokeApi(params, pathTemplate, method, additionalParams, body)
    .then(function(result){
      //console.log(result.data);
      var resultData = JSON.stringify(result.data);
      self.RestService.Profiles = result.data;
      console.log('Body: ', resultData);   
      self.nav.setRoot(self.main_page.component);    

      //self.nav.push(LoginPage);

        //This is where you would put a success callback
    }).catch( function(result){
        console.log(body);
    });

    //this.goToLogin();
  }
  
  ngOnInit () {
    //alert("ngOnInit begin");
    var self = this;
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
        cognitoIdentity.getId(params, function(err, data) {
          if (err) {
            alert ("cognitoidentity.getID error = " + err); 
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
      amazon.Login.setClientId('amzn1.application-oa2-client.c2eaafa3f5d3482eb28d055d582f3b71');
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
    this.platform.ready().then(() => {
      var self = this;
      var options = { scope : 'profile', popup : 'false' };
      amazon.Login.authorize(options,function(response) {
        if ( response.error ) {
          alert('oauth error ' + response.error);
        } else {
          self.RestService.AuthData.key = response.access_token;
          accountInfo.setKey(response.access_token);
        }
        amazon.Login.retrieveProfile(response.access_token, function(response) {
          self.RestService.AuthData.email = response.profile.PrimaryEmail;
          accountInfo.setEmail(response.profile.PrimaryEmail);
        });
      });
    });

    //this.nav.push(LoginPage);
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
