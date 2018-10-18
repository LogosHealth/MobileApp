import { Component } from '@angular/core';
import { NavController, NavParams, AlertController, LoadingController } from 'ionic-angular';
import { Validators, FormGroup, FormControl, FormArray } from '@angular/forms';
import { RestService } from '../../app/services/restService.service';
import { ListSleepModel, ListSleep } from '../../pages/listSleep/listSleep.model';
import { HistoryItemModel } from '../../pages/history/history.model';
import { ListGoalsModel } from '../../pages/listGoals/listGoals.model';
import { ListGoalsService } from '../../pages/listGoals/listGoals.service';

var moment = require('moment-timezone');

@Component({
  selector: 'formExercise-page',
  templateUrl: 'formSleep.html'
})
export class FormSleepPage {
  loading: any;
  section: string;
  formName: string = "formSleep";
  recId: number;
  card_form: FormGroup;
  goal_array: FormArray;
  goal_schedule: FormGroup;
  curRec: any;
  newRec: boolean = false;
  saving: boolean = false;
  showTips: boolean = true;

  sleepModelSave: ListSleepModel  = new ListSleepModel();
  sleepSave: ListSleep = new ListSleep();
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
    this.recId = navParams.get('recId');
    this.curRec = RestService.results[this.recId];

    var self = this;
    this.RestService.curProfileObj(function (error, results) {
      if (!error) {
        self.userTimezone = results.timezone;
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

    if (this.recId !== undefined) {
      this.card_form = new FormGroup({
        recordid: new FormControl(this.curRec.recordid),
        hoursslept: new FormControl(this.curRec.hoursslept, Validators.required),
        starttime: new FormControl(this.curRec.starttime),
        waketime: new FormControl(this.curRec.waketime),
        dateofmeasure: new FormControl(this.formatDateTime2(this.curRec.dateofmeasure)),
        confirmed: new FormControl(this.curRec.confirmed),
        profileid: new FormControl(this.curRec.profileid),
        userid: new FormControl(this.curRec.userid)
      });
    } else {
      this.newRec = true;
      this.card_form = new FormGroup({
        recordid: new FormControl(),
        hoursslept: new FormControl(),
        starttime: new FormControl(null, Validators.max(this.timeNow)),
        waketime: new FormControl(null, Validators.max(this.timeNow)),
        dateofmeasure: new FormControl(),
        confirmed: new FormControl(),
        profileid: new FormControl(),
        userid: new FormControl()
      });
    }
  }

  ionViewWillEnter() {
    this.loading = this.loadingCtrl.create();
    this.loading.present();
    this.nav.getPrevious().data.refresh = false;
    this.loading.dismiss();
  }

  deleteRecord(){
    let alert = this.alertCtrl.create({
      title: 'Confirm Delete',
      message: 'Are you certain you want to delete this record?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'Delete',
          handler: () => {
            console.log('Delete clicked');
            this.saving = true;
            //alert('Going to delete');
            this.sleepSave.recordid = this.card_form.get('recordid').value;
            this.sleepSave.profileid = this.RestService.currentProfile;
            this.sleepSave.userid = this.RestService.userId;
            this.sleepSave.active = 'N';

            var dtNow = moment(new Date());
            var dtExpiration = moment(this.RestService.AuthData.expiration);

            if (dtNow < dtExpiration) {
              var restURL="https://ap6oiuyew6.execute-api.us-east-1.amazonaws.com/dev/SleepByProfile";

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
                      profileid: this.RestService.currentProfile,
                  }
              };
              var body = JSON.stringify(this.sleepSave);
              var self = this;

              console.log('Calling Post', this.sleepSave);
              apigClient.invokeApi(params, pathTemplate, method, additionalParams, body)
              .then(function(result){
                self.RestService.results = result.data;
                console.log('Happy Path: ' + self.RestService.results);
                self.category.title = "Sleep";
                self.nav.pop();
              }).catch( function(result){
                console.log('Result: ',result);
                console.log(body);
              });
            } else {
              console.log('Need to login again!!! - Credentials expired from formSleep - DeleteData dtExpiration = ' + dtExpiration + ' dtNow = ' + dtNow);
              this.RestService.appRestart();
            }
          }
        }
      ]
    });
    alert.present();
  }

  saveRecord(){
    this.saving = true;
    //alert('Save Button Selected');
    if (this.card_form.get('recordid').value !==undefined && this.card_form.get('recordid').value !==null) {
      this.sleepSave.recordid = this.card_form.get('recordid').value;
      this.sleepSave.profileid = this.RestService.currentProfile;
      this.sleepSave.userid = this.RestService.userId;
      this.sleepSave.active = 'Y';
      if (this.card_form.get('hoursslept').dirty){
        this.sleepSave.hoursslept = this.card_form.get('hoursslept').value;
      }
      if (this.card_form.get('starttime').dirty){
        this.sleepSave.starttime = this.card_form.get('starttime').value;
      }
      if (this.card_form.get('waketime').dirty){
        this.sleepSave.waketime = this.card_form.get('waketime').value;
      }
    } else {
      this.sleepSave.profileid = this.RestService.currentProfile;
      this.sleepSave.userid = this.RestService.userId;
      this.sleepSave.active = 'Y';
      if (this.card_form.get('hoursslept').dirty){
        this.sleepSave.hoursslept = this.card_form.get('hoursslept').value;
      }
      if (this.card_form.get('starttime').dirty){
        this.sleepSave.starttime = this.card_form.get('starttime').value;
      }
      if (this.card_form.get('waketime').dirty){
        this.sleepSave.waketime = this.card_form.get('waketime').value;
      }
      if (this.card_form.get('dateofmeasure').dirty){
        if (this.userTimezone !== undefined) {
          var dtDET = moment.tz(this.card_form.get('dateofmeasure').value, this.userTimezone);
        } else {
          var dtDET = moment(this.card_form.get('dateofmeasure').value);
        }
        console.log('Date Sent: ' + dtDET.utc().format('MM-DD-YYYY HH:mm'));
        this.sleepSave.dateofmeasure = dtDET.utc().toISOString();
      }
      if (this.userTimezone !== undefined && this.userTimezone !=="") {
        this.sleepSave.timezone = this.userTimezone;
      }
    }

    var dtNow = moment(new Date());
    var dtExpiration = moment(this.RestService.AuthData.expiration);

    if (dtNow < dtExpiration) {
      var restURL="https://ap6oiuyew6.execute-api.us-east-1.amazonaws.com/dev/SleepByProfile";

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
      var body = JSON.stringify(this.sleepSave);
      var self = this;

      console.log('Calling Post', this.sleepSave);
      apigClient.invokeApi(params, pathTemplate, method, additionalParams, body)
      .then(function(result){
        self.RestService.results = result.data;
        console.log('Happy Path: ' + self.RestService.results);
        self.category.title = "Sleep";
        self.nav.pop();
      }).catch( function(result){
        console.log('Result: ',result);
        console.log(body);
      });
    } else {
      console.log('Need to login again!!! - Credentials expired from formSleep - SaveData dtExpiration = ' + dtExpiration + ' dtNow = ' + dtNow);
      this.RestService.appRestart();
    }
  }

  public today() {
    return new Date().toISOString().substring(0,10);
  }

  formatDateTime(dateString) {
    //alert('FormatDateTime called');
    if (this.userTimezone !== undefined && this.userTimezone !=="") {
      return moment(dateString).tz(this.userTimezone).format('dddd, MMMM DD');
    } else {
      return moment(dateString).format('dddd, MMMM DD');
    }
  }

  formatDateTime2(dateString) {
    //alert('FormatDateTime called');
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

}
