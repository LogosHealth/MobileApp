import { Component } from '@angular/core';
import { NavController, NavParams, LoadingController } from 'ionic-angular';
import { FeedModel } from '../feed/feed.model';
import 'rxjs/Rx';
//import { ListAllergiesModel } from './listAllergies.model';
//import { ListAllergiesService } from './listAllergies.service';
import { RestService } from '../../app/services/restService.service';
import { MedicalEventModel } from '../../pages/listMedicalEvent/listMedicalEvent.model';
import { MedicalEventService } from '../../pages/listMedicalEvent/listMedicalEvent.service';

import { FormAllergyPage } from '../../pages/formAllergy/formAllergy';

var moment = require('moment-timezone');

@Component({
  selector: 'listExercisePage',
  templateUrl: 'listAllergies.html'
})
export class ListAllergiesPage {
  list2: MedicalEventModel = new MedicalEventModel();
  feed: FeedModel = new FeedModel();
  loading: any;
  resultData: any;
  noData: boolean = false;
  aboutProfile: any = null;

  constructor(
    public nav: NavController,
    public list2Service: MedicalEventService,
    public navParams: NavParams,
    public RestService:RestService,
    public loadingCtrl: LoadingController
  ) {
    this.feed.category = navParams.get('category');
    this.aboutProfile = navParams.get('aboutProfile');
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
          console.log('Need to login again!!! - Credentials expired from listAllergies');
          self.loading.dismiss();
          self.RestService.appRestart();
        } else {
          console.log('From listAllergies - Credentials refreshed!');
          self.loadData();
        }
      });
    }
  }

  loadData() {
    var restURL: string;

    if (this.feed.category.title == 'Allergies') {
      restURL="https://ap6oiuyew6.execute-api.us-east-1.amazonaws.com/dev/MedicalEventByProfile";
    }
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
    var additionalParams;

  if (this.aboutProfile !== undefined && this.aboutProfile !== null && this.aboutProfile > 0) {
    additionalParams = {
      queryParams: {
          profileid: this.aboutProfile,
          isAllergy: 'Y'
      }
    };
    console.log('listAllergy - Select View - about profileid: ' + this.aboutProfile);
  } else {
    additionalParams = {
      queryParams: {
          profileid: this.RestService.currentProfile,
          isAllergy: 'Y'
      }
    };
  }
    var body = '';
    var self = this;

    apigClient.invokeApi(params, pathTemplate, method, additionalParams, body)
    .then(function(result){
      self.RestService.results = result.data;
      self.list2Service
      .getData()
      .then(data => {
        if (self.RestService.results !== undefined && self.RestService.results[0] !== undefined && self.RestService.results[0].recordid !== undefined &&
          self.RestService.results[0].recordid > 0) {
            self.list2.items = self.RestService.results;
            self.noData = false;
            console.log("Results Data for Get Allergies: ", self.list2.items);
        } else {
          self.noData = true;
          console.log('Results from listAllergies.loadData', self.RestService.results);
        }
        self.loading.dismiss();
      });
    }).catch( function(result){
      console.log(result);
      self.noData = true;
      self.loading.dismiss();
      alert('There was an error retrieving this data.  Please try again later');
    });
  }

  openRecord(recordId) {
    console.log("Goto Form index: " + recordId);
    //console.log("Recordid from index: " + this.list2[recordId].recordid);
    this.nav.push(FormAllergyPage, { recId: recordId });
    //alert('Open Record:' + recordId);
  }

  addNew() {
    this.nav.push(FormAllergyPage);
  }

  formatDateTime(dateString) {
    return moment.utc(dateString).format('MMM DD YYYY');
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
