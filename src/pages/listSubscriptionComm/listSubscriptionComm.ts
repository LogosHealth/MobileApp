import { Component } from '@angular/core';
import { NavController, AlertController, NavParams, LoadingController } from 'ionic-angular';
import { FeedModel } from '../feed/feed.model';
import 'rxjs/Rx';
import { RestService } from '../../app/services/restService.service';
import { InAppBrowser } from '@ionic-native/in-app-browser';
import { SubscriptionComm } from './listSubscriptionComm.model';

var moment = require('moment-timezone');

@Component({
  selector: 'listExercisePage',
  templateUrl: 'listSubscriptionComm.html'
})
export class ListSubscriptionComm {
  feed: FeedModel = new FeedModel();
  formName: string = "listSubscriptionComm";
  loading: any;
  resultData: any;
  userTimezone: any;
  noData: boolean = false;
  list2 = [];
  isDirty: any = false;

  constructor(
    public nav: NavController,
    public alertCtrl: AlertController,
    public navParams: NavParams,
    public RestService:RestService,
    public iab: InAppBrowser,
    public loadingCtrl: LoadingController,
  ) {
    //this.feed.category = navParams.get('category');

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
          console.log('Need to login again!!! - Credentials expired from listSubscriptionComm');
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
    this.list2 = this.RestService.Subscriptions;
    this.loading.dismiss();
    /*
    for (var i = 0; i < this.list2.length; i++) {
      console.log('Remove Disarm ' + this.list2[i].subject.substring(11));
      console.log('Initial Substring ' + this.list2[i].subject.substring(0, 11));
    }*/
  }

  openRecord(recordId) {
    var self = this;
    console.log("Goto Form index: " + recordId);

    if (self.list2[recordId].readflag == 'N') {
      self.list2[recordId].readflag = 'Y';
      self.RestService.Subscriptions[recordId].readflag = 'Y';
      self.list2[recordId].isDirty = true;
      self.isDirty = true;
    }

    const browser = this.iab.create(this.list2[recordId].url, '_blank');

    browser.on('loadstop').subscribe(e => {
      console.log('Loaded browser with url: ', self.list2[recordId].url);
      console.log('from browser loadstop: ', e);
      if (self.list2[recordId].readflag == 'N') {
        self.list2[recordId].readflag = 'Y';
        self.list2[recordId].isDirty = true;
        self.isDirty = true;
      }
      //browser.close();
      //alert('Error Loading Final Auth Window ' + e.message);
    });

  }

  formatDateTime(dateString) {
    if (this.userTimezone !== undefined && this.userTimezone !== null && this.userTimezone !=="") {
      return moment(dateString).tz(this.userTimezone).format("ddd, MMM DD 'YY, hh:mm A");
    } else {
      return moment(dateString).format("ddd, MMM DD 'YY, hh:mm A");
    }
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

  ionViewCanLeave() {
    var listSave = [];
    var objSave: SubscriptionComm = new SubscriptionComm();
    //var self = this;

    if (this.isDirty) {
      console.log('Leaving form - Saving read comm action!');
      for (var i = 0; i < this.RestService.Subscriptions.length; i++) {
        objSave = new SubscriptionComm();
        if (this.list2[i].isDirty) {
          objSave.recordid = this.list2[i].recordid;
          objSave.readflag = 'Y';
          listSave.push(objSave);
        }
      }
      console.log('ListSave values ', listSave);
      this.navSaveRecord(listSave, function(err, results) {
        if (err) {
          console.log('Err from navSaveRecord: ', err);
          return true;
        } else {
          console.log('Results from navSaveRecord: ', results);
          return true;
        }
      });
      return true;
    } else {
      return true;
    }
  }

  navSaveRecord(listSave, callback){
    var dtNow = moment(new Date());
    var dtExpiration = moment(this.RestService.AuthData.expiration);
    var self = this;

    if (dtNow < dtExpiration) {
      this.presentLoadingDefault();
      this.navSaveRecordDo(listSave, function (err, results) {
        if (err) {
          self.loading.dismiss();
          callback(err, null);
        } else {
          self.loading.dismiss();
          callback(null, results);
        }
      });
    } else {
      this.presentLoadingDefault();
      this.RestService.refreshCredentials(function(err, results) {
        if (err) {
          console.log('Need to login again!!! - Credentials expired from ' + self.formName + '.saveRecord');
          self.loading.dismiss();
          self.RestService.appRestart();
        } else {
          console.log('From ' + self.formName + '.saveRecord - Credentials refreshed!');
          self.navSaveRecordDo(listSave, function (err, results) {
            if (err) {
              self.loading.dismiss();
              callback(err, null);
            } else {
              self.loading.dismiss();
              callback(null, results);
            }
          });
        }
      });
    }
  }

  navSaveRecordDo(listSave, callback){
      var restURL="https://ap6oiuyew6.execute-api.us-east-1.amazonaws.com/dev/SubscriptionCommsByProfile";
      var config = {
        invokeUrl: restURL,
        accessKey: this.RestService.AuthData.accessKeyId,
        secretKey: this.RestService.AuthData.secretKey,
        sessionToken: this.RestService.AuthData.sessionToken,
        region:'us-east-1'
      };
      var apigClient = this.RestService.AWSRestFactory.newClient(config);
      var params = {
        //pathParameters: this.vaccineSave
      };
      var pathTemplate = '';
      var method = 'POST';
      var additionalParams = {
          queryParams: {
              profileid: this.RestService.currentProfile
          }
      };
      var body = JSON.stringify(listSave);
      //var self = this;
      console.log('Calling Post', listSave);
      apigClient.invokeApi(params, pathTemplate, method, additionalParams, body)
      .then(function(result){
        callback(null, result.data);
      }).catch( function(result){
        console.log('Error from formSubscriptionComm.save: ',result);
        alert('There was an error saving this data.  Please try again later');
        callback(result, null);
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
