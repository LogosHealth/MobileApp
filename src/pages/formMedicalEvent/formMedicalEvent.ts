import { Component } from '@angular/core';
import { NavController, NavParams, AlertController, ModalController, LoadingController, PopoverController } from 'ionic-angular';
import { Validators, FormGroup, FormControl, FormBuilder, FormArray } from '@angular/forms';
import { RestService } from '../../app/services/restService.service';
import { MedicalEventModel, MedicalEvent, Symptom, Symptoms } from '../../pages/listMedicalEvent/listMedicalEvent.model';
import { HistoryItemModel } from '../../pages/history/history.model';
import { DictionaryModel } from '../../pages/models/dictionary.model';
import { ListOrderService } from '../../pages/listOrder/listOrder.service';
import { MenuTreatment } from '../../pages/menuTreatment/menuTreatment';
import { MenuDynamic } from '../../pages/menuDynamic/menuDynamic';
import { FeedModel } from '../feed/feed.model';
import { FormMedication } from '../../pages/formMedication/formMedication';
import { FormSymptomPage } from '../../pages/formSymptom/formSymptom';
import { ListMedicationPage } from '../../pages/listMedication/listMedication';
import { ListTreatmentPage } from '../../pages/listTreatment/listTreatment';
import { ListMedicalEvent } from '../../pages/listMedicalEvent/listMedicalEvent';
import { FormVisitPage } from '../../pages/formVisit/formVisit';
import { FormProcedure } from '../../pages/formProcedure/formProcedure';
import { FormTherapy } from '../formTherapy/formTherapy';
import { ListContactPage } from '../../pages/listContacts/listContacts';
import { FormContactPage } from '../../pages/formContact/formContact';

import 'rxjs/add/operator/debounceTime';
import 'rxjs/Rx';

var moment = require('moment-timezone');

@Component({
  selector: 'formVisit1-page',
  templateUrl: 'formMedicalEvent.html'
})
export class FormMedicalEvent {
  loading: any;
  section: string;
  formName: string = "formMedicalEvent";
  recId: number;
  card_form: FormGroup;
  goal_array: FormArray;
  goal_schedule: FormGroup;
  curRec: any;
  newRec: boolean = false;
  saving: boolean = false;
  checkSave: boolean = false;
  showTips: boolean = true;
  eventModelSave: MedicalEventModel  = new MedicalEventModel();
  eventSave: MedicalEvent = new MedicalEvent();
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
  visitInfo: any;
  symptomsNotChosen: any;
  visitid: any = null;
  newFromVisit: boolean = false;
  hasVisit: boolean = false;
  fromVisit: boolean = false;
  aboutProfile: any = null;
  alreadyAddedAdd: boolean = false;
  fromEvent: any;
  fromTreatment: any;
  loadFromId: number;
  relatedEvent: any;
  hasRelated: boolean = false;
  ismedicallyconfirmed: boolean  = false;
  hasPhysician: boolean = false;
  medicalevent: FormControl = new FormControl();
  listFilter: DictionaryModel = new DictionaryModel();
  bodyAreaList = [];
  hasBodyArea: boolean = false;
  symptoms: FormArray;
  treatments: FormArray;
  comingBack: boolean = false;

  iiBlankAdded: boolean = false;
  eventTerm: string = '';
  items: any;

  constructor(public nav: NavController, public alertCtrl: AlertController, public RestService:RestService,
    public navParams: NavParams, public loadingCtrl: LoadingController, public list2Service: ListOrderService,
    public formBuilder: FormBuilder, public popoverCtrl:PopoverController, public modalCtrl: ModalController,
    ) {

    this.recId = navParams.get('recId');
    this.symptomsNotChosen = navParams.get('symptomsNotChosen');
    this.fromTreatment = navParams.get('fromTreatment');
    this.visitInfo =  navParams.get('visit');

    console.log('symptomsNotChosen from formMedicalEvent: ', this.symptomsNotChosen);
    console.log('recId from formMedicalEvent: ' + this.recId);
    //this.visitInfo = navParams.get('visit');
    if (this.visitInfo !== undefined && this.visitInfo.recordid !== undefined) {
      this.fromVisit = true;
      console.log('visitInfo for existing event: ', this.visitInfo);
    } else {
      console.log('No visitInfo');
    }
    if (this.recId == undefined && (this.visitInfo !== undefined && this.visitInfo.recordid !== undefined)) {
      this.newFromVisit = true;
      this.hasVisit = true;
      this.visitid = this.visitInfo.recordid;
      this.aboutProfile = this.visitInfo.profileid;
      console.log('visitInfo for new event: ', this.visitInfo);
      //console.log('NewFromVisit is true');
    } else if (this.recId !== undefined && this.recId !== null) {
      this.curRec = this.RestService.results[this.recId];
      if (this.curRec.visitid !== undefined && this.curRec.visitid !== null && this.curRec.visitid > 0) {
        this.hasVisit = true;
      }
      console.log('CurRec from formMedicalEvent: ', this.curRec);
    } else {
      console.log('No visit info or recId for medical condition!  Must be new record from list view.');
    }

    this.feed.category = navParams.get('category');
    this.loadFromId = navParams.get('loadFromId');
    console.log('FormMedEvent hasVisit: ' + this.hasVisit);

    if (this.feed.category == undefined || this.feed.category == null) {
      this.feed.category = {title: 'Medical Condition'};
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
    //console.log('Init Medical Event - recId = ' + this.recId);
    if (this.recId !== undefined) {
      console.log('RecId should populate form: ' + this.curRec.onsetdate);
      var ischronic = false;
      var isallergy = false;
      if (this.curRec.chronicflag !== undefined && this.curRec.chronicflag == 'Y') {
        ischronic = true;
      } else {
        console.log('Not chronic: chronicflag = ' + this.curRec.chronicflag);
      }
      if (this.curRec.isallergy !== undefined && this.curRec.isallergy == 'Y') {
        isallergy = true;
      }
      if (this.curRec.medicallyconfirmed !== undefined && this.curRec.medicallyconfirmed == 'Y') {
        this.ismedicallyconfirmed = true;
      }

      var visittext = "";
      if (this.curRec !== undefined && this.curRec !== null) {
        if(this.curRec.visitid !== undefined && this.curRec.visitid !== null) {
          if (this.curRec.lastname !== undefined && this.curRec.lastname !== null) {
            visittext = "Dr. " + this.curRec.lastname + ": " + this.formatDate(this.curRec.visitdate);
          } else {
            visittext = this.curRec.title + ": " + this.formatDate(this.curRec.visitdate);
          }
        }
      }
      this.fromEvent = {medicaleventid: this.curRec.recordid, medicalevent: this.curRec.medicalevent, profileid: self.curRec.profileid};
      console.log('Onset Date: ' + this.curRec.onsetdate);
      this.card_form = new FormGroup({
        recordid: new FormControl(this.curRec.recordid),
        parenteventid: new FormControl(this.curRec.parenteventid),
        parenteventname: new FormControl(this.curRec.parenteventname),
        parenteventonset: new FormControl(this.curRec.parenteventonset),
        eventcode: new FormControl(this.curRec.eventcode),
        bodyarea: new FormControl(this.curRec.bodyarea),
        bodyareatext: new FormControl(this.curRec.bodyareatext),
        //medicalevent: new FormControl(this.curRec.medicalevent, Validators.required),
        onsetdate: new FormControl(this.curRec.onsetdate, Validators.compose([Validators.max(this.timeNow), Validators.required])),
        enddate: new FormControl(this.curRec.enddate, Validators.max(this.timeNow)),
        eventdescription: new FormControl(this.curRec.eventdescription),
        dateofmeasure: new FormControl(this.curRec.dateofdiagnosis),
        visitid: new FormControl(this.curRec.visitid),
        visittext: new FormControl(visittext),
        ischronic: new FormControl(ischronic),
        isallergy: new FormControl(isallergy),
        ismedicallyconfirmed: new FormControl(this.ismedicallyconfirmed),
        physicianid: new FormControl(this.curRec.physicianid),
        physiciantitle: new FormControl(this.curRec.title),
        symptoms: this.formBuilder.array([]),
        treatments: this.formBuilder.array([]),
        confirmed: new FormControl(),
        profileid: new FormControl(this.curRec.profileid),
        userid: new FormControl()
      });
      this.medicalevent = new FormControl(this.curRec.medicalevent, Validators.required);
      this.eventTerm = this.curRec.medicalevent;
      if (this.curRec.parenteventid !== undefined && this.curRec.parenteventid > 0) {
        this.hasRelated = true;
      }
      if (this.curRec.physicianid !== undefined && this.curRec.physicianid > 0) {
        this.hasPhysician = true;
      }

      //console.log('The value for medical event is: ' + this.medicalevent.value);
    } else {
      //console.log('RecId is undefined:');
      this.newRec = true;
      this.medicalevent = new FormControl(null, Validators.required);
      this.card_form = new FormGroup({
        recordid: new FormControl(),
        parenteventid: new FormControl(),
        parenteventname: new FormControl(),
        parenteventonset: new FormControl(),
        eventcode: new FormControl(),
        //medicalevent: new FormControl(null, Validators.required),
        bodyarea: new FormControl(),
        bodyareatext: new FormControl(),
        onsetdate: new FormControl(null, Validators.compose([Validators.max(this.timeNow), Validators.required])),
        enddate: new FormControl(null, Validators.max(this.timeNow)),
        eventdescription: new FormControl(),
        dateofmeasure: new FormControl(),
        visitid: new FormControl(this.visitid),
        visittext: new FormControl(),
        ischronic: new FormControl(),
        isallergy: new FormControl(),
        ismedicallyconfirmed: new FormControl(),
        physicianid: new FormControl(),
        physiciantitle: new FormControl(),
        symptoms: this.formBuilder.array([]),
        treatments: this.formBuilder.array([]),
        confirmed: new FormControl(),
        profileid: new FormControl(),
        userid: new FormControl()
      });
    }
    this.addExistingSymptoms();
    this.addExistingTreatments();
  }

  ionViewWillEnter() {
    var dtNow = moment(new Date());
    var dtExpiration = moment(this.RestService.AuthData.expiration);
    var self = this;

    this.checkSave = false;
    this.saving = false;
    this.card_form.markAsPristine();
    this.medicalevent.markAsPristine();

    if (dtNow < dtExpiration) {
      if (!this.comingBack) {
        this.presentLoadingDefault();
        this.loadFilterList();
        this.medicalevent.valueChanges.debounceTime(700).subscribe(search => {
          this.setFilteredItems();
        });
      } else {
        console.log(this.formName + ' Coming Back 1');
        this.comingBack = false;
        this.presentLoadingDefault();
        this.loadDetails();
      }
      //this.loading.dismiss();
    } else {
      this.presentLoadingDefault();
      this.RestService.refreshCredentials(function(err, results) {
        if (err) {
          console.log('Need to login again!!! - Credentials expired from formMedicalEvent');
          self.loading.dismiss();
          self.RestService.appRestart();
        } else {
          if (!self.comingBack) {
            self.loadFilterList();
            self.medicalevent.valueChanges.debounceTime(700).subscribe(search => {
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
        //console.log('Result data from loadFilterList: ', result.data);
        //console.log('Filter items from formMedicalEvents.loadFilterList: ', self.listFilter.items);
        self.setFilteredItems();
        console.log('From loadFilterList - loadFromId: ', self.loadFromId);
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
    restURL="https://ap6oiuyew6.execute-api.us-east-1.amazonaws.com/dev/MedicalEventByProfile";
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
      self.loadFromId = null;
      if (result !== undefined && result.data !== undefined && result.data[0] !== undefined && result.data[0].recordid !==undefined) {
        self.recId = 0;
        self.curRec = result.data[0];
        self.newRec = false;
        console.log('formMedicalEvent.loadDetails: ', self.curRec);
        self.addExistingSymptoms();
        self.addExistingTreatments();
        if (self.eventTerm == '' && self.curRec !== undefined && self.curRec.medicalevent !== undefined) {
          self.loadMainRecord();
        } else {
          console.log('Missed loadMainRecord ' + self.eventTerm == '');
        }
      } else {
        console.log('No data from MedicalEvent.loadDetails');
      }
      self.loading.dismiss();
    }).catch( function(result){
      self.loadFromId = null;
      console.log('Err from formMedication.loadDetails: ', result);
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
            this.eventSave.recordid = this.card_form.get('recordid').value;
            this.eventSave.profileid = this.RestService.currentProfile;
            this.eventSave.userid = this.RestService.userId;
            this.eventSave.active = 'N';
              var restURL="https://ap6oiuyew6.execute-api.us-east-1.amazonaws.com/dev/MedicalEventByProfile";
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
                self.category.title = "Medical Condition";
                self.loading.dismiss();
                self.nav.pop();
              }).catch( function(result){
                console.log('Error from formMedicalEvent.delete: ',result);
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
    var symptom;

    if (this.card_form.get('recordid').value !==undefined && this.card_form.get('recordid').value !==null) {
      this.eventSave.recordid = this.card_form.get('recordid').value;
      this.eventSave.profileid = this.card_form.get('profileid').value;
      this.eventSave.userid = this.RestService.userId;
      this.eventSave.active = 'Y';
      if (this.medicalevent.dirty){
        this.eventSave.medicalevent = this.medicalevent.value;
      }
      if (this.card_form.get('eventcode').dirty){
        this.eventSave.eventcode = this.card_form.get('eventcode').value;
      }
      if (this.card_form.get('parenteventid').dirty){
        this.eventSave.parenteventid = this.card_form.get('parenteventid').value;
      }
      if (this.card_form.get('physicianid').dirty){
        this.eventSave.physicianid = this.card_form.get('physicianid').value;
      }
      if (this.card_form.get('onsetdate').dirty){
        this.eventSave.onsetdate = this.card_form.get('onsetdate').value;
      }
      if (this.card_form.get('enddate').dirty){
        this.eventSave.enddate = this.card_form.get('enddate').value;
      }
      if (this.card_form.get('eventdescription').dirty){
        this.eventSave.eventdescription = this.card_form.get('eventdescription').value;
      }
      if (this.card_form.get('dateofmeasure').dirty){
        this.eventSave.dateofdiagnosis = this.card_form.get('dateofmeasure').value;
      }
      /*  Should not be needed for update
      if (this.fromTreatment !== undefined && this.fromTreatment.recordid !== undefined && this.fromTreatment.recordid > 0) {
        this.eventSave.treatmentid = this.fromTreatment.recordid;
      }
      */
      if (this.card_form.get('ischronic').dirty){
        if (this.card_form.get('ischronic').value == true) {
          this.eventSave.chronicflag = 'Y';
        } else {
          this.eventSave.chronicflag = 'N';
        }
      }
      if (this.card_form.get('isallergy').dirty){
        if (this.card_form.get('isallergy').value == true) {
          this.eventSave.isallergy = 'Y';
        } else {
          this.eventSave.isallergy = 'N';
        }
      }
      if (this.card_form.get('ismedicallyconfirmed').dirty){
        if (this.card_form.get('ismedicallyconfirmed').value == true) {
          this.eventSave.medicallyconfirmed = 'Y';
        } else {
          this.eventSave.medicallyconfirmed = 'N';
        }
      }
      if (this.symptoms.dirty) {
        if (this.symptoms.length > 0) {
          console.log('Has Symptoms for event insert: ', this.symptoms);
          this.eventSave.symptoms = new Symptoms();
          this.eventSave.symptoms.items = [];
          this.eventSave.processsymptom = true;
          for (var j = 0; j < this.symptoms.length; j++) {
            symptom = new Symptom();
            symptom.recordid = this.symptoms.at(j).get("recordid").value;
            this.eventSave.symptoms.items.push(symptom);
          }
        } else {
          this.eventSave.processsymptom = true;
        }
      }
    } else {
      if (this.aboutProfile !== null) {
        this.eventSave.profileid = this.aboutProfile;
      } else {
        this.eventSave.profileid = this.RestService.currentProfile;
      }
      this.eventSave.userid = this.RestService.userId;
      this.eventSave.active = 'Y';

      if (this.visitid !== undefined && this.visitid !== null) {
        this.eventSave.visitid = this.visitid;
        this.eventSave.medicallyconfirmed = 'Y';
      }
      if (this.medicalevent.dirty){
        this.eventSave.medicalevent = this.medicalevent.value;
      }
      if (this.card_form.get('eventcode').dirty){
        this.eventSave.eventcode = this.card_form.get('eventcode').value;
      }
      if (this.card_form.get('parenteventid').dirty){
        this.eventSave.parenteventid = this.card_form.get('parenteventid').value;
      }
      if (this.card_form.get('physicianid').dirty){
        this.eventSave.physicianid = this.card_form.get('physicianid').value;
      }
      if (this.card_form.get('onsetdate').value !== null){
        this.eventSave.onsetdate = this.card_form.get('onsetdate').value;
      }
      if (this.card_form.get('enddate').dirty){
        this.eventSave.enddate = this.card_form.get('enddate').value;
      }
      if (this.card_form.get('eventdescription').dirty){
        this.eventSave.eventdescription = this.card_form.get('eventdescription').value;
      }
      if (this.card_form.get('dateofmeasure').value !== null){
        this.eventSave.dateofdiagnosis = this.card_form.get('dateofmeasure').value;
      }
      if (this.fromTreatment !== undefined && this.fromTreatment.recordid !== undefined && this.fromTreatment.recordid > 0) {
        this.eventSave.treatmentid = this.fromTreatment.recordid;
      }
      if (this.card_form.get('ischronic').dirty){
        if (this.card_form.get('ischronic').value == true) {
          this.eventSave.chronicflag = 'Y';
        } else {
          this.eventSave.chronicflag = 'N';
        }
      }
      if (this.card_form.get('isallergy').dirty){
        if (this.card_form.get('isallergy').value == true) {
          this.eventSave.isallergy = 'Y';
        } else {
          this.eventSave.isallergy = 'N';
        }
      }
      if (this.card_form.get('ismedicallyconfirmed').dirty){
        if (this.card_form.get('ismedicallyconfirmed').value == true) {
          this.eventSave.medicallyconfirmed = 'Y';
        } else {
          this.eventSave.medicallyconfirmed = 'N';
        }
      }

      //For inserts - if there are symptoms, add them to the record
      this.symptoms = this.card_form.get('symptoms') as FormArray;
      if (this.symptoms.length > 0) {
        console.log('Has Symptoms for event insert: ', this.symptoms);
        this.eventSave.symptoms = new Symptoms();
        this.eventSave.symptoms.items = [];
        this.eventSave.processsymptom = true;
        for (j = 0; j < this.symptoms.length; j++) {
          symptom = new Symptom();
          symptom.recordid = this.symptoms.at(j).get("recordid").value;
          this.eventSave.symptoms.items.push(symptom);
        }
      }
    }
      var restURL="https://ap6oiuyew6.execute-api.us-east-1.amazonaws.com/dev/MedicalEventByProfile";
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
        console.log('Happy Path: ', result);
        self.category.title = "MedicalEvent";
        self.loading.dismiss();
        self.nav.pop();
      }).catch( function(result){
        console.log('Error from formMedicalEvent.save: ',result);
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
          console.log('Need to login again!!! - Credentials expired from ' + self.formName + '.saveRecord');
          self.loading.dismiss();
          self.RestService.appRestart();
        } else {
          console.log('From ' + self.formName + '.saveRecord - Credentials refreshed!');
          self.navSaveRecordDo(function (err, results) {
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
    this.saving = true;
    if (this.card_form.get('recordid').value !==undefined && this.card_form.get('recordid').value !==null) {
      this.eventSave.recordid = this.card_form.get('recordid').value;
      this.eventSave.profileid = this.card_form.get('profileid').value;
      this.eventSave.userid = this.RestService.userId;
      this.eventSave.active = 'Y';
      if (this.medicalevent.dirty){
        this.eventSave.medicalevent = this.medicalevent.value;
      }
      if (this.card_form.get('eventcode').dirty){
        this.eventSave.eventcode = this.card_form.get('eventcode').value;
      }
      if (this.card_form.get('parenteventid').dirty){
        this.eventSave.parenteventid = this.card_form.get('parenteventid').value;
      }
      if (this.card_form.get('physicianid').dirty){
        this.eventSave.physicianid = this.card_form.get('physicianid').value;
      }
      if (this.card_form.get('onsetdate').dirty){
        this.eventSave.onsetdate = this.card_form.get('onsetdate').value;
      }
      if (this.card_form.get('enddate').dirty){
        this.eventSave.enddate = this.card_form.get('enddate').value;
      }
      if (this.card_form.get('eventdescription').dirty){
        this.eventSave.eventdescription = this.card_form.get('eventdescription').value;
      }
      if (this.card_form.get('dateofmeasure').dirty){
        this.eventSave.dateofdiagnosis = this.card_form.get('dateofmeasure').value;
      }
      if (this.card_form.get('ischronic').dirty){
        if (this.card_form.get('ischronic').value == true) {
          this.eventSave.chronicflag = 'Y';
        } else {
          this.eventSave.chronicflag = 'N';
        }
      }
      if (this.card_form.get('isallergy').dirty){
        if (this.card_form.get('isallergy').value == true) {
          this.eventSave.isallergy = 'Y';
        } else {
          this.eventSave.isallergy = 'N';
        }
      }
      if (this.card_form.get('ismedicallyconfirmed').dirty){
        if (this.card_form.get('ismedicallyconfirmed').value == true) {
          this.eventSave.medicallyconfirmed = 'Y';
        } else {
          this.eventSave.medicallyconfirmed = 'N';
        }
      }
    } else {
      if (this.aboutProfile !== null) {
        this.eventSave.profileid = this.aboutProfile;
      } else {
        this.eventSave.profileid = this.RestService.currentProfile;
      }
      this.eventSave.userid = this.RestService.userId;
      this.eventSave.active = 'Y';

      if (this.visitid !== undefined && this.visitid !== null) {
        this.eventSave.visitid = this.visitid;
        this.eventSave.medicallyconfirmed = 'Y';
      }
      if (this.medicalevent.dirty){
        this.eventSave.medicalevent = this.medicalevent.value;
      }
      if (this.card_form.get('eventcode').dirty){
        this.eventSave.eventcode = this.card_form.get('eventcode').value;
      }
      if (this.card_form.get('parenteventid').dirty){
        this.eventSave.parenteventid = this.card_form.get('parenteventid').value;
      }
      if (this.card_form.get('physicianid').dirty){
        this.eventSave.physicianid = this.card_form.get('physicianid').value;
      }
      if (this.card_form.get('onsetdate').value !== null){
        this.eventSave.onsetdate = this.card_form.get('onsetdate').value;
      }
      if (this.card_form.get('enddate').dirty){
        this.eventSave.enddate = this.card_form.get('enddate').value;
      }
      if (this.card_form.get('eventdescription').dirty){
        this.eventSave.eventdescription = this.card_form.get('eventdescription').value;
      }
      if (this.card_form.get('dateofmeasure').value !== null){
        this.eventSave.dateofdiagnosis = this.card_form.get('dateofmeasure').value;
      }
      if (this.card_form.get('ischronic').dirty){
        if (this.card_form.get('ischronic').value == true) {
          this.eventSave.chronicflag = 'Y';
        } else {
          this.eventSave.chronicflag = 'N';
        }
      }
      if (this.card_form.get('isallergy').dirty){
        if (this.card_form.get('isallergy').value == true) {
          this.eventSave.isallergy = 'Y';
        } else {
          this.eventSave.isallergy = 'N';
        }
      }
      if (this.card_form.get('ismedicallyconfirmed').dirty){
        if (this.card_form.get('ismedicallyconfirmed').value == true) {
          this.eventSave.medicallyconfirmed = 'Y';
        } else {
          this.eventSave.medicallyconfirmed = 'N';
        }
      }

      //For inserts - if there are symptoms, add them to the record
      this.symptoms = this.card_form.get('symptoms') as FormArray;
      if (this.symptoms.length > 0) {
        console.log('Has Symptoms for event insert: ', this.symptoms);
        this.eventSave.symptoms = new Symptoms();
        this.eventSave.symptoms.items = [];
        var symptom = new Symptom();
        this.eventSave.processsymptom = true;
        for (var j = 0; j < this.symptoms.length; j++) {
          symptom = new Symptom();
          symptom.recordid = this.symptoms.at(j).get("reftablefieldid").value;
          console.log('Symptom Record id: ' + symptom.recordid);
          this.eventSave.symptoms.items.push(symptom);
        }
      }
    }
      var restURL="https://ap6oiuyew6.execute-api.us-east-1.amazonaws.com/dev/MedicalEventByProfile";
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
        console.log('Happy Path: ', result);
        self.loading.dismiss();
        callback(null, result.data);
      }).catch( function(result){
        console.log('Error from formMedicalEvent.save: ',result);
        self.loading.dismiss();
        alert('There was an error saving this data.  Please try again later');
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

  formatDate(dateString) {
    if (this.userTimezone !== undefined && this.userTimezone !=="") {
      return moment(dateString).tz(this.userTimezone).format('MM-DD-YYYY');
    } else {
      return moment(dateString).format('MM-DD-YYYY');
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
    if (!this.saving && (this.card_form.dirty || this.medicalevent.dirty) && !this.checkSave) {
      const shouldLeave = await this.confirmLeave();
      return shouldLeave;
    } else if (!this.saving && (this.card_form.dirty || this.medicalevent.dirty) && this.checkSave) {
      const shouldLeave = await this.confirmSave();
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
                  self.curRec = {recordid: results};
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
                  var medicalevent = self.eventTerm;
                  self.curRec = {recordid: results, medicalevent: medicalevent};
                  self.loadFromId = results;
                  self.card_form.get('recordid').setValue(results);
                  console.log('new Medical Condition record: ', self.curRec);
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
      callback(null, true);
    }
  }

  addSymptom() {
    var self = this;
    var dataObj;
    var inputObj;

    if (this.symptomsNotChosen !== undefined && this.symptomsNotChosen !== null && this.symptomsNotChosen.length > 0) {
      console.log('Calling Symptom not chosen menu', this.symptomsNotChosen);
      if (!this.alreadyAddedAdd) {
        var addItem = {
          recordid: 'Add New',
          namevalue: 'Add New',
        }
        inputObj = this.symptomsNotChosen;
        inputObj.push(addItem);
        this.alreadyAddedAdd = true;
      } else {
        inputObj = this.symptomsNotChosen;
      }

      let popover = this.popoverCtrl.create(MenuDynamic, {itemList: inputObj});
      popover.onDidDismiss(data => {
        console.log('From popover onDismiss: ', data);
        if (data !==undefined && data !== null) {
          dataObj = data.choosePage;
          self.processAddExistingSymptom(dataObj);
        }
      });
      popover.present({
      });
    } else {
      this.checkSave = true;
      this.confirmSaveDirect(function(err, result) {
        if (err) {
          console.log('Error in addSymptom.confirmSaveDirect' + err);
          alert('There is an error in saving the medication record from addSymptom');
        } else {
          if (result) {
            console.log('Result from confirmSaveDirect: ', result);
            console.log('Getting top level confirmSaveDirect self: ', self);
            console.log('Getting top level confirmSaveDirect this: ', this);
            self.nav.push(FormSymptomPage, {fromEvent: self.fromEvent});
          } else if (!result) {
            console.log('addSymptom.ConfirmSaveDirect - User cancelled');
          }
        }
      });
    }
  }

  processAddExistingSymptom(dataObj) {
    console.log('dataObj from processAddExistingSymptom: ' + dataObj);
    var self = this;
    if (dataObj == 'Add New') {
      this.checkSave = true;
      this.confirmSaveDirect(function(err, result) {
        if (err) {
          console.log('Error in processAddExistingSymptom.confirmSaveDirect' + err);
          alert('There is an error in saving the medication record from processAddExistingSymptom');
        } else {
          if (result) {
            self.nav.push(FormSymptomPage, {fromEvent: self.fromEvent});
          } else if (!result) {
            console.log('processAddExistingSymptom.ConfirmSaveDirect - User cancelled');
          }
        }
      });
    } else if (!isNaN(dataObj)) {
      console.log('Data Obj is a number!');
      var objSymptom;
      for (var j = 0; j < this.symptomsNotChosen.length; j++) {
        if (this.symptomsNotChosen[j].recordid ==  dataObj) {
          console.log('dataObj equals recordid');
          this.symptoms = this.card_form.get('symptoms') as FormArray;
          objSymptom = {
            recordid: this.symptomsNotChosen[j].recordid,
            namevalue: this.symptomsNotChosen[j].namevalue,
          }
          this.symptoms.push(this.addUnaccountedSymptom(objSymptom));
          this.symptoms.markAsDirty();
          this.symptomsNotChosen.splice(j, 1);
        } else {
          console.log('recordid: ' + this.symptomsNotChosen[j].recordid + ', dataobj: ' + dataObj);
        }
      }
    } else {
      console.log('Invalid response from: processAddExistingSymptom' + dataObj);
    }
  }

  addUnaccountedSymptom(objSymptom): FormGroup {
    return this.formBuilder.group({
      recordid: new FormControl(objSymptom.recordid),
      namevalue: new FormControl(objSymptom.namevalue),
      treatments: this.formBuilder.array([]),
    });
  }

  updateSymptom(index) {
    this.checkSave = true;
    var self = this;
    this.confirmSaveDirect(function(err, result) {
      if (err) {
        console.log('Error in updateSymptom.confirmSaveDirect' + err);
        alert('There is an error in saving the medication record from updateSymptom');
      } else {
        if (result) {
          console.log('From updateSymptom: ', self.curRec.symptoms.items);
          self.RestService.results = self.curRec.symptoms.items;
          self.nav.push(FormSymptomPage, {fromEvent: true, recId: index});
        } else if (!result) {
          console.log('updateSymptom.ConfirmSaveDirect - User cancelled');
        }
      }
    });
  }

  removeSymptom(index) {
    var objSymptom;
    //console.log('Remove symptom - symptomname' + this.symptoms.at(index).get("namevalue").value);
    objSymptom = {
      recordid: this.symptoms.at(index).get("recordid").value,
      namevalue: this.symptoms.at(index).get("namevalue").value,
    }
    if (this.symptomsNotChosen !== undefined && this.symptomsNotChosen.length > 0) {
      this.symptomsNotChosen.push(objSymptom);
    } else {
      this.symptomsNotChosen = [];
      this.symptomsNotChosen.push(objSymptom);
    }

    this.symptoms.removeAt(index);
    this.symptoms.markAsDirty();
    //this.card_form.markAsDirty();
  }

setFilteredItems() {
  this.items = this.filterItems(this.eventTerm);
  //alert('Search Term:' + this.searchTerm);
}

filterItems(searchTerm){
  if (this.listFilter.items !== undefined) {
    if (this.listFilter.items[0].dictionary.filter((item) => {return item.value.toLowerCase().indexOf(searchTerm.toLowerCase()) ===0;}).length ==1
      && this.listFilter.items[0].dictionary.filter((item) => {return item.value.toLowerCase().indexOf(searchTerm.toLowerCase()) ===0;})[0].value.toLowerCase() == searchTerm.toLowerCase()){
        //console.log('Filter Items: loop 1');
        return [];
    } else if (this.listFilter.items[0].dictionary.filter((item) => {return item.value.toLowerCase().indexOf(searchTerm.toLowerCase()) ===0;}).length > 0 &&
      this.listFilter.items[0].dictionary.filter((item) => {return item.value.toLowerCase().indexOf(searchTerm.toLowerCase()) ===0;})[0].value.toLowerCase() == searchTerm.toLowerCase()) {
      //console.log('Filter Items: loop 2');
      return [];
    } else {
      //console.log('Filter Items: loop 3');
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
  setTimeout(() => {
    this.eventHasFocus = false;
    //console.log('Timeout for spinner called ' + this.formName);
  }, 1000);
}

showList() {
  //console.log('Event Focus: ' + this.eventHasFocus + ', term length: ' + this.eventTerm.length);
  if (this.eventTerm.length > 1 && this.eventHasFocus) {
    return true;
  } else {
    return false;
  }
}

searchListTerm(objME) {
  var self = this;
  console.log('SearchListTerm called for ', objME);
  //Add subDictionary code
  this.medicalevent.setValue(objME.value);
  this.card_form.get('eventcode').setValue(objME.recordid);
  this.card_form.get('eventcode').markAsDirty();
  //alert('strValue:' + strValue);

  this.setBodyAreaByME(objME.value, function(err, result) {
    if (result) {
      self.hasBodyArea = true;
      //alert('Has body area!');
    } else {
      self.hasBodyArea = false;
      //alert('Has no body area!');
    }
  });
}

setBodyAreaByME(strTerm, callback) {
  var returned = false;

  //alert('fieldName for 0: ' + this.listFilter.items[0].dictionary[0].dictionarycode + ', strTerm = ' + strTerm);
  for (var j = 0; j < this.listFilter.items[0].dictionary.length; j++) {
    if (this.listFilter.items[0].dictionary[j].dictionarycode == strTerm) {
      //alert('index for '+ strTerm + ': ' + j);
      if (this.listFilter.items[0].dictionary[j].dictionary.length > 0) {
        this.bodyAreaList = this.listFilter.items[0].dictionary[j].dictionary;
        returned = true;
        callback(null, 'Has Dictionary');
      } else {
        returned = true;
        callback('No Dictionary', null);
      }
    }
  }
  if (!returned) {
    //alert('Looped through - No match: j = ' + j);
    callback('No Dictionary', null);
  }
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
  var self = this;
  var fromType;

  if (dataObj !== undefined && dataObj !== null) {
    if (dataObj == 'Medication') {
      this.checkSave = true;
      this.confirmSaveDirect(function(err, result) {
        if (err) {
          console.log('Error in loadMenu.confirmSaveDirect' + err);
          alert('There is an error in saving the medication record from loadMenu');
        } else {
          if (result) {
            var cat = {title: dataObj};
            var fromEvent = {medicaleventid: self.curRec.recordid, medicalevent: self.curRec.medicalevent, profileid: self.curRec.profileid };
            console.log('Form load menu - curRec.recordid: ' +  self.curRec.recordid);
            self.nav.push(FormMedication, {category: cat, fromEvent: fromEvent});
          } else if (!result) {
            console.log('loadMenu.ConfirmSaveDirect Medication- User cancelled');
          }
        }
      });
    } else if (dataObj == 'Procedure') {
      console.log('Add Procedure');
      fromType = 'condition';
      this.checkSave = true;
      this.confirmSaveDirect(function(err, result) {
        if (err) {
          console.log('Error in loadMenu.confirmSaveDirect' + err);
          alert('There is an error in saving the procedure record from loadMenu');
        } else {
          if (result) {
            var cat = {title: dataObj};
            console.log('Form load menu - curRec.recordid: ' +  self.curRec.recordid);
            if (self.visitInfo !== undefined && self.visitInfo !== null && self.visitInfo.recordid > 0) {
              fromType = 'condition with visit';
            } else if (self.curRec !== undefined && self.curRec !== null && self.curRec.visitid > 0) {
              fromType = 'condition with visit';
            } else if (self.curRec !== undefined && self.curRec !== null && self.curRec.physicianid > 0) {
              fromType = 'condition with contact';
            }

            self.nav.push(FormProcedure, {category: cat, fromEvent: self.curRec, eventVisit: self.visitInfo, fromType: fromType});
          } else if (!result) {
            console.log('loadMenu.ConfirmSaveDirect Procedure - User cancelled');
          }
        }
      });
      //alert('Coming soon.  From here, you will be able to add a new procedure which treats this event');
    } else if (dataObj == 'Therapy') {
      console.log('Add Therapy');
      fromType = 'condition';
      this.checkSave = true;
      this.confirmSaveDirect(function(err, result) {
        if (err) {
          console.log('Error in loadMenu.confirmSaveDirect' + err);
          alert('There is an error in saving the therapy record from loadMenu');
        } else {
          if (result) {
            var cat = {title: dataObj};
            console.log('Form load menu - curRec.recordid: ' +  self.curRec.recordid);
            if (self.visitInfo !== undefined && self.visitInfo !== null && self.visitInfo.recordid > 0) {
              fromType = 'condition with visit';
            } else if (self.curRec !== undefined && self.curRec !== null && self.curRec.visitid > 0) {
              fromType = 'condition with visit';
            } else if (self.curRec !== undefined && self.curRec !== null && self.curRec.physicianid > 0) {
              fromType = 'condition with contact';
            }
            self.nav.push(FormTherapy, {category: cat, fromEvent: self.curRec, eventVisit: self.visitInfo, fromType: fromType});
          } else if (!result) {
            console.log('loadMenu.ConfirmSaveDirect Procedure - User cancelled');
          }
        }
      });
    } else {
      console.log ('No data in loadMenu');
    }
  }
}

noEventRecord() {
  if (this.eventTerm == undefined || this.eventTerm.length < 1) {
    return true;
  } else {
    return false;
  }
}

noTreatments() {
  if (this.curRec !== undefined && this.curRec.treatments !== undefined && this.curRec.treatments.items !== undefined
    && this.curRec.treatments.items.length > 0) {
      return false;
    } else {
      return true;
    }
  }

addExistingSymptoms() {
  var dtOnSet;
  var dtCompare;
  var strOnSet;
  var diagnoses;
  var diagnosis;
  var treatments;
  var exitLoop = 0;

  this.symptoms = this.card_form.get('symptoms') as FormArray;
  if (this.visitInfo !== undefined && this.visitInfo.visitdate !== undefined) {
    this.card_form.get('dateofmeasure').setValue(this.visitInfo.visitdate);
  }
  if (this.visitInfo !== undefined && this.visitInfo.importantinfo !== undefined && this.visitInfo.importantinfo.items !== undefined
    && this.visitInfo.importantinfo.items.length > 0 && this.newRec) {
      while (this.symptoms.length !== 0 || exitLoop > 9) {
        this.symptoms.removeAt(0);
        exitLoop = exitLoop + 1;
      }

    dtOnSet = moment(Date());
    for (var j = 0; j < this.visitInfo.importantinfo.items.length; j++) {
      if (this.visitInfo.importantinfo.items[j].type == 'symptom' && (this.visitInfo.importantinfo.items[j].medicaleventid == undefined ||
      this.visitInfo.importantinfo.items[j].medicaleventid == null )) {
        this.symptoms.push(this.addVisitSymptom(j));
        if (this.visitInfo.importantinfo.items[j].dateofmeasure !== undefined) {
          dtCompare = moment(this.visitInfo.importantinfo.items[j].dateofmeasure);
          if (dtCompare < dtOnSet) {
            dtOnSet = dtCompare;
          }
        }
      }
    }
    strOnSet = moment(dtOnSet).format('YYYY-MM-DD');
    console.log('strOnset: ' + strOnSet);
    this.card_form.get('onsetdate').setValue(strOnSet);
  } else if (this.curRec !== undefined && this.curRec.symptoms !== undefined && this.curRec.symptoms.items !== undefined
      && this.curRec.symptoms.items.length > 0) {
        while (this.symptoms.length !== 0 || exitLoop > 9) {
          this.symptoms.removeAt(0);
          exitLoop = exitLoop + 1;
        }
        for (j = 0; j < this.curRec.symptoms.items.length; j++) {
          this.symptoms.push(this.addExistingSymptom(j));
          if (this.curRec.symptoms.items[j].treatments !== undefined && this.curRec.symptoms.items[j].treatments.items.length > 0) {
            diagnoses = this.card_form.get('symptoms') as FormArray;
            diagnosis  = diagnoses.at(j) as FormGroup;
            treatments = diagnosis.get('treatments') as FormArray;
            for (var k = 0; k < this.curRec.symptoms.items[j].treatments.items.length; k++) {
              treatments.push(this.addTreatment4Symptom(this.curRec.symptoms.items[j].treatments.items[k]));
            }
          }
        }
      console.log('Once symptoms are saved with medical condition');
  } else {
    while (this.symptoms.length !== 0 || exitLoop > 9) {
      this.symptoms.removeAt(0);
      exitLoop = exitLoop + 1;
    }
  }
}

addTreatment4Symptom(objTreat): FormGroup {
  return this.formBuilder.group({
    recordid: new FormControl({value: objTreat.recordid, disabled: true}),
    reftable: new FormControl({value: objTreat.reftable, disabled: true}),
    reftablefield: new FormControl({value: objTreat.reftablefield, disabled: true}),
    reftablefieldid: new FormControl({value: objTreat.reftablefieldid, disabled: true}),
    reftablefields: new FormControl({value: objTreat.reftablefields, disabled: true}),
    type: new FormControl({value: objTreat.type, disabled: true}),
    namevalue: new FormControl({value: objTreat.namevalue, disabled: true}),
    indication: new FormControl({value: objTreat.indication, disabled: true}),
    dateofmeasure: new FormControl({value: objTreat.dateofmeasure, disabled: true}),
  });
}


addExistingTreatments() {
  var exitLoop = 0;

  this.treatments = this.card_form.get('treatments') as FormArray;
  if (this.curRec !== undefined && this.curRec.treatments !== undefined && this.curRec.treatments.items !== undefined
    && this.curRec.treatments.items.length > 0) {
      while (this.treatments.length !== 0 || exitLoop > 9) {
        this.treatments.removeAt(0);
        exitLoop = exitLoop + 1;
      }
      for (var j = 0; j < this.curRec.treatments.items.length; j++) {
        this.treatments.push(this.addExistingTreatment(j));
      }
  } else {
    while (this.treatments.length !== 0 || exitLoop > 9) {
      this.treatments.removeAt(0);
      exitLoop = exitLoop + 1;
    }
  }
}

loadMainRecord() {
  console.log('loadMainRecord start');
  var ischronic = false;
  var isallergy = false;
  if (this.curRec.chronicflag !== undefined && this.curRec.chronicflag == 'Y') {
    ischronic = true;
  }
  if (this.curRec.isallergy !== undefined && this.curRec.isallergy == 'Y') {
    isallergy = true;
  }

  var visittext = "";
  if (this.curRec !== undefined && this.curRec !== null) {
    if(this.curRec.visitid !== undefined && this.curRec.visitid !== null) {
      if (this.curRec.lastname !== undefined && this.curRec.lastname !== null) {
        visittext = "Dr. " + this.curRec.lastname + ": " + this.formatDate(this.curRec.visitdate);
      } else {
        visittext = this.curRec.title + ": " + this.formatDate(this.curRec.visitdate);
      }
    }
  }

  this.medicalevent.setValue(this.curRec.medicalevent);
  this.eventTerm = this.curRec.medicalevent;

  this.card_form.get('recordid').setValue(this.curRec.recordid);
  this.card_form.get('parenteventid').setValue(this.curRec.parenteventid);
  this.card_form.get('parenteventname').setValue(this.curRec.parenteventname);
  this.card_form.get('parenteventonset').setValue(this.curRec.parenteventonset);
  this.card_form.get('eventcode').setValue(this.curRec.eventcode);
  this.card_form.get('bodyarea').setValue(this.curRec.bodyarea);
  this.card_form.get('bodyareatext').setValue(this.curRec.bodyareatext);
  this.card_form.get('onsetdate').setValue(this.curRec.onsetdate);
  this.card_form.get('enddate').setValue(this.curRec.enddate);
  this.card_form.get('eventdescription').setValue(this.curRec.eventdescription);
  this.card_form.get('dateofmeasure').setValue(this.curRec.dateofdiagnosis);
  this.card_form.get('visitid').setValue(this.curRec.visitid);
  this.card_form.get('profileid').setValue(this.curRec.profileid);
  this.card_form.get('visittext').setValue(visittext);
  this.card_form.get('ischronic').setValue(ischronic);
  this.card_form.get('isallergy').setValue(isallergy);
}

createItem(): FormGroup {
  this.iiBlankAdded = true;
  return this.formBuilder.group({
    recordid: new FormControl(),
    namevalue: new FormControl(),
    dateofmeasure: new FormControl(),
    reftable: new FormControl(),
    reftablefield: new FormControl(),
    reftablefieldid: new FormControl(),
    reftablefields: new FormControl(),
    type: new FormControl(),
    active: new  FormControl('Y'),
  });
}

addItem(): void {
  this.symptoms = this.card_form.get('symptoms') as FormArray;
  this.symptoms.push(this.createItem());
  this.iiBlankAdded = true;
}

addVisitSymptom(index): FormGroup {
  return this.formBuilder.group({
    recordid: new FormControl(this.visitInfo.importantinfo.items[index].recordid),
    namevalue: new FormControl(this.visitInfo.importantinfo.items[index].namevalue),
    dateofmeasure: new FormControl(this.formatDateTime(this.visitInfo.importantinfo.items[index].dateofmeasure)),
  });
}

addExistingSymptom(index): FormGroup {
  return this.formBuilder.group({
    recordid: new FormControl(this.curRec.symptoms.items[index].recordid),
    namevalue: new FormControl(this.curRec.symptoms.items[index].full_symptom),
    dateofmeasure: new FormControl(this.formatDateTime(this.curRec.symptoms.items[index].onsetdate)),
    treatments: this.formBuilder.array([]),
  });
}

addExistingTreatment(index): FormGroup {
  var dtStart;
  if (this.curRec.treatments.items[index].startdate !== undefined && this.curRec.treatments.items[index].startdate !== null) {
    dtStart = this.curRec.treatments.items[index].startdate;
  } else if (this.curRec.treatments.items[index].dateofmeasure !== undefined && this.curRec.treatments.items[index].dateofmeasure !== null) {
    dtStart = this.curRec.treatments.items[index].dateofmeasure;
  } else {
    dtStart = null;
  }
  return this.formBuilder.group({
    recordid: new FormControl({value: this.curRec.treatments.items[index].recordid, disabled: true}),
    reftable: new FormControl({value: this.curRec.treatments.items[index].reftable, disabled: true}),
    reftablefield: new FormControl({value: this.curRec.treatments.items[index].reftablefield, disabled: true}),
    reftablefieldid: new FormControl({value: this.curRec.treatments.items[index].reftablefieldid, disabled: true}),
    reftablefields: new FormControl({value: this.curRec.treatments.items[index].reftablefields, disabled: true}),
    type: new FormControl({value: this.curRec.treatments.items[index].type, disabled: true}),
    namevalue: new FormControl({value: this.curRec.treatments.items[index].namevalue, disabled: true}),
    indication: new FormControl({value: this.curRec.treatments.items[index].indication, disabled: true}),
    dateofmeasure: new FormControl({value: dtStart, disabled: true}),
  });
}

notValid() {
  //if either is dirty and both are valid, enable save button - otherwise keep disabled
  if ((this.card_form.dirty || this.medicalevent.dirty) && (this.card_form.valid && this.medicalevent.valid)) {
    return false;
  } else {
    return true;
  }
}

updateEventTreatment(index) {
  var cat;
  var treatments = this.card_form.get('treatments') as FormArray;
  var objType = treatments.at(index).get('type').value;
  var objRecordid = treatments.at(index).get('reftablefieldid').value;
  var self = this;

  if (objType == 'medication') {
    this.checkSave = true;
    this.confirmSaveDirect(function(err, result) {
      if (err) {
        console.log('Error in updateEventTreatment.confirmSaveDirect' + err);
        alert('There is an error in saving the medication record from updateEventTreatment');
      } else {
        if (result) {
          cat = {title: 'Medication'};
          var fromEvent = {medicaleventid: self.curRec.recordid, medicalevent: self.curRec.medicalevent, profileid: self.curRec.profileid };
          self.nav.push(FormMedication, { loadFromId: objRecordid, category: cat, fromEvent: fromEvent });
        } else if (!result) {
          console.log('updateEventTreatment.ConfirmSaveDirect - User cancelled');
        }
      }
    });
  } else if (objType == 'procedure') {
    this.checkSave = true;
    this.confirmSaveDirect(function(err, result) {
      if (err) {
        console.log('Error in updateEventTreatment-procedure.confirmSaveDirect' + err);
        alert('There is an error in saving the medication record from updateEventTreatment');
      } else {
        if (result) {
          cat = {title: 'Procedure'};
          var fromEvent = {medicaleventid: self.curRec.recordid, medicalevent: self.curRec.medicalevent, profileid: self.curRec.profileid };
          self.nav.push(FormProcedure, { loadFromId: objRecordid, category: cat, eventVisit: self.visitInfo, fromEvent: fromEvent });
        } else if (!result) {
          console.log('updateEventTreatment.ConfirmSaveDirect - User cancelled');
        }
      }
    });
  } else if (objType == 'therapy') {
    this.checkSave = true;
    this.confirmSaveDirect(function(err, result) {
      if (err) {
        console.log('Error in updateEventTreatment-therapy.confirmSaveDirect' + err);
        alert('There is an error in saving the medication record from updateEventTreatment');
      } else {
        if (result) {
          cat = {title: 'Procedure'};
          var fromEvent = {medicaleventid: self.curRec.recordid, medicalevent: self.curRec.medicalevent, profileid: self.curRec.profileid };
          self.nav.push(FormTherapy, { loadFromId: objRecordid, category: cat, eventVisit: self.visitInfo, fromEvent: fromEvent });
        } else if (!result) {
          console.log('updateEventTreatment.ConfirmSaveDirect - User cancelled');
        }
      }
    });
  }
}

updateSymptomTreatment(parentIndex, index) {
  console.log('updateSymptomTreatment parentIndex: ' + parentIndex + ', index: ' + index);
  var cat;
  var self = this;
  var symptoms = this.card_form.get('symptoms') as FormArray;
  var symptomid = symptoms.at(parentIndex).get('recordid').value;
  var treatments =  symptoms.at(parentIndex).get('treatments') as FormArray;
  var objType = treatments.at(index).get('type').value;
  var objRecordid = treatments.at(index).get('reftablefieldid').value;

  if (objType == 'medication') {
    this.checkSave = true;
    this.confirmSaveDirect(function(err, result) {
      if (err) {
        console.log('Error in updateSymptomTreatment.confirmSaveDirect' + err);
        alert('There is an error in saving the medication record from updateSymptomTreatment');
      } else {
        if (result) {
          cat = {title: 'Medication'};
          self.nav.push(FormMedication, { loadFromId: objRecordid, category: cat, fromSymptom: symptomid });
        } else if (!result) {
          console.log('updateSymptomTreatment.ConfirmSaveDirect - User cancelled');
        }
      }
    });
  }
}

addFromCabinet() {
  var cat;
  this.checkSave = true;
  var self = this;
  this.confirmSaveDirect(function(err, result) {
    if (err) {
      console.log('Error in addFromCabinet.confirmSaveDirect' + err);
      alert('There is an error in saving the medication record from addFromCabinet');
    } else {
      if (result) {
        cat = {title: 'Medicine Cabinet'};
        self.nav.push(ListMedicationPage, { category: cat, fromEvent: self.fromEvent });
      } else if (!result) {
        console.log('addFromCabinet.ConfirmSaveDirect - User cancelled');
      }
    }
  });
}

attachRecord() {
  alert('Coming soon.  This button will allow you to link pictures and documents (e.g. PDFs) of physical medical records, images, etc.');
}

viewAllTreatments() {
  var cat;
  this.checkSave = true;
  var self = this;
  this.confirmSaveDirect(function(err, result) {
    if (err) {
      console.log('Error in viewAllTreatments.confirmSaveDirect' + err);
      alert('There is an error in saving the medication record from viewAllTreatments');
    } else {
      if (result) {
        cat = {title: 'Treatments'};
        self.nav.push(ListTreatmentPage, { category: cat, fromEvent: self.fromEvent });
      } else if (!result) {
        console.log('viewAllTreatments.ConfirmSaveDirect - User cancelled');
      }
    }
  });
}

viewParent() {
  var cat;
  this.checkSave = true;
  var self = this;
  this.confirmSaveDirect(function(err, result) {
    if (err) {
      console.log('Error in viewParent.confirmSaveDirect' + err);
      alert('There is an error in saving the record from viewParent');
    } else {
      if (result) {
        cat = {title: 'Related Condition'};
        self.nav.push(FormMedicalEvent, { category: cat, loadFromId: self.curRec.parenteventid });
      } else if (!result) {
        console.log('viewParent.ConfirmSaveDirect - User cancelled');
      }
    }
  });
}

addParent() {
  var self = this;
  var cat = {title: 'Select Related Condition'};

  let profileModal = this.modalCtrl.create(ListMedicalEvent, { category: cat, aboutProfile: this.aboutProfile });
  profileModal.onDidDismiss(data => {
    if (data !==undefined && data !== null) {
      self.relatedEvent = data;
      self.hasRelated = true;
      console.log('Result from addParent ', self.relatedEvent);
      self.card_form.get('parenteventname').setValue(self.relatedEvent.medicalevent);
      self.card_form.get('parenteventonset').setValue(self.relatedEvent.startdate);
      self.card_form.get('parenteventid').setValue(self.relatedEvent.recordid);
      self.card_form.get('parenteventid').markAsDirty();
    }
  });
  profileModal.present();
}

addPhysician() {
  var self = this;
  var cat = {title: 'Select Heathcare Provider'};

  let profileModal = this.modalCtrl.create(ListContactPage, { category: cat });
  profileModal.onDidDismiss(data => {
    if (data !==undefined && data !== null) {
      console.log('Result from addPhysician ', data);
      self.card_form.get('physicianid').setValue(data.recordid);
      self.card_form.get('physicianid').markAsDirty();
      self.card_form.get('physiciantitle').setValue(data.title);
    }
  });
  profileModal.present();
}

viewPhysician() {
  var cat;
  var physicianid;
  this.checkSave = true;
  var self = this;
  this.confirmSaveDirect(function(err, result) {
    if (err) {
      console.log('Error in viewPhysician.confirmSaveDirect' + err);
      alert('There is an error in saving the record from viewPhysician');
    } else {
      if (result) {
        cat = {title: 'Healthcare Provider'};
        physicianid = self.card_form.get('physicianid').value;
        self.nav.push(FormContactPage, { category: cat, loadFromId: physicianid });
      } else if (!result) {
        console.log('viewPhysician.ConfirmSaveDirect - User cancelled');
      }
    }
  });
}

flipMC() {
  if (this.card_form.get('ismedicallyconfirmed').value == true) {
    this.ismedicallyconfirmed = true;
  } else {
    this.ismedicallyconfirmed = false;
    this.card_form.get('physicianid').setValue(null);
    this.card_form.get('physicianid').markAsDirty();
    this.card_form.get('physiciantitle').setValue(null);
  }
}

gotoVisit() {
  this.checkSave = true;
  var self = this;
  this.confirmSaveDirect(function(err, result) {
    if (err) {
      console.log('Error in gotoVisit.confirmSaveDirect' + err);
      alert('There is an error in saving the record from gotoVisit');
    } else {
      if (result) {
        self.nav.push(FormVisitPage, { loadFromId: self.curRec.visitid });
      } else if (!result) {
        console.log('gotoVisit.ConfirmSaveDirect - User cancelled');
      }
    }
  });
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
