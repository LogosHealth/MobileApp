import { Component } from '@angular/core';
import { NavController, NavParams, AlertController, LoadingController } from 'ionic-angular';
import { Validators, FormGroup, FormControl, FormArray } from '@angular/forms';
import { RestService } from '../../app/services/restService.service';
import { LifestyleItemModel, LifestyleItem } from '../../pages/listLifestyleItem/listLifestyleItem.model';
import { HistoryItemModel } from '../../pages/history/history.model';

var moment = require('moment-timezone');

@Component({
  selector: 'formExercise-page',
  templateUrl: 'formLifestyleItem.html'
})
export class FormLifestyleItem {
  loading: any;
  section: string;
  formName: string = "formLifestyleItem";
  recId: number;
  card_form: FormGroup;
  goal_array: FormArray;
  goal_schedule: FormGroup;
  curRec: any;
  newRec: boolean = false;
  saving: boolean = false;
  showTips: boolean = true;
  lilModelSave: LifestyleItemModel  = new LifestyleItemModel();
  liSave: LifestyleItem = new LifestyleItem();
  category: HistoryItemModel = new HistoryItemModel();
  userTimezone: any;
  timeNow: any;
  hourNow: any;
  minuteNow: any;
  momentNow: any;
  categories_checkbox_open: boolean;
  categories_checkbox_result;
  strType: any;
  blnDoes: boolean = false;

  constructor(public nav: NavController, public alertCtrl: AlertController, public RestService:RestService,
    public navParams: NavParams, public loadingCtrl: LoadingController) {

    this.recId = navParams.get('recId');
    this.strType = navParams.get('type');
    console.log('formLifestyleItem: strType = ' + this.strType);
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
        type: new FormControl(this.curRec.type),
        subtype: new FormControl(this.curRec.subtype),
        does: new FormControl(this.curRec.does, Validators.required),
        startdate: new FormControl(this.curRec.startdate),
        enddate: new FormControl(this.curRec.enddate),
        daysperweek: new FormControl(this.curRec.daysperweek),
        itemsperday: new FormControl(this.curRec.itemsperday),
        comments: new FormControl(this.curRec.comments)
      });
    } else {
      this.newRec = true;
      this.card_form = new FormGroup({
        recordid: new FormControl(),
        type: new FormControl(this.strType),
        subtype: new FormControl(),
        does: new FormControl(null, Validators.required),
        startdate: new FormControl(),
        enddate: new FormControl(),
        daysperweek: new FormControl(),
        itemsperday: new FormControl(),
        comments: new FormControl()
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
            this.liSave.recordid = this.card_form.get('recordid').value;
            this.liSave.profileid = this.RestService.currentProfile;
            this.liSave.userid = this.RestService.userId;
            this.liSave.active = 'N';
              var restURL="https://ap6oiuyew6.execute-api.us-east-1.amazonaws.com/dev/LifestyleItemByProfile";
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
              var body = JSON.stringify(this.liSave);
              var self = this;
              console.log('Calling Post', this.liSave);
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
      this.liSave.recordid = this.card_form.get('recordid').value;
      this.liSave.profileid = this.RestService.currentProfile;
      this.liSave.userid = this.RestService.userId;
      this.liSave.active = 'Y';
      this.liSave.type = this.card_form.get('type').value;

      if (this.card_form.get('subtype').dirty){
        this.liSave.subtype = this.card_form.get('subtype').value;
      }
      if (this.card_form.get('does').dirty){
        this.liSave.does = this.card_form.get('does').value;
      }
      if (this.card_form.get('startdate').dirty){
        this.liSave.startdate = this.calculateDateTime(this.card_form.get('startdate').value);
      }
      if (this.card_form.get('enddate').dirty){
        this.liSave.enddate = this.calculateDateTime(this.card_form.get('enddate').value);
      }
      if (this.card_form.get('daysperweek').dirty){
        this.liSave.daysperweek = this.card_form.get('daysperweek').value;
      }
      if (this.card_form.get('itemsperday').dirty){
        this.liSave.itemsperday = this.card_form.get('itemsperday').value;
      }
      if (this.card_form.get('comments').dirty){
        this.liSave.comments = this.card_form.get('comments').value;
      }
    } else {
      this.liSave.profileid = this.RestService.currentProfile;
      this.liSave.userid = this.RestService.userId;
      this.liSave.active = 'Y';
      this.liSave.type = this.card_form.get('type').value;

      if (this.card_form.get('subtype').dirty){
        this.liSave.subtype = this.card_form.get('subtype').value;
      }
      if (this.card_form.get('does').dirty){
        this.liSave.does = this.card_form.get('does').value;
      }
      if (this.card_form.get('startdate').dirty){
        this.liSave.startdate = this.calculateDateTime(this.card_form.get('startdate').value);
      }
      if (this.card_form.get('enddate').dirty){
        this.liSave.enddate = this.calculateDateTime(this.card_form.get('enddate').value);
      }
      if (this.card_form.get('daysperweek').dirty){
        this.liSave.daysperweek = this.card_form.get('daysperweek').value;
      }
      if (this.card_form.get('itemsperday').dirty){
        this.liSave.itemsperday = this.card_form.get('itemsperday').value;
      }
      if (this.card_form.get('comments').dirty){
        this.liSave.comments = this.card_form.get('comments').value;
      }
    }
      var restURL="https://ap6oiuyew6.execute-api.us-east-1.amazonaws.com/dev/LifestyleItemByProfile";
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
      var body = JSON.stringify(this.liSave);
      var self = this;
      console.log('Calling Post', this.liSave);
      apigClient.invokeApi(params, pathTemplate, method, additionalParams, body)
      .then(function(result){
        self.RestService.results = result.data;
        console.log('Happy Path: ' + self.RestService.results);
        self.category.title = "Travel";
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

  calculateDateTime(dtString) {
    var offsetDate;
    var offset;
    var finalDate;
    var strTime;

    strTime = '00:00';
    console.log('original dtString from calculateDateTime: ' + dtString);
    dtString = dtString + ' ' + strTime;
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

  changeDoes(blnDoes) {
    if (blnDoes) {
      if (this.blnDoes !== blnDoes) {
        this.blnDoes = blnDoes;
      }
    } else {
      if (this.blnDoes !== blnDoes) {
        this.clearData();
      }
    }
  }

  clearData() {
    this.card_form.get('enddate').setValue(null);
    this.card_form.get('daysperweek').setValue(null);
    this.card_form.get('itemsperday').setValue(null);
    this.card_form.get('subtype').setValue(null);
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
