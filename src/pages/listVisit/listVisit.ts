import { Component } from '@angular/core';
import { NavController, AlertController, NavParams, LoadingController, ModalController } from 'ionic-angular';
import { FeedModel } from '../feed/feed.model';
import 'rxjs/Rx';
import { ListVisitModel } from './listVisit.model';
import { ListVisitService } from './listVisit.service';
import { RestService } from '../../app/services/restService.service';
import { FormVisitPage } from '../../pages/formVisit/formVisit';
import { CallNumber } from '@ionic-native/call-number';
import { FormCallNotesPage } from '../../pages/formCallNotes/formCallNotes';
import { FormChooseNotify } from '../../pages/formChooseNotify/formChooseNotify';

var moment = require('moment-timezone');

@Component({
  selector: 'listExercisePage',
  templateUrl: 'listVisit.html'
})
export class ListVisitPage {
  list2: ListVisitModel = new ListVisitModel();
  feed: FeedModel = new FeedModel();
  loading: any;
  resultData: any;
  userTimezone: any;
  showAll: boolean = true;
  visitType: string = 'Upcoming Visit';

  constructor(
    public nav: NavController,
    public alertCtrl: AlertController,
    public list2Service: ListVisitService,
    public navParams: NavParams,
    public RestService:RestService,
    public loadingCtrl: LoadingController,
    public modalCtrl: ModalController,
    private callNumber: CallNumber
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
    var self = this;

    if (dtNow < dtExpiration) {
      this.presentLoadingDefault();
      this.loadData();
    } else {
      this.presentLoadingDefault();
      this.RestService.refreshCredentials(function(err, results) {
        if (err) {
          console.log('Need to login again!!! - Credentials expired from listVisit');
          self.loading.dismiss();
          self.RestService.appRestart();
        } else {
          console.log('From listVisit - Credentials refreshed!');
          self.loadData();
        }
      });
    }
  }

  loadData() {
    var restURL: string;
    var tzoffset = (new Date()).getTimezoneOffset() /60; //offset in hours
    console.log('TZ Offeset from listVist - loadData: ' + tzoffset);

    restURL="https://ap6oiuyew6.execute-api.us-east-1.amazonaws.com/dev/VisitByProfile";

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

    if (this.showAll) {
      if (this.visitType == 'Past Visit') {
        additionalParams = {
          queryParams: {
              accountid: this.RestService.Profiles[0].accountid,
              offset: tzoffset,
              historical: 'Y'
          }
        };
      } else {
        additionalParams = {
          queryParams: {
              accountid: this.RestService.Profiles[0].accountid,
              offset: tzoffset
          }
        };
      }
    } else {
      if (this.visitType == 'Past Visit') {
        additionalParams = {
          queryParams: {
              profileid: this.RestService.currentProfile,
              offset: tzoffset,
              historical: 'Y'
          }
        };
      } else {
        additionalParams = {
          queryParams: {
              profileid: this.RestService.currentProfile,
              offset: tzoffset
          }
        };
      }
    }

    var body = '';
    var self = this;

    apigClient.invokeApi(params, pathTemplate, method, additionalParams, body)
    .then(function(result){
      self.RestService.results = result.data;
      self.list2Service
      .getData()
      .then(data => {
        if (self.RestService.results !== undefined && self.RestService.results[0] !== undefined && self.RestService.results[0].recordid !== undefined) {
            self.list2.items = self.RestService.results;
            for (var i = 0; i < self.RestService.Profiles.length; i++) {
              for (var j = 0; j < self.list2.items.length; j++) {
                if (self.list2.items[j].profileid == self.RestService.Profiles[i].profileid) {
                  self.list2.items[j].imageURL = self.RestService.Profiles[i].imageURL;
                }
              }
            }
            console.log("Results Data for Get Visits: ", self.list2.items);
        } else {
          console.log('Results from listVisit.loadData', self.RestService.results);
          self.list2.items = [];
        }
        self.loading.dismiss();
      });
    }).catch( function(result){
        console.log(result);
        self.loading.dismiss();
    });
  }

  flipSearch() {
    var dtNow = moment(new Date());
    var dtExpiration = moment(this.RestService.AuthData.expiration);
    var self = this;

    if (this.visitType == 'Upcoming Visit') {
      this.visitType = 'Past Visit';
    } else {
      this.visitType = 'Upcoming Visit';
    }
    console.log('Visit Type from Switch Search: ' + this.visitType);

    if (dtNow < dtExpiration) {
      this.presentLoadingDefault();
      this.loadData();
    } else {
      this.presentLoadingDefault();
      this.RestService.refreshCredentials(function(err, results) {
        if (err) {
          console.log('Need to login again!!! - Credentials expired from listVisit');
          self.loading.dismiss();
          self.RestService.appRestart();
        } else {
          console.log('From listVisit - Credentials refreshed!');
          self.loadData();
        }
      });
    }
  }

  itemAlert(index) {
    var self = this;
    console.log('Item from check itemAlert: ', this.list2.items[index]);
    let profileModal = this.modalCtrl.create(FormChooseNotify, { recId: index, todoIndex: null, object: "visit" });

    profileModal.onDidDismiss(data => {
      if (data !==undefined && data !== null) {
        console.log('Data from itemAlert: ', data);
        console.log('Data index from itemAlert: ', index);
        self.list2.items[index].visitreminder = data;
      }
      console.log('Data from itemAlert data: ', self.list2.items[index].visitreminder);
    });
    profileModal.present();
  }

  openRecord(recordId) {
    console.log("Goto Form index: " + recordId);
    //console.log("Recordid from index: " + this.list2[recordId].recordid);
    this.nav.push(FormVisitPage, { recId: recordId });
    //alert('Open Record:' + recordId);
  }

  callDoc(phoneNum, recordId) {
    console.log("Call Doc item", recordId);
    var visit = this.RestService.results[recordId];
    this.callNumber.callNumber(phoneNum, true)
      .then(() =>
        this.nav.push(FormCallNotesPage, { visit: visit, fromVisit: true })
      )
      .catch(() =>
        this.nav.push(FormCallNotesPage, { visit: visit, fromVisit: true })
      );
  }

  addNew() {
    this.nav.push(FormVisitPage);
  }

  formatDateTime(dateString, recordid) {
    //alert('FormatDateTime called');
    //alert('Record id: ' + recordid);
    var tzoffset = (new Date()).getTimezoneOffset() /60; //offset in hours

    if (recordid == null) {
      return 'TBD - Target date is ' + moment(dateString).format('dddd, MMM DD');
    } else {
        //MM generally, this function accounts for timezone as actual dates are stored in UTC.  However, with scheduled future dates,
        //these are stored in actual local time so need to add offset back in as moment(datestring) casts from datestring of UTC...
        //console.log('DateString from formatdatetime - listVisit: ' + dateString);
        //console.log('moment from formatdatetime - listVisit: ' + moment(dateString).format('dddd, MMMM DD hh:mm a'));
        var dtConvert = moment(dateString);
        dtConvert = moment(dtConvert).add(tzoffset, 'hours');
        //console.log('moment from formatdatetime - listVisit: ' + dtConvert.format('dddd, MMMM DD hh:mm a'));
        return dtConvert.format('dddd, MMMM DD hh:mm a');
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
