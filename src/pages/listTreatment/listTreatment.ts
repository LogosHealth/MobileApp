import { Component } from '@angular/core';
import { NavController, AlertController, NavParams, LoadingController } from 'ionic-angular';
import { FeedModel } from '../feed/feed.model';
import 'rxjs/Rx';
import { TreatmentResults } from '../../pages/listMedication/listMedication.model';
import { ListMedicationService } from '../../pages/listMedication/listMedication.service';
import { RestService } from '../../app/services/restService.service';
import { FormMedicationResults } from '../../pages/formMedicationResults/formMedicationResults';

var moment = require('moment-timezone');

@Component({
  selector: 'listExercisePage',
  templateUrl: 'listTreatment.html'
})
export class ListTreatmentPage {
  list2: TreatmentResults = new TreatmentResults();
  feed: FeedModel = new FeedModel();
  formName: string = "listTreatment";
  loading: any;
  resultData: any;
  userTimezone: any;
  loadFromId: any;
  medication: any;
  fromEvent: any;
  fromSymptom: any;
  isSymptom: boolean = false;

  constructor(
    public nav: NavController,
    public alertCtrl: AlertController,
    public list2Service: ListMedicationService,
    public navParams: NavParams,
    public RestService:RestService,
    public loadingCtrl: LoadingController,
  ) {
    this.feed.category = navParams.get('category');
    this.loadFromId = navParams.get('loadFromId');
    this.fromEvent = navParams.get('fromEvent');
    this.fromSymptom = navParams.get('fromSymptom');

    if (this.fromEvent !== undefined && this.fromEvent.medicaleventid !== undefined && this.loadFromId == undefined) {
      this.loadFromId = this.fromEvent.medicaleventid;
      console.log('LoadFromId added from fromEvent');
    } else if (this.fromSymptom !== undefined && this.fromSymptom.symptomid !== undefined && this.loadFromId == undefined) {
      this.loadFromId = this.fromSymptom.symptomid;
      this.isSymptom = true;
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
          console.log('Need to login again!!! - Credentials expired from listTreatment');
          self.loading.dismiss();
          self.RestService.appRestart();
        } else {
          console.log('From listTreatment - Credentials refreshed!');
          self.loadData();
        }
      });
    }
  }

  loadData() {
    var restURL: string;
    restURL="https://ap6oiuyew6.execute-api.us-east-1.amazonaws.com/dev/TreatmentByEvent";

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

    if (this.loadFromId !== undefined && this.loadFromId > 0) {
      if (this.isSymptom == true) {
        additionalParams = {
          queryParams: {
              profileid: this.RestService.currentProfile,
              loadFromId: this.loadFromId,
              isSymptom: 'Y'
          }
        };
      } else {
        additionalParams = {
          queryParams: {
              profileid: this.RestService.currentProfile,
              loadFromId: this.loadFromId
          }
        };
      }
    } else {
      additionalParams = {
        queryParams: {
            profileid: this.RestService.currentProfile
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
            console.log("Results Data for Get Treatment: ", self.list2.items);
        } else {
          console.log('Results from listTreatment.loadData', self.RestService.results);
        }
        self.loading.dismiss();
      });
    }).catch( function(result){
        console.log(result);
        self.loading.dismiss();
        alert('There was an error retrieving this data.  Please try again later');
    });
  }

  openRecord(recordId) {
    console.log("Goto Form index: " + recordId);
    //console.log("Recordid from index: " + this.list2[recordId].recordid);
    this.nav.push(FormMedicationResults, { recId: recordId, medication: this.medication });
    //alert('Open Record:' + recordId);
  }

  addNew() {
    this.nav.push(FormMedicationResults);
  }

  formatDateTime(dateString) {
    var offsetDate;
    var offset;
    var finalDate;

    offsetDate = new Date(moment(dateString).toISOString());
    offset = offsetDate.getTimezoneOffset() / 60;
    if (this.userTimezone !== undefined && this.userTimezone !== null && this.userTimezone !== "") {
      finalDate = moment(dateString).tz(this.userTimezone).add(offset, 'hours').format('MMM DD-YY');
      //console.log('Final date with timezone: ' + finalDate);
    } else {
      finalDate = moment(dateString).add(offset, 'hours').format('MMM DD-YY');
      //console.log('Final date with no timezone: ' + finalDate);
    }
    return finalDate;
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
