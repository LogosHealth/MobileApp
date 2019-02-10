import { Component } from '@angular/core';
import { NavController, NavParams, LoadingController } from 'ionic-angular';
import { FeedModel } from '../feed/feed.model';
import 'rxjs/Rx';
import { ListVaccinesModel } from './listVaccines.model';
import { ListVaccinesService } from './listVaccines.service';
import { RestService } from '../../app/services/restService.service';
import { FormVaccinesPage } from '../../pages/formVaccines/formVaccines';
import { ListContactModel } from '../../pages/listContacts/listContacts.model';
import { ListContactService } from '../../pages/listContacts/listContacts.service';

var moment = require('moment-timezone');

@Component({
  selector: 'listExercisePage',
  templateUrl: 'listVaccines.html'
})
export class ListVaccinesPage {
  list2: ListVaccinesModel = new ListVaccinesModel();
  feed: FeedModel = new FeedModel();
  loading: any;
  resultData: any;
  listContacts: ListContactModel = new ListContactModel();

  constructor(
    public nav: NavController,
    public list2Service: ListVaccinesService,
    public listContactService: ListContactService,
    public navParams: NavParams,
    public RestService:RestService,
    public loadingCtrl: LoadingController
  ) {
    this.feed.category = navParams.get('category');
  }

  ionViewWillEnter() {
    var dtNow = moment(new Date());
    var dtExpiration = moment(this.RestService.AuthData.expiration);
    var self = this;

    if (dtNow < dtExpiration) {
      this.presentLoadingDefault();
      this.loadData();
    } else {
      this.presentLoadingDefault();
      this.RestService.refreshCredentials(function(err, results) {
        if (err) {
          console.log('Need to login again!!! - Credentials expired from listVaccines');
          self.loading.dismiss();
          self.RestService.appRestart();
        } else {
          console.log('From listVaccines - Credentials refreshed!');
          self.loadData();
        }
      });
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
        self.loadContacts();
      });
    }).catch( function(result){
      console.log(body);
      self.loading.dismiss();
    });
  }

  loadContacts() {
    var restURL: string;
    restURL="https://ap6oiuyew6.execute-api.us-east-1.amazonaws.com/dev/ContactByProfile";
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
            profileid: this.RestService.currentProfile,
            contacttype: "doctor"
        }
    };
    var body = '';
    var self = this;
    var contacts = [];

    apigClient.invokeApi(params, pathTemplate, method, additionalParams, body)
    .then(function(result){
      contacts = result.data;
      self.listContactService
      .getData()
      .then(data => {
        self.listContacts.items = contacts;
        self.loading.dismiss();
      });
    }).catch( function(result){
      console.log(body);
      self.loading.dismiss();
    });
  }

  getName(contactid) {
    if(this.listContacts.items !== undefined) {
      for (var j = 0; j < this.listContacts.items.length; j++) {
        if (this.listContacts.items[j].recordid == contactid) {
          return this.listContacts.items[j].title;
        }
      }
    } else {
      return null;
    }
  }

  openRecord(recordId) {
    this.nav.push(FormVaccinesPage, { recId: recordId });
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
    }, 15000);
  }

}
