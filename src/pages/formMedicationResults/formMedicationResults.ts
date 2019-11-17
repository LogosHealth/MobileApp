import { Component } from '@angular/core';
import { NavController, NavParams, AlertController, LoadingController, PopoverController } from 'ionic-angular';
import { Validators, FormGroup, FormControl, FormArray, FormBuilder } from '@angular/forms';
import { RestService } from '../../app/services/restService.service';
import { TreatmentResult } from '../../pages/listMedication/listMedication.model';

import { HistoryItemModel } from '../../pages/history/history.model';
import { DictionaryModel } from '../../pages/models/dictionary.model';
import { ListOrderService } from '../../pages/listOrder/listOrder.service';
import { MenuTreatment } from '../../pages/menuTreatment/menuTreatment';
import { MenuHelp } from '../../pages/menuHelp/menuHelp';
import { FeedModel } from '../feed/feed.model';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/Rx';
//import { CallNumber } from '@ionic-native/call-number';
import { FormMedSchedule } from '../../pages/formMedSchedule/formMedSchedule';
import { FormMedicalEvent } from '../../pages/formMedicalEvent/formMedicalEvent';
import { ListDoseHistory } from '../../pages/listDoseHistory/listDoseHistory';

var moment = require('moment-timezone');

@Component({
  selector: 'formVisit1-page',
  templateUrl: 'formMedicationResults.html'
})
export class FormMedicationResults {
  loading: any;
  section: string;
  formName: string = "formMedicationResults";
  recId: number;
  card_form: FormGroup;
  goal_array: FormArray;
  goal_schedule: FormGroup;
  curRec: any;
  newRec: boolean = false;
  saving: boolean = false;
  checkSave: boolean = false;
  showTips: boolean = true;
  eventSave: TreatmentResult = new TreatmentResult();
  category: HistoryItemModel = new HistoryItemModel();
  userTimezone: any;
  timeNow: any;
  hourNow: any;
  minuteNow: any;
  momentNow: any;
  categories_checkbox_open: boolean;
  categories_checkbox_result;
  feed: FeedModel = new FeedModel();
  eventHasFocus: boolean = false;
  isDone: boolean = false;
  hasValidDoseData: boolean = false;

  listFilter: DictionaryModel = new DictionaryModel();
  medication: any;
  fromEvent: any;
  fromSymptom: any;
  eventList: any = [];
  hasEventList: boolean = false;
  currentEvent: any;
  evProfile: any;
  sideeffectdata: any;
  sideeffects: FormArray;
  mode: any;
  medCompleted: boolean = false;
  isAsNeeded: boolean = false;
  loadFromId: any;

  constructor(public nav: NavController, public alertCtrl: AlertController, public RestService:RestService,
    public navParams: NavParams, public loadingCtrl: LoadingController, public list2Service: ListOrderService,
    public popoverCtrl:PopoverController, public formBuilder: FormBuilder, //private callNumber: CallNumber
    ) {

    this.recId = navParams.get('recId');
    this.medication = navParams.get('medication');
    this.fromEvent = navParams.get('fromEvent');
    this.fromSymptom = navParams.get('fromSymptom');
    this.eventList = navParams.get('eventList');
    this.feed.category = navParams.get('category');

    if (this.feed.category == undefined || this.feed.category.title == undefined) {
      this.feed.category = {title: 'Medication Info & Results'};
    }
    //console.log('visitInfo: ', this.visitInfo);
    console.log('formMedication: recId: ' + this.recId );
    console.log('formMedication: medication: ', this.medication );
    console.log('formMedication: fromEvent: ', this.fromEvent );
    console.log('formMedication: eventList: ', this.eventList );

    if (this.medication !== undefined && this.medication !== null && this.medication.mode !== undefined) {
      this.mode = this.medication.mode;
    }
    if (this.medication !== undefined && this.medication !== null && this.medication.completeflag !== undefined) {
      if (this.medication.completeflag == 'Y') {
        this.medCompleted = true;
      }
    }
    if (this.fromEvent !== undefined && this.fromEvent !== null && this.fromEvent.medicalevent !== undefined) {
      this.evProfile = this.fromEvent.profileid;
    } else if (this.fromSymptom !== undefined && this.fromSymptom !== null && this.fromSymptom.symptomname !== undefined){
      this.evProfile = this.fromSymptom.profileid;
    }
    if (this.eventList !== undefined && this.eventList !== null && this.eventList.length > 0) {
      this.hasEventList = true;
      console.log('hasEventList: ', this.eventList);
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

    this.curRec = RestService.results[this.recId];
    //console.log('Init Medication - recId = ' + this.recId);
    if (this.recId !== undefined) {
      console.log('Set using rec id: ' + this.recId + ': ', this.curRec );
      var allergy = false;
      if (this.curRec.allergyflag !== undefined && this.curRec.allergyflag == 'Y') {
        allergy = true;
      }
      var effective = true;
      if (this.curRec.effectiveflag !== undefined && this.curRec.effectiveflag == 'N') {
        effective = false;
      }

      if (this.curRec.treatmentid !== undefined && this.curRec.recordid == undefined) {
        console.log('Cur Rec - rec id set');
        this.curRec.recordid = this.curRec.treatmentid;
      }

      this.card_form = new FormGroup({
        recordid: new FormControl(this.curRec.recordid),
        symptomid: new FormControl(this.curRec.symptomid),
        medicaleventid: new FormControl(this.curRec.medicaleventid),
        reftable: new FormControl(this.curRec.reftable),
        reftablefield: new FormControl(this.curRec.reftablefield),
        reftablefieldid: new FormControl(this.curRec.reftablefieldid),
        reftablefields: new FormControl(this.curRec.reftablefields),
        type: new FormControl(this.curRec.type),
        namevalue: new FormControl(this.curRec.namevalue),
        startdate: new FormControl(this.curRec.startdate, Validators.required),
        enddate: new FormControl(this.curRec.enddate),
        verbatimindication: new FormControl(this.curRec.verbatimindication),
        dosage: new FormControl(this.curRec.dosage),
        doseunits: new FormControl(this.curRec.doseunits),
        dosefrequency: new FormControl(this.curRec.dosefrequency),
        ineffectiveflag: new FormControl(!effective),
        allergyflag: new FormControl(allergy),
        comments: new FormControl(this.curRec.comments),
        medicationname: new FormControl({value: null, disabled: true}),
        formulation: new FormControl({value: null, disabled: true}),
        startinginventory: new FormControl(),
        inventory: new FormControl(),
        inventoryunit: new FormControl(),
        dosetrackingtype: new FormControl(this.curRec.dosetrackingtype),

        sideeffects: this.formBuilder.array([]),
      });
    } else {
      this.newRec = true;
      this.card_form = new FormGroup({
        recordid: new FormControl(),
        symptomid: new FormControl(),
        medicaleventid: new FormControl(),
        reftable: new FormControl(),
        reftablefield: new FormControl(),
        reftablefieldid: new FormControl(),
        reftablefields: new FormControl(),
        type: new FormControl(),
        namevalue: new FormControl(),
        startdate: new FormControl(null, Validators.required),
        enddate: new FormControl(),
        verbatimindication: new FormControl(),
        dosage: new FormControl(),
        doseunits: new FormControl(),
        dosefrequency: new FormControl(),
        ineffectiveflag: new FormControl(),
        allergyflag: new FormControl(),
        comments: new FormControl(),
        medicationname: new FormControl({value: null, disabled: true}),
        formulation: new FormControl({value: null, disabled: true}),
        startinginventory: new FormControl(),
        inventory: new FormControl(),
        inventoryunit: new FormControl(),
        dosetrackingtype: new FormControl(),

        sideeffects: this.formBuilder.array([]),
      });
    }
  }

  ionViewWillEnter() {
    var dtNow = moment(new Date());
    var dtExpiration = moment(this.RestService.AuthData.expiration);
    var self = this;

    this.checkSave = false;
    if (dtNow < dtExpiration) {
      this.loadDetails();
    } else {
      this.RestService.refreshCredentials(function(err, results) {
        if (err) {
          console.log('Need to login again!!! - Credentials expired from formMedication');
          self.loading.dismiss();
          self.RestService.appRestart();
        } else {
          console.log('From formMedication - Credentials refreshed!');
          this.loadDetails();
        }
      });
    }
  }

  loadDetails() {
    if (this.medication !== undefined && this.medication !== null && this.medication.recordid !== undefined) {
      this.card_form.get('medicationname').setValue(this.medication.medicationname);
      this.card_form.get('formulation').setValue(this.medication.formulation);
      this.card_form.get('startinginventory').setValue(this.medication.startinginventory);
      this.card_form.get('inventory').setValue(this.medication.inventory);
      this.card_form.get('inventoryunit').setValue(this.medication.inventoryunit);
      if (this.card_form.get('doseunits').value == undefined || this.card_form.get('doseunits').value == null) {
        this.card_form.get('doseunits').setValue(this.medication.inventoryunit);
      }
    }

    if (this.fromEvent !== undefined && this.fromEvent.medicaleventid !== undefined && this.fromEvent.medicaleventid > 0) {
      this.card_form.get('medicaleventid').setValue(this.fromEvent.medicaleventid);
      this.card_form.get('verbatimindication').setValue(this.fromEvent.medicalevent);

    }

    if (!this.newRec) {
      this.presentLoadingDefault();
      var restURL: string;
      restURL="https://ap6oiuyew6.execute-api.us-east-1.amazonaws.com/dev/SideEffectByTreatment";
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
        }
      };
      var body = '';
      var self = this;

      apigClient.invokeApi(params, pathTemplate, method, additionalParams, body)
      .then(function(result){
        self.sideeffectdata = result.data;
        self.addExistingSideEffects();
        console.log('formMedicationResults.loadDetails: ', self.sideeffectdata);
        self.loading.dismiss();
        }).catch( function(result){
          console.log('Err from formMedicationResults.loadDetails: ', result);
          self.loading.dismiss();
          alert('There was an error retrieving this data.  Please try again later');
        });
     }
  }

  checkDoseValid() {
    //MM 11-15-19 This function checks if the data needed to save a record in Basic mode is met (similar to the Valid form).
    //Cannot use the Valid form method because of the differing requirements between basic and cabinet modes
    //This flag will stop an initial basic record save without having a start date and indication entered
    var invalidCount = 0;

    if (this.mode == 'basic') {
      console.log('checkDoseValid - dosage: ' + this.card_form.get('dosage').value);
      console.log('checkDoseValid - doseunits: ' + this.card_form.get('doseunits').value);
      console.log('checkDoseValid - dosefrequency: ' + this.card_form.get('dosefrequency').value);
      console.log('checkDoseValid - dosetrackingtype: ' + this.card_form.get('dosetrackingtype').value);
      if (this.card_form.get('dosage').value == null) {
        invalidCount = invalidCount + 1;
      }
      if (this.card_form.get('doseunits').value == null) {
        invalidCount = invalidCount + 1;
      }
      if (this.card_form.get('dosefrequency').value == null || this.card_form.get('dosefrequency').value == 'As Needed') {
        invalidCount = invalidCount + 1;
      }
      if (this.card_form.get('dosetrackingtype').value == null) {
        invalidCount = invalidCount + 1;
      }

      if (invalidCount > 0) {
        this.hasValidDoseData = false;
      } else {
        this.hasValidDoseData = true;
      }
    }
  }

  addExistingSideEffects() {
    console.log('Starting addExistingSideEffects');
    this.sideeffects = this.card_form.get('sideeffects') as FormArray;
    if (this.sideeffectdata !== undefined && this.sideeffectdata.items !== undefined && this.sideeffectdata.items.length > 0) {
      var exitLoop = 0;

      while (this.sideeffects.length !== 0 || exitLoop > 9) {
        this.sideeffects.removeAt(0);
        exitLoop = exitLoop + 1;
      }
      for (var j = 0; j < this.sideeffectdata.items.length; j++) {
        this.sideeffects.push(this.addExistingSideEffect(j));
      }
      this.checkDoseValid();
    } else {
      this.checkDoseValid();
    }
  }

  addExistingSideEffect(index): FormGroup {
    console.log('Starting addExistingTreatmentResult index: ' + index);
    return this.formBuilder.group({
      recordid: new FormControl({value: this.sideeffectdata.items[index].recordid, disabled: true}),
      medicalevent: new FormControl({value: this.sideeffectdata.items[index].medicalevent, disabled: true}),
      onsetdate: new FormControl({value: this.sideeffectdata.items[index].onsetdate, disabled: true}),
      enddate: new FormControl({value: this.sideeffectdata.items[index].enddate, disabled: true}),
      eventdescription: new FormControl({value: this.sideeffectdata.items[index].eventdescription, disabled: true}),
      dateofmeasure: new FormControl({value: this.sideeffectdata.items[index].dateofdiagnosis, disabled: true}),
      visitid: new FormControl({value: this.sideeffectdata.items[index].visitid, disabled: true}),
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
            this.eventSave.recordid = this.card_form.get('recordid').value;
            this.eventSave.profileid = this.RestService.currentProfile;
            this.eventSave.userid = this.RestService.userId;
            this.eventSave.active = 'N';
              var restURL="https://ap6oiuyew6.execute-api.us-east-1.amazonaws.com/dev/TreatmentByEvent";
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
              var body = JSON.stringify(this.eventSave);
              var self = this;
              console.log('Calling Post', this.eventSave);
              apigClient.invokeApi(params, pathTemplate, method, additionalParams, body)
              .then(function(result){
                self.RestService.results = result.data;
                console.log('Happy Path: ' + self.RestService.results);
                self.category.title = "Medication";
                self.loading.dismiss();
                self.nav.pop();
              }).catch( function(result){
                console.log('Error from formMedication.delete: ',result);
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
    console.log('saving record rec id: ' + this.card_form.get('recordid').value);

    if (this.card_form.get('recordid').value !==undefined && this.card_form.get('recordid').value !==null) {
      this.eventSave.recordid = this.card_form.get('recordid').value;
      if (this.curRec !== undefined && this.curRec.profileid !== undefined) {
        this.eventSave.profileid = this.curRec.profileid;
      } else {
        this.eventSave.profileid = this.RestService.currentProfile;
      }
      this.eventSave.userid = this.RestService.userId;
      this.eventSave.active = 'Y';

      if (this.card_form.get('startdate').dirty){
        this.eventSave.startdate = this.card_form.get('startdate').value;
      }
      if (this.card_form.get('enddate').dirty){
        this.eventSave.enddate = this.card_form.get('enddate').value;
      }
      if (this.card_form.get('dosage').dirty){
        this.eventSave.dosage = this.card_form.get('dosage').value;
      }
      if (this.card_form.get('doseunits').dirty){
        this.eventSave.doseunits = this.card_form.get('doseunits').value;
      }
      if (this.card_form.get('dosefrequency').dirty){
        this.eventSave.dosefrequency = this.card_form.get('dosefrequency').value;
      }
      if (this.card_form.get('dosetrackingtype').dirty){
        this.eventSave.dosetrackingtype = this.card_form.get('dosetrackingtype').value;
      }
      if (this.card_form.get('ineffectiveflag').dirty){
        if (this.card_form.get('ineffectiveflag').value == true) {
          this.eventSave.effectiveflag = 'N';
        } else {
          this.eventSave.effectiveflag = 'Y';
        }
      }
      if (this.card_form.get('allergyflag').dirty){
        if (this.card_form.get('allergyflag').value == true) {
          this.eventSave.allergyflag = 'Y';
        } else {
          this.eventSave.allergyflag = 'N';
        }
      }
      if (this.card_form.get('comments').dirty){
        this.eventSave.comments = this.card_form.get('comments').value;
      }
    } else {
      if (this.evProfile !== undefined && this.evProfile !== null) {
        this.eventSave.profileid = this.evProfile;
      } else {
        this.eventSave.profileid = this.RestService.currentProfile;
      }
        this.eventSave.userid = this.RestService.userId;
      this.eventSave.active = 'Y';
      if (this.card_form.get('medicaleventid').value !==undefined && this.card_form.get('medicaleventid').value !==null && this.card_form.get('medicaleventid').value > 0) {
        this.eventSave.medicaleventid = this.card_form.get('medicaleventid').value;
      } else if (this.card_form.get('symptomid').value !==undefined && this.card_form.get('symptomid').value !==null && this.card_form.get('symptomid').value > 0) {
        this.eventSave.symptomid = this.card_form.get('symptomid').value;
      } else {
        console.log('Error: No medicaleventid or symptomid');
        alert('Error: No medicaleventid or symptomid');
      }
      this.eventSave.reftable = 'medication';
      this.eventSave.reftablefield = 'medicationid';
      if (this.medication !== undefined && this.medication.recordid > 0) {
        this.eventSave.reftablefieldid = this.medication.recordid;
      } else {
        console.log('Error: No medication recordid', this.medication);
        alert('Error: No medication recordid');
      }
      this.eventSave.reftablefields = 'medicationname, startdate';
      this.eventSave.type = 'medication';
      if (this.card_form.get('medicationname').value !==undefined && this.card_form.get('medicationname').value !== "") {
        this.eventSave.namevalue = this.card_form.get('medicationname').value;
      }
      if (this.card_form.get('verbatimindication').value !==undefined && this.card_form.get('verbatimindication').value !== "") {
        this.eventSave.verbatimindication = this.card_form.get('verbatimindication').value;
      }

      if (this.card_form.get('startdate').dirty){
        this.eventSave.startdate = this.card_form.get('startdate').value;
      }
      if (this.card_form.get('enddate').dirty){
        this.eventSave.enddate = this.card_form.get('enddate').value;
      }
      if (this.card_form.get('dosage').dirty){
        this.eventSave.dosage = this.card_form.get('dosage').value;
      }
      if (this.card_form.get('doseunits').value !==undefined && this.card_form.get('doseunits').value !== "") {
        this.eventSave.doseunits = this.card_form.get('doseunits').value;
      }
      if (this.card_form.get('dosefrequency').dirty){
        this.eventSave.dosefrequency = this.card_form.get('dosefrequency').value;
      }
      if (this.card_form.get('dosetrackingtype').dirty){
        this.eventSave.dosetrackingtype = this.card_form.get('dosetrackingtype').value;
      }
      if (this.card_form.get('ineffectiveflag').dirty){
        if (this.card_form.get('ineffectiveflag').value == true) {
          this.eventSave.effectiveflag = 'N';
        } else {
          this.eventSave.effectiveflag = 'Y';
        }
      }
      if (this.card_form.get('allergyflag').dirty){
        if (this.card_form.get('allergyflag').value == true) {
          this.eventSave.allergyflag = 'Y';
        } else {
          this.eventSave.allergyflag = 'N';
        }
      }
      if (this.card_form.get('comments').dirty){
        this.eventSave.comments = this.card_form.get('comments').value;
      }

    }
      var restURL="https://ap6oiuyew6.execute-api.us-east-1.amazonaws.com/dev/TreatmentByEvent";
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
      var body = JSON.stringify(this.eventSave);
      var self = this;
      console.log('Calling Post', this.eventSave);
      apigClient.invokeApi(params, pathTemplate, method, additionalParams, body)
      .then(function(result){
        self.RestService.results = result.data;
        console.log('Happy Path: ', self.RestService.results);
        self.category.title = "Medication";
        self.loading.dismiss();
        self.nav.pop();
      }).catch( function(result){
        console.log('Error from formMedication.save: ',result);
        self.loading.dismiss();
        alert('There was an error saving this data.  Please try again later');
      });
 }

 navSaveRecord(callback){
  var dtNow = moment(new Date());
  var dtExpiration = moment(this.RestService.AuthData.expiration);
  var self = this;

  if (dtNow < dtExpiration) {
    this.presentLoadingDefault();
    this.navSaveRecordDo(function (err, results) {
      if (err) {
        callback(err, null);
      } else {
        callback(null, results);
      }
    });
  } else {
    this.presentLoadingDefault();
    this.RestService.refreshCredentials(function(err, results) {
      if (err) {
        console.log('Need to login again!!! - Credentials expired from ' + self.formName + '.navSaveRecord');
        self.loading.dismiss();
        self.RestService.appRestart();
      } else {
        console.log('From ' + self.formName + '.navSaveRecord - Credentials refreshed!');
        this.navSaveRecordDo(function (err, results) {
          if (err) {
            callback(err, null);
          } else {
            callback(null, results);
          }
        });
      }
    });
  }
}

navSaveRecordDo(callback){
  var updateOnly = false;

  this.saving = true;
  console.log('saving record rec id: ' + this.card_form.get('recordid').value);

  if (this.card_form.get('recordid').value !==undefined && this.card_form.get('recordid').value !==null) {
    this.eventSave.recordid = this.card_form.get('recordid').value;
    if (this.curRec !== undefined && this.curRec.profileid !== undefined) {
      this.eventSave.profileid = this.curRec.profileid;
    } else {
      this.eventSave.profileid = this.RestService.currentProfile;
    }
    this.eventSave.userid = this.RestService.userId;
    this.eventSave.active = 'Y';
    updateOnly = true;

    if (this.card_form.get('startdate').dirty){
      this.eventSave.startdate = this.card_form.get('startdate').value;
      this.curRec.startdate = this.card_form.get('startdate').value;
    }
    if (this.card_form.get('enddate').dirty){
      this.eventSave.enddate = this.card_form.get('enddate').value;
      this.curRec.enddate = this.card_form.get('enddate').value;
    }
    if (this.card_form.get('dosage').dirty){
      this.eventSave.dosage = this.card_form.get('dosage').value;
      this.curRec.dosage = this.card_form.get('dosage').value;
    }
    if (this.card_form.get('doseunits').dirty){
      this.eventSave.doseunits = this.card_form.get('doseunits').value;
      this.curRec.doseunits = this.card_form.get('doseunits').value;
    }
    if (this.card_form.get('dosefrequency').dirty){
      this.eventSave.dosefrequency = this.card_form.get('dosefrequency').value;
      this.curRec.dosefrequency = this.card_form.get('dosefrequency').value;
    }
    if (this.card_form.get('dosetrackingtype').dirty){
      this.eventSave.dosetrackingtype = this.card_form.get('dosetrackingtype').value;
      this.curRec.dosetrackingtype = this.card_form.get('dosetrackingtype').value;
    }
    if (this.card_form.get('ineffectiveflag').dirty){
      if (this.card_form.get('ineffectiveflag').value == true) {
        this.eventSave.effectiveflag = 'N';
      } else {
        this.eventSave.effectiveflag = 'Y';
      }
    }
    if (this.card_form.get('allergyflag').dirty){
      if (this.card_form.get('allergyflag').value == true) {
        this.eventSave.allergyflag = 'Y';
      } else {
        this.eventSave.allergyflag = 'N';
      }
    }
    if (this.card_form.get('comments').dirty){
      this.eventSave.comments = this.card_form.get('comments').value;
    }
  } else {
    if (this.evProfile !== undefined && this.evProfile !== null) {
      this.eventSave.profileid = this.evProfile;
    } else {
      this.eventSave.profileid = this.RestService.currentProfile;
    }
    this.eventSave.userid = this.RestService.userId;
    this.eventSave.active = 'Y';
    if (this.card_form.get('medicaleventid').value !==undefined && this.card_form.get('medicaleventid').value !==null && this.card_form.get('medicaleventid').value > 0) {
      this.eventSave.medicaleventid = this.card_form.get('medicaleventid').value;
    } else if (this.card_form.get('symptomid').value !==undefined && this.card_form.get('symptomid').value !==null && this.card_form.get('symptomid').value > 0) {
      this.eventSave.symptomid = this.card_form.get('symptomid').value;
    } else {
      console.log('Error: No medicaleventid or symptomid');
      alert('Error: No medicaleventid or symptomid');
    }
    this.eventSave.reftable = 'medication';
    this.eventSave.reftablefield = 'medicationid';
    if (this.medication !== undefined && this.medication.recordid > 0) {
      this.eventSave.reftablefieldid = this.medication.recordid;
    } else {
      console.log('Error: No medication recordid', this.medication);
      alert('Error: No medication recordid');
    }
    this.eventSave.reftablefields = 'medicationname, startdate';
    this.eventSave.type = 'medication';
    if (this.card_form.get('medicationname').value !==undefined && this.card_form.get('medicationname').value !== "") {
      this.eventSave.namevalue = this.card_form.get('medicationname').value;
    }
    if (this.card_form.get('verbatimindication').value !==undefined && this.card_form.get('verbatimindication').value !== "") {
      this.eventSave.verbatimindication = this.card_form.get('verbatimindication').value;
    }

    if (this.card_form.get('startdate').dirty){
      this.eventSave.startdate = this.card_form.get('startdate').value;
    }
    if (this.card_form.get('enddate').dirty){
      this.eventSave.enddate = this.card_form.get('enddate').value;
    }
    if (this.card_form.get('dosage').dirty){
      this.eventSave.dosage = this.card_form.get('dosage').value;
    }
    if (this.card_form.get('doseunits').value !==undefined && this.card_form.get('doseunits').value !== "") {
      this.eventSave.doseunits = this.card_form.get('doseunits').value;
    }
    if (this.card_form.get('dosefrequency').dirty){
      this.eventSave.dosefrequency = this.card_form.get('dosefrequency').value;
    }
    if (this.card_form.get('dosetrackingtype').dirty){
      this.eventSave.dosetrackingtype = this.card_form.get('dosetrackingtype').value;
    }
    if (this.card_form.get('ineffectiveflag').dirty){
      if (this.card_form.get('ineffectiveflag').value == true) {
        this.eventSave.effectiveflag = 'N';
      } else {
        this.eventSave.effectiveflag = 'Y';
      }
    }
    if (this.card_form.get('allergyflag').dirty){
      if (this.card_form.get('allergyflag').value == true) {
        this.eventSave.allergyflag = 'Y';
      } else {
        this.eventSave.allergyflag = 'N';
      }
    }
    if (this.card_form.get('comments').dirty){
      this.eventSave.comments = this.card_form.get('comments').value;
    }

  }
    var restURL="https://ap6oiuyew6.execute-api.us-east-1.amazonaws.com/dev/TreatmentByEvent";
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
    var body = JSON.stringify(this.eventSave);
    var self = this;
    console.log('Calling Post', this.eventSave);
    apigClient.invokeApi(params, pathTemplate, method, additionalParams, body)
    .then(function(result){
      self.loading.dismiss();
      if (!updateOnly) {
        this.curRec = this.eventSave;
        this.curRec.recordid = result.data;
      }
      callback(null, result.data);
    }).catch( function(result){
      console.log('Error from formMedication.save: ',result);
      self.loading.dismiss();
      callback(result, null);
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

  formatDate(dateString) {
    if (this.userTimezone !== undefined && this.userTimezone !== null && this.userTimezone !=="") {
      return moment(dateString).tz(this.userTimezone).format('MMM DD YYYY');
    } else {
      return moment(dateString).format('MMM DD YYYY');
    }
  }
/*  formatDateTime(dateString) {
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
  async ionViewCanLeave() {
    if (!this.saving && this.card_form.dirty && this.checkSave) {
      const shouldLeave = await this.confirmSave();
      return shouldLeave;
    } else if (!this.saving && this.card_form.dirty) {
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

  confirmSave(): Promise<Boolean> {
    let resolveLeaving;
    const canLeave = new Promise<Boolean>(resolve => resolveLeaving = resolve);
    const alert = this.alertCtrl.create({
      title: 'Save to Continue',
      message: 'This navigation will auto-save the current record.  Continue?',
      buttons: [
        {
          text: 'No',
          role: 'cancel',
          handler: () => {
            this.checkSave = false;
            resolveLeaving(false);
          }
        },
        {
          text: 'Yes',
          handler: () => {
            console.log('Confirm Save - Yes handle start');
            this.checkSave = false;
            var self = this;
            this.navSaveRecord(function(err, results) {
              if (err) {
                console.log('Err from navSaveRecord: ', err);
                resolveLeaving(true);
              } else {
                console.log('Results from navSaveRecord: ', results);
                console.log('After confirmSave success - CurRec: ', self.curRec);
                resolveLeaving(true);
              }
            });
          }
        }
      ]
    });
    alert.present();
    return canLeave
  }

  confirmSaveDirect(callback) {
    const alert = this.alertCtrl.create({
      title: 'Save to Continue',
      message: 'This navigation will auto-save the current record.  Continue?',
      buttons: [
        {
          text: 'No',
          role: 'cancel',
          handler: () => {
            this.checkSave = false;
            callback(null, false);
          }
        },
        {
          text: 'Yes',
          handler: () => {
            console.log('Confirm Save - Yes handle start');
            this.checkSave = false;
            var self = this;
            this.navSaveRecord(function(err, results) {
              if (err) {
                console.log('Err from navSaveRecord: ', err);
                callback(err, false);
              } else {
                console.log('Results from navSaveRecord: ', results);
                if (self.newRec) {
                  self.curRec = {recordid: results};
                  self.loadFromId = results;
                  console.log('New Treatment record: ', self.curRec);
                } else {
                  self.loadFromId = self.curRec.recordid;
                }
                callback(null, true);
              }
            });
          }
        }
      ]
    });
    if (!this.saving && this.card_form.dirty && this.checkSave) {
      alert.present();
    } else {
      callback(null, true);
    }
  }

hasFocus() {
  this.eventHasFocus = true;
}

loseFocus() {
  this.eventHasFocus = false;
}

searchListTerm(strValue) {
  console.log('SearchListTerm called');
  this.medication.setValue(strValue);
}

presentHelp(myEvent) {
  var self = this;
  var dataObj;
  var title = 'Dose Tracking Mode';
  var helptext = "<b>Passive:</b> Each dose will be automatically captured and removed from the current inventory (in cabinet mode) based on dose schedule.<br><br>" +
  "<b>Active:</b> Each dose must be explicitly acknowledged.";

  let popover = this.popoverCtrl.create(MenuHelp, {title: title, helptext: helptext});
  popover.onDidDismiss(data => {
    console.log('From popover onDismiss: ', data);
    if (data !==undefined && data !== null) {
      dataObj = data.choosePage;
      self.loadMenu(dataObj);
    }
  });
  popover.present({
    ev: myEvent
  });
}

presentPopover(myEvent) {
  var self = this;
  var dataObj;
  let popover = this.popoverCtrl.create(MenuTreatment);
  popover.onDidDismiss(data => {
    console.log('From popover onDismiss: ', data);
    if (data !==undefined && data !== null) {
      dataObj = data.choosePage;
      this.checkSave = true;
      self.loadMenu(dataObj);
    }
  });
  popover.present({
    ev: myEvent
  });
}

loadMenu(dataObj) {
  console.log('LoadMenu dataobj: ' + dataObj);
}

openSchedule() {
  this.checkSave = true;
  var self = this;
  this.confirmSaveDirect(function(err, result) {
    if (err) {
      console.log('Error in openSchedule.confirmSaveDirect' + err);
      alert('There is an error in saving the medication record from openSchedule');
    } else {
      if (result) {
        self.nav.push(FormMedSchedule, {fromTreatment: self.curRec, medication: self.medication});
      } else if (!result) {
        console.log('openSchedule.ConfirmSaveDirect - User cancelled');
      }
    }
  });
}

doseHistory() {
  var cat;

  cat = {title: 'Dose History'};
  this.nav.push(ListDoseHistory, {treatmentid: this.curRec.recordid, treatment: this.curRec, category: cat});

}

attachRecord() {
  alert('Coming soon.  This button will allow you to attach pictures and documents (e.g. PDFs) of physical medical records');
}

addSideeffect() {
  this.checkSave = true;
  var self = this;
  this.confirmSaveDirect(function(err, result) {
    if (err) {
      console.log('Error in addSideeffect.confirmSaveDirect' + err);
      alert('There is an error in saving the medication record from addSideeffect');
    } else {
      if (result) {
        self.nav.push(FormMedicalEvent, {fromTreatment: self.curRec});
      } else if (!result) {
        console.log('addSideeffect.ConfirmSaveDirect - User cancelled');
      }
    }
  });
}

setAsNeeded() {
  this.card_form.get('dosetrackingtype').setValue('active');
  this.isAsNeeded = true;
  //this.checkDoseValid();
}

notAsNeeded() {
  this.isAsNeeded = false;
  //this.checkDoseValid();
}

setCurrentEvent (item) {
  this.currentEvent = item;
  console.log('From setCurEvt: currentEvent ', this.currentEvent);
  if (this.currentEvent.type == 'medicalevent') {
    this.card_form.get('medicaleventid').setValue(this.currentEvent.recordid);
    this.card_form.get('symptomid').setValue(null);
  } else if (this.currentEvent.type == 'symptom') {
    this.card_form.get('medicaleventid').setValue(null);
    this.card_form.get('symptomid').setValue(this.currentEvent.recordid);
  } else {
    console.log('Error in setCurEvt bad type: ' + this.currentEvent.type);
  }
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
