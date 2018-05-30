import { Component, Self } from '@angular/core';
import { NavController, NavParams, LoadingController } from 'ionic-angular';
import { FeedModel } from '../feed/feed.model';

import 'rxjs/Rx';

import { List2Model } from './list-2.model';
import { List2Service } from './list-2.service';
import { RestService } from '../../app/services/restService.service';

@Component({
  selector: 'list-2-page',
  templateUrl: 'list-2.html'
})
export class List2Page {
  list2: List2Model = new List2Model();
  feed: FeedModel = new FeedModel();
  loading: any;
  resultData: any;

  constructor(
    public nav: NavController,
    public list2Service: List2Service,
    public navParams: NavParams,
    public RestService:RestService,
    public loadingCtrl: LoadingController
  ) {
    this.loading = this.loadingCtrl.create();
    this.feed.category = navParams.get('category');
  }

  ionViewDidLoad() {
    this.loading.present();
    //this.loadData();
    
    this.list2Service
      .getData()
      .then(data => {
        this.list2.items = data.items;
        //alert('Allergy Response: ' + this.RestService.results);   
        //alert('Transfer to List Items: ' +  this.list2.items);   
       
        this.loading.dismiss();
      });
      
  }

  loadData() {
    //alert('Feed Category: ' + this.feed.category.title);
    //alert('Current Profile ID: ' + this.RestService.currentProfile);
    var restURL: string;

    if (this.feed.category.title == 'Allergies') {
      restURL="https://ap6oiuyew6.execute-api.us-east-1.amazonaws.com/dev/AllergiesByProfile";
    }
    //alert('RestURL: ' + restURL);
    
    var config = {
      invokeUrl: restURL,
      accessKey: this.RestService.AuthData.accessKeyId,
      secretKey: this.RestService.AuthData.secretKey,
      sessionToken: this.RestService.AuthData.sessionToken,
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
            profileid: this.RestService.currentProfile
        }
    };
    var body = '';
    var self = this;

    apigClient.invokeApi(params, pathTemplate, method, additionalParams, body)
    .then(function(result){
      self.RestService.results = result.data;
      self.list2Service
      .getData()
      .then(data => {
        self.list2.items = self.RestService.results;
        //alert('Allergy Response: ' + this.RestService.results);   
        //alert('Transfer to List Items: ' +  this.list2.items);   
       
        self.loading.dismiss();
      });
      
      //alert('Async Check from Invoke: ' + self.RestService.results);   
      
    }).catch( function(result){
        console.log(body);
    });

  }
}
