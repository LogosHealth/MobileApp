import { Component } from '@angular/core';
import { NavController, NavParams, AlertController, LoadingController } from 'ionic-angular';
import { Validators, FormGroup, FormControl, FormArray } from '@angular/forms';
import { RestService } from '../../app/services/restService.service';
import { ListOccupationModel, Occupation } from '../../pages/listOccupation/listOccupation.model';
import { HistoryItemModel } from '../../pages/history/history.model';

var moment = require('moment-timezone');

@Component({
  selector: 'formExercise-page',
  templateUrl: 'formOccupation.html'
})
export class FormOccupationPage {
  loading: any;
  section: string;
  formName: string = "formOccupation";
  recId: number;
  card_form: FormGroup;
  goal_array: FormArray;
  goal_schedule: FormGroup;
  curRec: any;
  newRec: boolean = false;
  saving: boolean = false;
  showTips: boolean = true;
  occModelSave: ListOccupationModel  = new ListOccupationModel();
  occSave: Occupation = new Occupation();
  category: HistoryItemModel = new HistoryItemModel();
  userTimezone: any;
  timeNow: any;
  hourNow: any;
  minuteNow: any;
  momentNow: any;
  categories_checkbox_open: boolean;
  categories_checkbox_result;

  constructor(public nav: NavController, public alertCtrl: AlertController, public RestService:RestService,
    public navParams: NavParams, public loadingCtrl: LoadingController) {

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
    if (this.recId !== undefined) {
      this.card_form = new FormGroup({
        recordid: new FormControl(this.curRec.recordid),
        name: new FormControl(this.curRec.name, Validators.required),
        description: new FormControl(this.curRec.description),
        startdate: new FormControl(this.curRec.startdate, Validators.required),
        enddate: new FormControl(this.curRec.enddate),
        knownhazards: new FormControl(this.curRec.knownhazards)
      });
    } else {
      this.newRec = true;
      this.card_form = new FormGroup({
        recordid: new FormControl(),
        name: new FormControl(null, Validators.required),
        description: new FormControl(),
        startdate: new FormControl(null, Validators.required),
        enddate: new FormControl(),
        knownhazards: new FormControl(),
      });
    }
  }

  ionViewWillEnter() {
    this.nav.getPrevious().data.refresh = false;
  }

  deleteRecord(){
    var dtNow = moment(new Date());
    var dtExpiration = moment(this.RestService.AuthData.expiration);
    var self = this;

    if (dtNow < dtExpiration) {
      this.presentLoadingDefault();
      this.deleteRecordDo();
    } else {
      this.presentLoadingDefault();
      this.RestService.refreshCredentials(function(err, results) {
        if (err) {
          console.log('Need to login again!!! - Credentials expired from ' + self.formName + '.deleteRecord');
          self.loading.dismiss();
          self.RestService.appRestart();
        } else {
          console.log('From ' + self.formName + '.deleteRecord - Credentials refreshed!');
          self.deleteRecordDo();
        }
      });
    }
  }

  deleteRecordDo(){
    let alert = this.alertCtrl.create({
      title: 'Confirm Delete',
      message: 'Are you certain you want to delete this record?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
            this.loading.dismiss();
            console.log('Cancel clicked');
          }
        },
        {
          text: 'Delete',
          handler: () => {
            console.log('Delete clicked');
            this.saving = true;
            this.occSave.recordid = this.card_form.get('recordid').value;
            this.occSave.profileid = this.RestService.currentProfile;
            this.occSave.userid = this.RestService.userId;
            this.occSave.active = 'N';
              var restURL="https://ap6oiuyew6.execute-api.us-east-1.amazonaws.com/dev/OccupationByProfile";
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
              var body = JSON.stringify(this.occSave);
              var self = this;
              console.log('Calling Post', this.occSave);
              apigClient.invokeApi(params, pathTemplate, method, additionalParams, body)
              .then(function(result){
                self.RestService.results = result.data;
                console.log('Happy Path: ' + self.RestService.results);
                self.category.title = "Occupation";
                self.loading.dismiss();
                //Set to trigger parent page to refresh data upon reentry
                self.RestService.refreshParent = true;
                self.nav.pop();
              }).catch( function(result){
                console.log('Error from ' + self.formName + '.delete: ',result);
                self.loading.dismiss();
              });
          }
        }
      ]
    });
    alert.present();
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
          console.log('Need to login again!!! - Credentials expired from ' + self.formName + '.saveRecord');
          self.loading.dismiss();
          self.RestService.appRestart();
        } else {
          console.log('From ' + self.formName + '.saveRecord - Credentials refreshed!');
          self.saveRecordDo();
        }
      });
    }
  }

  saveRecordDo(){
    this.saving = true;
    if (this.card_form.get('recordid').value !==undefined && this.card_form.get('recordid').value !==null) {
      this.occSave.recordid = this.card_form.get('recordid').value;
      this.occSave.profileid = this.RestService.currentProfile;
      this.occSave.userid = this.RestService.userId;
      this.occSave.active = 'Y';
      if (this.card_form.get('name').dirty){
        this.occSave.name = this.card_form.get('name').value;
      }
      if (this.card_form.get('description').dirty){
        this.occSave.description = this.card_form.get('description').value;
      }
      if (this.card_form.get('startdate').dirty){
        this.occSave.startdate = this.card_form.get('startdate').value.substring(0, 7) + '-05';
        console.log('Parsed StartDate: ' + this.occSave.startdate);
      }
      if (this.card_form.get('enddate').dirty){
        this.occSave.enddate = this.card_form.get('enddate').value.substring(0, 7) + '-05';
      }
      if (this.card_form.get('knownhazards').dirty){
        this.occSave.knownhazards = this.card_form.get('knownhazards').value;
      }
    } else {
      this.occSave.profileid = this.RestService.currentProfile;
      this.occSave.userid = this.RestService.userId;
      this.occSave.active = 'Y';
      if (this.card_form.get('name').dirty){
        this.occSave.name = this.card_form.get('name').value;
      }
      if (this.card_form.get('description').dirty){
        this.occSave.description = this.card_form.get('description').value;
      }
      if (this.card_form.get('startdate').dirty){
        this.occSave.startdate = this.card_form.get('startdate').value.substring(0, 7) + '-05';
      }
      if (this.card_form.get('enddate').dirty){
        this.occSave.enddate = this.card_form.get('enddate').value.substring(0, 7) + '-05';
      }
      if (this.card_form.get('knownhazards').dirty){
        this.occSave.knownhazards = this.card_form.get('knownhazards').value;
      }
    }
      var restURL="https://ap6oiuyew6.execute-api.us-east-1.amazonaws.com/dev/OccupationByProfile";
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
      var body = JSON.stringify(this.occSave);
      var self = this;
      console.log('Calling Post', this.occSave);
      apigClient.invokeApi(params, pathTemplate, method, additionalParams, body)
      .then(function(result){
        self.RestService.results = result.data;
        console.log('Happy Path: ' + self.RestService.results);
        self.category.title = "Occupation";
        self.loading.dismiss();
        //Set to trigger parent page to refresh data upon reentry
        self.RestService.refreshParent = true;
        self.nav.pop();
      }).catch( function(result){
        console.log('Error from ' + self.formName + '.save: ',result);
        self.loading.dismiss();
        alert('There was an error saving this data.  Please try again later');
      });
  }

  public today() {
    //Used as max day in date of measure control
    var momentNow;

    if (this.userTimezone !== undefined && this.userTimezone !== null && this.userTimezone !== "") {
      momentNow = this.momentNow.tz(this.userTimezone).format('YYYY-MM-DD');
    } else {
      momentNow = this.momentNow.format('YYYY-MM-DD');
    }
    //console.log('From Today momentNow: ' + momentNow);
    return momentNow;
  }
/*
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
      return moment(dateString).format('MM-DD-YYYY hh:mm A');
    }
  }
*/
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
