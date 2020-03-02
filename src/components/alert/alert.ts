import { Component } from '@angular/core';

import { LocalNotifications } from '@ionic-native/local-notifications';
import { ListAlertModel, ListAlert } from './listAlert.model';
import { ListAlertService } from '../../pages/listAlert/listAlert.service';
import { FeedModel } from '../../pages/feed/feed.model';
import { RestService } from '../../app/services/restService.service';

import { NavController, LoadingController, Platform, ModalController, Events, PopoverController, Content } from 'ionic-angular';
var moment = require('moment-timezone');
/**
 * Generated class for the AlertComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'alert',
  templateUrl: 'alert.html'
})

export class AlertComponent {
  list2: ListAlertModel = new ListAlertModel();
  feed: FeedModel = new FeedModel();
  alertSave: ListAlert = new ListAlert();
  loading: any;
  formName: string = "today";
  resultData: any;
  userTimezone: any;
  autoload: boolean = false;
  text: string;
  constructor(
    //public nav: NavController,
    //public alertCtrl: AlertController,
    public list2Service: ListAlertService,
    //public navParams: NavParams,
    private platform: Platform,
    public RestService:RestService,
    
    //public loadingCtrl: LoadingController,
    private localNotifications: LocalNotifications,
  ) {
    var self = this;


    this.text = 'Hello World';
    console.log("alert");
    this.platform.ready().then((rdy) => {

      self.localNotifications.on('click').subscribe((notification)  => {
        //console.log("notification id from click event " + notification.id);
        if (notification.data.secret == 'scheduleinstance') {
          //console.log('Click Notification - state of nav: ', self.nav);
          alert("Please go to the Visit tile and schedule this appointment");
        }
      });

      //self.autoload = navParams.get('autoload');
      console.log('alerts - autoload: ' + self.autoload);
      self.localNotifications.on('trigger').subscribe((notification) => {
        console.log("notification id from trigger event " + notification.id);
        this.setAlertDone(notification.id);
      });

      self.localNotifications.on('click').subscribe((notification) => {
        console.log("notification id from click/confirm event " + notification.id);
        this.setAlertConfirmed(notification.id);
      });

      self.RestService.curProfileObj(function (error, results) {
        if (!error) {
          self.userTimezone = results.timezone;
        }
      });
    });
  }

  ionViewWillEnter() {
    var dtNow = moment(new Date());
    var dtExpiration = moment(this.RestService.AuthData.expiration);
    var self = this;
    console.log("ionviewwillenter");
    if (dtNow < dtExpiration) {
      //this.presentLoadingDefault();
      this.loadData();
    } else {
      //this.presentLoadingDefault();
      this.RestService.refreshCredentials(function(err, results) {
        if (err) {
          console.log('Need to login again!!! - Credentials expired from listAlert');
          //self.loading.dismiss();
          self.RestService.appRestart();
        } else {
          console.log('From listAlert - Credentials refreshed!');
          self.loadData();
        }
      });
    }
  }

  loadData() {
    var restURL: string;
    restURL="https://ap6oiuyew6.execute-api.us-east-1.amazonaws.com/dev/AlertsByUser";
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
            userid: this.RestService.userId
        }
    };
    var body = '';
    var self = this;

    console.log("loaddata alert");

    apigClient.invokeApi(params, pathTemplate, method, additionalParams, body)
    .then(function(result){
      var results = result.data;
      self.RestService.results = results;
      self.list2Service
      .getData()
      .then(data => {
        if (self.RestService.results !== undefined && self.RestService.results[0] !== undefined && self.RestService.results[0].recordid !== undefined &&
          self.RestService.results[0].recordid > 0) {
            self.list2.items = results;
            console.log("Results Data for Get Alerts: ", self.list2.items);
            var offSet;
            var dtNow = moment(new Date());
            var dtOffset;

            //10-10-18 MM Adding the local notification alerts
            if (self.list2.items.length > 0) {
              for (var i = 0; i < self.list2.items.length; i++) {
                if (self.list2.items[i].triggered == 'N') {
                  //console.log('Trigger Date/Time ' + self.list2.items[i].triggerdate);
                  dtOffset = moment.tz(self.list2.items[i].triggerdate, moment.tz.guess());
                  //console.log('Offset Date/Time ' + dtOffset.format());
                  offSet = dtOffset.diff(dtNow);
                  //console.log('Offset milliseconds ' + offSet);
                  self.RestService.notifyCount = self.RestService.notifyCount + 1;
                  if (offSet > 0) {
                    self.localNotifications.schedule({
                      id: self.list2.items[i].recordid,
                      title: self.list2.items[i].alerttitle,
                      text: self.list2.items[i].alerttext,
                      trigger: {at: new Date(new Date().getTime() + offSet)},
                      data: { secret: self.list2.items[i].reftable }
                    });
                  } else {
                    self.localNotifications.schedule({
                      id: self.list2.items[i].recordid,
                      title: self.list2.items[i].alerttitle,
                      text: self.list2.items[i].alerttext,
                      trigger: {at: new Date(new Date().getTime())},
                      data: { secret: self.list2.items[i].reftable }
                    });
                  }
                }
              }
              console.log('Local Notifications: ', self.localNotifications);
            }
        } else {
          console.log('Results from listAlert.loadData', self.RestService.results);
        }
        // if (self.autoload) {
        //   self.nav.pop();
        //   //self.loading.dismiss();
        // }else {
        //   //self.loading.dismiss();
        // }
      });
    }).catch( function(result){
        console.log(result);
        //self.loading.dismiss();
    });
  }

  setAlertDone(recordid) {
    var dtNow = moment(new Date());
    var dtExpiration = moment(this.RestService.AuthData.expiration);
    var self = this;

    if (dtNow < dtExpiration) {
      //this.presentLoadingDefault();
      this.setAlertDoneDo(recordid);
    } else {
      //this.presentLoadingDefault();
      this.RestService.refreshCredentials(function(err, results) {
        if (err) {
          console.log('Need to login again!!! - Credentials expired from listAlert');
          //self.loading.dismiss();
          self.RestService.appRestart();
        } else {
          console.log('From listAlert - Credentials refreshed!');
          self.setAlertDoneDo(recordid);
        }
      });
    }
  }

  setAlertDoneDo(recordid) {
    var restURL: string;
    restURL="https://ap6oiuyew6.execute-api.us-east-1.amazonaws.com/dev/AlertsByUser";
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
    var method = 'POST';
    var additionalParams = {
        queryParams: {
            userid: this.RestService.userId
        }
    };
    this.alertSave.userid = this.RestService.userId;
    this.alertSave.recordid = recordid;
    this.alertSave.active = 'Y';
    this.alertSave.triggered = 'Y';
    var body = JSON.stringify(this.alertSave);
    var self = this;
    console.log('Calling Post listAlert setAlertDone', this.alertSave);
    apigClient.invokeApi(params, pathTemplate, method, additionalParams, body)
    .then(function(result){
      self.RestService.results = result.data;
      console.log('Happy Path from listAlert setAlertDone: ' + self.RestService.results);
      //self.loading.dismiss();
    }).catch( function(result){
      console.log('Result: ',result);
      console.log(body);
      //self.loading.dismiss();
    });
  }

  setAlertConfirmed(recordid) {
    var dtNow = moment(new Date());
    var dtExpiration = moment(this.RestService.AuthData.expiration);
    var self = this;

    if (dtNow < dtExpiration) {
      //this.presentLoadingDefault();
      this.setAlertConfirmedDo(recordid);
    } else {
      //this.presentLoadingDefault();
      this.RestService.refreshCredentials(function(err, results) {
        if (err) {
          console.log('Need to login again!!! - Credentials expired from listAlert');
          //self.loading.dismiss();
          self.RestService.appRestart();
        } else {
          console.log('From listAlert - Credentials refreshed!');
          self.setAlertConfirmedDo(recordid);
        }
      });
    }
  }

  setAlertConfirmedDo(recordid) {
    var restURL: string;
    restURL="https://ap6oiuyew6.execute-api.us-east-1.amazonaws.com/dev/AlertsByUser";
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
    var method = 'POST';
    var additionalParams = {
        queryParams: {
            userid: this.RestService.userId
        }
    };
    this.alertSave.userid = this.RestService.userId;
    this.alertSave.recordid = recordid;
    this.alertSave.active = 'Y';
    this.alertSave.triggered = 'Y';
    this.alertSave.confirmed = 'Y';
    var body = JSON.stringify(this.alertSave);
    var self = this;
    console.log('Calling Post listAlert setAlertDone', this.alertSave);
    apigClient.invokeApi(params, pathTemplate, method, additionalParams, body)
    .then(function(result){
      self.RestService.results = result.data;
      console.log('Happy Path from listAlert setAlertDone: ' + self.RestService.results);
      //self.loading.dismiss();
    }).catch( function(result){
      console.log('Result: ',result);
      console.log(body);
      //self.loading.dismiss();
    });
  }

  // openRecord(recordId) {
  //   console.log("Goto Form index: " + recordId);
  //   //console.log("Recordid from index: " + this.list2[recordId].recordid);
  //   this.nav.push(FormSleepPage, { recId: recordId });
  //   //alert('Open Record:' + recordId);
  // }

  // addNew() {
  //   this.nav.push(FormSleepPage);
  // }

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

  // presentLoadingDefault() {
  //   this.loading = this.loadingCtrl.create({
  //   spinner: 'hide',
  //   content: `
  //     <div class="custom-spinner-container">
  //       <div class="custom-spinner-box">
  //          <img src="assets/images/stickManCursor3.gif" width="50" height="50" />
  //          Loading...
  //       </div>
  //     </div>`,
  //   });

  //   this.loading.present();

    // setTimeout(() => {
    //   this.loading.dismiss();
    //   //console.log('Timeout for spinner called ' + this.formName);
    // }, 15000);
  //}

}