import { Component } from '@angular/core';
import { NavController, AlertController, NavParams, LoadingController, PopoverController, ModalController } from 'ionic-angular';
import { FeedModel } from '../feed/feed.model';
import 'rxjs/Rx';
import { ListMedicationModel } from './listMedication.model';
import { ListMedicationService } from './listMedication.service';
import { RestService } from '../../app/services/restService.service';
import { FormMedication } from '../../pages/formMedication/formMedication';
import { MenuHelp } from '../../pages/menuHelp/menuHelp';
import { FormMedAddDose } from '../../pages/formMedAddDose/formMedAddDose';

var moment = require('moment-timezone');

@Component({
  selector: 'listExercisePage',
  templateUrl: 'listMedication.html'
})
export class ListMedicationPage {
  list2: ListMedicationModel = new ListMedicationModel();
  feed: FeedModel = new FeedModel();
  loading: any;
  resultData: any;
  userTimezone: any;
  accountid: any;
  type: any;
  fromEvent: any;
  fromSymptom: any;
  noData: boolean = false;
  forSelection: boolean = false;

  constructor(
    public nav: NavController,
    public alertCtrl: AlertController,
    public list2Service: ListMedicationService,
    public navParams: NavParams,
    public RestService:RestService,
    public loadingCtrl: LoadingController,
    public popoverCtrl:PopoverController,
    public modalCtrl: ModalController,
  ) {
    this.feed.category = navParams.get('category');
    this.fromEvent = navParams.get('fromEvent');
    this.fromSymptom = navParams.get('fromSymptom');
    console.log('listMedication fromEvent: ', this.fromEvent);
    console.log('listMedication fromSymptom: ', this.fromSymptom);

    if (this.fromEvent !==undefined || this.fromSymptom !==undefined) {
      this.forSelection = true;
    }

    this.type = this.feed.category.title;
    if (this.feed.category.title == 'Medicine Cabinet') {
      this.accountid = this.RestService.Profiles[0].accountid;
    } else if (this.feed.category.title == 'Medicine') {
      this.feed.category.title = 'Current Medicine'
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
    var self = this;

    if (dtNow < dtExpiration) {
      this.presentLoadingDefault();
      this.loadData();
    } else {
      this.presentLoadingDefault();
      this.RestService.refreshCredentials(function(err, results) {
        if (err) {
          console.log('Need to login again!!! - Credentials expired from listMedication');
          self.loading.dismiss();
          self.RestService.appRestart();
        } else {
          console.log('From listMedication - Credentials refreshed!');
          self.loadData();
        }
      });
    }
  }

  loadData() {
    var restURL: string;
    restURL="https://ap6oiuyew6.execute-api.us-east-1.amazonaws.com/dev/MedicationByProfile";
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

    if (this.type == 'Medicine Cabinet') {
      additionalParams = {
        queryParams: {
            profileid: this.RestService.currentProfile,
            accountid: this.RestService.Profiles[0].accountid,
            type: this.type,
        }
      };
    } else {
      additionalParams = {
        queryParams: {
            profileid: this.RestService.currentProfile,
            type: this.type,
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
            self.noData = false;
            self.list2.items = self.RestService.results;
            console.log("Results Data for Get Medications: ", self.list2.items);
        } else {
          self.noData = true;
          self.list2.items = [];
          console.log('Results from listMedication.loadData', self.RestService.results);
        }
        if (self.forSelection) {
          self.feed.category.title = 'Select Medicine';
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

  flipSearch() {
    if (this.type == 'Medicine' || this.type == 'Current Medicine') {
      console.log('Going to med cab');
      this.type = 'Medicine Cabinet';
      this.feed.category.title = this.type;
      this.presentLoadingDefault();
      this.loadData();
    } else if (this.type == 'Medicine Cabinet') {
      console.log('Going to cur med');
      this.type = 'Current Medicine';
      this.feed.category.title = this.type;
      this.presentLoadingDefault();
      this.loadData();
    } else {
      console.log('Error in Flip Search - Type: ', this.type);
    }

  }

  isActive(index) {
    var selMed = this.RestService.results[index];
    var blnActive = false;

    //console.log('isActive: index ' + index);
    //console.log('isActive: selMed ', selMed);

    if (selMed !== undefined) {
      if (selMed.mode == 'cabinet') {
        blnActive = true;
      } else if (selMed.mode == 'basic') {
        if (selMed.treatmentresults !== undefined && selMed.treatmentresults.items !== undefined && selMed.treatmentresults.items[0] !== undefined) {
          if (selMed.treatmentresults.items[0].dosetrackingtype == 'active' && selMed.treatmentresults.items[0].dosetrackingstate == 'activated') {
            blnActive = true;
          }
        }
      }
    }
    return blnActive;
  }

  addDose(index) {
    var selMed = this.RestService.results[index];
    var objIncluded = 'none';
    var self = this;

    console.log('listMed.addDose selMed: ', selMed);
    console.log('listMed.addDose fromEvent: ', this.fromEvent);
    console.log('listMed.addDose fromSymp: ', this.fromSymptom);
    if (this.fromSymptom !== undefined && this.fromSymptom !== null) {
      objIncluded = 'symptom';
    } else if (this.fromEvent !== undefined && this.fromEvent !== null) {
      objIncluded = 'event';
    }
    console.log('objIncluded - ' + objIncluded);

    let profileModal = this.modalCtrl.create(FormMedAddDose, { objIncluded: objIncluded, fromSymptom: this.fromSymptom,
      fromEvent: this.fromEvent, medication: selMed });
    profileModal.onDidDismiss(data => {
      console.log('Data from getDefaultUser: ', data);
      if (data !== undefined) {
        console.log('Data from addDose: ', data);
        if (data.userUpdated !== undefined && data.userUpdated == true) {
          self.nav.pop();
        }
      }
    });
    profileModal.present();
    //alert('Coming soon!  This will allow you to quickly track medication usage.');
  }

  presentHelp(myEvent) {
    var title = 'Drug Mode';
    var helptext = "<b>Basic:</b> Pertains to a single indication and includes only start and stop dates.  Great for maintenance and historical medications.<br><br>" +
    "<b>Medicine Cabinet:</b> Your vitual medicine cabinet.  You can set up dose schedules, manage inventory, and use across family members.  Great for multi-use, OTC drugs as well as targeted temporary treatments with set schedules (e.g. antibiotics)";

    let popover = this.popoverCtrl.create(MenuHelp, {title: title, helptext: helptext});
    popover.onDidDismiss(data => {
      console.log('From popover onDismiss: ', data);
    });
    popover.present({
      ev: myEvent
    });
  }

  openRecord(recordId) {
    //console.log("Goto Form index: " + recordId);
    //console.log("Recordid from index: " + this.list2[recordId].recordid);
    //console.log('listMedication.openRecord fromEvent: ', this.fromEvent);

    if (!this.forSelection) {
      if (this.fromEvent !== undefined && this.fromEvent.medicaleventid !== undefined && this.fromEvent.medicaleventid > 0) {
        this.nav.push(FormMedication, { recId: recordId, fromEvent: this.fromEvent });
      } else if (this.fromSymptom !== undefined && this.fromSymptom.symptomid !== undefined && this.fromSymptom.symptomid > 0) {
        this.nav.push(FormMedication, { recId: recordId, fromSymptom: this.fromSymptom });
      } else {
        this.nav.push(FormMedication, { recId: recordId });
      }
      //alert('Open Record:' + recordId);
    } else {
      this.addDose(recordId);
    }

  }

  addNew() {
    if (this.type == 'Medicine Cabinet') {
      console.log('From Cabinet')
      this.nav.push(FormMedication, {newFromCabinet: true});
    } else {
      this.nav.push(FormMedication);
    }
  }

  attachRecord() {
    alert('Coming soon.  This button will allow you to attach pictures and documents (e.g. PDFs) of physical medical records');
  }

  formatDateTime(dateString) {
    //alert('FormatDateTime called');
    if (this.userTimezone !== undefined && this.userTimezone !==null && this.userTimezone !=="") {
      return moment(dateString).tz(this.userTimezone).format('dddd, MMMM DD');
    } else {
      return moment(dateString).format('dddd, MMMM DD');
    }
  }

  formatDateTime2(dateString) {
    //alert('FormatDateTime called');
    if (this.userTimezone !== undefined && this.userTimezone !==null && this.userTimezone !=="") {
      return moment(dateString).tz(this.userTimezone).format('MMM DD YYYY');
    } else {
      return moment(dateString).format('MMM DD YYYY');
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
