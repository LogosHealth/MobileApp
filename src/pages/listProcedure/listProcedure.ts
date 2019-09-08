import { Component } from '@angular/core';
import { NavController, AlertController, NavParams, LoadingController } from 'ionic-angular';
import { FeedModel } from '../feed/feed.model';
import 'rxjs/Rx';
import { ProcedureModel } from './listProcedure.model';
import { ProcedureService } from './listProcedure.service';
import { RestService } from '../../app/services/restService.service';
import { FormProcedure } from '../../pages/formProcedure/formProcedure';
import { FormTherapy } from '../formTherapy/formTherapy';

var moment = require('moment-timezone');

@Component({
  selector: 'listExercisePage',
  templateUrl: 'listProcedure.html'
})
export class ListProcedure {
  list2: ProcedureModel = new ProcedureModel();
  feed: FeedModel = new FeedModel();
  formName: string = "listProcedure";
  loading: any;
  resultData: any;
  userTimezone: any;
  type: any;
  noData: boolean = false;

  constructor(
    public nav: NavController,
    public alertCtrl: AlertController,
    public list2Service: ProcedureService,
    public navParams: NavParams,
    public RestService:RestService,
    public loadingCtrl: LoadingController,
  ) {
    this.feed.category = navParams.get('category');
    if (this.feed.category.title == 'Treatments') {
      this.feed.category.title = 'Procedures';
    }
    this.type = this.feed.category.title;

    var self = this;
    this.RestService.curProfileObj(function (error, results) {
      if (!error) {
        self.userTimezone = results.timezone;
      }
    });
  }

  ionViewWillEnter() {
    var dtNow = moment(new Date());
    var dtExpiration = moment(this.RestService.AuthData.expiration);
    //var dtExpiration = dtNow;  //for testing
    var self = this;

    if (dtNow < dtExpiration) {
      this.presentLoadingDefault();
      this.loadData();
    } else {
      this.presentLoadingDefault();
      this.RestService.refreshCredentials(function(err, results) {
        if (err) {
          console.log('Need to login again!!! - Credentials expired from listProcedure');
          self.loading.dismiss();
          self.RestService.appRestart();
        } else {
          console.log('From listMedicalEvent - Credentials refreshed!');
          self.loadData();
        }
      });
    }
  }

  loadData() {
    var restURL: string;

    if (this.type == 'Procedures') {
      restURL="https://ap6oiuyew6.execute-api.us-east-1.amazonaws.com/dev/ProcedureByProfile";
    } else if (this.type == 'Therapies') {
      restURL="https://ap6oiuyew6.execute-api.us-east-1.amazonaws.com/dev/TherapyByProfile";
    } else {
      restURL="https://ap6oiuyew6.execute-api.us-east-1.amazonaws.com/dev/ProcedureByProfile";
      console.log('listProcedure - loadData - type not found - default to Procedure');
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
        if (self.RestService.results !== undefined && self.RestService.results[0] !== undefined && self.RestService.results[0].recordid !== undefined &&
          self.RestService.results[0].recordid > 0) {
            self.list2.items = self.RestService.results;
            self.noData = false;
            console.log("Results Data for Get Procedures: ", self.list2.items);
        } else {
          self.noData = true;
          self.list2.items = [];
          console.log('Results from listProcedure.loadData', self.RestService.results);
        }
        self.loading.dismiss();
      });
    }).catch( function(result){
        console.log(result);
        self.noData = true;
        self.list2.items = [];
        self.loading.dismiss();
        alert('There was an error retrieving this data.  Please try again later');
    });
  }

  openRecord(recordId) {
    console.log("Goto Form index: " + recordId);
    if (this.type == 'Procedures') {
      this.nav.push(FormProcedure, { recId: recordId });
    } else if (this.type == 'Therapies') {
      this.nav.push(FormTherapy, { recId: recordId });
    }
  }

  addNew() {
    if (this.type == 'Procedures') {
      this.nav.push(FormProcedure);
    } else if (this.type == 'Therapies') {
      this.nav.push(FormTherapy);
    }
  }

  formatDateTime(dateString) {
    return moment.utc(dateString).format('MMM DD YYYY');
  }

  flipSearch() {
    if (this.type == 'Procedures') {
      console.log('Going to Therapies');
      this.type = 'Therapies';
      this.feed.category.title = this.type;
      this.presentLoadingDefault();
      this.loadData();
    } else if (this.type == 'Therapies') {
      console.log('Going to Procedures');
      this.type = 'Procedures';
      this.feed.category.title = this.type;
      this.presentLoadingDefault();
      this.loadData();
    } else {
      console.log('Error in Flip Search - Type: ', this.type);
    }
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
