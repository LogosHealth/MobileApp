import { Component } from '@angular/core';
import { NavController, NavParams, AlertController, LoadingController } from 'ionic-angular';
import { Validators, FormGroup, FormControl, FormArray } from '@angular/forms';
import { RestService } from '../../app/services/restService.service';
import { ListMeasureModel, ListMeasure } from '../../pages/listMeasure/listMeasure.model';

import { HistoryItemModel } from '../../pages/history/history.model';
import { ListGoalsModel } from '../../pages/listGoals/listGoals.model';
import { DictionaryModel, DictionaryItem } from '../../pages/models/dictionary.model';
import { DictionaryService } from '../../pages/models/dictionary.service';

var moment = require('moment-timezone');

@Component({
  selector: 'formExercise-page',
  templateUrl: 'formLabs.html'
})
export class FormLabsPage {
  loading: any;
  section: string;
  formName: string = "formLabs";
  recId: number;
  labForm: string = "";
  isSpecificLabForm: boolean = false;
  goalname: string;
  card_form: FormGroup;
  goal_array: FormArray;
  goal_schedule: FormGroup;
  curRec: any;
  newRec: boolean = false;
  saving: boolean = false;
  loadingComplete: boolean = false;
  showTips: boolean = true;

  formModelSave: ListMeasureModel  = new ListMeasureModel();
  formSave: ListMeasure = new ListMeasure();
  category: HistoryItemModel = new HistoryItemModel();
  userTimezone: any;
  list2: ListGoalsModel = new ListGoalsModel();
  dictionaries: DictionaryModel = new DictionaryModel();
  labsList: DictionaryItem[];
  unitList = [];

  categories_checkbox_open: boolean;
  categories_checkbox_result;

  constructor(public nav: NavController, public alertCtrl: AlertController, public RestService:RestService,
    public navParams: NavParams, public loadingCtrl: LoadingController, public dictionaryService: DictionaryService) {
    this.recId = navParams.get('recId');
    this.labForm = navParams.get('labForm');

    if (this.labForm !== "" && this.labForm !== undefined && this.labForm !== null) {
      this.isSpecificLabForm = true;
    } else {
      console.log ('Lab Form not exist - value = ' + this.labForm);
    }

    this.curRec = RestService.results[this.recId];

    var self = this;
    this.RestService.curProfileObj(function (error, results) {
      if (!error) {
        self.userTimezone = results.timezone;
      }
    });

    //add caloriesburnedvalue generator
    if (this.recId !== undefined) {

      this.card_form = new FormGroup({
        recordid: new FormControl(this.curRec.recordid),
        labnametext: new FormControl(this.curRec.labnametext, Validators.required),
        labname: new FormControl(this.curRec.labname),
        labresult: new FormControl(this.curRec.labresult, Validators.required),
        labunittext: new FormControl(this.curRec.labunittext),
        labunit: new FormControl(this.curRec.labunit),
        lowerrange: new FormControl(this.curRec.lowerrange),
        upperrange: new FormControl(this.curRec.upperrange),
        dateofmeasure: new FormControl(this.formatDateTime(this.curRec.dateofmeasure)),
        profileid: new FormControl(this.curRec.profileid),
        userid: new FormControl(this.curRec.userid),
        confirmed: new FormControl(this.curRec.confirmed)
      });
    } else {
      this.newRec = true;
      this.card_form = new FormGroup({
        recordid: new FormControl(),
        labnametext: new FormControl(null, Validators.required),
        labname: new FormControl(),
        labresult: new FormControl(null, Validators.required),
        labunittext: new FormControl(),
        labunit: new FormControl(),
        lowerrange: new FormControl(),
        upperrange: new FormControl(),
        dateofmeasure: new FormControl(),
        profileid: new FormControl(),
        userid: new FormControl(),
        confirmed: new FormControl()
      });
    }
  }

  ionViewDidLoad() {
    var dtNow = moment(new Date());
    var dtExpiration = moment(this.RestService.AuthData.expiration);

    if (dtNow < dtExpiration) {
      this.loading = this.loadingCtrl.create();
      this.loading.present();
      this.loadData();
    } else {
      console.log('Need to login again!!! - Credentials expired from formLabs');
      this.RestService.appRestart();
    }
  }

  ionViewWillEnter() {
    this.nav.getPrevious().data.refresh = false;
  }

  loadData() {
    console.log('GetDictionaries by Form: formLabs');
    var restURL: string;

    restURL="https://ap6oiuyew6.execute-api.us-east-1.amazonaws.com/dev/GetDictionariesByForm";

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

    if (this.isSpecificLabForm) {
      additionalParams = {
        queryParams: {
            formName: this.formName,
            specificItem: this.labForm
        }
      };
    } else {
      additionalParams = {
        queryParams: {
            formName: this.formName
        }
      };
    }

    var body = '';
    var self = this;
    console.log('Calling getDictionaries from FormLabs');
    apigClient.invokeApi(params, pathTemplate, method, additionalParams, body)
    .then(function(result){
      self.RestService.results = result.data;
      console.log('RestService Results ', self.RestService.results);
      self.dictionaryService
      .getData()
      .then(data => {
        self.dictionaries.items = self.RestService.results;
        console.log("Results Data for Get Dictionaries: ", self.dictionaries.items);
        self.labsList = self.dictionaries.items[0].dictionary; //index 0 as aligned with sortIndex
        //console.log("Results Data Active LabName: " +  self.curRec.labname);
        if (self.curRec !== undefined) {
          if (self.curRec.labname !== undefined && self.curRec.labname !== null && Number(self.curRec.labname) > 0) {
            self.unitList = self.getUnitsByLabName(self.curRec.labname);
          } else {
            self.unitList = self.dictionaries.items[0].dictionary[0].dictionary; //index 1 as aligned with sortIndex
          }
        } else {
          self.unitList = self.dictionaries.items[0].dictionary[0].dictionary; //index 1 as aligned with sortIndex
        }

        if (self.isSpecificLabForm) {
          var labFormSplit = self.labForm.split("=");
          var labValue = labFormSplit[1];
          self.card_form.get('labname').setValue(labValue);
          self.labNameChange(self.labsList[0], 0);
        }
        self.RestService.refreshCheck();
        self.loadingComplete = true;
        self.loading.dismiss();
      });
    }).catch( function(result){
        self.RestService.refreshCheck();
        console.log(body);
        self.loadingComplete = true;
        self.loading.dismiss();
    });
  }

  confirmRecord(){
    this.saving = true;
    this.formSave.recordid = this.card_form.get('recordid').value;
    this.formSave.profileid = this.RestService.currentProfile;
    this.formSave.userid = this.RestService.userId;
    this.formSave.active = 'Y';
    this.formSave.confirmed = 'Y';
    if (this.card_form.get('labname').dirty){
      this.formSave.labname = this.card_form.get('labname').value;
    }
    if (this.card_form.get('labnametext').dirty){
      this.formSave.labnametext = this.card_form.get('labnametext').value;
    }
    if (this.card_form.get('labresult').dirty){
      this.formSave.labresult = this.card_form.get('labresult').value;
    }
    if (this.card_form.get('labunit').dirty){
      this.formSave.labunit = this.card_form.get('labunit').value;
    }
    if (this.card_form.get('labunittext').dirty){
      this.formSave.labunittext = this.card_form.get('labunittext').value;
    }
    if (this.card_form.get('lowerrange').dirty){
      this.formSave.lowerrange = this.card_form.get('lowerrange').value;
    }
    if (this.card_form.get('upperrange').dirty){
      this.formSave.upperrange = this.card_form.get('upperrange').value;
    }

    var dtNow = moment(new Date());
    var dtExpiration = moment(this.RestService.AuthData.expiration);

    if (dtNow < dtExpiration) {
      var restURL="https://ap6oiuyew6.execute-api.us-east-1.amazonaws.com/dev/LabsByProfile";

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
        self.category.title = "Labs";
        self.nav.pop();
      }).catch( function(result){
        console.log('Result: ',result);
        console.log(body);
      });
    } else {
      console.log('Need to login again!!! - Credentials expired from formLabs - Confirm');
      this.RestService.appRestart();
    }
  }

  deleteRecord(){
    let alert = this.alertCtrl.create({
      title: 'Confirm Delete',
      message: 'Do you certain you want to delete this record?',
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
            var dtNow = moment(new Date());
            var dtExpiration = moment(this.RestService.AuthData.expiration);

            if (dtNow < dtExpiration) {
              this.saving = true;
              this.formSave.recordid = this.card_form.get('recordid').value;
              this.formSave.profileid = this.RestService.currentProfile;
              this.formSave.userid = this.RestService.userId;
              this.formSave.active = 'N';
              var restURL="https://ap6oiuyew6.execute-api.us-east-1.amazonaws.com/dev/LabsByProfile";

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
                self.category.title = "Labs";
                self.nav.pop();
              }).catch( function(result){
                console.log('Result: ',result);
                console.log(body);
              });
            } else {
              console.log('Need to login again!!! - Credentials expired from formLabs - Delete');
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
      this.formSave.recordid = this.card_form.get('recordid').value;
      this.formSave.profileid = this.RestService.currentProfile;
      this.formSave.userid = this.RestService.userId;
      this.formSave.active = 'Y';

      if (this.card_form.get('labname').dirty){
        this.formSave.labname = this.card_form.get('labname').value;
      }
      if (this.card_form.get('labnametext').dirty){
        this.formSave.labnametext = this.card_form.get('labnametext').value;
      }
        if (this.card_form.get('labresult').dirty){
        this.formSave.labresult = this.card_form.get('labresult').value;
      }
      if (this.card_form.get('labunit').dirty){
        this.formSave.labunit = this.card_form.get('labunit').value;

      }
      if (this.card_form.get('labunittext').dirty){
        this.formSave.labunittext = this.card_form.get('labunittext').value;
      }
      if (this.card_form.get('lowerrange').dirty){
        this.formSave.lowerrange = this.card_form.get('lowerrange').value;
      }
      if (this.card_form.get('upperrange').dirty){
        this.formSave.upperrange = this.card_form.get('upperrange').value;
      }
    } else {
      this.formSave.profileid = this.RestService.currentProfile;
      this.formSave.userid = this.RestService.currentProfile;  //placeholder for user to device mapping and user identification
      this.formSave.active = 'Y';
      this.formSave.labname = this.card_form.get('labname').value;
      this.formSave.labresult = this.card_form.get('labresult').value;
      if (this.card_form.get('labnametext').dirty){
        this.formSave.labnametext = this.card_form.get('labnametext').value;
      }
      if (this.card_form.get('labunit').dirty){
        this.formSave.labunit = this.card_form.get('labunit').value;
      }
      if (this.card_form.get('labunittext').dirty){
        this.formSave.labunittext = this.card_form.get('labunittext').value;
      }
      if (this.card_form.get('lowerrange').dirty){
        this.formSave.lowerrange = this.card_form.get('lowerrange').value;
      }
      if (this.card_form.get('upperrange').dirty){
        this.formSave.upperrange = this.card_form.get('upperrange').value;
      }
    }

    var dtNow = moment(new Date());
    var dtExpiration = moment(this.RestService.AuthData.expiration);

    if (dtNow < dtExpiration) {
      var restURL="https://ap6oiuyew6.execute-api.us-east-1.amazonaws.com/dev/LabsByProfile";

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
        self.category.title = "Labs";
        self.nav.pop();
      }).catch( function(result){
        console.log('Result: ',result);
        console.log(body);
      });
    } else {
      console.log('Need to login again!!! - Credentials expired from formLabs - Save');
      this.RestService.appRestart();
    }
  }

  public today() {
    return new Date().toISOString().substring(0,10);
  }

  formatDateTime(dateString) {
    //alert('FormatDateTime called');
    if (this.userTimezone !== undefined && this.userTimezone !=="") {
      return moment(dateString).tz(this.userTimezone).format('MM-DD-YYYY hh:mm A');
    } else {
      return moment(dateString).format('MM-DD-YYYY hh:mm a');
    }
  }

  getUnitsByLabName(index) {
    console.log('GetUnitsbyLabName Index: ' + index);
    for (var i = 0; i < this.labsList.length; i++) {
      if (this.labsList[i].recordid == index) {
        //console.log('GetUnitsbyLabName dictionaryid: ' + this.labsList[i].recordid);
        //console.log('Found unit list: ', this.labsList[i].dictionary[0]);
        return this.labsList[i].dictionary;
      }
    }
  }

  labNameChange(lab, index) {
    this.card_form.get('labnametext').setValue(lab.dictionarycode);
    console.log('Labnametext: ' + this.card_form.get('labnametext').value);
    if (this.loadingComplete) {
      this.card_form.get('labnametext').markAsDirty();
    }

    this.unitList = this.getUnitsByLabName(lab.recordid);
    //console.log('Unit List from labNameChange: ', this.unitList);
    if (this.unitList !== undefined && this.unitList.length > 0 && this.card_form.get('labunit').value == null) {
      //console.log('Labunit field value: ' + this.card_form.get('labunit').value);
      for (var i = 0; i < this.unitList.length; i++) {
        if (this.unitList[i].defaultSelection == 'Y' ) {
          this.card_form.get('labunit').setValue(this.unitList[i].recordid);
          this.card_form.get('labunit').markAsDirty();
        }
      }
    }
  }

  labUnitChange(unit) {
    console.log("labUnit changed - Unit text = " + unit.dictionarycode);
    this.card_form.get('labunittext').setValue(unit.dictionarycode);
    if (this.loadingComplete) {
      this.card_form.get('labunittext').markAsDirty();
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

  attachRecord() {
    alert('Add attach doc here');
  }

}
