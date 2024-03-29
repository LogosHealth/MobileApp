import { Component } from '@angular/core';
import { NavController, NavParams, AlertController, LoadingController, ViewController } from 'ionic-angular';
import { Validators, FormGroup, FormControl } from '@angular/forms';
import { RestService } from '../../app/services/restService.service';
import { ListNutritionModel, ListNutrition, ListNutritionDay } from '../../pages/listNutrition/listNutrition.model';
import { HistoryItemModel } from '../../pages/history/history.model';

var moment = require('moment-timezone');

@Component({
  selector: 'formExercise-page',
  templateUrl: 'formNutritionAdd.html'
})
export class FormNutritionAdd {
  loading: any;
  section: string;
  formName: string = "formNutritionAdd";
  dayofmeasure: string;
  formattedDate: string;
  action: string;
  recId: number;
  card_form: FormGroup;
  curRec: any;
  curMeal: any;
  existingInfo: any;
  newRec: boolean = false;
  saving: boolean = false;
  showTips: boolean = true;
  mealModelSave: ListNutritionModel  = new ListNutritionModel();
  mealSave: ListNutrition = new ListNutrition();
  formDaySave: ListNutritionDay = new ListNutritionDay();
  category: HistoryItemModel = new HistoryItemModel();
  userTimezone: any;
  timeNow: any;
  hourNow: any;
  minuteNow: any;
  momentNow: any;
  categories_checkbox_open: boolean;
  categories_checkbox_result;

  constructor(public nav: NavController, public alertCtrl: AlertController, public RestService:RestService,
    public navParams: NavParams, public loadingCtrl: LoadingController,  public viewCtrl: ViewController) {

    this.recId = navParams.get('recId');
    this.curRec = RestService.results[this.recId];
    if (this.curRec !== undefined && this.curRec !== null) {
      var index = navParams.get('index');
      this.curMeal = this.curRec.meals[index];
    }
    console.log('formNutritionAdd init curRec: ', this.curRec);
    console.log('formNutritionAdd init index: ' + index + ', curMeal: ', this.curMeal);
    this.existingInfo = navParams.get('existingInfo');

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
    if (this.curRec !== undefined && this.curRec !==null) {
      this.dayofmeasure = this.curRec.dayofmeasure;
      this.formattedDate = moment(this.curRec.dayofmeasure).format('YYYY-MM-DD');
    } else if (this.existingInfo !== undefined && this.existingInfo !==null) {
      this.dayofmeasure = this.existingInfo.dayofmeasure;
      this.formattedDate = moment(this.existingInfo.dayofmeasure).format('YYYY-MM-DD');
      //console.log('Formatted date from existingInfo: ' + this.formattedDate);
    } else {
      if (this.userTimezone !== undefined && this.userTimezone !== null && this.userTimezone !== "") {
        this.dayofmeasure = this.momentNow.tz(this.userTimezone).format('MMM-DD-YY');
      } else {
        this.dayofmeasure = this.momentNow.format('MMM-DD-YY');
      }
    }
    //console.log('Day of Measure formNutritionAdd - ' + this.dayofmeasure);
    if (this.recId !== undefined) {
      this.card_form = new FormGroup({
        recordid: new FormControl(this.curMeal.recordid),
        food: new FormControl(this.curMeal.food, Validators.required),
        meal: new FormControl(this.curMeal.meal),
        mealtime: new FormControl(this.formatDateTime3(this.curMeal.dateofmeasure)),
        amount: new FormControl(this.curMeal.amount),
        calories: new FormControl(this.curMeal.calories),
        carbs: new FormControl(this.curMeal.carbs),
        fat: new FormControl(this.curMeal.fat),
        protein: new FormControl(this.curMeal.protein),
        dateofmeasure: new FormControl(this.formatDateTime2(this.curMeal.dateofmeasure)),
        profileid: new FormControl(this.curRec.profileid),
        userid: new FormControl(this.curRec.userid)
      });
      console.log('Loading date time for: ' + this.curMeal.dateofmeasure + ' transformed to: ' + this.formatDateTime3(this.curMeal.dateofmeasure));
    } else {
      this.newRec = true;
      this.card_form = new FormGroup({
        recordid: new FormControl(),
        food: new FormControl(null, Validators.required),
        meal: new FormControl(),
        mealtime: new FormControl(),
        amount: new FormControl(),
        calories: new FormControl(),
        carbs: new FormControl(),
        fat: new FormControl(),
        protein: new FormControl(),
        dateofmeasure: new FormControl(),
        profileid: new FormControl(),
        userid: new FormControl()
      });
    }
  }

  ionViewWillEnter() {
    //this.nav.getPrevious().data.refresh = false;
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
      message: 'Are you certain you want to delete this meal?',
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
            this.action = 'save';
            this.mealSave.recordid = this.card_form.get('recordid').value;
            this.mealSave.profileid = this.RestService.currentProfile;
            this.mealSave.userid = this.RestService.userId;
            this.mealSave.active = 'N';
            this.formDaySave.meals = [];
            this.formDaySave.meals.push(this.mealSave);
              var restURL="https://ap6oiuyew6.execute-api.us-east-1.amazonaws.com/dev/NutritionByProfile";
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
              var body = JSON.stringify(this.formDaySave);
              var self = this;
              console.log('Calling Post', this.formDaySave);
              apigClient.invokeApi(params, pathTemplate, method, additionalParams, body)
              .then(function(result){
                self.RestService.results = result.data;
                console.log('Happy Path: ' + self.RestService.results);
                self.category.title = "Nutrition";
                self.loading.dismiss();
                self.dismiss();
              }).catch( function(result){
                console.log('Error from formNutrtionAdd.delete: ',result);
                self.loading.dismiss();
                self.dismiss();
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
    var offset = 0;
    var offsetDate;
    var chkTime;

    this.saving = true;
    this.action = 'save';
    if (this.card_form.get('recordid').value !==undefined && this.card_form.get('recordid').value !==null) {
      this.mealSave.recordid = this.card_form.get('recordid').value;
      this.mealSave.profileid = this.RestService.currentProfile;
      this.mealSave.userid = this.RestService.userId;
      this.mealSave.active = 'Y';
      if (this.card_form.get('food').dirty){
        this.mealSave.food = this.card_form.get('food').value;
      }
      if (this.card_form.get('meal').dirty){
        this.mealSave.meal = this.card_form.get('meal').value;
      }
      if (this.card_form.get('mealtime').dirty){
        //For mealtime, if it is a record that is already saved, it will expose the time from the dateofmeasure which is an ISO datestring
        //If it is new, it will provide simply a naked timestamp e.g. 09:00 - accounting for both
        chkTime  = this.card_form.get('mealtime').value;
        offsetDate = new Date(moment(this.dayofmeasure).toISOString());
        offset = offsetDate.getTimezoneOffset() / 60;
      if (chkTime.length < 10) {
          //Not ISO Date String
          this.mealSave.mealtime = chkTime;
        } else {
          console.log('Mealtime value: ' + this.card_form.get('mealtime').value);
          if (this.userTimezone !== undefined && this.userTimezone !== null && this.userTimezone !== "") {
            chkTime = moment(chkTime).tz(this.userTimezone).add(offset, 'hours').format('HH:mm');
          } else {
            chkTime = moment(chkTime).format('HH:mm');
          }
          console.log('chkTime Transform from ISO String to: ' + chkTime);
          this.mealSave.mealtime = chkTime;
        }
        this.formattedDate = this.formattedDate + ' ' + this.mealSave.mealtime;
        console.log('formNutritionAdd - save-update Day of Measure: ' + this.dayofmeasure + ', offset: ' + offset);
        if (this.userTimezone !== undefined && this.userTimezone !== null && this.userTimezone !== "") {
          this.mealSave.dateofmeasure = moment(this.formattedDate).tz(this.userTimezone).add(offset, 'hours').format('YYYY-MM-DD HH:mm');
          console.log('formNutrionAdd update - dateofmeasure: ' + this.mealSave.dateofmeasure + ', formatted date: ' + this.formattedDate);
        } else {
          this.mealSave.dateofmeasure = moment(this.formattedDate).add(offset, 'hours').format('YYYY-MM-DD HH:mm');
          console.log('formNutrionAdd update - dateofmeasure: ' + this.mealSave.dateofmeasure + ', formatted date: ' + this.formattedDate);
        }
      } else {
        offsetDate = new Date(moment(this.dayofmeasure).toISOString());
        offset = offsetDate.getTimezoneOffset() / 60;
        this.formattedDate = this.formattedDate + ' 00:00';
      }
      if (this.card_form.get('amount').dirty){
        this.mealSave.amount = this.card_form.get('amount').value;
      }
      if (this.card_form.get('calories').dirty){
        this.mealSave.calories = this.card_form.get('calories').value;
      }
      if (this.card_form.get('carbs').dirty){
        this.mealSave.carbs = this.card_form.get('carbs').value;
      }
      if (this.card_form.get('fat').dirty){
        this.mealSave.fat = this.card_form.get('fat').value;
      }
      if (this.card_form.get('protein').dirty){
        this.mealSave.protein = this.card_form.get('protein').value;
      }
    } else {
      this.mealSave.profileid = this.RestService.currentProfile;
      this.mealSave.userid = this.RestService.userId;
      this.mealSave.active = 'Y';
      if (this.card_form.get('food').dirty){
        this.mealSave.food = this.card_form.get('food').value;
      }
      if (this.card_form.get('meal').dirty){
        this.mealSave.meal = this.card_form.get('meal').value;
      }
      if (this.card_form.get('mealtime').dirty){
        //For mealtime, if it is a record that is already saved, it will expose the time from the dateofmeasure which is an ISO datestring
        //If it is new, it will provide simply a naked timestamp e.g. 09:00 - accounting for both
        chkTime  = this.card_form.get('mealtime').value;
        offsetDate = new Date(moment(this.dayofmeasure).toISOString());
        offset = offsetDate.getTimezoneOffset() / 60;
      if (chkTime.length < 10) {
          //Not ISO Date String
          console.log('Mealtime value clean insert: ' + this.card_form.get('mealtime').value);
          this.mealSave.mealtime = chkTime;
        } else {
          console.log('Mealtime value: ' + this.card_form.get('mealtime').value);
          if (this.userTimezone !== undefined && this.userTimezone !== null && this.userTimezone !== "") {
            chkTime = moment(chkTime).tz(this.userTimezone).add(offset, 'hours').format('HH:mm');
          } else {
            chkTime = moment(chkTime).format('HH:mm');
          }
          console.log('chkTime Transform from ISO String to: ' + chkTime);
          this.mealSave.mealtime = chkTime;
        }
        this.formattedDate = this.formattedDate + ' ' + this.mealSave.mealtime;
        console.log('formattedDate insert: ' + this.formattedDate);
      } else {
        offsetDate = new Date(moment(this.dayofmeasure).toISOString());
        offset = offsetDate.getTimezoneOffset() / 60;
        this.formattedDate = this.formattedDate + ' 00:00';
      }
      if (this.card_form.get('amount').dirty){
        this.mealSave.amount = this.card_form.get('amount').value;
      }
      if (this.card_form.get('calories').dirty){
        this.mealSave.calories = this.card_form.get('calories').value;
      }
      if (this.card_form.get('carbs').dirty){
        this.mealSave.carbs = this.card_form.get('carbs').value;
      }
      if (this.card_form.get('fat').dirty){
        this.mealSave.fat = this.card_form.get('fat').value;
      }
      if (this.card_form.get('protein').dirty){
        this.mealSave.protein = this.card_form.get('protein').value;
      }

      if (this.userTimezone !== undefined && this.userTimezone !== null && this.userTimezone !== "") {
        //console.log('IsoString: ' + moment(this.dayofmeasure).toISOString());
        this.mealSave.dateofmeasure = moment(this.formattedDate).tz(this.userTimezone).add(offset, 'hours').format('YYYY-MM-DD HH:mm');
        console.log('formNutrionAdd insert - dateofmeasure: ' + this.mealSave.dateofmeasure + ', formatted date: ' + this.formattedDate
        + ', offset: ' + offset);
      } else {
        this.mealSave.dateofmeasure = moment(this.formattedDate).add(offset, 'hours').format('YYYY-MM-DD HH:mm');
      }
    }

      var restURL="https://ap6oiuyew6.execute-api.us-east-1.amazonaws.com/dev/NutritionByProfile";
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
      this.formDaySave.meals = [];
      this.formDaySave.meals.push(this.mealSave);
      var body = JSON.stringify(this.formDaySave);
      var self = this;
      console.log('Calling Post', this.formDaySave);

      apigClient.invokeApi(params, pathTemplate, method, additionalParams, body)
      .then(function(result){
        self.RestService.results = result.data;
        console.log('Happy Path: ' + self.RestService.results);
        self.category.title = "Nutrition";
        self.loading.dismiss();
        self.dismiss();
      }).catch( function(result){
        console.log('Error from formSleep.save: ',result);
        self.loading.dismiss();
        self.dismiss();
        alert('There was an error retrieving this data.  Please try again later');
      });
  }

  cancelEntry() {
    this.action = 'cancel';
    this.dismiss();
  }

  dismiss() {
    let data = { 'action': this.action };
    this.viewCtrl.dismiss(data);
  }

  public today() {
    return new Date().toISOString().substring(0,10);
  }

  formatDateTime(dateString) {
    if (this.userTimezone !== undefined && this.userTimezone !== null && this.userTimezone !=="") {
      return moment(dateString).tz(this.userTimezone).format('dddd, MMMM DD');
    } else {
      return moment(dateString).format('dddd, MMMM DD');
    }
  }

  formatDateTime2(dateString) {
    if (this.userTimezone !== undefined && this.userTimezone !== null && this.userTimezone !=="") {
      return moment(dateString).tz(this.userTimezone).format('MMM DD YYYY hh:mm a');
    } else {
      return moment(dateString).format('MMM DD YYYY hh:mm a');
    }
  }

  formatDateTime3(dateString) {
    if (this.userTimezone !== undefined && this.userTimezone !== null && this.userTimezone !=="") {
      return moment(dateString).tz(this.userTimezone).format('YYYY-MM-DDTHH:mm');
    } else {
      return moment(dateString).format('YYYY-MM-DDTHH:mm');
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
