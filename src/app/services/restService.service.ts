/// <reference types="aws-sdk" />
import { Injectable } from '@angular/core';
import * as AWSme from 'aws-sdk';
import * as AWS from 'aws-sdk';
import { NavController, AlertController } from 'ionic-angular';
import { WalkthroughPage } from '../../pages/walkthrough/walkthrough';

var moment = require('moment-timezone');

var apigClientFactory = require('aws-api-gateway-client').default;
var profiles = [];
var results = [];
var cognitoIdentity;
var AuthData = {} as AuthData;
var currentProfile: number;
var refreshProfiles: Boolean;
var nav: NavController;
var alertCtrl: AlertController;

interface AccountProfile {
    profileid: number,
    accountid: number,
    firstname: string,
    lastname: string};

interface AuthData {
    key: string,
    email: string,
    cognitoId: string,
    accessKeyId: string, 
    expiration: Date,
    secretKey: string,
    sessionToken:string
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

    constructor() {
        this.AWS = AWSme;
        this.AWSRestFactory = apigClientFactory;
        this.Profiles = profiles;
        this.results = results;
        this.AuthData = AuthData;
        this.CognitoIdentity = cognitoIdentity;
        this.currentProfile = currentProfile
        this.refreshProfiles = refreshProfiles;
        this.nav = nav;
        this.alertCtrl = alertCtrl;
    }

    anyfunction() {
        console.log('testing');
    }

    curProfileObj (callback) {
        var foundObj = false;
        console.log("curProfileObj currentProfile:" + this.currentProfile);
        console.log("curProfileObj profiles.length:" + this.Profiles.length);
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

    refreshCredentials() {
        console.log('Refresh Credentials - Started!');                          
        console.log('Current key = ' + this.AuthData.key);                          
        console.log('Current email = ' + this.AuthData.email);                          
        //alert("ngOnInit begin");
        var self = this;
        var key = self.AuthData.key;
        var email = self.AuthData.email;
        if (key !== "" && email !=="") {
            self.AWS.config.region = 'us-east-1';        
            self.AWS.config.credentials = new AWS.CognitoIdentityCredentials({
                IdentityPoolId: 'us-east-1_CmQLhXc1P',
                Logins: {'www.amazon.com': key}
            });
            self.CognitoIdentity = new AWS.CognitoIdentity();
            var cognitoIdentity = self.CognitoIdentity;

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
           self.AuthData.cognitoId = data.IdentityId;
           //alert ("cognitoidentity.getID success = " + data.IdentityId ); // successful response

           var params2 = {
             IdentityId: self.AuthData.cognitoId, /* required */
             Logins: {'www.amazon.com': key}
           };
           cognitoIdentity.getCredentialsForIdentity(params2, function(err, data) {
             if (err) {
               alert('Error in getCred: ' + err); // an error occurred
             } else {
               self.AuthData.expiration = data.Credentials.Expiration;                   
               self.AuthData.sessionToken = data.Credentials.SessionToken;                                   
               self.AuthData.accessKeyId = data.Credentials.AccessKeyId;                                   
               self.AuthData.secretKey = data.Credentials.SecretKey;          
               console.log('From Refresh Credentials - Expiration: ' + self.AuthData.expiration);
             } // successful response
           });            
         }
       });        
     }
  }

    public restart() {
        console.log('Need to login again!!! - Credentials expired');
        this.nav.setRoot(WalkthroughPage);
    }

    async appRestart() {
        const shouldLeave = await this.messageTimeout(); 
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
        return canLeave
    }
   
  
  public refreshCheck() {
    var dtNow = moment(new Date());
    var dtExpiration = moment(this.AuthData.expiration);
    var dtDiff = dtExpiration.diff(dtNow, 'minutes');
    if (dtDiff < 30) {
        console.log('Calling Refresh Credentials dtDiff: ' + dtDiff + ' dtExp: ' + dtExpiration + ' dtNow: ' + dtNow);
        this.refreshCredentials();        
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