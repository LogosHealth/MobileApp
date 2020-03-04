import { Component } from '@angular/core';
import { NavController, NavParams, AlertController, LoadingController, PopoverController, ModalController } from 'ionic-angular';
import { Validators, FormGroup, FormControl, FormArray, FormBuilder } from '@angular/forms';
import { RestService } from '../../app/services/restService.service';
import { MedicalEventModel } from '../../pages/listMedicalEvent/listMedicalEvent.model';
import { ListMedication, TreatmentResult, TreatmentResults } from '../../pages/listMedication/listMedication.model';
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
import { FormMedicationResults } from '../../pages/formMedicationResults/formMedicationResults';
import { ListMedicationResults } from '../../pages/listMedicationResults/listMedicationResults';
//import { ListTreatmentPage } from '../listTreatment/listTreatment';
import { FormMedAddDose } from '../../pages/formMedAddDose/formMedAddDose';

var moment = require('moment-timezone');

@Component({
  selector: 'formVisit1-page',
  templateUrl: 'formMedication.html'
})
export class FormMedication {
  loading: any;
  section: string;
  formName: string = "formMedication";
  recId: number;
  card_form: FormGroup;
  goal_array: FormArray;
  goal_schedule: FormGroup;
  curRec: any;
  newRec: boolean = false;
  saving: boolean = false;
  showTips: boolean = true;
  eventModelSave: MedicalEventModel  = new MedicalEventModel();
  eventSave: ListMedication = new ListMedication();
  category: HistoryItemModel = new HistoryItemModel();
  userTimezone: any;
  timeNow: any;
  hourNow: any;
  minuteNow: any;
  momentNow: any;
  futureLimit: any;
  categories_checkbox_open: boolean;
  categories_checkbox_result;
  feed: FeedModel = new FeedModel();
  eventHasFocus: boolean = false;
  //visitInfo: any;
  loadFromId: number;
  fromEvent: any;
  fromSymptom: any;
  mode: any = null;
  treatmentresults: FormArray;
  eventList: any = [];
  currentEvent: any;
  comingBack: boolean = false;

  //set at addBasicInfo - if in basic mode and has a treatment result, diable add button as basic mode requires only 1 treatment result
  basicModeHasTR: boolean = false;
  //flag to highlight if a change occurred and the record needs saved to move to a forward page (not a back page)
  checkSave: boolean = false;
  //Needed because can't use valid as field requirements are different between basic and cabinet modes
  isBasicInvalid2Save: boolean = false;
  //represents if the drug package has been completed
  isDone: boolean = false;
  //Set in addExistingTreatmentResults - used to inactivate delete button - set to true with 1 or more TRs
  hasTreatments: boolean = false;
  //Set in addExistingTreatmentResults - used to deactivate TR add button - set to true if the workflow is coming from the medical event
  treatingEvent: boolean = false;
  //Used to render either a freetext verbatim of structured medical event list
  needEventList: boolean = false;
  //Represents a new Medicine Cabinet drug - when true, sets mode to cabinet and disables mode control
  newFromCabinet: boolean = false;

  medication: FormControl = new FormControl();
  listFilter: DictionaryModel = new DictionaryModel();
  eventTerm: string = '';
  items: any;
  userCount: any = 0;
  dtNow: any = moment(Date()).format('YYYY-MM-DDTHH:mm');

  constructor(public nav: NavController, public alertCtrl: AlertController, public RestService:RestService,
    public navParams: NavParams, public loadingCtrl: LoadingController, public list2Service: ListOrderService,
    public popoverCtrl:PopoverController, public formBuilder: FormBuilder, public modalCtrl: ModalController, //private callNumber: CallNumber
    ) {

    this.userCount = this.RestService.Profiles.length;
    this.recId = navParams.get('recId');
    this.loadFromId = navParams.get('loadFromId');
    //this.visitInfo = navParams.get('visit');
    this.feed.category = navParams.get('category');
    this.fromEvent = navParams.get('fromEvent');
    console.log('formMedication from Event ', this.fromEvent);
    this.fromSymptom = navParams.get('fromSymptom');
    console.log('formMedication from Symptom ', this.fromSymptom);
    this.newFromCabinet = navParams.get('newFromCabinet');
    if (this.newFromCabinet == undefined || this.newFromCabinet == null) {
      this.newFromCabinet = false;
    }
    console.log('formMedication newFromCabinet ', this.newFromCabinet);

    if (this.feed.category == undefined || this.feed.category == null) {
      this.feed.category = {title: 'Medication'};
    }
    console.log('formMedication: recId: ' + this.recId );
    console.log('formMedication: loadFromId: ' + this.loadFromId );

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
    this.futureLimit = moment(new Date()).add(5, 'years');

    this.curRec = RestService.results[this.recId];
    console.log('Init Medication - curRec: ', this.curRec);
    if (this.recId !== undefined) {
      if (this.curRec.completeflag !== undefined && this.curRec.completeflag == 'Y') {
        this.isDone = true;
      }
      if (this.curRec.mode !== undefined) {
        this.mode = this.curRec.mode;
      }
      this.card_form = new FormGroup({
        recordid: new FormControl(this.curRec.recordid),
        accountid: new FormControl(this.curRec.accountid),
        drugid: new FormControl(this.curRec.drugid),
        formulation: new FormControl(this.curRec.formulation),
        manufacturer: new FormControl(this.curRec.manufacturer),
        mode: new FormControl(this.curRec.mode, Validators.required),
        type: new FormControl(this.curRec.type),
        purchasedate: new FormControl(this.curRec.purchasedate, Validators.max(this.dtNow)),
        expiration: new FormControl(this.curRec.expiration),
        startinginventory: new FormControl(this.curRec.startinginventory),
        inventory: new FormControl(this.curRec.inventory),
        inventoryunit: new FormControl(this.curRec.inventoryunit),
        completeflag: new FormControl(this.isDone),
        serialnumber: new FormControl(this.curRec.serialnumber),
        cost: new FormControl(this.curRec.cost),
        specialinstruction: new FormControl(this.curRec.specialinstruction),
        confirmed: new FormControl(this.curRec.confirmed),
        verbatimindication: new FormControl(),
        startdate: new FormControl(this.todayNow()),
        enddate: new FormControl(),
        medicaleventid: new FormControl(),
        symptomid: new FormControl(),

        treatmentresults: this.formBuilder.array([]),
      });
      this.medication = new FormControl(this.curRec.medicationname, Validators.required);
      this.eventTerm = this.curRec.medicationname;
      this.addExistingTreatmentResults();
    } else {
      var modeValue;
      if (this.newFromCabinet) {
        modeValue = 'cabinet';
      } else {
        modeValue = null;
      }
      this.newRec = true;
      this.card_form = new FormGroup({
        recordid: new FormControl(),
        accountid: new FormControl(),
        drugid: new FormControl(),
        formulation: new FormControl(),
        manufacturer: new FormControl(),
        mode: new FormControl(modeValue, Validators.required),
        type: new FormControl(),
        purchasedate: new FormControl(null, Validators.max(this.dtNow)),
        expiration: new FormControl(null),
        startinginventory: new FormControl(),
        inventory: new FormControl(),
        inventoryunit: new FormControl(),
        completeflag: new FormControl(),
        serialnumber: new FormControl(),
        cost: new FormControl(),
        specialinstruction: new FormControl(),
        confirmed: new FormControl(),
        verbatimindication: new FormControl(),
        startdate: new FormControl(this.todayNow()),
        enddate: new FormControl(),
        medicaleventid: new FormControl(),
        symptomid: new FormControl(),

        treatmentresults: this.formBuilder.array([]),
      });
      this.medication = new FormControl(null, Validators.required);
      this.addBasicInfo();
    }
  }

  ionViewWillEnter() {
    var dtNow = moment(new Date());
    var dtExpiration = moment(this.RestService.AuthData.expiration);
    var self = this;
    this.checkSave = false;
    this.saving = false;
    this.card_form.markAsPristine();
    this.medication.markAsPristine();

    if (dtNow < dtExpiration) {
      if (!this.comingBack) {
        this.presentLoadingDefault();
        this.loadFilterList();
        this.medication.valueChanges.debounceTime(700).subscribe(search => {
          this.setFilteredItems();
        });
      } else {
        console.log(this.formName + ' Coming Back 1');
        this.comingBack = false;
        this.presentLoadingDefault();
        this.loadDetails();
      }
    } else {
      this.presentLoadingDefault();
      this.RestService.refreshCredentials(function(err, results) {
        if (err) {
          console.log('Need to login again!!! - Credentials expired from formMedication');
          self.loading.dismiss();
          self.RestService.appRestart();
        } else {
          if (!self.comingBack) {
            self.loadFilterList();
            self.medication.valueChanges.debounceTime(700).subscribe(search => {
              self.setFilteredItems();
            });
          } else {
            console.log(self.formName + ' Coming Back 2');
            self.comingBack = false;
            self.loadDetails();
          }
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

  loadEventList() {
    //this.presentLoadingDefault();
    console.log('Start loadEventList!');
    var restURL: string;
    restURL="https://ap6oiuyew6.execute-api.us-east-1.amazonaws.com/dev/EventListByProfile";
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
      console.log('Result from formMed.loadEventList - loadFromID: ' + self.loadFromId, result);
      if (result !== undefined && result.data !== undefined && result.data[0] !== undefined && result.data[0].recordid > 0) {
        self.eventList = result.data;
        self.loading.dismiss();
        console.log('formMedication.loadEventList: ', self.eventList);
      } else {
        console.log('formMedication.loadEventList - no data: ', result);
        self.loading.dismiss();
      }
    }).catch( function(result){
      console.log('Err from formMedication.loadEventList: ', result);
      self.loading.dismiss();
      alert('There was an error retrieving this data.  Please try again later');
    });
  }

  fillFormDetails() {
    console.log('Add data from fillFormDetails: ', this.curRec);
    if (this.curRec.completeflag !== undefined && this.curRec.completeflag == 'Y') {
      this.isDone = true;
    }
    if (this.curRec.mode !== undefined) {
      this.mode = this.curRec.mode;
    }
    this.card_form.get('recordid').setValue(this.curRec.recordid);
    this.card_form.get('formulation').setValue(this.curRec.formulation);
    this.card_form.get('mode').setValue(this.curRec.mode);
    this.card_form.get('type').setValue(this.curRec.type);
    this.card_form.get('purchasedate').setValue(this.curRec.purchasedate);
    this.card_form.get('expiration').setValue(this.curRec.expiration);
    this.card_form.get('startinginventory').setValue(this.curRec.startinginventory);
    this.card_form.get('inventory').setValue(this.curRec.inventory);
    this.card_form.get('inventoryunit').setValue(this.curRec.inventoryunit);
    this.card_form.get('completeflag').setValue(this.isDone);
    this.card_form.get('serialnumber').setValue(this.curRec.serialnumber);
    this.card_form.get('cost').setValue(this.curRec.cost);
    this.card_form.get('specialinstruction').setValue(this.curRec.specialinstruction);
    this.card_form.get('confirmed').setValue(this.curRec.confirmed);
    this.medication.setValue(this.curRec.medicationname);
    this.eventTerm = this.curRec.medicationname;

    console.log('isDone is set to: ' + this.isDone);
    if (this.curRec.treatmentresults !== undefined && this.curRec.treatmentresults.items !== undefined && this.curRec.treatmentresults.items.length > 0) {
      this.addExistingTreatmentResults();
    } else {
      this.addBasicInfo();
    }
    console.log('Event term from fillformdetails'+ this.curRec.medicationname);
  }

  addExistingTreatmentResults() {
    console.log('Starting addExistingTreatmentResults');
    this.treatmentresults = this.card_form.get('treatmentresults') as FormArray;
    if (this.curRec !== undefined && this.curRec.treatmentresults !== undefined && this.curRec.treatmentresults.items !== undefined
      && this.curRec.treatmentresults.items.length > 0) {
        console.log('AddTR has TR');
        this.hasTreatments = true;
        var exitLoop = 0;

      while (this.treatmentresults.length !== 0 || exitLoop > 9) {
        this.treatmentresults.removeAt(0);
        exitLoop = exitLoop + 1;
      }
      for (var j = 0; j < this.curRec.treatmentresults.items.length; j++) {
        if (this.fromEvent !== undefined && this.fromEvent.medicaleventid !== undefined) {
          if (this.fromEvent.medicaleventid == this.curRec.treatmentresults.items[j].medicaleventid) {
            this.treatingEvent = true;
          }
        } else if (this.fromSymptom !== undefined && this.fromSymptom.symptomid !== undefined) {
          if (this.fromSymptom.symptomid == this.curRec.treatmentresults.items[j].symptomid) {
            this.treatingEvent = true;
          }
        }
        this.treatmentresults.push(this.addExistingTreatmentResult(j));
      }
      this.addBasicInfo();
    } else {
      console.log('AddTR no TR');
      this.addBasicInfo();
    }
  }

  addBasicInfo() {
    console.log('Start addBasicInfo');
    if (this.newFromCabinet) {
      this.setMode('cabinet');
    }
    if (this.mode !== undefined && this.mode == 'basic' && this.curRec.treatmentresults.items.length == 1) {
      this.card_form.get('verbatimindication').setValue(this.curRec.treatmentresults.items[0].verbatimindication);
      //this.card_form.get('startdate').setValue({value: this.curRec.treatmentresults.items[0].startdate, disabled: this.isDone});
      this.card_form.get('startdate').setValue(this.curRec.treatmentresults.items[0].startdate);
      this.card_form.get('enddate').setValue(this.curRec.treatmentresults.items[0].enddate);
      console.log('Add Basic Info startdate: ', this.card_form.get('startdate').value);
      this.basicModeHasTR = true;
    } else if (this.fromEvent !== undefined && this.fromEvent.medicaleventid !== undefined) {
      this.card_form.get('medicaleventid').setValue(this.fromEvent.medicaleventid);
      this.card_form.get('verbatimindication').setValue(this.fromEvent.medicalevent);
      console.log('Add Basic Info medicaleventid: ' + this.card_form.get('medicaleventid').value);
    } else if (this.fromSymptom !== undefined && this.fromSymptom.symptomid !== undefined) {
      this.card_form.get('symptomid').setValue(this.fromSymptom.symptomid);
      this.card_form.get('verbatimindication').setValue(this.fromSymptom.symptomname);
      console.log('Add Basic Info symptomid: ' + this.card_form.get('symptomid').value);
    } else {
      this.needEventList = true;
      console.log('Need Event List! boolean = ' + this.needEventList);
      this.loadEventList();
    }
  }

  addExistingTreatmentResult(index): FormGroup {
    console.log('Starting addExistingTreatmentResult index: ' + index);
    var verbatim;
    if (this.userCount > 1) {
      verbatim = this.curRec.treatmentresults.items[index].verbatimindication + " (" + this.curRec.treatmentresults.items[index].firstname + ")"
    } else {
      verbatim = this.curRec.treatmentresults.items[index].verbatimindication;
    }

    return this.formBuilder.group({
      recordid: new FormControl({value: this.curRec.treatmentresults.items[index].treatmentid, disabled: true}),
      symptomid: new FormControl({value: this.curRec.treatmentresults.items[index].symptomid, disabled: true}),
      medicaleventid: new FormControl({value: this.curRec.treatmentresults.items[index].medicaleventid, disabled: true}),
      profileid: new FormControl({value: this.curRec.treatmentresults.items[index].profileid, disabled: true}),
      reftable: new FormControl({value: this.curRec.treatmentresults.items[index].reftable, disabled: true}),
      reftablefield: new FormControl({value: this.curRec.treatmentresults.items[index].reftablefield, disabled: true}),
      reftablefieldid: new FormControl({value: this.curRec.treatmentresults.items[index].reftablefieldid, disabled: true}),
      reftablefields: new FormControl({value: this.curRec.treatmentresults.items[index].reftablefields, disabled: true}),
      type: new FormControl({value: this.curRec.treatmentresults.items[index].type, disabled: true}),
      namevalue: new FormControl({value: this.curRec.treatmentresults.items[index].namevalue, disabled: true}),
      startdate: new FormControl({value: this.curRec.treatmentresults.items[index].startdate, disabled: true}),
      enddate: new FormControl({value: this.curRec.treatmentresults.items[index].enddate, disabled: true}),
      verbatimindication: new FormControl({value: verbatim, disabled: true}),
      dosage: new FormControl({value: this.curRec.treatmentresults.items[index].dosage, disabled: true}),
      doseunits: new FormControl({value: this.curRec.treatmentresults.items[index].doseunits, disabled: true}),
      dosefrequency: new FormControl({value: this.curRec.treatmentresults.items[index].dosefrequency, disabled: true}),
      dosetrackingtype: new FormControl({value: this.curRec.treatmentresults.items[index].dosetrackingtype, disabled: true}),
      dosetrackingstate: new FormControl({value: this.curRec.treatmentresults.items[index].dosetrackingstate, disabled: true}),
      effectiveflag: new FormControl({value: this.curRec.treatmentresults.items[index].effectiveflag, disabled: true}),
      allergyflag: new FormControl({value: this.curRec.treatmentresults.items[index].allergyflag, disabled: true}),
      comments: new FormControl({value: this.curRec.treatmentresults.items[index].comments, disabled: true}),
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
      title: 'Are you certain???',
      message: 'Are you absolutely certain you want to delete this record?  By deleting this record, this drug will be wiped from your medical history.  Unless this was created and populated in error, adding an end date is the proper way to complete a medication regimen.',
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
              var restURL="https://ap6oiuyew6.execute-api.us-east-1.amazonaws.com/dev/MedicationByProfile";
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
                self.category.title = "Medical Event";
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
    var tr: TreatmentResult = new TreatmentResult();
    var blnAddTR: boolean = false;

    this.saving = true;
    if (this.card_form.get('recordid').value !==undefined && this.card_form.get('recordid').value !==null) {
      this.eventSave.recordid = this.card_form.get('recordid').value;
      this.eventSave.profileid = this.RestService.currentProfile;
      this.eventSave.accountid = this.RestService.Profiles[0].accountid;
      this.eventSave.userid = this.RestService.userId;
      this.eventSave.active = 'Y';
      if (this.medication.dirty){
        this.eventSave.medicationname = this.medication.value;
        this.curRec.medicationname = this.medication.value;
      }
      if (this.card_form.get('formulation').dirty){
        this.eventSave.formulation = this.card_form.get('formulation').value;
        this.curRec.formulation = this.card_form.get('formulation').value;
      }
      if (this.card_form.get('manufacturer').dirty){
        this.eventSave.manufacturer = this.card_form.get('manufacturer').value;
        this.curRec.manufacturer = this.card_form.get('manufacturer').value;
      }
      if (this.card_form.get('mode').dirty){
        this.eventSave.mode = this.card_form.get('mode').value;
        this.curRec.mode = this.card_form.get('mode').value;
      }
      if (this.card_form.get('type').dirty){
        this.eventSave.type = this.card_form.get('type').value;
        this.curRec.type = this.card_form.get('type').value;
      }
      if (this.card_form.get('purchasedate').dirty){
        this.eventSave.purchasedate = this.card_form.get('purchasedate').value;
        this.curRec.purchasedate = this.card_form.get('purchasedate').value;
      }
      if (this.card_form.get('expiration').dirty){
        this.eventSave.expiration = this.card_form.get('expiration').value;
        this.curRec.expiration = this.card_form.get('expiration').value;
      }
      if (this.card_form.get('startinginventory').dirty){
        this.eventSave.startinginventory = this.card_form.get('startinginventory').value;
        this.curRec.startinginventory = this.card_form.get('startinginventory').value;
      }
      if (this.card_form.get('inventory').dirty){
        this.eventSave.inventory = this.card_form.get('inventory').value;
        this.curRec.inventory = this.card_form.get('inventory').value;
      }
      if (this.card_form.get('inventoryunit').dirty){
        this.eventSave.inventoryunit = this.card_form.get('inventoryunit').value;
        this.curRec.inventoryunit = this.card_form.get('inventoryunit').value;
      }
      if (this.card_form.get('serialnumber').dirty){
        this.eventSave.serialnumber = this.card_form.get('serialnumber').value;
        this.curRec.serialnumber = this.card_form.get('serialnumber').value;
      }
      if (this.card_form.get('cost').dirty){
        this.eventSave.cost = this.card_form.get('cost').value;
        this.curRec.cost = this.card_form.get('cost').value;
      }
      if (this.card_form.get('specialinstruction').dirty){
        this.eventSave.specialinstruction = this.card_form.get('specialinstruction').value;
        this.curRec.specialinstruction = this.card_form.get('specialinstruction').value;
      }
      if (this.card_form.get('drugid').dirty){
        this.eventSave.drugid = this.card_form.get('drugid').value;
        this.curRec.drugid = this.card_form.get('drugid').value;
      }
      if (this.card_form.get('confirmed').dirty){
        this.eventSave.confirmed = this.card_form.get('confirmed').value;
        this.curRec.confirmed = this.card_form.get('confirmed').value;
      }

      if (!this.basicModeHasTR && this.card_form.get('mode').value == 'basic') {
        if (this.card_form.get('medicaleventid').value !== undefined && this.card_form.get('medicaleventid').value !== null && this.card_form.get('medicaleventid').value > 0) {
          tr.medicaleventid = this.card_form.get('medicaleventid').value;
          blnAddTR = true;
        }
        if (this.card_form.get('symptomid').value !== undefined && this.card_form.get('symptomid').value !== null && this.card_form.get('symptomid').value > 0) {
          tr.symptomid = this.card_form.get('symptomid').value;
          blnAddTR = true;
        }
        if (this.card_form.get('startdate').value !== undefined && this.card_form.get('startdate').value !== null) {
          tr.startdate = this.card_form.get('startdate').value;
          blnAddTR = true;
        }
        if (this.card_form.get('enddate').value !== undefined && this.card_form.get('enddate').value !== null) {
          tr.enddate = this.card_form.get('enddate').value;
          blnAddTR = true;
          this.eventSave.completeflag = 'Y';
          this.isDone = true;
        }
        if (this.card_form.get('verbatimindication').value !== undefined && this.card_form.get('verbatimindication').value !== null) {
          tr.verbatimindication = this.card_form.get('verbatimindication').value;
          blnAddTR = true;
        }

        if (blnAddTR) {
          if (this.fromEvent !== undefined && this.fromEvent.profileid !== undefined) {
            tr.profileid = this.fromEvent.profileid;
          } else {
            tr.profileid = this.RestService.currentProfile;
          }
          this.eventSave.treatmentresults = new TreatmentResults();
          this.eventSave.treatmentresults.items = [];
          this.eventSave.treatmentresults.items.push(tr);
        }
      } else if (this.card_form.get('mode').value == 'basic' && this.curRec.treatmentresults !== undefined && this.curRec.treatmentresults.items.length == 1) {
        if (this.card_form.get('startdate').dirty) {
          tr.startdate = this.card_form.get('startdate').value;
          blnAddTR = true;
        }
        if (this.card_form.get('enddate').dirty) {
          tr.enddate = this.card_form.get('enddate').value;
          blnAddTR = true;
          this.eventSave.completeflag = 'Y';
          this.isDone = true;
        }
        if (blnAddTR) {
          if (this.curRec.treatmentresults.items[0].recordid !== undefined) {
            tr.recordid = this.curRec.treatmentresults.items[0].recordid;
          } else if (this.curRec.treatmentresults.items[0].treatmentid !== undefined) {
            tr.recordid = this.curRec.treatmentresults.items[0].treatmentid;
          }
          this.eventSave.treatmentresults = new TreatmentResults();
          this.eventSave.treatmentresults.items = [];
          this.eventSave.treatmentresults.items.push(tr);
        }
      }
    } else {
      this.eventSave.profileid = this.RestService.currentProfile;
      this.eventSave.accountid = this.RestService.Profiles[0].accountid;
      this.eventSave.userid = this.RestService.userId;
      this.eventSave.active = 'Y';
      this.eventSave.medicationname = this.medication.value;
      this.eventSave.mode = this.card_form.get('mode').value;

      if (this.card_form.get('formulation').dirty){
        this.eventSave.formulation = this.card_form.get('formulation').value;
      }
      if (this.card_form.get('manufacturer').dirty){
        this.eventSave.manufacturer = this.card_form.get('manufacturer').value;
      }
      if (this.card_form.get('type').dirty){
        this.eventSave.type = this.card_form.get('type').value;
      }
      if (this.card_form.get('purchasedate').dirty){
        this.eventSave.purchasedate = this.card_form.get('purchasedate').value;
      }
      if (this.card_form.get('expiration').dirty){
        this.eventSave.expiration = this.card_form.get('expiration').value;
      }
      if (this.card_form.get('startinginventory').dirty){
        this.eventSave.startinginventory = this.card_form.get('startinginventory').value;
      }
      if (this.card_form.get('inventory').dirty){
        this.eventSave.inventory = this.card_form.get('inventory').value;
      }
      if (this.card_form.get('inventoryunit').dirty){
        this.eventSave.inventoryunit = this.card_form.get('inventoryunit').value;
      }
      if (this.card_form.get('serialnumber').dirty){
        this.eventSave.serialnumber = this.card_form.get('serialnumber').value;
      }
      if (this.card_form.get('cost').dirty){
        this.eventSave.cost = this.card_form.get('cost').value;
      }
      if (this.card_form.get('specialinstruction').dirty){
        this.eventSave.specialinstruction = this.card_form.get('specialinstruction').value;
      }
      if (this.card_form.get('drugid').dirty){
        this.eventSave.drugid = this.card_form.get('drugid').value;
      }
      if (this.card_form.get('confirmed').dirty){
        this.eventSave.confirmed = this.card_form.get('confirmed').value;
      }

      if (!this.basicModeHasTR && this.card_form.get('mode').value == 'basic') {
        if (this.card_form.get('medicaleventid').value !== undefined && this.card_form.get('medicaleventid').value !== null && this.card_form.get('medicaleventid').value > 0) {
          tr.medicaleventid = this.card_form.get('medicaleventid').value;
          blnAddTR = true;
        }
        if (this.card_form.get('symptomid').value !== undefined && this.card_form.get('symptomid').value !== null && this.card_form.get('symptomid').value > 0) {
          tr.symptomid = this.card_form.get('symptomid').value;
          blnAddTR = true;
        }
        if (this.card_form.get('startdate').value !== undefined && this.card_form.get('startdate').value !== null) {
          tr.startdate = this.card_form.get('startdate').value;
          blnAddTR = true;
        }
        if (this.card_form.get('enddate').value !== undefined && this.card_form.get('enddate').value !== null) {
          tr.enddate = this.card_form.get('enddate').value;
          blnAddTR = true;
          this.eventSave.completeflag = 'Y';
          this.isDone = true;
        }
        if (this.card_form.get('verbatimindication').value !== undefined && this.card_form.get('verbatimindication').value !== null) {
          tr.verbatimindication = this.card_form.get('verbatimindication').value;
          blnAddTR = true;
        }

        if (blnAddTR) {
          if (this.fromEvent !== undefined && this.fromEvent.profileid !== undefined) {
            tr.profileid = this.fromEvent.profileid;
          } else {
            tr.profileid = this.RestService.currentProfile;
          }
          this.eventSave.treatmentresults = new TreatmentResults();
          this.eventSave.treatmentresults.items = [];
          this.eventSave.treatmentresults.items.push(tr);
        }
      } else if (this.card_form.get('mode').value == 'basic' && this.curRec.treatmentresults !== undefined && this.curRec.treatmentresults.items.length == 1) {
        if (this.card_form.get('startdate').dirty) {
          tr.startdate = this.card_form.get('startdate').value;
          blnAddTR = true;
        }
        if (this.card_form.get('enddate').dirty) {
          tr.enddate = this.card_form.get('enddate').value;
          blnAddTR = true;
          this.eventSave.completeflag = 'Y';
          this.isDone = true;
        }
        if (blnAddTR) {
          //console.log('Check treatment results save: ', this.curRec.treatmentresults);
          if (this.curRec.treatmentresults.items[0].recordid !== undefined) {
            tr.recordid = this.curRec.treatmentresults.items[0].recordid;
          } else if (this.curRec.treatmentresults.items[0].treatmentid !== undefined) {
            tr.recordid = this.curRec.treatmentresults.items[0].treatmentid;
          }
          this.eventSave.treatmentresults = new TreatmentResults();
          this.eventSave.treatmentresults.items = [];
          this.eventSave.treatmentresults.items.push(tr);
        }
      }
      //MM 3-10-19 - Setting curRec to eventSave which sets the medication object to the object which is being saved to DB
      //this.curRec = this.eventSave;
    }
      var restURL="https://ap6oiuyew6.execute-api.us-east-1.amazonaws.com/dev/MedicationByProfile";
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
        console.log('Happy Path: ' + self.RestService.results);
        //self.card_form.markAsPristine();
        self.loading.dismiss();
        callback(null, result.data);
      }).catch( function(result){
        console.log('Error from formMedication.save: ',result);
        self.loading.dismiss();
        callback(result, null);
      });
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
    var tr: TreatmentResult = new TreatmentResult();
    var blnAddTR: boolean = false;

    this.saving = true;
    if (this.card_form.get('recordid').value !==undefined && this.card_form.get('recordid').value !==null) {
      this.eventSave.recordid = this.card_form.get('recordid').value;
      this.eventSave.accountid = this.RestService.Profiles[0].accountid;
      this.eventSave.profileid = this.RestService.currentProfile;
      this.eventSave.userid = this.RestService.userId;
      this.eventSave.active = 'Y';
      if (this.medication.dirty){
        this.eventSave.medicationname = this.medication.value;
      }
      if (this.card_form.get('formulation').dirty){
        this.eventSave.formulation = this.card_form.get('formulation').value;
      }
      if (this.card_form.get('manufacturer').dirty){
        this.eventSave.manufacturer = this.card_form.get('manufacturer').value;
      }
      if (this.card_form.get('mode').dirty){
        this.eventSave.mode = this.card_form.get('mode').value;
      }
      if (this.card_form.get('type').dirty){
        this.eventSave.type = this.card_form.get('type').value;
      }
      if (this.card_form.get('purchasedate').dirty){
        this.eventSave.purchasedate = this.card_form.get('purchasedate').value;
      }
      if (this.card_form.get('expiration').dirty){
        this.eventSave.expiration = this.card_form.get('expiration').value;
      }
      if (this.card_form.get('startinginventory').dirty){
        this.eventSave.startinginventory = this.card_form.get('startinginventory').value;
      }
      if (this.card_form.get('inventory').dirty){
        this.eventSave.inventory = this.card_form.get('inventory').value;
      }
      if (this.card_form.get('inventoryunit').dirty){
        this.eventSave.inventoryunit = this.card_form.get('inventoryunit').value;
      }
      if (this.card_form.get('serialnumber').dirty){
        this.eventSave.serialnumber = this.card_form.get('serialnumber').value;
      }
      if (this.card_form.get('cost').dirty){
        this.eventSave.cost = this.card_form.get('cost').value;
      }
      if (this.card_form.get('specialinstruction').dirty){
        this.eventSave.specialinstruction = this.card_form.get('specialinstruction').value;
      }
      if (this.card_form.get('confirmed').dirty){
        this.eventSave.confirmed = this.card_form.get('confirmed').value;
      }

      if (!this.basicModeHasTR && this.card_form.get('mode').value == 'basic') {
        if (this.card_form.get('medicaleventid').value !== undefined && this.card_form.get('medicaleventid').value !== null && this.card_form.get('medicaleventid').value > 0) {
          tr.medicaleventid = this.card_form.get('medicaleventid').value;
          blnAddTR = true;
        }
        if (this.card_form.get('symptomid').value !== undefined && this.card_form.get('symptomid').value !== null && this.card_form.get('symptomid').value > 0) {
          tr.symptomid = this.card_form.get('symptomid').value;
          blnAddTR = true;
        }
        if (this.card_form.get('startdate').value !== undefined && this.card_form.get('startdate').value !== null) {
          tr.startdate = this.card_form.get('startdate').value;
          blnAddTR = true;
        }
        if (this.card_form.get('enddate').value !== undefined && this.card_form.get('enddate').value !== null) {
          tr.enddate = this.card_form.get('enddate').value;
          this.eventSave.completeflag = 'Y';
          this.isDone = true;
          blnAddTR = true;
        }
        if (this.card_form.get('verbatimindication').value !== undefined && this.card_form.get('verbatimindication').value !== null) {
          tr.verbatimindication = this.card_form.get('verbatimindication').value;
          blnAddTR = true;
        }

        if (blnAddTR) {
          if (this.fromEvent !== undefined && this.fromEvent.profileid !== undefined) {
            tr.profileid = this.fromEvent.profileid;
          } else {
            tr.profileid = this.RestService.currentProfile;
          }
          //console.log('Check treatment results save2: ', this.curRec.treatmentresults);
          this.eventSave.treatmentresults = new TreatmentResults();
          this.eventSave.treatmentresults.items = [];
          this.eventSave.treatmentresults.items.push(tr);
        }
      } else if (this.card_form.get('mode').value == 'basic' && this.curRec.treatmentresults !== undefined && this.curRec.treatmentresults.items.length == 1) {
        if (this.card_form.get('startdate').dirty) {
          tr.startdate = this.card_form.get('startdate').value;
          blnAddTR = true;
        }
        if (this.card_form.get('enddate').dirty) {
          tr.enddate = this.card_form.get('enddate').value;
          blnAddTR = true;
          this.eventSave.completeflag = 'Y';
          this.isDone = true;
        }
        if (blnAddTR) {
          //console.log('Check treatment results save4: ', this.curRec.treatmentresults);
          if (this.curRec.treatmentresults.items[0].recordid !== undefined) {
            tr.recordid = this.curRec.treatmentresults.items[0].recordid;
          } else if (this.curRec.treatmentresults.items[0].treatmentid !== undefined) {
            tr.recordid = this.curRec.treatmentresults.items[0].treatmentid;
          }
          this.eventSave.treatmentresults = new TreatmentResults();
          this.eventSave.treatmentresults.items = [];
          this.eventSave.treatmentresults.items.push(tr);
        }
      }
    } else {
      this.eventSave.profileid = this.RestService.currentProfile;
      this.eventSave.accountid = this.RestService.Profiles[0].accountid;
      this.eventSave.userid = this.RestService.userId;
      this.eventSave.active = 'Y';
      this.eventSave.medicationname = this.medication.value;
      this.eventSave.mode = this.card_form.get('mode').value;

      if (this.card_form.get('formulation').dirty){
        this.eventSave.formulation = this.card_form.get('formulation').value;
      }
      if (this.card_form.get('manufacturer').dirty){
        this.eventSave.manufacturer = this.card_form.get('manufacturer').value;
      }
      if (this.card_form.get('type').dirty){
        this.eventSave.type = this.card_form.get('type').value;
      }
      if (this.card_form.get('purchasedate').dirty){
        this.eventSave.purchasedate = this.card_form.get('purchasedate').value;
      }
      if (this.card_form.get('expiration').dirty){
        this.eventSave.expiration = this.card_form.get('expiration').value;
      }
      if (this.card_form.get('startinginventory').dirty){
        this.eventSave.startinginventory = this.card_form.get('startinginventory').value;
      }
      if (this.card_form.get('inventory').dirty){
        this.eventSave.inventory = this.card_form.get('inventory').value;
      }
      if (this.card_form.get('inventoryunit').dirty){
        this.eventSave.inventoryunit = this.card_form.get('inventoryunit').value;
      }
      if (this.card_form.get('serialnumber').dirty){
        this.eventSave.serialnumber = this.card_form.get('serialnumber').value;
      }
      if (this.card_form.get('cost').dirty){
        this.eventSave.cost = this.card_form.get('cost').value;
      }
      if (this.card_form.get('specialinstruction').dirty){
        this.eventSave.specialinstruction = this.card_form.get('specialinstruction').value;
      }
      if (this.card_form.get('confirmed').dirty){
        this.eventSave.confirmed = this.card_form.get('confirmed').value;
      }

      if (!this.basicModeHasTR && this.card_form.get('mode').value == 'basic') {
        if (this.card_form.get('medicaleventid').value !== undefined && this.card_form.get('medicaleventid').value !== null && this.card_form.get('medicaleventid').value > 0) {
          tr.medicaleventid = this.card_form.get('medicaleventid').value;
          blnAddTR = true;
        }
        if (this.card_form.get('symptomid').value !== undefined && this.card_form.get('symptomid').value !== undefined && this.card_form.get('symptomid').value > 0) {
          tr.symptomid = this.card_form.get('symptomid').value;
          blnAddTR = true;
        }
        if (this.card_form.get('startdate').value !== undefined && this.card_form.get('startdate').value !== null) {
          tr.startdate = this.card_form.get('startdate').value;
          blnAddTR = true;
        }
        if (this.card_form.get('enddate').value !== undefined && this.card_form.get('enddate').value !== null) {
          tr.enddate = this.card_form.get('enddate').value;
          this.eventSave.completeflag = 'Y';
          this.isDone = true;
          blnAddTR = true;
        }
        if (this.card_form.get('verbatimindication').value !== undefined && this.card_form.get('verbatimindication').value !== null) {
          tr.verbatimindication = this.card_form.get('verbatimindication').value;
          blnAddTR = true;
        }

        if (blnAddTR) {
         // console.log('Check treatment results save3: ', this.curRec.treatmentresults);
         if (this.fromEvent !== undefined && this.fromEvent.profileid !== undefined) {
            tr.profileid = this.fromEvent.profileid;
          } else {
            tr.profileid = this.RestService.currentProfile;
          }
          this.eventSave.treatmentresults = new TreatmentResults();
          this.eventSave.treatmentresults.items = [];
          this.eventSave.treatmentresults.items.push(tr);
        }
      } else if (this.card_form.get('mode').value == 'basic' && this.curRec.treatmentresults !== undefined && this.curRec.treatmentresults.items.length == 1) {
        if (this.card_form.get('startdate').dirty) {
          tr.startdate = this.card_form.get('startdate').value;
          blnAddTR = true;
        }
        if (this.card_form.get('enddate').dirty) {
          tr.enddate = this.card_form.get('enddate').value;
          blnAddTR = true;
          this.eventSave.completeflag = 'Y';
          this.isDone = true;
        }
        if (blnAddTR) {
          //console.log('Check treatment results save3: ', this.curRec.treatmentresults);
          if (this.curRec.treatmentresults.items[0].recordid !== undefined) {
            tr.recordid = this.curRec.treatmentresults.items[0].recordid;
          } else if (this.curRec.treatmentresults.items[0].treatmentid !== undefined) {
            tr.recordid = this.curRec.treatmentresults.items[0].treatmentid;
          }
          this.eventSave.treatmentresults = new TreatmentResults();
          this.eventSave.treatmentresults.items = [];
          this.eventSave.treatmentresults.items.push(tr);
        }
      }
    }
      var restURL="https://ap6oiuyew6.execute-api.us-east-1.amazonaws.com/dev/MedicationByProfile";
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
        console.log('Happy Path: ' + self.RestService.results);
        self.category.title = "Medication";
        self.loading.dismiss();
        self.nav.pop();
      }).catch( function(result){
        console.log('Error from formMedication.save: ',result);
        self.loading.dismiss();
        alert('There was an error saving this data.  Please try again later');
      });
  }

  public today() {
    //Used as max day in date of measure control
    /*
    var momentNow;

    if (this.userTimezone !== undefined && this.userTimezone !== null && this.userTimezone !== "") {
      momentNow = this.momentNow.tz(this.userTimezone).format('YYYY-MM-DD');
    } else {
      momentNow = this.momentNow.format('YYYY-MM-DD');
    }
    //console.log('From Today momentNow: ' + momentNow);
    return momentNow;
*/
  return moment().format('YYYY-MM-DD');;
  }

  public todayNow() {
    //Used as max day in date of measure control
    var momentNow;

    if (this.userTimezone !== undefined && this.userTimezone !== null && this.userTimezone !== "") {
      momentNow = this.momentNow.tz(this.userTimezone).format('YYYY-MM-DDTHH:mm');
    } else {
      momentNow = this.momentNow.format('YYYY-MM-DDTHH:mm');
    }
    console.log('From Today momentNow: ' + momentNow);
    return momentNow;
  }

  formatDate(dateString) {
    if (this.userTimezone !== undefined && this.userTimezone !== null && this.userTimezone !=="") {
      return moment(dateString).tz(this.userTimezone).format('MMM DD YYYY');
    } else {
      return moment(dateString).format('MMM DD YYYY');
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
                if (self.newRec) {
                  var medicationname = self.eventTerm;
                  //MM 3-10-19 Set curRec for loading in next form
                  self.curRec = {recordid: results, medicationname: medicationname};
                  //MM 3-10-19 Sets loadFromId to reload data when coming back
                  self.loadFromId = results;
                  console.log('new Medication record: ', self.curRec);
                }
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
                self.comingBack = true;
                if (self.newRec) {
                  self.curRec = self.eventSave;
                  self.curRec.recordid = results;
                  self.loadFromId = results;
                  self.card_form.get('recordid').setValue(results);
                  console.log('new Medication record: ', self.curRec);
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
      this.loadFromId = this.curRec.recordid;
      this.comingBack = true;
      callback(null, true);
    }
  }

  noMedication() {
    if ((this.medication.value == null || this.medication.value == "") ||
    (this.card_form.get('inventory').value !== undefined && this.card_form.get('inventory').value !== null && this.card_form.get('inventory').value == 0)) {
      return true;
    } else {
      return false;
    }
  }

  isActiveDoseTrackedMed(index) {
    var treatments = this.card_form.get('treatmentresults') as FormArray;
    var doseType = treatments.at(index).get('dosetrackingtype').value;
    var dtState = treatments.at(index).get('dosetrackingstate').value;

    var blnReturn = false;

    if (doseType !== undefined && doseType !== null && doseType == 'active') {
      blnReturn = true;
    }

    if (dtState !== undefined && dtState !== null && dtState == 'complete' && blnReturn == true) {
      blnReturn = false;
    }

    return blnReturn;
  }

  addDose(index) {
    var treatments = this.card_form.get('treatmentresults') as FormArray;
    var objIncluded;
    var treatment;

    if (treatments.at(index).get('symptomid').value !== undefined && treatments.at(index).get('symptomid').value !== null &&
    treatments.at(index).get('symptomid').value > 0) {
      objIncluded = 'treatment symptom';
      treatment = {treatmentid: treatments.at(index).get('recordid').value,
                        profileid: treatments.at(index).get('profileid').value,
                        conditionid: treatments.at(index).get('symptomid').value,
                        indication: treatments.at(index).get('verbatimindication').value,
                        medicationid: treatments.at(index).get('reftablefieldid').value,
                        namevalue: treatments.at(index).get('namevalue').value,
                        dosage: treatments.at(index).get('dosage').value,
                        doseunits: treatments.at(index).get('doseunits').value,
                    };

    } else {
      objIncluded = 'treatment event';
      treatment = {treatmentid: treatments.at(index).get('recordid').value,
                        profileid: treatments.at(index).get('profileid').value,
                        conditionid: treatments.at(index).get('medicaleventid').value,
                        indication: treatments.at(index).get('verbatimindication').value,
                        medicationid: treatments.at(index).get('reftablefieldid').value,
                        namevalue: treatments.at(index).get('namevalue').value,
                        dosage: treatments.at(index).get('dosage').value,
                        doseunits: treatments.at(index).get('doseunits').value,
                    };
    }
    //var doseType = treatments.at(index).get('dosetrackingtype').value;
    //console.log('Add Dose index ' + index + ', doseType: ' + doseType);

    let profileModal = this.modalCtrl.create(FormMedAddDose, { objIncluded: objIncluded, fromTreatment: treatment });
    profileModal.onDidDismiss(data => {
      console.log('Data from getDefaultUser: ', data);
      if (data !== undefined) {
        //console.log('Data from getDefaultUser: ', data);
        if (data.userUpdated) {

        }
      }
    });
    profileModal.present();

  }

setFilteredItems() {
  this.items = this.filterItems(this.eventTerm);
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

hasFocus() {
  this.eventHasFocus = true;
}

loseFocus() {
  this.eventHasFocus = false;
}

showList() {
  if (this.eventTerm == undefined) {
    this.eventTerm = "";
  }
  //console.log('Event Term Length: ' + this.eventTerm.length + ', term: ', this.eventTerm);
  if (this.eventTerm.length > 1) {
    return true;
  } else {
    return false;
  }
}

attachRecord () {
  alert('Coming soon.  This button will allow you to attach pictures and documents (e.g. PDFs) of physical medical records');
}

searchListTerm(strValue) {
  console.log('SearchListTerm called');
  this.medication.setValue(strValue);
}

presentHelp(myEvent) {
  var title = 'Drug Mode';
  var helptext = "<b>Basic:</b> Pertains to a single indication and includes only start and stop dates.  Great for maintenance and historical medications.<br><br>" +
  "<b>Medicine Cabinet:</b> Your vitual medicine cabinet.  You can set up dose schedules, manage inventory, and use across family members.  Great for multi-use, OTC drugs as well as targeted temporary treatments with set schedules (e.g. antibiotics)";

  let popover = this.popoverCtrl.create(MenuHelp, {title: title, helptext: helptext});
  popover.onDidDismiss(data => {
    console.log('From popover onDismiss: ', data);
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

callContact(){
/*
  var phoneNum = this.curRec.phone;
  this.callNumber.callNumber(phoneNum, true)
    .then(() => alert('Launched dialer!'))
    .catch(() => alert('This capability is only availabe through call-capable devices.  Please manually call: ' + phoneNum + ' to order.'));
*/
  alert('Coming soon.  This button will allow you to call the medical information center for this drug');
}

openWebsite(){
    alert('Coming soon.  This button will open the website for this drug');
  }

doseNotComplete() {
  if (this.card_form.get('dosage').value !== null && this.card_form.get('dosefrequency').value !== null) {
    return false;
  } else {
    return true;
  }
}

openSchedule () {
  var self = this;

  this.checkSave = true;
  this.confirmSaveDirect(function(err, result) {
    if (err) {
      console.log('Error in openSchedule.confirmSaveDirect' + err);
      alert('There is an error in saving the medication record from openSchedule');
    } else {
      if (result) {
        self.nav.push(FormMedSchedule, {visit: self.curRec});
      } else if (!result) {
        console.log('openSchedule.ConfirmSaveDirect - User cancelled');
      }
    }
  });
}

checkBasicValid() {
  //MM 11-15-19 This function checks if the data needed to save a record in Basic mode is met (similar to the Valid form).
  //Cannot use the Valid form method because of the differing requirements between basic and cabinet modes
  //This flag will stop an initial basic record save without having a start date and indication entered
  var invalidCount = 0;

  if (this.mode == 'basic') {
    console.log('checkBaicValid - medeventid: ' + this.card_form.get('medicaleventid').value);
    console.log('checkBaicValid - verbatimindication: ' + this.card_form.get('verbatimindication').value);
    console.log('checkBaicValid - symptomid: ' + this.card_form.get('symptomid').value);
    console.log('checkBaicValid - startdate: ' + this.card_form.get('startdate').value);
    if (this.card_form.get('medicaleventid').value == null && this.card_form.get('verbatimindication').value == null &&
     this.card_form.get('symptomid').value == null) {
      invalidCount = invalidCount + 1;
    }
    if (this.card_form.get('startdate').value == null) {
      invalidCount = invalidCount + 1;
    }
    if (invalidCount > 0) {
      this.isBasicInvalid2Save = true;
    } else {
      this.isBasicInvalid2Save = false;
    }
  }
}

setMode (mode) {
  this.mode = mode;
  this.checkBasicValid();
  //console.log("from setMode: " + mode);
}



addNewTreatmentResults() {
  var cat;
  var self = this;
  var isBasic = false;

  this.checkSave = true;
//  this.RestService.results = this.curRec.treatmentresults.items;
  cat = {title: 'Medication Info & Results'};

  this.confirmSaveDirect(function(err, result) {
    if (err) {
      console.log('Error in addNewTreatmentResults.confirmSaveDirect' + err);
      alert('There is an error in saving the medication record from addNewTreatmentResults.');
    } else {
      if (result) {
        console.log("Add New Treatment Results CurRec ", self.curRec);
        console.log("Add New Treatment Results fromEvent ", self.fromEvent);

        if (self.loadFromId == undefined || self.loadFromId == null) {
          if (self.curRec !== undefined && self.curRec !== null && self.curRec.recordid !== undefined) {
            self.loadFromId = self.curRec.recordid;
          }
        }

        if (self.mode == 'basic') {
          if (self.curRec.treatmentresults.items.length == 1) {
            console.log('add New Treatment - setting basic');
            self.RestService.results = self.curRec.treatmentresults.items;
            isBasic = true;
          }
        }

        if (isBasic) {
          if (self.fromEvent !== undefined && self.fromEvent.medicaleventid !== undefined && self.fromEvent.medicaleventid > 0) {
            self.nav.push(FormMedicationResults, {recId: 0, medication: self.curRec, category: cat, fromEvent: self.fromEvent});
          } else if (self.fromSymptom !== undefined && self.fromSymptom.symptomid !== undefined && self.fromSymptom.symptomid > 0) {
            self.nav.push(FormMedicationResults, {recId: 0, medication: self.curRec, category: cat, fromSymptom: self.fromSymptom});
          } else {
            self.nav.push(FormMedicationResults, {recId: 0, medication: self.curRec, category: cat});
          }
        } else {
          if (self.fromEvent !== undefined && self.fromEvent.medicaleventid !== undefined && self.fromEvent.medicaleventid > 0) {
            self.nav.push(FormMedicationResults, {medication: self.curRec, category: cat, fromEvent: self.fromEvent});
          } else if (self.fromSymptom !== undefined && self.fromSymptom.symptomid !== undefined && self.fromSymptom.symptomid > 0) {
            self.nav.push(FormMedicationResults, {medication: self.curRec, category: cat, fromSymptom: self.fromSymptom});
          } else {
            self.nav.push(FormMedicationResults, {medication: self.curRec, category: cat, eventList: self.eventList});
          }
        }

      } else if (!result) {
        console.log('addNewTreatmentResults.ConfirmSaveDirect - User cancelled');
      }
    }
  });

}

viewAllTreatmentResults() {
  var cat;
  var self = this;

  this.checkSave = true;
  this.confirmSaveDirect(function(err, result) {
    if (err) {
      console.log('Error in updateTreatmentResults.confirmSaveDirect' + err);
      alert('There is an error in saving the medication record from updateTreatmentResults.');
    } else {
      if (result) {
        cat = {title: 'Results for ' + self.curRec.medicationname};
        self.nav.push(ListMedicationResults, {loadFromId: self.curRec.recordid, medication: self.curRec, category: cat});
      } else if (!result) {
        console.log('updateTreatmentResults.ConfirmSaveDirect - User cancelled');
      }
    }
  });
}

updateTreatmentResults(index) {
  var cat;
  var self = this;

  this.checkSave = true;
  this.confirmSaveDirect(function(err, result) {
    if (err) {
      console.log('Error in updateTreatmentResults.confirmSaveDirect' + err);
      alert('There is an error in saving the medication record from updateTreatmentResults.');
    } else {
      if (result) {
        self.RestService.results = self.curRec.treatmentresults.items;
        cat = {title: 'Medication Info & Results'};
        self.nav.push(FormMedicationResults, {recId: index, medication: self.curRec, category: cat});
      } else if (!result) {
        console.log('updateTreatmentResults.ConfirmSaveDirect - User cancelled');
      }
    }
  });
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
  this.checkBasicValid();
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
    }, 20000);
  }

}
