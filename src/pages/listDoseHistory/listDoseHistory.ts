import { Component } from '@angular/core';
import { NavController, AlertController, NavParams, LoadingController } from 'ionic-angular';
import { FeedModel } from '../feed/feed.model';
import 'rxjs/Rx';
import { DoseHistoryModel } from './listDoseHistory.model';
//import { DoseHistoryService } from './listdoseHistory.service';
import { RestService } from '../../app/services/restService.service';
import { FormDoseHistory } from '../../pages/formDoseHistory/formDoseHistory';

var moment = require('moment-timezone');

@Component({
  selector: 'listExercisePage',
  templateUrl: 'listDoseHistory.html'
})
export class ListDoseHistory {
  list2: DoseHistoryModel = new DoseHistoryModel();
  feed: FeedModel = new FeedModel();
  formName: string = "listDoseHistory";
  loading: any;
  resultData: any;
  userTimezone: any;
  treatmentid: any;
  treatment: any;

  constructor(
    public nav: NavController,
    public alertCtrl: AlertController,
    //public list2Service: DoseHistoryService,
    public navParams: NavParams,
    public RestService:RestService,
    public loadingCtrl: LoadingController,
  ) {
    this.feed.category = navParams.get('category');
    this.treatmentid = navParams.get('treatmentid');
    this.treatment = navParams.get('treatment');

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
          console.log('Need to login again!!! - Credentials expired from listSleep');
          self.loading.dismiss();
          self.RestService.appRestart();
        } else {
          console.log('From listSleep - Credentials refreshed!');
          self.loadData();
        }
      });
    }
  }

  loadData() {
    var restURL: string;

    restURL="https://ap6oiuyew6.execute-api.us-east-1.amazonaws.com/dev/DoseHistoryTreatment";

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
            treatmentid: this.treatmentid
        }
    };
    var body = '';
    var self = this;

    apigClient.invokeApi(params, pathTemplate, method, additionalParams, body)
    .then(function(result){
      self.RestService.results = result.data;
      self.list2.items = self.RestService.results;
      self.loading.dismiss();
/*
      self.list2Service
      .getData()
      .then(data => {
        self.list2.items = self.RestService.results;
        console.log("Results Data for Get Goals: ", self.list2.items);
        self.loading.dismiss();
      });
*/
    }).catch( function(result){
        console.log(body);
        self.loading.dismiss();
    });
  }

  openRecord(recordId) {
    console.log("Goto Form index: " + recordId);
    //console.log("Recordid from index: " + this.list2[recordId].recordid);
    this.nav.push(FormDoseHistory, { recId: recordId, treatment: this.treatment });
    //alert('Open Record:' + recordId);
  }

  addNew() {
    this.nav.push(FormDoseHistory, { treatment: this.treatment });
  }

  formatDateTime(dateString) {
    //alert('FormatDateTime called');
    var dtDate = new Date(dateString);
    var dtReturn;

    var offset = dtDate.getTimezoneOffset() /60;
    var dtMoment = moment(dtDate);

    dtReturn = dtMoment.add(offset, 'hours');

    return dtReturn.format('dddd, MMMM DD hh:mm a');
/*
    if (this.userTimezone !== undefined && this.userTimezone !=="") {
      return moment(dateString).tz(this.userTimezone).format('dddd, MMMM DD hh:mm a');
    } else {
      return moment(dateString).format('dddd, MMMM DD hh:mm a');
    }
    */
  }

  formatTime(timeString) {
    //alert('FormatDateTime called');
    if (timeString == null) {
      return null;
    }
    var timeSplit = timeString.split(":");
    var hour = timeSplit[0];
    var minute = timeSplit[1];

    if (Number(hour) > 11) {
      if (Number(hour) == 12 ) {
        return hour + ":" + minute + " PM";
      } else {
        return (Number(hour) - 12) + ":" + minute + " PM";
      }
    } else {
      if (Number(hour) == 0) {
        return "12:" + minute + " AM";
      } else {
        return hour + ":" + minute + " AM";
      }
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
