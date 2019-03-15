import { Component } from '@angular/core';
import { NavController, NavParams, AlertController, LoadingController, ModalController } from 'ionic-angular';
import { FormGroup, FormControl, FormArray, FormBuilder, Validators } from '@angular/forms';
import { RestService } from '../../app/services/restService.service';
import { ListNutritionModel, ListNutrition, ListNutritionDay } from '../../pages/listNutrition/listNutrition.model';
import { HistoryItemModel } from '../../pages/history/history.model';
import { ListGoalsModel } from '../../pages/listGoals/listGoals.model';
import { FormNutritionAdd } from '../../pages/formNutritionAdd/formNutritionAdd';
import { ListNutritionService } from '../../pages/listNutrition/listNutrition.service';

var moment = require('moment-timezone');

@Component({
  selector: 'formExercise-page',
  templateUrl: 'formNutrition.html'
})
export class FormNutritionPage {
  section: string;
  formName: string = "formNutrition";
  loading: any;
  recId: number;
  goalname: string;
  card_form: FormGroup;
  meals: FormArray;
  goal_array: FormArray;
  goal_schedule: FormGroup;
  curRec: any;
  reloaded: boolean = false;
  newRec: boolean = false;
  saving: boolean = false;
  formModelSave: ListNutritionModel  = new ListNutritionModel();
  formDaySave: ListNutritionDay = new ListNutritionDay();
  formSave: ListNutrition = new ListNutrition();
  category: HistoryItemModel = new HistoryItemModel();
  userTimezone: any;
  list2: ListGoalsModel = new ListGoalsModel();
  categories_checkbox_open: boolean;
  categories_checkbox_result;
  timeNow: any;
  hourNow: any;
  minuteNow: any;
  momentNow: any;

  constructor(public nav: NavController, public alertCtrl: AlertController, public RestService:RestService, public loadingCtrl: LoadingController,
    public modalCtrl: ModalController, public navParams: NavParams, public formBuilder: FormBuilder, public list2Service: ListNutritionService) {
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
          dayofmeasure: new FormControl(this.curRec.dayofmeasure, Validators.required),
          meals: this.formBuilder.array([ this.createItem() ]),
          profileid: new FormControl(this.curRec.profileid),
          userid: new FormControl(this.curRec.userid)
      });
      this.addExistingMeals();
    } else {
      this.newRec = true;
      this.card_form = new FormGroup({
        dayofmeasure: new FormControl(this.today(), Validators.required),
        meals: this.formBuilder.array([]),
        profileid: new FormControl(),
        userid: new FormControl()
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
    var mealsArray: FormArray;
    var mealSave: ListNutrition;
    var meal: FormGroup;
    let alert = this.alertCtrl.create({
      title: 'Confirm Delete',
      message: 'Are you certain you want to delete this day and all these meals?',
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
              //alert('Going to delete');
              this.formDaySave.meals = [];
              mealsArray = this.card_form.get('meals') as FormArray;
              for (var j = 0; j < mealsArray.length; j++) {
                mealSave = new ListNutrition();
                meal = mealsArray.at(j) as FormGroup;
                if (meal.get("recordid").value !== null) {
                  mealSave.recordid = meal.get("recordid").value;
                  mealSave.active = 'N';
                  mealSave.profileid = this.RestService.currentProfile;
                  mealSave.userid = this.RestService.userId;
                  this.formDaySave.meals.push(mealSave);
                }
              }
              if (this.formDaySave.meals !== undefined && this.formDaySave.meals.length > 0) {
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
                  self.nav.pop();
                }).catch( function(result){
                  console.log('Error in formNutrition.delete: ',result);
                  self.loading.dismiss();
                });
              } else {
                console.log('No saved Records - Delete goes back.');
                self.category.title = "Nutrition";
                self.loading.dismiss();
                self.nav.pop();
              }
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
    var mealsArray: FormArray;
    var meal: FormGroup;
    var mealSave: ListNutrition;
    var isDirty = false;
    var dtDET;
    var dtTranslate;

    this.saving = true;
    this.formDaySave.meals = new Array<ListNutrition>() ;
    mealsArray = this.card_form.get('meals') as FormArray;
    for (var j = 0; j < mealsArray.length; j++) {
      isDirty = false;
      meal = mealsArray.at(j) as FormGroup;
      mealSave = new ListNutrition();
      if (meal.get("recordid").value !== undefined && meal.get("recordid").value !== null && meal.get("recordid").value !== "") {
        mealSave.recordid = meal.get("recordid").value;
      }
      if (meal.get("meal").dirty) {
        mealSave.meal = meal.get("meal").value;
        isDirty = true;
      }
      if (meal.get("food").dirty) {
        mealSave.food = meal.get("food").value;
        isDirty = true;
      }
      if (meal.get("amount").dirty) {
        mealSave.amount = meal.get("amount").value;
        isDirty = true;
      }
      if (meal.get("calories").dirty) {
        mealSave.calories = meal.get("calories").value;
        isDirty = true;
      }
      if (isDirty) {
        mealSave.profileid = this.RestService.currentProfile;
        mealSave.userid = this.RestService.userId;
        mealSave.active = 'Y';
        if (this.userTimezone !== undefined && this.userTimezone !== null && this.userTimezone !== "") {
          mealSave.timezone = this.userTimezone;
        }
        this.formDaySave.meals.push(mealSave);
      } else {
        console.log('No change for index: ' + j);
      }
    }
    if (this.formDaySave.meals.length !== undefined && this.formDaySave.meals.length > 0) {
      if (this.userTimezone !== undefined) {
        if (this.card_form.get('dayofmeasure').value !== undefined && this.curRec == undefined ) {
          dtDET = moment.tz(this.card_form.get('dayofmeasure').value, this.userTimezone);
        } else if (this.card_form.get('dayofmeasure').value !== undefined && this.curRec.dayofmeasure !== undefined) {
          dtTranslate = new Date(this.card_form.get('dayofmeasure').value);
          dtDET = moment.tz(dtTranslate.toUTCString(), this.userTimezone);
        } else {
          dtTranslate = new Date();
          dtDET = moment.tz(dtTranslate.toUTCString(), this.userTimezone);
        }
        console.log('Date Sent: ' + dtDET.utc().format('MM-DD-YYYY HH:mm'));
      } else {
        dtTranslate = new Date();
        dtDET = moment(dtTranslate.toUTCString());
        console.log('No usertimezone: ' + dtDET.format('MM-DD-YYYY HH:mm'));
      }
      this.formDaySave.dayofmeasure =  dtDET.utc().format('YYYY-MM-DD HH:mm');
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
      var body = JSON.stringify(this.formDaySave);
      var self = this;
      console.log('Calling Post', this.formDaySave);
      apigClient.invokeApi(params, pathTemplate, method, additionalParams, body)
      .then(function(result){
        self.RestService.results = result.data;
        console.log('Happy Path: ' + self.RestService.results);
        self.category.title = "Nutrition";
        self.loading.dismiss();
        self.nav.pop();
      }).catch( function(result){
        console.log('Error results formNutrition.save: ',result);
        self.loading.dismiss();
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

  formatDateTime(dateString) {
    if (this.userTimezone !== undefined && this.userTimezone !=="") {
      return moment(dateString).tz(this.userTimezone).format('MM-DD-YYYY hh:mm A');
    } else {
      return moment(dateString).format('MM-DD-YYYY hh:mm a');
    }
  }

  formatDateTimeTitle(dateString) {
    if (this.userTimezone !== undefined && this.userTimezone !=="") {
      return moment(dateString).tz(this.userTimezone).format('dddd, MMMM DD');
    } else {
      return moment(dateString).format('dddd, MMMM DD');
    }
  }

  addExistingMeals() {
    this.meals = this.card_form.get('meals') as FormArray;
    console.log('Add existing meals form array length: '+ this.meals.length);
    while (this.meals.length !== 0) {
      this.meals.removeAt(0)
    }
    console.log('records clear: ', this.meals.length);
    for (var j = 0; j < this.curRec.meals.length; j++) {
      this.meals.push(this.addExistingMeal(j));
    }
  }

  addExistingMeal(index): FormGroup {
    //console.log('Add Existing Meal - meal: ', this.curRec.meals[index]);
    return this.formBuilder.group({
      recordid: new FormControl(this.curRec.meals[index].recordid),
      meal: new FormControl(this.curRec.meals[index].meal),
      mealtime: new FormControl(this.curRec.meals[index].mealtime),
      mealtimeformat: new FormControl(this.curRec.meals[index].mealtimeformat),
      food: new FormControl(this.curRec.meals[index].food),
      amount: new FormControl(this.curRec.meals[index].amount),
      calories: new FormControl(this.curRec.meals[index].calories),
      active: new  FormControl('Y'),
    });
  }

  createItem(): FormGroup {
    return this.formBuilder.group({
      recordid: new FormControl(),
      meal: new FormControl(null),
      mealtime: new FormControl(),
      mealtimeformat: new FormControl(null),
      food: new FormControl(),
      amount: new FormControl(),
      calories: new FormControl(),
      active: new  FormControl('Y'),
    });
  }

  updateMeal(index) {
    var recid;
    if (this.reloaded) {
      recid = 0;
    } else {
      recid = this.recId;
    }
    let profileModal = this.modalCtrl.create(FormNutritionAdd, { recId: recid, index: index });
    profileModal.onDidDismiss(data => {
      console.log('Data from getDefaultUser: ', data);
      if (data !== undefined) {
        //console.log('Data from getDefaultUser: ', data);
        if (data.action == 'save') {
          this.reload();
        } else {
          if (this.loading !== undefined) {
            this.loading.dismiss();
          }
        }
      }
    });
    profileModal.present();
  }

  addMeal() {
    console.log('CurRec: ', this.curRec);
    var dayofmeasure;
    if (this.newRec) {
      dayofmeasure = this.card_form.get('dayofmeasure').value
    } else {
      dayofmeasure = this.curRec.dayofmeasure;
    }

    var existingInfo = {
      dayofmeasure: dayofmeasure
    }
    let profileModal = this.modalCtrl.create(FormNutritionAdd, { existingInfo: existingInfo });
    profileModal.onDidDismiss(data => {
      console.log('Data from getDefaultUser: ', data);
      if (data !== undefined) {
        //console.log('Data from getDefaultUser: ', data);
        if (data.action == 'save') {
          this.reload();
        } else {
          this.loading.dismiss();
        }
      }
    });
    profileModal.present();
  }

  reload() {
    var dtNow = moment(new Date());
    var dtExpiration = moment(this.RestService.AuthData.expiration);
    var self = this;

    if (dtNow < dtExpiration) {
      this.presentLoadingDefault();
      this.reloadDo();
    } else {
      this.presentLoadingDefault();
      this.RestService.refreshCredentials(function(err, results) {
        if (err) {
          console.log('Need to login again!!! - Credentials expired from ' + self.formName + '.reload');
          self.loading.dismiss();
          self.RestService.appRestart();
        } else {
          console.log('From ' + self.formName + '.reload - Credentials refreshed!');
          self.reloadDo();
        }
      });
    }
  }

  reloadDo() {
    var restURL: string;
    restURL="https://ap6oiuyew6.execute-api.us-east-1.amazonaws.com/dev/NutritionByProfile";
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
    var dayofmeasure = this.card_form.get('dayofmeasure').value;
    var offsetDate = new Date(moment(dayofmeasure).toISOString());
    var offset = offsetDate.getTimezoneOffset() / 60;
    var additionalParams = {
        queryParams: {
            profileid: this.RestService.currentProfile,
            dayofmeasure: dayofmeasure,
            offset: offset
        }
    };
    var body = '';
    var self = this;

    apigClient.invokeApi(params, pathTemplate, method, additionalParams, body)
    .then(function(result){
      self.RestService.results = result.data;
      console.log('Results from Reload: ', self.RestService.results);
      self.list2Service
      .getData()
      .then(data => {
        self.curRec = self.RestService.results[0];
        self.reloaded = true;
        self.card_form.markAsPristine();
        console.log("Results Data for reload Nutrition Day: ", self.curRec);
        //console.log("Results Data for reload Nutrition Day2: ", self.curRec[0]);
        self.addExistingMeals();
        self.loading.dismiss();
      });
    }).catch( function(result){
        console.log(body);
        self.loading.dismiss();
    });
  }

  addItem(): void {
    //Add new code here!!!
    this.meals = this.card_form.get('meals') as FormArray;
    this.meals.push(this.createItem());
  }

  getMinDayDate() {
    var momentNow = moment(new Date());
    var dayoftheweek;
    var startofWeek;

    if  (this.userTimezone !== undefined && this.userTimezone !=="") {
      dayoftheweek = momentNow.tz(this.userTimezone).format('dddd');
    } else {
      dayoftheweek = momentNow.format('dddd');
    }

    if (dayoftheweek == 'Sunday') {
      var offSet = 0
    } else if (dayoftheweek == 'Monday') {
      offSet = 1
    } else if (dayoftheweek == 'Tuesday') {
      offSet = 2
    } else if (dayoftheweek == 'Wednesday') {
      offSet = 3
    } else if (dayoftheweek == 'Thursday') {
      offSet = 4
    } else if (dayoftheweek == 'Friday') {
      offSet = 5
    } else if (dayoftheweek == 'Saturday') {
      offSet = 6
    }
    if (this.userTimezone !== undefined && this.userTimezone !=="") {
      startofWeek = moment(momentNow).tz(this.userTimezone).subtract(offSet, 'days');
    } else {
      startofWeek = moment(momentNow).subtract(offSet, 'days');
    }
    return startofWeek.format("YYYY-MM-DD");
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
