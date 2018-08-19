import { Component } from '@angular/core';
import { NavController, NavParams, LoadingController } from 'ionic-angular';
import { FeedModel } from '../feed/feed.model';

import 'rxjs/Rx';

import { ListVaccinesModel } from './listVaccines.model';
import { ListVaccinesService } from './listVaccines.service';
import { RestService } from '../../app/services/restService.service';
import { FormVaccinesPage } from '../../pages/formVaccines/formVaccines';

var moment = require('moment-timezone');

@Component({
  selector: 'listVaccinesPage',
  templateUrl: 'listVaccines.html'
})
export class ListVaccinesPage {
  list2: ListVaccinesModel = new ListVaccinesModel();
  feed: FeedModel = new FeedModel();
  loading: any;
  resultData: any;

  constructor(
    public nav: NavController,
    public list2Service: ListVaccinesService,
    public navParams: NavParams,
    public RestService:RestService,
    public loadingCtrl: LoadingController
  ) {
    this.loading = this.loadingCtrl.create();
    this.feed.category = navParams.get('category');
  }

  ionViewWillEnter() {
    var dtNow = moment(new Date());
    var dtExpiration = moment(this.RestService.AuthData.expiration);

    if (dtNow < dtExpiration) {
      this.loading.present();
      this.loadData();  
    } else {
      console.log('Need to login again!!! - Credentials expired from listSleep');
      this.RestService.appRestart();
    }
  }

  loadData() {
    var restURL: string;

    restURL="https://ap6oiuyew6.execute-api.us-east-1.amazonaws.com/dev/VaccinesByProfile";
    
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
        self.RestService.refreshCheck();       
        self.loading.dismiss();
      });
    }).catch( function(result){
      self.RestService.refreshCheck();
      console.log(body);
    });
  }

  openRecord(recordId) {
    this.nav.push(FormVaccinesPage, { recId: recordId });
  }  
  
}
