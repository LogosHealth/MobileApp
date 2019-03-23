import { Component } from '@angular/core';
import { NavController, NavParams, AlertController, LoadingController } from 'ionic-angular';
import { Validators, FormGroup, FormControl, FormArray } from '@angular/forms';
import { RestService } from '../../app/services/restService.service';
import { ListStresslevelModel, ListStresslevel } from '../../pages/listStresslevel/listStresslevel.model';
import { HistoryItemModel } from '../../pages/history/history.model';

var moment = require('moment-timezone');

@Component({
  selector: 'formExercise-page',
  templateUrl: 'formStresslevel.html'
})
export class FormStresslevelPage {
  loading: any;
  section: string;
  formName: string = "formStresslevel";
  recId: number;
  card_form: FormGroup;
  goal_array: FormArray;
  goal_schedule: FormGroup;
  curRec: any;
  newRec: boolean = false;
  saving: boolean = false;
  showTips: boolean = true;
  slModelSave: ListStresslevelModel  = new ListStresslevelModel();
  slSave: ListStresslevel = new ListStresslevel();
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
    console.log('formStressLevel - initial recid: ', this.recId);
    if (this.recId !== undefined && this.recId !== null) {
      this.curRec = RestService.results[this.recId];
    }
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
        level: new FormControl(this.curRec.level, Validators.required),
        factors: new FormControl(this.curRec.factors),
        howmanage: new FormControl(this.curRec.howmanage),
        dateofmeasure: new FormControl(this.formatDateTime(this.curRec.dateofmeasure))
      });
    } else {
      console.log('Creating new rec stress level init');
      this.newRec = true;
      this.card_form = new FormGroup({
        recordid: new FormControl(),
        level: new FormControl(null, Validators.required),
        factors: new FormControl(),
        howmanage: new FormControl(),
        dateofmeasure: new FormControl()
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
            this.slSave.recordid = this.card_form.get('recordid').value;
            this.slSave.profileid = this.RestService.currentProfile;
            this.slSave.userid = this.RestService.userId;
            this.slSave.active = 'N';
              var restURL="https://ap6oiuyew6.execute-api.us-east-1.amazonaws.com/dev/StresslevelByProfile";
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
              var body = JSON.stringify(this.slSave);
              var self = this;
              console.log('Calling Post', this.slSave);
              apigClient.invokeApi(params, pathTemplate, method, additionalParams, body)
              .then(function(result){
                self.RestService.results = result.data;
                console.log('Happy Path: ' + self.RestService.results);
                self.category.title = "Lifestyle";
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
      this.slSave.recordid = this.card_form.get('recordid').value;
      this.slSave.profileid = this.RestService.currentProfile;
      this.slSave.userid = this.RestService.userId;
      this.slSave.active = 'Y';
      if (this.card_form.get('level').dirty){
        this.slSave.level = this.card_form.get('level').value;
      }
      if (this.card_form.get('factors').dirty){
        this.slSave.factors = this.card_form.get('factors').value;
      }
      if (this.card_form.get('howmanage').dirty){
        this.slSave.howmanage = this.card_form.get('howmanage').value;
      }
    } else {
      this.slSave.profileid = this.RestService.currentProfile;
      this.slSave.userid = this.RestService.userId;
      this.slSave.active = 'Y';
      if (this.card_form.get('level').dirty){
        this.slSave.level = this.card_form.get('level').value;
      }
      if (this.card_form.get('factors').dirty){
        this.slSave.factors = this.card_form.get('factors').value;
      }
      if (this.card_form.get('howmanage').dirty){
        this.slSave.howmanage = this.card_form.get('howmanage').value;
      }
      if (this.card_form.get('dateofmeasure').dirty){
        this.slSave.dateofmeasure = this.calculateDateTime();
      }
    }
      var restURL="https://ap6oiuyew6.execute-api.us-east-1.amazonaws.com/dev/StresslevelByProfile";
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
      var body = JSON.stringify(this.slSave);
      var self = this;
      console.log('Calling Post', this.slSave);
      apigClient.invokeApi(params, pathTemplate, method, additionalParams, body)
      .then(function(result){
        self.RestService.results = result.data;
        console.log('Happy Path: ' + self.RestService.results);
        self.category.title = "Lifestyle";
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

  calculateDateTime() {
    var dtString;
    var offsetDate;
    var offset;
    var finalDate;
    var strDate;
    var strTime;
    //console.log('Date of Measure: ' + this.card_form.get('dateofmeasure').value);
    //console.log('Start Time: ' + this.card_form.get('starttime').value);
    if (this.userTimezone !== undefined && this.userTimezone !== null && this.userTimezone !== "") {
      strDate = this.momentNow.tz(this.userTimezone).format('YYYY-MM-DD');
      strTime = this.momentNow.tz(this.userTimezone).format('HH:mm');
    } else {
      strDate = this.momentNow.format('YYYY-MM-DD');
      strTime = this.momentNow.format('HH:mm');
    }
    if (this.card_form.get('dateofmeasure').dirty) {
      strDate = this.card_form.get('dateofmeasure').value;
    }
    strTime = '00:00';
    dtString = strDate + ' ' + strTime;
    offsetDate = new Date(moment(dtString).toISOString());
    offset = offsetDate.getTimezoneOffset() / 60;
    if (this.userTimezone !== undefined && this.userTimezone !== null && this.userTimezone !== "") {
      finalDate = moment(dtString).tz(this.userTimezone).add(offset, 'hours').format('YYYY-MM-DD HH:mm');
      console.log('Final date with timezone: ' + finalDate);
    } else {
      finalDate = moment(dtString).add(offset, 'hours').format('YYYY-MM-DD HH:mm');
      console.log('Final date with no timezone: ' + finalDate);
    }
    return finalDate;
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

  formatDateTimeTitle(dateString) {
    if (this.userTimezone !== undefined && this.userTimezone !== null && this.userTimezone !=="") {
      return moment(dateString).tz(this.userTimezone).format('dddd, MMMM DD');
    } else {
      return moment(dateString).format('dddd, MMMM DD');
    }
  }

  formatDateTime(dateString) {
    return moment.utc(dateString).format('MMM DD YYYY');
  }

/*
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

  formatDateTime2(dateString) {
    if (this.userTimezone !== undefined && this.userTimezone !=="") {
      return moment(dateString).tz(this.userTimezone).format('MM-DD-YYYY hh:mm A');
    } else {
      return moment(dateString).format('MM-DD-YYYY hh:mm A');
    }
  }
*/
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
