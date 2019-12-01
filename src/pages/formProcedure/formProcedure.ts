import { Component } from '@angular/core';
import { NavController, NavParams, AlertController, LoadingController, PopoverController, ModalController, ViewController } from 'ionic-angular';
import { Validators, FormGroup, FormControl, FormArray } from '@angular/forms';
import { RestService } from '../../app/services/restService.service';
import { ProcedureModel, Procedure } from '../../pages/listProcedure/listProcedure.model';
import { HistoryItemModel } from '../../pages/history/history.model';
import { ListGoalsModel } from '../../pages/listGoals/listGoals.model';
import { DictionaryModel } from '../../pages/models/dictionary.model';
import { ListOrderService } from '../../pages/listOrder/listOrder.service';
import { MenuHelp } from '../../pages/menuHelp/menuHelp';
import { FormVisitPage } from '../../pages/formVisit/formVisit';
import { ListContactPage } from '../../pages/listContacts/listContacts';
import { FormContactPage } from '../../pages/formContact/formContact';


var moment = require('moment-timezone');

@Component({
  selector: 'formVisit1-page',
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
  fromType: any;
  fromEvent: any;
  fromSymptom: any;
  eventVisit: any;
  comingBack: boolean = false;

  procedurename: FormControl = new FormControl();
  listFilter: DictionaryModel = new DictionaryModel();
  procedureTerm: string = '';
  items: any;
  userCount: any = 0;
  fromVisit: any;
  aboutProfile: any;
  checkTiming: boolean = false;
  hasVisit: boolean = false;
  needsVisit: boolean = false;
  showPhysician: boolean = false;
  hasPhysician: boolean = false;
  hasEvent: boolean = false;
  needsDate: boolean = false;
  visitMode: any = null;

  constructor(public nav: NavController, public alertCtrl: AlertController, public RestService:RestService, public loadingCtrl: LoadingController,
    public list2Service: ListOrderService, public popoverCtrl:PopoverController, public navParams: NavParams, public modalCtrl: ModalController,
    public viewCtrl: ViewController) {

    this.recId = navParams.get('recId');
    this.curRec = RestService.results[this.recId];
    this.fromVisit = navParams.get('fromVisit');
    this.loadFromId = navParams.get('loadFromId');
    this.fromType = navParams.get('fromType');
    this.fromEvent = navParams.get('fromEvent');
    this.fromSymptom = navParams.get('fromSymptom');
    this.eventVisit = navParams.get('eventVisit');
    console.log('Init formProc recId', this.recId);
    console.log('Init formProc curRec', this.curRec);
    console.log('Init formProc fromVisit', this.fromVisit);
    console.log('Init formProc fromEvent', this.fromEvent);
    console.log('Init formProc eventVisit', this.eventVisit);
    console.log('Init formProc fromType: ', this.fromType);
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
      var visittext = "";
      var physicianname;
      if (this.curRec !== undefined && this.curRec !== null) {
        if(this.curRec.visitid !== undefined && this.curRec.visitid !== null) {
          if (this.curRec.lastname !== undefined && this.curRec.lastname !== null) {
            visittext = "Dr. " + this.curRec.lastname + ": " + this.formatDateTime(this.curRec.dateofmeasure);
            physicianname = "Dr. " + this.curRec.lastname;
          } else {
            visittext = this.curRec.title + ": " + this.formatDateTime(this.curRec.dateofmeasure);
            physicianname = this.curRec.title;
          }
        } else if (this.curRec.lastname !== undefined && this.curRec.lastname !== null) {
          visittext = "Dr. " + this.curRec.lastname + ": " + this.formatDateTime(this.curRec.dateofmeasure);
          physicianname = "Dr. " + this.curRec.lastname;
        } else if (this.curRec.title !== undefined && this.curRec.title !== null) {
          visittext = this.curRec.title + ": " + this.formatDateTime(this.curRec.dateofmeasure);
          physicianname = this.curRec.title;
        }
      }
      this.card_form = new FormGroup({
        recordid: new FormControl(this.curRec.recordid),
        medicaleventid: new FormControl(this.curRec.medicaleventid),
        symptomid: new FormControl(this.curRec.symptomid),
        verbatimindication: new FormControl(this.curRec.verbatimindication),
        visitid: new FormControl(this.curRec.visitid),
        visittext: new FormControl(visittext),
        physicianid: new FormControl(this.curRec.physicianid),
        physicianname: new FormControl(physicianname),
        title: new FormControl(this.curRec.title),
        firstname: new FormControl(this.curRec.firstname),
        lastname: new FormControl(this.curRec.lastname),
        description: new FormControl(this.curRec.description),
        dateofmeasure: new FormControl(this.formatDateTime(this.curRec.dateofmeasure)),
        result: new FormControl(this.curRec.result),
        proceduretiming: new FormControl(this.curRec.proceduretiming),
        profileid: new FormControl(this.curRec.profileid),
        userid: new FormControl(this.curRec.userid)
      });
      this.procedurename = new FormControl(this.curRec.procedurename, Validators.required);
      this.procedureTerm = this.curRec.procedurename;
      console.log('formProcdure Has curRec: ', this.curRec);
      if ((this.curRec.visitid == undefined || this.curRec.visitid == null) && this.curRec.proceduretiming == 'aftervisit') {
        this.needsVisit = true;
        console.log('Set form to needsVisit');
      } else if (this.curRec.visitid !== undefined && this.curRec.visitid !== null && this.curRec.visitid > 0) {
        this.hasVisit = true;
        console.log('Set form to hasVisit');
      } else {
        this.showPhysician = true;
        if (this.curRec.physicianid !== undefined && this.curRec.physicianid !== null) {
          this.hasPhysician = true;
        }
        console.log('Set form to showPhysician');
      }
      if (this.curRec.medicaleventid !== undefined && this.curRec.medicaleventid !== null) {
        this.hasEvent = true;
      }
      if (this.curRec.dateofmeasure == undefined || this.curRec.dateofmeasure == null) {
        this.needsDate = true;
      }
    } else {
      this.newRec = true;
      this.card_form = new FormGroup({
        recordid: new FormControl(),
        medicaleventid: new FormControl(),
        symptomid: new FormControl(),
        verbatimindication: new FormControl(),
        visitid: new FormControl(),
        visittext: new FormControl(),
        physicianid: new FormControl(),
        physicianname: new FormControl(),
        title: new FormControl(),
        firstname: new FormControl(),
        lastname: new FormControl(),
        description: new FormControl(),
        dateofmeasure: new FormControl(),
        result: new FormControl(),
        proceduretiming: new FormControl(),
        profileid: new FormControl(),
        userid: new FormControl()
      });
      this.procedurename = new FormControl(null, Validators.required);
      if (this.fromType !==undefined && this.fromType == 'condition with visit') {
        this.checkTiming = true;
      } else if (this.fromVisit !== undefined && this.fromVisit !== null) {
        this.hasVisit =true;

        if (this.fromVisit.physician !== undefined && this.fromVisit.physician.lastname !== undefined && this.fromVisit.physician.lastname !== null) {
          visittext = "Dr. " + this.fromVisit.physician.lastname + ": " + this.formatDateTime(this.fromVisit.visitdate);
          physicianname = "Dr. " + this.fromVisit.physician.lastname;
        } else if (this.fromVisit.physician !== undefined) {
          visittext = this.fromVisit.physician.title + ": " + this.formatDateTime(this.fromVisit.visitdate);
          physicianname = this.fromVisit.physician.title;
        }
        this.card_form.get('visitid').setValue(this.fromVisit.recordid);
        this.card_form.get('visittext').setValue(visittext);
        if (this.fromVisit.visitdate !== undefined && this.fromVisit.visitdate !== null) {
          this.card_form.get('dateofmeasure').setValue(this.fromVisit.visitdate);
        }
        if (this.fromVisit.mode !== undefined && this.fromVisit.mode !== null) {
          this.visitMode = this.fromVisit.mode;
        }
      } else {
        this.showPhysician = true;
      }
      if (this.fromEvent !==undefined && this.fromEvent !==null && this.fromEvent.recordid !== undefined && this.fromEvent.recordid > 0) {
        this.card_form.get('medicaleventid').setValue(this.fromEvent.recordid);
        this.card_form.get('verbatimindication').setValue(this.fromEvent.medicalevent);
        this.hasEvent = true;
        this.aboutProfile = this.fromEvent.profileid;
      } else if (this.fromSymptom !==undefined && this.fromSymptom !==null && this.fromSymptom.recordid !== undefined && this.fromSymptom.recordid > 0) {
        this.card_form.get('symptomid').setValue(this.fromSymptom.recordid);
        this.card_form.get('verbatimindication').setValue(this.fromSymptom.symptomname);
        this.hasEvent = true;
        this.aboutProfile = this.fromSymptom.profileid;
      }else if (this.eventVisit !==undefined && this.eventVisit !==null && this.eventVisit.profileid !== undefined) {
        this.aboutProfile = this.eventVisit.profileid;
      }
    }
  }

  ionViewWillEnter() {
    var dtNow = moment(new Date());
    var dtExpiration = moment(this.RestService.AuthData.expiration);
    var self = this;

    this.checkSave = false;
    this.card_form.markAsPristine();
    this.procedurename.markAsPristine();

    if (dtNow < dtExpiration) {
      if (!this.comingBack) {
        this.presentLoadingDefault();
        this.loadFilterList();
        this.procedurename.valueChanges.debounceTime(700).subscribe(search => {
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
          console.log('From formMedication - Credentials refreshed!');
          if (!self.comingBack) {
            self.loadFilterList();
            self.procedurename.valueChanges.debounceTime(700).subscribe(search => {
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
    restURL="https://ap6oiuyew6.execute-api.us-east-1.amazonaws.com/dev/ProcedureByProfile";
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
      console.log('Result from formProc.loadDetails - loadFromID: ' + self.loadFromId, result);
      if (result !== undefined && result.data !== undefined && result.data[0] !== undefined && result.data[0].recordid > 0) {
        self.recId = 0;
        self.curRec = result.data[0];
        self.newRec = false;
        self.loading.dismiss();
        console.log('formProc.loadDetails: ', self.curRec);
        self.fillFormDetails();
      } else {
        console.log('formProc.loadDetails - no data: ', result);
        self.loading.dismiss();
      }
    }).catch( function(result){
      console.log('Err from formProc.loadDetails: ', result);
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
    var visittext = "";
    if (this.curRec !== undefined && this.curRec !== null) {
      if(this.curRec.visitid !== undefined && this.curRec.visitid !== null) {
        if (this.curRec.lastname !== undefined && this.curRec.lastname !== null) {
          visittext = "Dr. " + this.curRec.lastname + ": " + this.formatDateTime(this.curRec.dateofmeasure);
        } else {
          visittext = this.curRec.title + ": " + this.formatDateTime(this.curRec.dateofmeasure);
        }
      }
    }
    console.log('Add data from fillFormDetails: ', this.curRec);
    this.card_form.get('recordid').setValue(this.curRec.recordid);
    this.card_form.get('medicaleventid').setValue(this.curRec.medicaleventid);
    this.card_form.get('symptomid').setValue(this.curRec.symptomid);
    this.card_form.get('visitid').setValue(this.curRec.visitid);
    this.card_form.get('visittext').setValue(visittext);
    this.card_form.get('description').setValue(this.curRec.description);
    this.card_form.get('dateofmeasure').setValue(this.formatDateTime(this.curRec.dateofmeasure));
    this.card_form.get('result').setValue(this.curRec.result);
    this.card_form.get('proceduretiming').setValue(this.curRec.proceduretiming);
    this.procedurename.setValue(this.curRec.procedurename);
    this.procedureTerm = this.curRec.procedurename;

    if (this.curRec.dateofmeasure == undefined || this.curRec.dateofmeasure == null) {
      this.needsDate = true;
    }
    if ((this.curRec.visitid == undefined || this.curRec.visitid == null) && this.curRec.proceduretiming == 'aftervisit') {
      this.needsVisit = true;
      this.showPhysician = false;
      this.hasVisit = false;
      console.log('Set form to needsVisit');
    } else if (this.curRec.visitid !== undefined && this.curRec.visitid !== null && this.curRec.visitid > 0) {
      if ((this.eventVisit !== undefined && this.eventVisit !== null) || (this.fromVisit !== undefined && this.fromVisit !== null)) {
        console.log('Procedure has visit, but is coming from a visit - eventVisit, ',  this.eventVisit);
        console.log('Procedure has visit, but is coming from a visit - fromVisit, ',  this.fromVisit);
        this.showPhysician = false;
      } else {
        this.hasVisit = true;
        this.showPhysician = false;
        console.log('Set form to hasVisit');
      }
    } else {
      this.showPhysician = true;
      if (this.curRec.physicianid !== undefined && this.curRec.physicianid !== null) {
        this.hasPhysician = true;
      }
      console.log('Set form to showPhysician');
    }

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
                self.category.title = "Procedure";
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
      this.formSave.userid = this.RestService.userId;
      this.formSave.active = 'Y';

      if (this.procedurename.dirty){
        this.formSave.procedurename = this.procedurename.value;
      }
      if (this.card_form.get('medicaleventid').value !== undefined && this.card_form.get('medicaleventid').value !== null){
        this.formSave.medicaleventid = this.card_form.get('medicaleventid').value;
      }
      if (this.card_form.get('symptomid').value !== undefined && this.card_form.get('symptomid').value !== null){
        this.formSave.symptomid = this.card_form.get('symptomid').value;
      }
      if (this.card_form.get('visitid').dirty){
        this.formSave.visitid = this.card_form.get('visitid').value;
      }
      if (this.card_form.get('physicianid').dirty){
        this.formSave.physicianid = this.card_form.get('physicianid').value;
      }
      if (this.card_form.get('description').dirty){
        this.formSave.description = this.card_form.get('description').value;
      }
      if (this.card_form.get('dateofmeasure').dirty){
        this.formSave.dateofmeasure = this.card_form.get('dateofmeasure').value;
      }
      if (this.card_form.get('result').dirty){
        this.formSave.result = this.card_form.get('result').value;
      }
      if (this.card_form.get('proceduretiming').dirty){
        this.formSave.proceduretiming = this.card_form.get('proceduretiming').value;
      }
    } else {
      this.formSave.procedurename = this.procedurename.value;
      if (this.card_form.get('medicaleventid').value !== undefined && this.card_form.get('medicaleventid').value !== null){
        this.formSave.medicaleventid = this.card_form.get('medicaleventid').value;
      }
      if (this.card_form.get('visitid').value !== undefined && this.card_form.get('visitid').value !== null){
        this.formSave.visitid = this.card_form.get('visitid').value;
      }
      if (this.card_form.get('physicianid').value !== undefined && this.card_form.get('physicianid').value !== null){
        this.formSave.physicianid = this.card_form.get('physicianid').value;
      }
      if (this.card_form.get('description').dirty){
        this.formSave.description = this.card_form.get('description').value;
      }
      if (this.card_form.get('dateofmeasure').value !== undefined && this.card_form.get('dateofmeasure').value !== null){
        this.formSave.dateofmeasure = this.card_form.get('dateofmeasure').value;
      }
      if (this.card_form.get('result').dirty){
        this.formSave.result = this.card_form.get('result').value;
      }
      if (this.card_form.get('proceduretiming').dirty){
        this.formSave.proceduretiming = this.card_form.get('proceduretiming').value;
      }
      if (this.aboutProfile !== undefined && this.aboutProfile !== null) {
        this.formSave.profileid = this.aboutProfile;
      } else {
        this.formSave.profileid = this.RestService.currentProfile;
      }

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
      var params;
      var additionalParams;
      var pathTemplate = '';
      var method = 'POST';

      params = {
        //pathParameters: this.vaccineSave
      };

      if (this.visitMode !== undefined && this.visitMode !== null) {
        additionalParams = {
          queryParams: {
              profileid: this.RestService.currentProfile,
              mode: this.visitMode
          }
        };
      } else {
        additionalParams = {
          queryParams: {
              profileid: this.RestService.currentProfile
          }
        };
      }
      console.log('fromProcedure save: ', additionalParams);

      var body = JSON.stringify(this.formSave);
      var self = this;
      console.log('Calling Post', this.formSave);
      apigClient.invokeApi(params, pathTemplate, method, additionalParams, body)
      .then(function(result){
        self.RestService.results = result.data;
        console.log('Happy Path: ' + self.RestService.results);
        //self.category.title = "Measure";
        self.loading.dismiss();
        if (self.visitMode !== undefined && self.visitMode !== null) {
          self.formSave.recordid = result.data;
          self.formSave.namevalue = self.formSave.procedurename;
          self.formSave.type = 'procedure';
          self.dismiss();
        } else {
          self.nav.pop();
        }
      }).catch( function(result){
        console.log('Error results from formProcedure.save: ',result);
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
    this.checkSave = false;
    if (this.card_form.get('recordid').value !==undefined && this.card_form.get('recordid').value !==null) {
      this.formSave.recordid = this.card_form.get('recordid').value;
      this.formSave.userid = this.RestService.userId;
      this.formSave.active = 'Y';
      if (this.procedurename.dirty){
        this.formSave.procedurename = this.procedurename.value;
      }
      if (this.card_form.get('medicaleventid').value !== undefined && this.card_form.get('medicaleventid').value !== null){
        this.formSave.medicaleventid = this.card_form.get('medicaleventid').value;
      }
      if (this.card_form.get('symptomid').value !== undefined && this.card_form.get('symptomid').value !== null){
        this.formSave.symptomid = this.card_form.get('symptomid').value;
      }
      if (this.card_form.get('visitid').dirty){
        this.formSave.visitid = this.card_form.get('visitid').value;
      }
      if (this.card_form.get('physicianid').dirty){
        this.formSave.physicianid = this.card_form.get('physicianid').value;
      }
      if (this.card_form.get('description').dirty){
        this.formSave.description = this.card_form.get('description').value;
      }
      if (this.card_form.get('dateofmeasure').dirty){
        this.formSave.dateofmeasure = this.card_form.get('dateofmeasure').value;
      }
      if (this.card_form.get('result').dirty){
        this.formSave.result = this.card_form.get('result').value;
      }
      if (this.card_form.get('proceduretiming').dirty){
        this.formSave.proceduretiming = this.card_form.get('proceduretiming').value;
      }
    } else {
      this.formSave.procedurename = this.procedurename.value;
      if (this.card_form.get('medicaleventid').value !== undefined && this.card_form.get('medicaleventid').value !== null){
        this.formSave.medicaleventid = this.card_form.get('medicaleventid').value;
      }
      if (this.card_form.get('visitid').value !== undefined && this.card_form.get('visitid').value !== null){
        this.formSave.visitid = this.card_form.get('visitid').value;
      }
      if (this.card_form.get('physicianid').value !== undefined && this.card_form.get('physicianid').value !== null){
        this.formSave.physicianid = this.card_form.get('physicianid').value;
      }
      if (this.card_form.get('description').dirty){
        this.formSave.description = this.card_form.get('description').value;
      }
      if (this.card_form.get('dateofmeasure').dirty){
        this.formSave.dateofmeasure = this.card_form.get('dateofmeasure').value;
      }
      if (this.card_form.get('result').dirty){
        this.formSave.result = this.card_form.get('result').value;
      }
      if (this.card_form.get('proceduretiming').dirty){
        this.formSave.proceduretiming = this.card_form.get('proceduretiming').value;
      }
      if (this.aboutProfile !== undefined && this.aboutProfile !== null) {
        this.formSave.profileid = this.aboutProfile;
      } else {
        this.formSave.profileid = this.RestService.currentProfile;
      }

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
                  self.curRec = {recordid: results};
                  self.loadFromId = results;
                  self.card_form.get('recordid').setValue(results);
                  console.log('new Procedure record: ', self.curRec);
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
    if (!this.saving && (this.card_form.dirty || this.procedurename.dirty) && this.checkSave) {
      alert.present();
    } else {
      this.loadFromId = this.curRec.recordid;
      this.checkSave = false;
      callback(null, true);
    }
  }

  newContact() {
    this.checkSave = true;
    var self = this;
    var physicianname;

    console.log('Called newContact');
    this.confirmSaveDirect(function(err, result) {
      if (err) {
        console.log('Error in newContact.confirmSaveDirect' + err);
        alert('There is an error in saving the record from newContact');
      } else {
        console.log('NewContact.result: ', result);
        if (result) {
          var cat = {title: 'Select Heathcare Provider'};
          let profileModal = self.modalCtrl.create(ListContactPage, { category: cat });
          profileModal.onDidDismiss(data => {
            if (data !==undefined && data !== null) {
              console.log('newContact - response: ', data);
              self.card_form.get('physicianid').setValue(data.recordid);
              self.card_form.get('physicianid').markAsDirty();
              self.card_form.get('title').setValue(data.title);
              self.card_form.get('firstname').setValue(data.firstname);
              self.card_form.get('lastname').setValue(data.lastname);

              if (data.lastname !== undefined && data.lastname !== null) {
                physicianname = "Dr. " + data.lastname;
              } else {
                physicianname = data.title;
              }
              //place code to create a visit
              self.card_form.get('physicianname').setValue(physicianname);
              self.hasPhysician = true;
            }
          });
          profileModal.present();
        } else if (!result) {
          console.log('newContact.ConfirmSaveDirect - User cancelled');
        }
      }
    });
  }

  gotoContact() {
    this.checkSave = true;
    var self = this;
    this.confirmSaveDirect(function(err, result) {
      if (err) {
        console.log('Error in gotoContact.confirmSaveDirect' + err);
        alert('There is an error in saving the record from gotoContact');
      } else {
        if (result) {
          self.nav.push(FormContactPage, { loadFromId: self.curRec.physicianid });
        } else if (!result) {
          console.log('gotoContact.ConfirmSaveDirect - User cancelled');        }
      }
    });
  }

  newVisit() {
    this.checkSave = true;
    var self = this;
    var createNewParams;
    this.confirmSaveDirect(function(err, result) {
      if (err) {
        console.log('Error in newContact.confirmSaveDirect' + err);
        alert('There is an error in saving the record from newContact');
      } else {
        if (result) {
          var cat = {title: 'Select Heathcare Provider'};
          var profileid = null;
          var procedureid = null;
          var procedurename = null;
          var medicaleventid = null;
          var medicalevent = null;
          var eventstart = null;
          var parentvisitid = null;
          var parentreason = null;


          if (self.aboutProfile !== undefined && self.aboutProfile !== null) {
            profileid = self.aboutProfile;
          } else if (self.curRec !== undefined && self.curRec.profileid !== undefined && self.curRec.profileid > 0) {
            profileid = self.curRec.profileid;
          } else {
            profileid = self.RestService.currentProfile;
          }

          if (self.eventVisit !== undefined && self.eventVisit !== null) {
            if (self.eventVisit.parentvisitid !== undefined && self.eventVisit.parentvisitid !== null) {
              parentvisitid = self.eventVisit.parentvisitid;
              parentreason = self.eventVisit.parentreason + " " + self.formatDateTime(self.eventVisit.parentdate);
            } else {
              parentvisitid = self.eventVisit.recordid;
              parentreason = self.eventVisit.reason + " " + self.formatDateTime(self.eventVisit.visitdate);
            }
          } else if (self.fromVisit !== undefined && self.fromVisit !== null) {
            if (self.fromVisit.parentvisitid !== undefined && self.fromVisit.parentvisitid !== null) {
              parentvisitid = self.fromVisit.parentvisitid;
              parentreason = self.fromVisit.parentreason + " " + self.formatDateTime(self.fromVisit.parentdate);
            } else {
              parentvisitid = self.fromVisit.recordid;
              parentreason = self.fromVisit.reason + " " + self.formatDateTime(self.fromVisit.visitdate);
            }
          }
          if (self.fromEvent !== undefined && self.fromEvent !== null) {
            medicalevent = self.fromEvent.medicalevent;
            eventstart = self.fromEvent.startdate;
          }

          if (self.curRec !== undefined && self.curRec.profileid !== undefined && self.curRec.profileid > 0
             && self.curRec.procedurename !== undefined && self.curRec.procedurename !== null) {
            procedureid = self.curRec.recordid;
            procedurename = self.curRec.procedurename;
            medicaleventid = self.curRec.medicaleventid;
            medicalevent = self.curRec.verbatimindication;
          } else if (self.curRec !== undefined && self.curRec.profileid !== undefined && self.curRec.profileid > 0) {
            procedureid = self.curRec.recordid;
            procedurename = self.procedurename.value;
            medicaleventid = self.card_form.get('medicaleventid').value;
            medicalevent = self.card_form.get('verbatimindication').value;
          }

          if (self.curRec !== undefined && self.curRec !== null) {
            self.loadFromId = self.curRec.recordid;
          }
          let profileModal = self.modalCtrl.create(ListContactPage, { category: cat, aboutProfile: profileid });
          profileModal.onDidDismiss(data => {
            if (data !==undefined && data !== null) {
              console.log('newContact - response: ', data);
              createNewParams = {
                'contactid':data.recordid,
                'title':data.title,
                'firstname':data.firstname,
                'lastname':data.lastname,
                'profileid':profileid,
                'procedureid':procedureid,
                'procedurename':procedurename,
                'medicaleventid':medicaleventid,
                'medicalevent':medicalevent,
                'eventstart':eventstart,
                'parentvisitid': parentvisitid,
                'parentreason':parentreason
              }
              self.nav.push(FormVisitPage, {createNewParams: createNewParams});
              //self.nav.push(FormVisitPage, {  });
            }
          });
          profileModal.present();
        } else if (!result) {
          console.log('newContact.ConfirmSaveDirect - User cancelled');
        }
      }
    });
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
    //Date time is captured in local time for this date - must be local time display
    if (this.userTimezone !== undefined && this.userTimezone !== null && this.userTimezone !=="") {
      var offsetDate = new Date(moment(dateString).toISOString());
      var offset = offsetDate.getTimezoneOffset() / 60;
      return moment(dateString).add(offset, 'hours').format('MMM DD YYYY hh:mm a');
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

  cancel() {
    this.nav.pop();
  }

  dismiss() {
    //console.log('From chooseinfo dismiss: ', this.listSave);
    let data = this.formSave;
    this.viewCtrl.dismiss(data);
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

  setTiming(strTiming) {
    var visittext;
    var visitid;
    var visitdate;
    if (strTiming == 'atvisit') {
      console.log('setTiming at visit eventVisit: ', this.eventVisit);
      console.log('setTiming at visit fromEvent: ', this.fromEvent);
      if (this.eventVisit !== undefined && this.eventVisit !== null && this.eventVisit.physician !== undefined) {
        visitid = this.eventVisit.recordid;
        visitdate = this.eventVisit.visitdate;
        if (this.eventVisit.physician.lastname !== undefined && this.eventVisit.physician.lastname !== null) {
          visittext = "Dr. " + this.eventVisit.physician.lastname + ": " + visitdate;
        } else {
          visittext = this.eventVisit.physician.title + ": " + visitdate;
        }
      } else if (this.fromEvent !== undefined && this.fromEvent !== null) {
        visitid = this.fromEvent.visitid;
        visitdate = this.fromEvent.dateofdiagnosis;
        if (this.fromEvent.lastname !== undefined && this.fromEvent.lastname !== null) {
          visittext = "Dr. " + this.fromEvent.lastname + ": " + visitdate;
        } else {
          visittext = this.fromEvent.title + ": " + visitdate;
        }
      }
      this.card_form.get('dateofmeasure').setValue(visitdate);
      this.card_form.get('dateofmeasure').markAsDirty();
      this.card_form.get('visitid').setValue(visitid);
      this.card_form.get('visitid').markAsDirty();
      this.card_form.get('visittext').setValue(visittext);
      this.hasVisit = true;
      this.needsVisit = false;
    } else if (strTiming == 'aftervisit') {
      if (this.card_form.get('visitid').value !== undefined && this.card_form.get('visitid').value !== null) {
        this.card_form.get('visitid').setValue(null);
        this.card_form.get('visitid').markAsDirty();
        this.card_form.get('visittext').setValue(null);
      }
      this.needsVisit = true;
      this.hasVisit = false;
    } else {
      this.showPhysician = true;
    }
  }

  attachRecord() {
    alert('Coming soon.  This button will allow you to link pictures and documents (e.g. PDFs) of physical medical records, images, etc.');
  }

  presentHelp(myEvent) {
    var title = 'Procedure timing';
    var helptext = "Choose the appropriate procedure timing.  For procedures performed at the diagnosis visit, the proper information will auto-populate<br><br>" +
    "For an upcoming procedure, you can schedule the visit through the schedule a visit button (calendar) after entering the procedure name.";

    let popover = this.popoverCtrl.create(MenuHelp, {title: title, helptext: helptext});
    popover.onDidDismiss(data => {
      console.log('From popover onDismiss: ', data);
    });
    popover.present({
      ev: myEvent
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
