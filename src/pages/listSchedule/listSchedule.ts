import { Component } from '@angular/core';
import { NavController, AlertController, NavParams, LoadingController } from 'ionic-angular';
import { FeedModel } from '../feed/feed.model';
import 'rxjs/Rx';
import { ListScheduleModel } from './listSchedule.model';
import { ListScheduleService } from './listSchedule.service';
import { RestService } from '../../app/services/restService.service';
import { FormSchedulePage } from '../../pages/formSchedule/formSchedule';

var moment = require('moment-timezone');

@Component({
  selector: 'listExercisePage',
  templateUrl: 'listSchedule.html'
})
export class ListSchedulePage {
  list2: ListScheduleModel = new ListScheduleModel();
  feed: FeedModel = new FeedModel();
  loading: any;
  resultData: any;
  userTimezone: any;

  constructor(
    public nav: NavController,
    public alertCtrl: AlertController,
    public list2Service: ListScheduleService,
    public navParams: NavParams,
    public RestService:RestService,
    public loadingCtrl: LoadingController,
  ) {
    this.feed.category = navParams.get('category');

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

    if (dtNow < dtExpiration) {
      this.loading = this.loadingCtrl.create();
      this.loading.present();
      this.loadData();  
    } else {
      console.log('Need to login again!!! - Credentials expired from listSchedule');
      this.RestService.appRestart();
    }
  }

  loadData() {
    var restURL: string;

    restURL="https://ap6oiuyew6.execute-api.us-east-1.amazonaws.com/dev/SchedulesByAccount";
    
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
          accountid: this.RestService.Profiles[0].accountid
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
        console.log("Results Data for list Schedules: ", self.list2.items);
        self.RestService.refreshCheck();
        self.loading.dismiss();
      });      
    }).catch( function(result){
        console.log(body);
        self.RestService.refreshCheck();
        self.loading.dismiss();
    });
  }

  openRecord(recordId) {
    console.log("Goto Form index: " + recordId);
    //console.log("Recordid from index: " + this.list2[recordId].recordid);
    this.nav.push(FormSchedulePage, { recId: recordId });
    //alert('Open Record:' + recordId);
  }  

  addNew() {
    this.nav.push(FormSchedulePage);
  }  
  
  formatDateTime(dateString) {
    //alert('FormatDateTime called');
    if (this.userTimezone !== undefined && this.userTimezone !=="") {
      return moment(dateString).tz(this.userTimezone).format('dddd, MMMM DD');
    } else {
      return moment(dateString).format('dddd, MMMM DD');
    }
  }

  formatTime(timeString) {
    //alert('FormatDateTime called');
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

  getActives(item) {
    //console.log('Item for getActives: ', item);
    var strReturn = '';
    if (item.activatedSchedules !== undefined && item.activatedSchedules.length > 0) {
      //console.log('Active schedules count: ' + item.activatedSchedules.length);
      for (var j = 0; j < item.activatedSchedules.length; j++) {		
        strReturn = strReturn + item.activatedSchedules[j].firstname + ', ';
      }
    } 
    if (strReturn !== '') {
      strReturn = strReturn.substr(0, strReturn.length - 2);
    }
    return strReturn;
  }

  getEligibles(item) {
    //console.log('Item for getEligibles: ', item);
    var strReturn = '';
    if (item.eligibles !== undefined  && item.eligibles.length > 0) {
      //console.log('Eligibles count: ' + item.eligibles.length);
      for (var j = 0; j < item.eligibles.length; j++) {		
        strReturn = strReturn + item.eligibles[j].firstname + ', ';
      }
    } 
    if (strReturn !== '') {
      strReturn = strReturn.substr(0, strReturn.length - 2);
    }
    return strReturn;
  }

}
