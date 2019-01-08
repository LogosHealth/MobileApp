import {Component} from '@angular/core';
import { NavController, NavParams, AlertController, LoadingController } from 'ionic-angular';
import { Validators, FormGroup, FormControl, FormArray } from '@angular/forms';
import { RestService } from '../../app/services/restService.service';
import { HistoryItemModel } from '../../pages/history/history.model';
import { ListGoalsModel } from '../../pages/listGoals/listGoals.model';
import { ListGoalsService } from '../../pages/listGoals/listGoals.service';
import { FormVisitPage } from '../../pages/formVisit/formVisit';
import { CallNote } from './formCallNotes.model';

var moment = require('moment-timezone');

@Component({
  selector: 'formExercise-page',
  templateUrl: 'formCallNotes.html'
})
export class FormCallNotesPage {
  loading: any;
  section: string;
  formName: string = "FormCallNotesPage";
  recId: number;
  card_form: FormGroup;
  goal_array: FormArray;
  goal_schedule: FormGroup;
  curRec: any;
  curProfile: any;
  contact: any;
  visit: any;
  fromVisit: boolean = false;
  newRec: boolean = false;
  saving: boolean = false;
  callNoteSave: CallNote = new CallNote();
  category: HistoryItemModel = new HistoryItemModel();
  userTimezone: any;
  list2: ListGoalsModel = new ListGoalsModel();
  timeNow: any;
  hourNow: any;
  minuteNow: any;
  momentNow: any;
  categories_checkbox_open: boolean;
  categories_checkbox_result;

  constructor(public nav: NavController, public alertCtrl: AlertController, public RestService:RestService,
    public navParams: NavParams, public loadingCtrl: LoadingController, public list2Service: ListGoalsService) {

    this.fromVisit = navParams.get('fromVisit');
    if (this.fromVisit) {
      this.visit = navParams.get('visit');
    } else {
      this.contact = navParams.get('contact');
    }
    var self = this;
    this.RestService.curProfileObj(function (error, results) {
      if (!error) {
        self.userTimezone = results.timezone;
        self.curProfile = results;
      }
    });
    this.momentNow = moment(new Date());
    if (this.userTimezone !== undefined && this.userTimezone !== null && this.userTimezone !== "") {
      this.hourNow = this.momentNow.tz(this.userTimezone).format('HH');
      this.minuteNow = this.momentNow.tz(this.userTimezone).format('mm');
      this.timeNow = this.momentNow.tz(this.userTimezone).format('HH:mm');
    } else {
      this.hourNow = this.momentNow.format('HH');
      this.minuteNow = this.momentNow.format('mm');
      this.timeNow = this.momentNow.format('HH:mm');
    }
    console.log("Hour Now: " + this.hourNow + ", Minute Now:  " + this.minuteNow + ", Time Now" + this.timeNow);
    var strTitle;
    var numContact = null;
    var numVisit = null;
    if (this.fromVisit) {
      strTitle = this.visit.physician.title;
      numContact = this.visit.physician.recordid;
      numVisit = this.visit.recordid;
    } else {
      strTitle = this.contact.title;
      numContact = this.contact.recordid;
    }
    this.card_form = new FormGroup({
      recordid: new FormControl(),
      title: new FormControl(strTitle),
      callnotes: new FormControl(null, Validators.required),
      dateofmeasure: new FormControl(this.formatDateTime2(this.momentNow)),
      confirmed: new FormControl(),
      contactid: new FormControl(numContact),
      visitid: new FormControl(numVisit),
      profileid: new FormControl(this.curProfile.profileid),
      userid: new FormControl(this.RestService.userId)
    });
  }

  ionViewWillEnter() {
    this.nav.getPrevious().data.refresh = false;
  }

  saveRecord(){
    var dtNow = moment(new Date());
    var dtExpiration = moment(this.RestService.AuthData.expiration);
    var self = this;

    if (dtNow < dtExpiration) {
      this.presentLoadingDefault();
      this.saveRecordDo();
    } else {
      this.presentLoadingDefault();
      this.RestService.refreshCredentials(function(err, results) {
        if (err) {
          console.log('Need to login again!!! - Credentials expired from formCallNotes.saveRecord');
          self.loading.dismiss();
          self.RestService.appRestart();
        } else {
          console.log('From formCallNotes.saveRecord - Credentials refreshed!');
          self.saveRecordDo();
        }
      });
    }
  }

  saveRecordDo(){
    this.saving = true;
    if (this.card_form.get('recordid').value !==undefined && this.card_form.get('recordid').value !==null) {
      this.callNoteSave.recordid = this.card_form.get('recordid').value;
      this.callNoteSave.profileid = this.card_form.get('profileid').value;
      this.callNoteSave.userid = this.card_form.get('userid').value;
      this.callNoteSave.active = 'Y';
      if (this.card_form.get('callnotes').dirty){
        this.callNoteSave.callnote = this.card_form.get('callnotes').value;
      }
    } else {
      this.callNoteSave.profileid = this.card_form.get('profileid').value;
      this.callNoteSave.userid = this.card_form.get('userid').value;
      if (this.card_form.get('contactid').value !== undefined && this.card_form.get('contactid').value !== null){
        this.callNoteSave.contactid = this.card_form.get('contactid').value;
      }
      if (this.card_form.get('visitid').value !== undefined && this.card_form.get('visitid').value !== null){
        this.callNoteSave.visitid = this.card_form.get('visitid').value;
      }
      if (this.card_form.get('callnotes').dirty){
        this.callNoteSave.callnote = this.card_form.get('callnotes').value;
      }
      this.callNoteSave.active = 'Y';
    }
      var restURL="https://ap6oiuyew6.execute-api.us-east-1.amazonaws.com/dev/CallNotesByProfile";
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
      var body = JSON.stringify(this.callNoteSave);
      var self = this;
      console.log('Calling Post', this.callNoteSave);
      apigClient.invokeApi(params, pathTemplate, method, additionalParams, body)
      .then(function(result){
        self.RestService.results = result.data;
        console.log('Happy Path: ' + self.RestService.results);
        self.category.title = "Sleep";
        self.loading.dismiss();
        self.nav.pop();
      }).catch( function(result){
        console.log('Result: ',result);
        self.loading.dismiss();
      });
  }

  public today() {
    return new Date().toISOString().substring(0,10);
  }

  createVisit() {
    this.nav.push(FormVisitPage, {contact: this.contact});
  }

  formatDateTime(dateString) {
    if (this.userTimezone !== undefined && this.userTimezone !=="") {
      return moment(dateString).tz(this.userTimezone).format('dddd, MMMM DD');
    } else {
      return moment(dateString).format('dddd, MMMM DD');
    }
  }

  formatDateTime2(dateString) {
    if (this.userTimezone !== undefined && this.userTimezone !=="") {
      return moment(dateString).tz(this.userTimezone).format('MM-DD-YYYY hh:mm A');
    } else {
      return moment(dateString).format('MM-DD-YYYY hh:mm a');
    }
  }

  updateCalc() {
    if (this.card_form.get('starttime').value !== null && this.card_form.get('waketime').value !== null) {
      var startSplit = this.card_form.get('starttime').value.split(":");
      var startHour = Number(startSplit[0]);
      var startMinRatio = (Number(startSplit[1]))/60;
      var wakeSplit = this.card_form.get('waketime').value.split(":");
      var wakeHour = Number(wakeSplit[0]);
      var wakeMinRatio = (Number(wakeSplit[1]))/60;
      var duration;

      if ((wakeHour + wakeMinRatio) >=(startHour + startMinRatio)) {
        duration = (wakeHour + wakeMinRatio) - (startHour + startMinRatio);
      } else {
        duration = (24 - (startHour + startMinRatio)) + (wakeHour + wakeMinRatio);
      }
      this.card_form.get('hoursslept').setValue(duration);
    } else {
      if (this.card_form.get('starttime').value !== null || this.card_form.get('waketime').value !== null) {
        this.card_form.get('hoursslept').setValue(null);
      }
    }
  }

  async ionViewCanLeave() {
    if (!this.saving && this.card_form.dirty) {
      const shouldLeave = await this.confirmLeave();
      return shouldLeave;
    }
  }

  confirmLeave(): Promise<Boolean> {
    let resolveLeaving;
    const canLeave = new Promise<Boolean>(resolve => resolveLeaving = resolve);
    const alert = this.alertCtrl.create({
      title: 'Exit without Saving',
      message: 'Do you want to exit without saving?',
      buttons: [
        {
          text: 'No',
          role: 'cancel',
          handler: () => resolveLeaving(false)
        },
        {
          text: 'Yes',
          handler: () => resolveLeaving(true)
        }
      ]
    });
    alert.present();
    return canLeave
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
