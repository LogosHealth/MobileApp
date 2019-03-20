import { Component } from '@angular/core';
import { NavController, NavParams, LoadingController, PopoverController } from 'ionic-angular';
import { FeedModel } from '../feed/feed.model';
import 'rxjs/Rx';
import { ListMeasureModel } from './listMeasure.model';
import { ListMeasureService } from './listMeasure.service';
import { RestService } from '../../app/services/restService.service';
import { FormWeightPage } from '../../pages/formWeight/formWeight';
import { FormMoodPage } from '../../pages/formMood/formMood';
import { FormLabsPage } from '../../pages/formLabs/formLabs';
import { FormTemperaturePage } from '../../pages/formTemperature/formTemperature';
import { FormSymptomPage } from '../../pages/formSymptom/formSymptom';
import { MenuMeasure } from '../../pages/menuMeasure/menuMeasure';


var moment = require('moment-timezone');

@Component({
  selector: 'listExercisePage',
  templateUrl: 'listMeasure.html'
})
export class ListMeasurePage {
  list2: ListMeasureModel = new ListMeasureModel();
  feed: FeedModel = new FeedModel();
  loading: any;
  resultData: any;
  userTimezone: any;
  multiTab: any;
  curObj: any;

  constructor(
    public nav: NavController,
    public list2Service: ListMeasureService,
    public navParams: NavParams,
    public RestService:RestService,
    public popoverCtrl:PopoverController,
    public loadingCtrl: LoadingController
  ) {
    this.feed.category = navParams.get('category');
    this.multiTab = true;

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
    var self = this;

    if (dtNow < dtExpiration) {
      this.presentLoadingDefault();
      if (this.curObj == 'mood') {
        this.loadDataMood();
      } else if (this.curObj == 'symptom') {
        this.loadDataSymptom();
      } else if (this.curObj == 'temperature') {
        this.loadDataTemp();
      } else if (this.curObj == 'bloodGlucose') {
        this.loadDataBG();
      } else {
        this.loadData();
      }
    } else {
      this.presentLoadingDefault();
      this.RestService.refreshCredentials(function(err, results) {
        if (err) {
          console.log('Need to login again!!! - Credentials expired from listMeasure');
          self.loading.dismiss();
          self.RestService.appRestart();
        } else {
          console.log('From listMeasure - Credentials refreshed!');
          if (self.curObj == 'mood') {
            self.loadDataMood();
          } else if (this.curObj == 'symptom') {
            this.loadDataSymptom();
          } else if (this.curObj == 'temperature') {
            this.loadDataTemp();
          } else if (self.curObj == 'bloodGlucose') {
            self.loadDataBG();
          } else {
            self.loadData();
          }
        }
      });
    }
  }

  loadData() {
    var restURL: string;
    restURL="https://ap6oiuyew6.execute-api.us-east-1.amazonaws.com/dev/WeightByProfile";
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
            self.curObj = "weight";
            console.log("Results Data for Get Weight: ", self.list2.items);
        } else {
          console.log('Results from listVisit.loadData', self.RestService.results);
        }
        self.loading.dismiss();
      });
    }).catch( function(result){
        console.log(result);
        self.loading.dismiss();
    });
  }

  loadDataBG() {
    var restURL: string;
    restURL="https://ap6oiuyew6.execute-api.us-east-1.amazonaws.com/dev/LabsByProfile";
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
            labname: 300
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
            self.curObj = "bloodGlucose";
            console.log("Results Data for loadDataBG: ", self.list2.items);
        } else {
          console.log('Results from listVisit.loadData', self.RestService.results);
        }
        self.loading.dismiss();
      });
    }).catch( function(result){
        console.log(result);
        self.loading.dismiss();
    });
  }

  loadDataMood() {
    var restURL: string;
    restURL="https://ap6oiuyew6.execute-api.us-east-1.amazonaws.com/dev/MoodByProfile";
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
            self.curObj = "mood";
            console.log("Results Data for loadDataMood: ", self.list2.items);
        } else {
          console.log('Results from listVisit.loadData', self.RestService.results);
        }
        self.loading.dismiss();
      });
    }).catch( function(result){
        console.log(result);
        self.loading.dismiss();
    });
  }

  loadDataTemp() {
    var restURL: string;
    restURL="https://ap6oiuyew6.execute-api.us-east-1.amazonaws.com/dev/TemperatureByProfile";
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
            self.curObj = "temperature";
            console.log("Results Data for loadTemperature: ", self.list2.items);
        } else {
          console.log('Results from listVisit.loadData', self.RestService.results);
        }
        self.loading.dismiss();
      });
    }).catch( function(result){
        console.log(result);
        self.loading.dismiss();
    });
  }

  loadDataSymptom() {
    var restURL: string;
    restURL="https://ap6oiuyew6.execute-api.us-east-1.amazonaws.com/dev/SymptomByProfile";
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
            self.curObj = "symptom";
            console.log("Results Data for loadSymptom: ", self.list2.items);
        } else {
            console.log('Results from listVisit.loadData', self.RestService.results);
        }
        self.loading.dismiss();
      });
    }).catch( function(result){
        console.log(result);
        self.loading.dismiss();
    });
  }

  openRecord(recordId) {
    console.log("Goto Form index: " + recordId);
    if (this.curObj == "weight") {
      this.nav.push(FormWeightPage, { recId: recordId });
    } else if (this.curObj == "mood") {
      this.nav.push(FormMoodPage, { recId: recordId });
    } else if (this.curObj == "symptom") {
      console.log('Symptom RecordId: ' + this.RestService.results[recordId].recordid );
      this.nav.push(FormSymptomPage, { recId: recordId, loadFromId: this.RestService.results[recordId].recordid });
    } else if (this.curObj == "temperature") {
      this.nav.push(FormTemperaturePage, { recId: recordId });
    } else if (this.curObj == "bloodGlucose") {
      this.nav.push(FormLabsPage, { recId: recordId, labForm: 'labName=300' });
    }
  }

  getTitle() {
    if (this.curObj == "weight") {
      return 'Weight';
    } else if (this.curObj == "mood") {
      return 'Mood';
    } else if (this.curObj == "symptom") {
      return 'Symptom';
    } else if (this.curObj == "temperature") {
      return 'Temperature';
    } else if (this.curObj == "bloodGlucose") {
      return 'Blood Glucose';
    } else {
      return 'Not Known';
    }
  }


  addNew() {
    if (this.curObj == "weight") {
      this.nav.push(FormWeightPage);
    } else if (this.curObj == "mood") {
      this.nav.push(FormMoodPage);
    } else if (this.curObj == "symptom") {
      this.nav.push(FormSymptomPage);
    } else if (this.curObj == "temperature") {
      this.nav.push(FormTemperaturePage);
    } else if (this.curObj == "bloodGlucose") {
      this.nav.push(FormLabsPage, {labForm: 'labName=300'});
    }
  }

  formatDateTime(dateString) {
    //alert('FormatDateTime called');
    if (this.userTimezone !== undefined && this.userTimezone !=="") {
      return moment(dateString).tz(this.userTimezone).format("dddd, MMMM DD 'YY");
    } else {
      return moment(dateString).format("dddd, MMMM DD 'YY");
    }
  }

  formatMeasureTime(dateString) {
    //alert('FormatDateTime called');
    if (this.userTimezone !== undefined && this.userTimezone !=="") {
      return moment(dateString).tz(this.userTimezone).format("hh:mm A");
    } else {
      return moment(dateString).format("hh:mm A");
    }
  }

  loadList(dataObj) {
    var dtNow = moment(new Date());
    var dtExpiration = moment(this.RestService.AuthData.expiration);
    var self = this;

    if (dtNow < dtExpiration) {
      if (dataObj !== this.curObj) {
        this.presentLoadingDefault();
        if (dataObj == 'weight') {
          this.loadData();
        } else if (dataObj == 'bloodGlucose') {
          this.loadDataBG();
        } else if (dataObj == 'mood') {
          this.loadDataMood();
        } else if (dataObj == 'temperature') {
          this.loadDataTemp();
        } else if (dataObj == 'symptom') {
          this.loadDataSymptom();
        } else {
          console.log ('No data in loadList');
          self.loading.dismiss();
        }
      }
    } else {
      this.presentLoadingDefault();
      this.RestService.refreshCredentials(function(err, results) {
        if (err) {
          console.log('Need to login again!!! - Credentials expired from listMeasure');
          self.loading.dismiss();
          self.RestService.appRestart();
        } else {
          console.log('From listMeasure - Credentials refreshed!');
          if (dataObj !== this.curObj) {
            if (dataObj == 'weight') {
              this.loadData();
            } else if (dataObj == 'bloodGlucose') {
              this.loadDataBG();
            } else if (dataObj == 'mood') {
              this.loadDataMood();
            } else if (dataObj == 'temperature') {
              this.loadDataTemp();
            } else if (dataObj == 'symptom') {
              this.loadDataSymptom();
            } else {
              console.log ('No data in loadList');
              self.loading.dismiss();
            }
          }
        }
      });
    }
  }

  presentPopover(myEvent) {
    var self = this;
    var dataObj;
    let popover = this.popoverCtrl.create(MenuMeasure);
    popover.onDidDismiss(data => {
      console.log('From popover onDismiss: ', data);
      if (data !==undefined && data !== null) {
        dataObj = data.choosePage;
        self.loadList(dataObj);
      }
    });
    popover.present({
      ev: myEvent
    });
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
