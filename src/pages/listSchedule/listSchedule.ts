import { Component } from '@angular/core';
import { NavController, AlertController, NavParams, LoadingController } from 'ionic-angular';
import { FeedModel } from '../feed/feed.model';
import 'rxjs/Rx';
//import { ListScheduleModel } from './listSchedule.model';
import { ListScheduleService } from './listSchedule.service';
import { RestService } from '../../app/services/restService.service';
import { FormSchedulePage } from '../../pages/formSchedule/formSchedule';

var moment = require('moment-timezone');

@Component({
  selector: 'listExercisePage',
  templateUrl: 'listSchedule.html'
})
export class ListSchedulePage {
  //list2: ListScheduleModel = new ListScheduleModel();
  list2: any;
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
    this.list2 = {
      items: []
    };
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
    var self = this;

    if (dtNow < dtExpiration) {
      this.presentLoadingDefault();
      this.loadData();
    } else {
      this.presentLoadingDefault();
      this.RestService.refreshCredentials(function(err, results) {
        if (err) {
          console.log('Need to login again!!! - Credentials expired from listSchedule');
          self.loading.dismiss();
          self.RestService.appRestart();
        } else {
          console.log('From listSchedule - Credentials refreshed!');
          self.loadData();
        }
      });
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
        self.updatePicURLs();
        console.log("Results Data for list Schedules: ", self.list2.items);
        self.loading.dismiss();
      });
    }).catch( function(result){
        console.log(body);
        self.loading.dismiss();
    });
  }

  openRecord(recordId) {
    console.log("Goto Form index: " + recordId);
    this.nav.push(FormSchedulePage, { recId: recordId });
  }

  addNew() {
    this.nav.push(FormSchedulePage);
  }

  formatDateTime(dateString) {
    if (this.userTimezone !== undefined && this.userTimezone !=="") {
      return moment(dateString).tz(this.userTimezone).format('dddd, MMMM DD');
    } else {
      return moment(dateString).format('dddd, MMMM DD');
    }
  }

  formatTime(timeString) {
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
    var strReturn = '';
    if (item.activatedSchedules !== undefined && item.activatedSchedules.length > 0) {
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
    var strReturn = '';
    if (item.eligibles !== undefined  && item.eligibles.length > 0) {
      for (var j = 0; j < item.eligibles.length; j++) {
        strReturn = strReturn + item.eligibles[j].firstname + ', ';
      }
    }
    if (strReturn !== '') {
      strReturn = strReturn.substr(0, strReturn.length - 2);
    }
    return strReturn;
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

  updatePicURLs() {
    for (var j = 0; j < this.list2.items.length; j++) {
      //console.log('UpdatePicUrls item: ', this.list2.items[j]);
      //console.log('UpdatePicUrls item: ', this.list2.items[j].activatedSchedules);
      if (this.list2.items[j].activatedSchedules !== undefined && this.list2.items[j].activatedSchedules !== null && this.list2.items[j].activatedSchedules.length > 0) {
        for (var k = 0; k < this.list2.items[j].activatedSchedules.length; k++) {
         //console.log('updatePicURLs number of activated schedule items: ' + k);
          //console.log('updatePicURLs Activated schedule item: ', this.list2.items[j].activatedSchedules[k]);
          if (this.list2.items[j].activatedSchedules[k].photopath == 'AWS') {
            for (var z = 0; z < this.RestService.Profiles.length; z++) {
              if (this.RestService.Profiles[z].profileid == this.list2.items[j].activatedSchedules[k].profileid) {
                this.list2.items[j].activatedSchedules[k].photopath = this.RestService.Profiles[z].imageURL;
                //console.log('updatePicURL - url updated: ', this.list2.items[j].activatedSchedules[k]);
              }
            }
          }
        }
      }
      if (this.list2.items[j].eligibles !== undefined && this.list2.items[j].eligibles !== null && this.list2.items[j].eligibles.length > 0) {
        for (k = 0; k < this.list2.items[j].eligibles.length; k++) {
         // console.log('updatePicURLs number of activated schedule items: ' + k);
          //console.log('updatePicURLs Activated schedule item: ', this.list2.items[j].eligibles[k]);
          if (this.list2.items[j].eligibles[k].photopath == 'AWS') {
            for (z = 0; z < this.RestService.Profiles.length; z++) {
              if (this.RestService.Profiles[z].profileid == this.list2.items[j].eligibles[k].profileid) {
                this.list2.items[j].eligibles[k].photopath = this.RestService.Profiles[z].imageURL;
                //console.log('updatePicURL - url updated: ', this.list2.items[j].eligibles[k]);
              }
            }
          }
        }
      }
    }
  }

}
