import { Component } from '@angular/core';
import { NavController, AlertController, NavParams, LoadingController, ViewController } from 'ionic-angular';
import { FeedModel } from '../feed/feed.model';
import 'rxjs/Rx';
import { MedicalEventModel } from './listMedicalEvent.model';
import { MedicalEventService } from './listMedicalEvent.service';
import { RestService } from '../../app/services/restService.service';
import { FormMedicalEvent } from '../../pages/formMedicalEvent/formMedicalEvent';

var moment = require('moment-timezone');

@Component({
  selector: 'listExercisePage',
  templateUrl: 'listMedicalEvent.html'
})
export class ListMedicalEvent {
  list2: MedicalEventModel = new MedicalEventModel();
  feed: FeedModel = new FeedModel();
  formName: string = "listMedicalEvent";
  loading: any;
  resultData: any;
  userTimezone: any;
  isSelectRelated: boolean = false;
  relatedEvent: any;
  noData: boolean = false;
  aboutProfile: any = null;

  constructor(
    public nav: NavController,
    public alertCtrl: AlertController,
    public list2Service: MedicalEventService,
    public navParams: NavParams,
    public RestService:RestService,
    public loadingCtrl: LoadingController,
    public viewCtrl: ViewController,
  ) {
    this.feed.category = navParams.get('category');
    this.aboutProfile = navParams.get('aboutProfile');
    if (this.feed.category.title == 'Select Related Condition') {
      this.isSelectRelated = true;
    }

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
          console.log('Need to login again!!! - Credentials expired from listMedicalEvent');
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

    restURL="https://ap6oiuyew6.execute-api.us-east-1.amazonaws.com/dev/MedicalEventByProfile";
    if (this.isSelectRelated) {
      restURL="https://ap6oiuyew6.execute-api.us-east-1.amazonaws.com/dev/ParentEventByProfile";
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



    if (!this.isSelectRelated) {
      additionalParams = {
        queryParams: {
            profileid: this.RestService.currentProfile
        }
      };
      console.log('listMedicalEvent - Standard View - profileid: ' + this.RestService.currentProfile);
    } else if (this.aboutProfile !== null && this.aboutProfile > 0) {
      additionalParams = {
        queryParams: {
            profileid: this.aboutProfile
        }
      };
      console.log('listMedicalEvent - Select View - about profileid: ' + this.aboutProfile);
    } else {
      additionalParams = {
        queryParams: {
            profileid: this.RestService.currentProfile
        }
      };
      console.log('listMedicalEvent - Select View - profileid: ' + this.RestService.currentProfile);
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
            console.log("Results Data for Get Medical Events: ", self.list2.items);
        } else {
          self.noData = true;
          console.log('Results from listMedicalEvents.loadData', self.RestService.results);
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

    if (!this.isSelectRelated) {
    //console.log("Recordid from index: " + this.list2[recordId].recordid);
    this.nav.push(FormMedicalEvent, { recId: recordId });
    //alert('Open Record:' + recordId);
    } else {
      this.relatedEvent = this.RestService.results[recordId];
    //fromCancel = false
    this.dismiss(false);
    }
  }

  addNew() {
    this.nav.push(FormMedicalEvent);
  }

  formatDateTime(dateString) {
    return moment.utc(dateString).format('MMM DD YYYY');
  }

  cancelSelectRelated() {
    //fromCancel = true
    this.dismiss(true);
  }

  dismiss(fromCancel) {
    if (fromCancel) {
      this.relatedEvent = null;
    }
    let data = this.relatedEvent;
    this.viewCtrl.dismiss(data);
  }

/*
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
*/
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
