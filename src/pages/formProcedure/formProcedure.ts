import { Component } from '@angular/core';
import { NavController, NavParams, AlertController, LoadingController } from 'ionic-angular';
import { Validators, FormGroup, FormControl, FormArray } from '@angular/forms';
import { RestService } from '../../app/services/restService.service';
import { ProcedureModel, Procedure } from '../../pages/listProcedure/listProcedure.model';
import { HistoryItemModel } from '../../pages/history/history.model';
import { ListGoalsModel } from '../../pages/listGoals/listGoals.model';
import { DictionaryModel } from '../../pages/models/dictionary.model';
import { ListOrderService } from '../../pages/listOrder/listOrder.service';

var moment = require('moment-timezone');

@Component({
  selector: 'formExercise-page',
  templateUrl: 'formProcedure.html'
})
export class FormProcedure {
  section: string;
  formName: string = "formProcedure";
  recId: number;
  goalname: string;
  card_form: FormGroup;
  goal_array: FormArray;
  goal_schedule: FormGroup;
  curRec: any;
  loading: any;
  newRec: boolean = false;
  saving: boolean = false;
  showTips: boolean = true;
  formModelSave: ProcedureModel  = new ProcedureModel();
  formSave: Procedure = new Procedure();
  category: HistoryItemModel = new HistoryItemModel();
  userTimezone: any;
  list2: ListGoalsModel = new ListGoalsModel();
  categories_checkbox_open: boolean;
  categories_checkbox_result;
  timeNow: any;
  hourNow: any;
  minuteNow: any;
  momentNow: any;
  checkSave: boolean = false;
  loadFromId: number;

  procedurename: FormControl = new FormControl();
  listFilter: DictionaryModel = new DictionaryModel();
  procedureTerm: string = '';
  items: any;
  userCount: any = 0;
  fromVisit: any;

  constructor(public nav: NavController, public alertCtrl: AlertController, public RestService:RestService, public loadingCtrl: LoadingController,
    public list2Service: ListOrderService, public navParams: NavParams) {

    this.recId = navParams.get('recId');
    this.curRec = RestService.results[this.recId];
    this.fromVisit = navParams.get('fromVisit');
    this.loadFromId = navParams.get('loadFromId');

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
        medicaleventid: new FormControl(this.curRec.medicaleventid),
        visitid: new FormControl(this.curRec.visitid),
        description: new FormControl(this.curRec.description),
        dateofmeasure: new FormControl(this.formatDateTime(this.curRec.dateofmeasure)),
        result: new FormControl(this.curRec.result),
        profileid: new FormControl(this.curRec.profileid),
        userid: new FormControl(this.curRec.userid)
      });
      this.procedurename = new FormControl(this.curRec.procedurename, Validators.required);
      this.procedureTerm = this.curRec.procedurename;
    } else {
      this.newRec = true;
      this.card_form = new FormGroup({
        recordid: new FormControl(),
        medicaleventid: new FormControl(),
        visitid: new FormControl(),
        description: new FormControl(),
        dateofmeasure: new FormControl(),
        result: new FormControl(),
        profileid: new FormControl(),
        userid: new FormControl()
      });
      this.procedurename = new FormControl(null, Validators.required);
    }
  }

  ionViewWillEnter() {
    var dtNow = moment(new Date());
    var dtExpiration = moment(this.RestService.AuthData.expiration);
    var self = this;

    this.checkSave = false;
    if (dtNow < dtExpiration) {
      console.log('Presenting Default');
      this.presentLoadingDefault();
      this.loadFilterList();
      this.procedurename.valueChanges.debounceTime(700).subscribe(search => {
        this.setFilteredItems();
      });
      console.log('ionViewWillEnter - going to dismiss');
      //this.loading.dismiss();
    } else {
      this.presentLoadingDefault();
      this.RestService.refreshCredentials(function(err, results) {
        if (err) {
          console.log('Need to login again!!! - Credentials expired from formMedication');
          self.loading.dismiss();
          self.RestService.appRestart();
        } else {
          console.log('From formMedication - Credentials refreshed!');
          self.loadFilterList();
          self.procedurename.valueChanges.debounceTime(700).subscribe(search => {
            self.setFilteredItems();
          });
          //this.loading.dismiss();
        }
      });
    }
  }

  loadFilterList() {
    var self = this;
    var restURLFilter: string;
    restURLFilter="https://ap6oiuyew6.execute-api.us-east-1.amazonaws.com/dev/GetDictionariesByForm";
    var config2 = {
      invokeUrl: restURLFilter,
      accessKey: this.RestService.AuthData.accessKeyId,
      secretKey: this.RestService.AuthData.secretKey,
      sessionToken: this.RestService.AuthData.sessionToken,
      region:'us-east-1'
    };
    var apigClient2 = this.RestService.AWSRestFactory.newClient(config2);
    var params2 = {
      //email: accountInfo.getEmail()
    };
    var pathTemplate2 = '';
    var method2 = 'GET';
    var additionalParams2 = {
        queryParams: {
            profileid: this.RestService.currentProfile,
            formName: this.formName
        }
    };
    var body2 = '';
    apigClient2.invokeApi(params2, pathTemplate2, method2, additionalParams2, body2)
    .then(function(result){
      self.list2Service
      .getFilter()
      .then(data => {
        self.listFilter.items = result.data;
        console.log('Result data from loadFilterList: ', result.data);
        console.log('Filter items from formMedication.loadFilterList: ', self.listFilter.items);
        self.setFilteredItems();
        if (self.loadFromId !== undefined && self.loadFromId !== null && self.loadFromId > 0) {
          self.loadDetails();
        } else {
          self.loading.dismiss();
        }
      });
    }).catch( function(result){
        console.log(result);
        if (self.loadFromId !== undefined && self.loadFromId !== null && self.loadFromId > 0) {
          self.loadDetails();
        } else {
          self.loading.dismiss();
          alert('There was an error retrieving this data.  Please try again later');
        }
    });
  }

  loadDetails() {
    //this.presentLoadingDefault();
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
    var additionalParams = {
        queryParams: {
            profileid: this.RestService.currentProfile,
            loadFromId: this.loadFromId,
        }
    };
    var body = '';
    var self = this;

    apigClient.invokeApi(params, pathTemplate, method, additionalParams, body)
    .then(function(result){
      console.log('Result from formMed.loadDetails - loadFromID: ' + self.loadFromId, result);
      if (result !== undefined && result.data !== undefined && result.data[0] !== undefined && result.data[0].recordid > 0) {
        self.recId = 0;
        self.curRec = result.data[0];
        self.newRec = false;
        self.loading.dismiss();
        console.log('formMedication.loadDetails: ', self.curRec);
        self.fillFormDetails();
      } else {
        console.log('formMedication.loadDetails - no data: ', result);
        self.loading.dismiss();
      }
    }).catch( function(result){
      console.log('Err from formMedication.loadDetails: ', result);
      self.loading.dismiss();
      alert('There was an error retrieving this data.  Please try again later');
    });
  }

  setFilteredItems() {
    this.items = this.filterItems(this.procedureTerm);
    console.log('setFilteredItems: ', this.items);
    //alert('Search Term:' + this.searchTerm);
  }

  filterItems(searchTerm){
    if (this.listFilter.items !== undefined) {
      if (this.listFilter.items[0].dictionary.filter((item) => {return item.value.toLowerCase().indexOf(searchTerm.toLowerCase()) ===0;}).length ==1
        && this.listFilter.items[0].dictionary.filter((item) => {return item.value.toLowerCase().indexOf(searchTerm.toLowerCase()) ===0;})[0].value.toLowerCase() == searchTerm.toLowerCase()){
          console.log('Filter Items: loop 1');
          return [];
      } else if (this.listFilter.items[0].dictionary.filter((item) => {return item.value.toLowerCase().indexOf(searchTerm.toLowerCase()) ===0;}).length > 0 &&
        this.listFilter.items[0].dictionary.filter((item) => {return item.value.toLowerCase().indexOf(searchTerm.toLowerCase()) ===0;})[0].value.toLowerCase() == searchTerm.toLowerCase()) {
        console.log('Filter Items: loop 2');
        return [];
      } else {
        console.log('Filter Items: loop 3');
        return this.listFilter.items[0].dictionary.filter((item) => {
          return item.value.toLowerCase().indexOf(searchTerm.toLowerCase()) > -1;
        });
      }
    } else {
      console.log('Filter Items: loop 4');
      return [];
    }
  }

  fillFormDetails() {
    console.log('Add data from fillFormDetails: ', this.curRec);
    this.card_form.get('recordid').setValue(this.curRec.recordid);
    this.card_form.get('medicaleventid').setValue(this.curRec.medicaleventid);
    this.card_form.get('visitid').setValue(this.curRec.visitid);
    this.card_form.get('procedurename').setValue(this.curRec.procedurename);
    this.card_form.get('description').setValue(this.curRec.description);
    this.card_form.get('result').setValue(this.curRec.result);
    this.card_form.get('dateofmeasure').setValue(this.curRec.dateofmeasure);
    this.card_form.get('confirmed').setValue(this.curRec.confirmed);
    this.procedurename.setValue(this.curRec.procedurename);
    this.procedureTerm = this.curRec.procedurename;
    console.log('Event term from fillformdetails'+ this.curRec.medicationname);
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
      message: 'Do you certain you want to delete this record?',
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
              this.formSave.recordid = this.card_form.get('recordid').value;
              this.formSave.profileid = this.RestService.currentProfile;
              this.formSave.userid = this.RestService.userId;
              this.formSave.active = 'N';
              var restURL="https://ap6oiuyew6.execute-api.us-east-1.amazonaws.com/dev/ProcedureByProfile";
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
              var body = JSON.stringify(this.formSave);
              var self = this;
              console.log('Calling Post', this.formSave);
              apigClient.invokeApi(params, pathTemplate, method, additionalParams, body)
              .then(function(result){
                self.RestService.results = result.data;
                console.log('Happy Path: ' + self.RestService.results);
                self.category.title = "Measure";
                self.loading.dismiss();
                self.nav.pop();
              }).catch( function(result){
                console.log('Error results from formProcedure.delete: ',result);
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
    if (this.card_form.get('timeofmeasure').dirty) {
      strTime = this.card_form.get('timeofmeasure').value;
    } else if (this.card_form.get('dateofmeasure').dirty) {
      strTime = '00:00';
    }
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
      this.formSave.recordid = this.card_form.get('recordid').value;
      this.formSave.profileid = this.RestService.currentProfile;
      this.formSave.userid = this.RestService.userId;
      this.formSave.active = 'Y';
      if (this.card_form.get('procedurename').dirty){
        this.formSave.procedurename = this.card_form.get('procedurename').value;
      }
    } else {
      this.formSave.procedurename = this.card_form.get('procedurename').value;
      if (this.card_form.get('dateofmeasure').dirty || this.card_form.get('timeofmeasure').dirty){
        this.formSave.dateofmeasure = this.calculateDateTime();
      }
      this.formSave.profileid = this.RestService.currentProfile;
      this.formSave.userid = this.RestService.currentProfile;  //placeholder for user to device mapping and user identification
      this.formSave.active = 'Y';
    }
      var restURL="https://ap6oiuyew6.execute-api.us-east-1.amazonaws.com/dev/ProcedureByProfile";
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
      var body = JSON.stringify(this.formSave);
      var self = this;
      console.log('Calling Post', this.formSave);
      apigClient.invokeApi(params, pathTemplate, method, additionalParams, body)
      .then(function(result){
        self.RestService.results = result.data;
        console.log('Happy Path: ' + self.RestService.results);
        self.category.title = "Measure";
        self.loading.dismiss();
        self.nav.pop();
      }).catch( function(result){
        console.log('Error results from formProcedure.save: ',result);
        self.loading.dismiss();
        alert('There was an error saving this data.  Please try again later');
      });
  }

  showList() {
    if (this.procedureTerm == undefined) {
      this.procedureTerm = "";
    }
    //console.log('Event Term Length: ' + this.eventTerm.length + ', term: ', this.eventTerm);
    if (this.procedureTerm.length > 1) {
      return true;
    } else {
      return false;
    }
  }

  searchListTerm(strValue) {
    console.log('SearchListTerm called');
    this.procedurename.setValue(strValue);
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
    //alert('FormatDateTime called');
    if (this.userTimezone !== undefined && this.userTimezone !== null && this.userTimezone !=="") {
      return moment(dateString).tz(this.userTimezone).format('MMM DD YYYY hh:mm a');
    } else {
      return moment(dateString).format('MMM DD YYYY hh:mm a');
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
