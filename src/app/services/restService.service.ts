/// <reference types="aws-sdk" />
import { Injectable } from '@angular/core';
import * as AWSme from 'aws-sdk';
import { AwsManagedPolicy } from 'aws-sdk/clients/organizations';
//import { AuthInfo } from 'aws-sdk/clients/iot';
var apigClientFactory = require('aws-api-gateway-client').default;
var profiles = [];
var cognitoIdentity;
var AuthData = {} as AuthData;

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

    constructor() {
        this.AWS = AWSme;
        this.AWSRestFactory = apigClientFactory;
        this.Profiles = profiles;
        this.AuthData = AuthData;
        this.CognitoIdentity = cognitoIdentity;
    }

    anyfunction() {
        console.log('testing');
    }

}    