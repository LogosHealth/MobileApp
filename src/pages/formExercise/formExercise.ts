import { Component } from '@angular/core';
import { NavController, NavParams, AlertController, LoadingController } from 'ionic-angular';
import { Validators, FormGroup, FormControl, FormArray } from '@angular/forms';
import { RestService } from '../../app/services/restService.service';
import { ListExerciseModel, ListExercise } from '../../pages/listExercise/listExercise.model';
import { HistoryItemModel } from '../../pages/history/history.model';
import { ListGoalsModel } from '../../pages/listGoals/listGoals.model';
import { ListGoalsService } from '../../pages/listGoals/listGoals.service';

var moment = require('moment-timezone');

@Component({
  selector: 'formExercise-page',
  templateUrl: 'formExercise.html'
})
export class FormExercisePage {
  loading: any;
  section: string;
  formName: string = "formExercise";
  recId: number;
  goalname: string;
  card_form: FormGroup;
  goal_array: FormArray;
  goal_schedule: FormGroup;
  curRec: any;
  newRec: boolean = false;
  goalsModelSave: ListExerciseModel  = new ListExerciseModel();
  exerciseSave: ListExercise = new ListExercise();
  category: HistoryItemModel = new HistoryItemModel();
  userTimezone: any;
  list2: ListGoalsModel = new ListGoalsModel();
  saving: boolean = false;
  categories_checkbox_open: boolean;
  categories_checkbox_result;
  timeNow: any;
  hourNow: any;
  minuteNow: any;
  momentNow: any;
  noGoals: boolean = false;
  showTips: boolean = true;
  dtNow: any = moment(Date()).format('YYYY-MM-DDTHH:mm');

  constructor(public nav: NavController, public alertCtrl: AlertController, public RestService:RestService,
    public navParams: NavParams, public loadingCtrl: LoadingController, public list2Service: ListGoalsService) {
    this.recId = navParams.get('recId');
    this.goalname = navParams.get('goalname');
    if (this.goalname == undefined) {
      this.goalname = "";
    }
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
    //add caloriesburnedvalue generator
    if (this.recId !== undefined) {
      var cbSplit;
      var numCB = null;
      if(this.curRec.caloriesburned !== undefined && this.curRec.caloriesburned !== null && this.curRec.caloriesburned !== "") {
        cbSplit = this.curRec.caloriesburned.split(" ");
        if (Number(cbSplit[0]) !== NaN) {
          numCB = cbSplit[0];
        }
      }
      this.card_form = new FormGroup({
        recordid: new FormControl(this.curRec.recordid),
        exercisetype: new FormControl(this.curRec.exercisetype, Validators.required),
        exercisetime: new FormControl(this.curRec.exercisetime),
        caloriesburned: new FormControl(this.curRec.caloriesburned),
        caloriesburnedvalue: new FormControl(numCB, Validators.min(0)),
        distance: new FormControl(this.curRec.distance),
        reps: new FormControl(this.curRec.reps),
        goalname: new FormControl(this.curRec.goalname),
        goalid: new FormControl(this.curRec.goalid),
        dateofmeasure: new FormControl(this.formatDateTime(this.curRec.dateofmeasure)),
        confirmed: new FormControl(this.curRec.confirmed),
        profileid: new FormControl(this.curRec.profileid),
        userid: new FormControl(this.curRec.userid)
      });
    } else {
      this.newRec = true;
      this.card_form = new FormGroup({
        recordid: new FormControl(),
        exercisetype: new FormControl("", Validators.required),
        exercisetime: new FormControl(),
        caloriesburned: new FormControl(),
        caloriesburnedvalue: new FormControl("", Validators.min(0)),
        distance: new FormControl(),
        reps: new FormControl(),
        goalname: new FormControl(this.goalname),
        goalid: new FormControl(),
        dateofmeasure: new FormControl(this.dtNow),
        timeofmeasure: new FormControl(this.dtNow),
        confirmed: new FormControl(),
        profileid: new FormControl(),
        userid: new FormControl()
      });
    }
  }

  ionViewWillEnter() {
    var dtNow = moment(new Date());
    var dtExpiration = moment(this.RestService.AuthData.expiration);
    var self = this;

    //alert('Begin');

    if (dtNow < dtExpiration) {
      this.presentLoadingDefault();
      this.nav.getPrevious().data.refresh = false;
      this.loadData();
    } else {
      this.presentLoadingDefault();
      this.RestService.refreshCredentials(function(err, results) {
        if (err) {
          console.log('Need to login again!!! - Credentials expired from formExercise');
          self.loading.dismiss();
          self.RestService.appRestart();
        } else {
          console.log('From formExercise - Credentials refreshed!');
          self.loadData();
        }
      });
    }
  }

  loadData() {
    var restURL: string;
    restURL="https://ap6oiuyew6.execute-api.us-east-1.amazonaws.com/dev/GoalsByProfile";
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
    var additionalParams = {
        queryParams: {
            profileid: this.RestService.currentProfile,
            goaltype: 'exercise'
          }
    };
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
            self.noGoals = false;
            self.list2.items = self.RestService.results;
            console.log("Results Data for Get Goals: ", self.list2.items);
          } else {
            self.noGoals = true;
            self.list2.items = [];
          }
          self.loading.dismiss();
        });
    }).catch( function(result){
        console.log(result);
        self.noGoals = true;
        self.list2.items = [];
        self.loading.dismiss();
        alert('There was an error retrieving this data.  Please try again later');
    });
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
              this.exerciseSave.recordid = this.card_form.get('recordid').value;
              this.exerciseSave.profileid = this.RestService.currentProfile;
              this.exerciseSave.userid = this.RestService.userId;
              this.exerciseSave.active = 'N';
              var restURL="https://ap6oiuyew6.execute-api.us-east-1.amazonaws.com/dev/ExerciseByProfile";
              var config = {
                invokeUrl: restURL,
                accessKey: this.RestService.AuthData.accessKeyId,
                secretKey: this.RestService.AuthData.secretKey,
                sessionToken: this.RestService.AuthData.sessionToken,
                region:'us-east-1'
              };
              var apigClient = this.RestService.AWSRestFactory.newClient(config);
              var params = {
              };
              var pathTemplate = '';
              var method = 'POST';
              var additionalParams = {
                queryParams: {
                    profileid: this.RestService.currentProfile,
                }
              };
              var body = JSON.stringify(this.exerciseSave);
              var self = this;
              console.log('Calling Post', this.exerciseSave);
              apigClient.invokeApi(params, pathTemplate, method, additionalParams, body)
                .then(function(result){
                  self.RestService.results = result.data;
                  console.log('Happy Path: ' + self.RestService.results);
                  self.category.title = "Invest in You";
                  self.loading.dismiss();
                  self.nav.pop();
                }).catch( function(result){
                  console.log('Result: ',result);
                  self.loading.dismiss();
                });
          }
        }
      ]
    });
    alert.present();
  }

  calculateDateTime() {
    var dtString;
    var offsetDate;
    var offset;
    var finalDate;
    var strDate;
    var strDateArr;
    var strTime;
    var strTimeArr;
    //console.log('Date of Measure: ' + this.card_form.get('dateofmeasure').value);
    //console.log('Start Time: ' + this.card_form.get('starttime').value);
    if (this.userTimezone !== undefined && this.userTimezone !== null && this.userTimezone !== "") {
      strDate = this.momentNow.tz(this.userTimezone).format('YYYY-MM-DD');
      strTime = this.momentNow.tz(this.userTimezone).format('HH:mm');
    } else {
      strDate = this.momentNow.format('YYYY-MM-DD');
      strTime = this.momentNow.format('HH:mm');
    }
    if (this.card_form.get('dateofmeasure').value !== undefined && this.card_form.get('dateofmeasure').value !== null) {
      strDateArr = this.card_form.get('dateofmeasure').value.split('T');
      strDate = strDateArr[0];

    }
    if (this.card_form.get('timeofmeasure').value !== undefined && this.card_form.get('timeofmeasure').value !== null) {
      strTimeArr = this.card_form.get('timeofmeasure').value.split('T');
      strTime = strTimeArr[1].substr(0, 5);
    } else {
      strTime = '00:00';
    }
    dtString = strDate + ' ' + strTime;
    console.log('Date before offset: ' + strDate);
    console.log('Time before offset: ' + strTime);
    console.log('Final date string before offset: ' + dtString);
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
      this.exerciseSave.recordid = this.card_form.get('recordid').value;
      this.exerciseSave.profileid = this.RestService.currentProfile;
      this.exerciseSave.userid = this.RestService.userId;
      this.exerciseSave.active = 'Y';
      if (this.card_form.get('exercisetime').dirty){
        this.exerciseSave.exercisetime = this.card_form.get('exercisetime').value;
      }
      if (this.card_form.get('exercisetype').dirty){
        this.exerciseSave.exercisetype = this.card_form.get('exercisetype').value;
      }
      if (this.card_form.get('caloriesburnedvalue').dirty){
        this.exerciseSave.caloriesburned = this.card_form.get('caloriesburnedvalue').value;
      }
      if (this.card_form.get('distance').dirty){
        this.exerciseSave.distance = this.card_form.get('distance').value;
      }
      if (this.card_form.get('reps').dirty){
        this.exerciseSave.reps = this.card_form.get('reps').value;
      }
      if (this.card_form.get('goalname').dirty || this.card_form.get('goalname').value !== null){
        this.exerciseSave.goalname = this.card_form.get('goalname').value;
      }
      if (this.userTimezone !== undefined && this.userTimezone !=="") {
        this.exerciseSave.timezone = this.userTimezone;
      }
    } else {
      this.exerciseSave.exercisetype = this.card_form.get('exercisetype').value;
      this.exerciseSave.profileid = this.RestService.currentProfile;
      this.exerciseSave.userid = this.RestService.currentProfile;  //placeholder for user to device mapping and user identification
      this.exerciseSave.active = 'Y';
      this.exerciseSave.dateofmeasure = this.calculateDateTime();
      if (this.card_form.get('exercisetime').dirty){
        this.exerciseSave.exercisetime = this.card_form.get('exercisetime').value;
      }
      if (this.card_form.get('caloriesburnedvalue').dirty){
        this.exerciseSave.caloriesburned = this.card_form.get('caloriesburnedvalue').value;
      }
      if (this.card_form.get('distance').dirty){
        this.exerciseSave.distance = this.card_form.get('distance').value;
      }
      if (this.card_form.get('reps').dirty){
        this.exerciseSave.reps = this.card_form.get('reps').value;
      }
      if (this.card_form.get('goalname').dirty || this.card_form.get('goalname').value !== null){
        this.exerciseSave.goalname = this.card_form.get('goalname').value;
      }
/*      if (this.card_form.get('dateofmeasure').dirty){
        if (this.userTimezone !== undefined) {
          console.log("dateofmeasure: " + this.card_form.get('dateofmeasure').value);
          var dtDET = moment.tz(this.card_form.get('dateofmeasure').value, this.userTimezone);
        } else {
          var dtDET = moment(this.card_form.get('dateofmeasure').value);
        }
        console.log('Date Sent: ' + dtDET.utc().format('MM-DD-YYYY HH:mm'));
        this.exerciseSave.dateofmeasure = dtDET.utc().toISOString();
      }  */
      if (this.userTimezone !== undefined && this.userTimezone !=="") {
        this.exerciseSave.timezone = this.userTimezone;
      }
    }
      var restURL="https://ap6oiuyew6.execute-api.us-east-1.amazonaws.com/dev/ExerciseByProfile";
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
      var localNowDate = moment().format('YYYY-MM-DD');
      var additionalParams = {
          queryParams: {
              profileid: this.RestService.currentProfile,
              localNowDate: localNowDate
          }
      };
      var body = JSON.stringify(this.exerciseSave);
      var self = this;
      console.log('Calling Post', this.exerciseSave);
      apigClient.invokeApi(params, pathTemplate, method, additionalParams, body)
      .then(function(result){
        self.RestService.results = result.data;
        console.log('Happy Path: ' + self.RestService.results);
        self.category.title = "Invest in You";
        self.loadData2();
      }).catch( function(result){
        console.log('Result: ',result);
        self.loading.dismiss()
        alert('There was an error saving this data.  Please try again later');
      });
  }

  loadData2() {
    var restURL: string;
    restURL="https://ap6oiuyew6.execute-api.us-east-1.amazonaws.com/dev/GoalsByProfile";
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
    var additionalParams = {
        queryParams: {
            profileid: this.RestService.currentProfile,
            getStats: 'Y'
        }
    };
    var body = '';
    var self = this;
    apigClient.invokeApi(params, pathTemplate, method, additionalParams, body)
    .then(function(result){
      self.RestService.results = result.data;
      self.list2Service
      .getData()
      .then(data => {
        self.nav.getPrevious().data.refresh = true;
        self.loading.dismiss();
        self.nav.pop();
      });
    }).catch( function(result){
        console.log('Error in formExercise: apigClient.invokeApi', result);
        self.loading.dismiss();
        self.nav.pop();
    });
  }

  public today() {
    //return new Date().toISOString().substring(0,10);
    return moment().format('YYYY-MM-DD');;
  }

  formatDateTime(dateString) {
    if (this.userTimezone !== undefined && this.userTimezone !== null && this.userTimezone !=="") {
      return moment(dateString).tz(this.userTimezone).format("ddd, MMM DD 'YY, hh:mm A");
    } else {
      return moment(dateString).format("ddd, MMM DD 'YY, hh:mm A");
    }
  }

  formatDateTimeTitle(dateString) {
    if (this.userTimezone !== undefined && this.userTimezone !== null && this.userTimezone !=="") {
      return moment(dateString).tz(this.userTimezone).format('dddd, MMMM DD');
    } else {
      return moment(dateString).format('dddd, MMMM DD');
    }
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
