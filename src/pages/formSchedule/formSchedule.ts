import { Component } from '@angular/core';
import { NavController, NavParams, AlertController, LoadingController } from 'ionic-angular';
import { Validators, FormGroup, FormControl, FormArray, FormBuilder } from '@angular/forms';
import { RestService } from '../../app/services/restService.service';
import { HistoryItemModel } from '../../pages/history/history.model';
import { ListSchedule, ActivatedSchedule, ActivatedSchedules, Eligible } from '../../pages/listSchedule/listSchedule.model';
import { DictionaryModel, DictionaryItem } from '../../pages/models/dictionary.model';
import { DictionaryService } from '../../pages/models/dictionary.service';
import { ListContactModel } from '../../pages/listContacts/listContacts.model';
import { ListContactService } from '../../pages/listContacts/listContacts.service';

var moment = require('moment-timezone');

@Component({
  selector: 'formSchedule-page',
  templateUrl: 'formSchedule.html'
})
export class FormSchedulePage {
  loading: any;
  section: string;
  formName: string = "formSchedule";
  recId: number;
  card_form: FormGroup;
  profilesNotify: FormArray;
  curRec: any;
  newRec: boolean = false;
  saving: boolean = false;
  showTips: boolean = true;
  isNotSelected: boolean = true;
  isCustom: boolean = false;
  notifySelected: boolean = false;
  hasActiveSched: boolean = true;
  activeProfileID: number;
  profiles = [];
  scheduleModelSave: ListSchedule  = new ListSchedule();
  scheduleSave: ActivatedSchedule = new ActivatedSchedule();
  scheduleSaveArray: ActivatedSchedules = new ActivatedSchedules();
  category: HistoryItemModel = new HistoryItemModel();
  userTimezone: any;
  timeNow: any;
  hourNow: any;
  minuteNow: any;
  momentNow: any;
  monthNow: any;
  yearNow: any;
  monthDefaultNext: any;
  yearDefaultNext: any;
  dictionaries: DictionaryModel = new DictionaryModel();
  intervalList: DictionaryItem[];
  listContacts: ListContactModel = new ListContactModel();
  categories_checkbox_open: boolean;
  categories_checkbox_result;

  constructor(public nav: NavController, public alertCtrl: AlertController, public RestService:RestService,
    public navParams: NavParams, public loadingCtrl: LoadingController, public dictionaryService: DictionaryService,
    public listContactService: ListContactService, public formBuilder: FormBuilder) {

    var eligibles = [];
    this.recId = navParams.get('recId');
    this.curRec = RestService.results[this.recId];
    console.log('Cur Rec from formSchedule: ', this.curRec);
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
      this.monthNow = this.momentNow.tz(this.userTimezone).format('MM');
      this.yearNow = this.momentNow.tz(this.userTimezone).format('YYYY');
    } else {
      this.hourNow = this.momentNow.format('HH');
      this.minuteNow = this.momentNow.format('mm');
      this.timeNow = this.momentNow.format('HH:mm');
      this.monthNow = this.momentNow.format('MM');
      this.yearNow = this.momentNow.format('YYYY');
    }
    console.log("Hour Now: " + this.hourNow + ", Minute Now:  " + this.minuteNow + ", Time Now" + this.timeNow);
    if (this.monthNow < 11) {
      this.monthDefaultNext = Number(this.monthNow) + 2;
      if (this.monthDefaultNext < 10) {
        this.monthDefaultNext = '0' + String(this.monthDefaultNext);
      } else {
        this.monthDefaultNext = String(this.monthDefaultNext);
        this.yearDefaultNext = String(this.yearNow);
      }
    } else if (this.monthNow == 11) {
      this.monthDefaultNext = '01';
      this.yearDefaultNext = String(Number(this.yearNow) +1);
    } else { //month is 12
      this.monthDefaultNext = '02';
      this.yearDefaultNext = String(Number(this.yearNow) +1);
    }
    if (this.curRec !== undefined && this.curRec !== null) {
      if (this.curRec.accountid !== undefined && this.curRec.accountid !== null && this.curRec.accountid > 0) {
        this.isCustom = true;
      }
      if (this.curRec.activatedSchedules !== undefined && this.curRec.activatedSchedules.length > 0) {
        for (var j = 0; j < this.curRec.activatedSchedules.length; j++) {
          //console.log('Added from ActivatedSchedules for index: ' + j, this.curRec.activatedSchedules[j]);
          eligibles.push(this.curRec.activatedSchedules[j]);
        }
      }
      if (this.curRec.eligibles !== undefined && this.curRec.eligibles.length > 0) {
        for (j = 0; j < this.curRec.eligibles.length; j++) {
          //console.log('Added from Eligibles for index: ' + j, this.curRec.eligibles[j]);
          eligibles.push(this.curRec.eligibles[j]);
        }
      }
      this.profiles = eligibles;
    } else {
      eligibles = [];
      var eligible: Eligible = new Eligible();
      this.newRec = true;
      this.isCustom = true;
      for (j = 0; j < this.RestService.Profiles.length; j++) {
        eligible = new Eligible();
        eligible.profileid = this.RestService.Profiles[j].profileid;
        eligible.firstname = this.RestService.Profiles[j].title;
        eligible.photopath = this.RestService.Profiles[j].imageURL;
        //console.log('Photopath for index: ' + j + ', ' + this.RestService.Profiles[j].imageURL);
        //console.log('Eligible: ', eligible);
        eligibles.push(eligible);
      }
      this.profiles = eligibles;
    }
    if (this.recId !== undefined) {
      this.card_form = new FormGroup({
        profile: new FormControl(),
        profilesnotify: this.formBuilder.array([ this.createItem() ], Validators.required),
        recordid: new FormControl(this.curRec.recordid),
        name: new FormControl(this.curRec.name),
        type: new FormControl(this.curRec.type),
        description: new FormControl(this.curRec.description),
        actschedid: new FormControl(),
        interval: new FormControl(this.curRec.interval),
        nextdate: new FormControl(),
        contactid: new FormControl(null, Validators.required),
        day90alert: new FormControl(),
        day30alert: new FormControl(),
        day7alert: new FormControl(),
        accountid: new FormControl(this.curRec.accountid),
        active: new FormControl()
     });
    } else {
      //this.newRec = true;
      this.card_form = new FormGroup({
        profile: new FormControl(),
        profilesnotify: this.formBuilder.array([ this.createItem() ], Validators.required),
        recordid: new FormControl(),
        name: new FormControl(),
        type: new FormControl(),
        description: new FormControl(),
        actschedid: new FormControl(),
        interval: new FormControl(),
        nextdate: new FormControl(),
        contactid: new FormControl(null, Validators.required),
        day90alert: new FormControl(),
        day30alert: new FormControl(),
        day7alert: new FormControl(),
        accountid: new FormControl(this.RestService.Profiles[0].accountid),
        active: new FormControl()
      });
    }
    this.addExistingProfiles();
  }

  ionViewWillEnter() {
    var dtNow = moment(new Date());
    var dtExpiration = moment(this.RestService.AuthData.expiration);
    var self = this;

    if (dtNow < dtExpiration) {
      this.presentLoadingDefault();
      this.loadDictionaries();
    } else {
      this.presentLoadingDefault();
      this.RestService.refreshCredentials(function(err, results) {
        if (err) {
          console.log('Need to login again!!! - Credentials expired from ' + self.formName);
          self.loading.dismiss();
          self.RestService.appRestart();
        } else {
          console.log('From '+ self.formName + ' - Credentials refreshed!');
          self.loadDictionaries();
        }
      });
    }
  }

  loadDictionaries() {
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
    var additionalParams = {
        queryParams: {
            formName: this.formName
        }
    };
    var body = '';
    var self = this;
    apigClient.invokeApi(params, pathTemplate, method, additionalParams, body)
    .then(function(result){
      self.RestService.results = result.data;
      self.dictionaryService
      .getData()
      .then(data => {
        self.dictionaries.items = self.RestService.results;
        console.log("Results Data for Get Dictionaries: ", self.dictionaries.items);
        self.intervalList = self.dictionaries.items[0].dictionary; //index 0 as aligned with sortIndex
        self.setDefault(self.profiles[0].profileid);
      });
    }).catch( function(result){
        console.log('Error result from formSchedule.loadDictionary: ', result);
        self.loading.dismiss();
    });
  }

  loadContacts(listFilter){
    var dtNow = moment(new Date());
    var dtExpiration = moment(this.RestService.AuthData.expiration);
    var self = this;

    if (dtNow < dtExpiration) {
      if (this.loading == undefined) {
        //console.log('From loadContacts: loading is undefined');
        this.presentLoadingDefault();
      } else {
        //console.log('From loadContacts: loading is already set');
      }
      this.loadContactsDo(listFilter);
    } else {
      this.presentLoadingDefault();
      this.RestService.refreshCredentials(function(err, results) {
        if (err) {
          console.log('Need to login again!!! - Credentials expired from ' + self.formName + '.loadContacts');
          if (self.loading !== undefined) {
            self.loading.dismiss();
          }
          self.RestService.appRestart();
        } else {
          console.log('From ' + self.formName + '.loadContacts - Credentials refreshed!');
          self.loadContactsDo(listFilter);
        }
      });
    }
  }

  loadContactsDo(listFilter) {
    var restURL: string;
    restURL="https://ap6oiuyew6.execute-api.us-east-1.amazonaws.com/dev/ContactByProfile";
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
    var method = 'GET';
    var additionalParams;
    if (listFilter !== '') {
      additionalParams = {
        queryParams: {
            profileid: this.activeProfileID,
            contacttype: "doctor",
            filter: listFilter
        }
      };
    } else {
      additionalParams = {
        queryParams: {
            profileid: this.activeProfileID,
            contacttype: "doctor"
        }
      };
    }
    var body = '';
    var self = this;
    var contacts = [];
    apigClient.invokeApi(params, pathTemplate, method, additionalParams, body)
    .then(function(result){
      contacts = result.data;
      self.listContactService
      .getData()
      .then(data => {
        self.listContacts.items = contacts;
        self.card_form.markAsPristine();
        console.log('From loadContacts - contactid value: ' + self.card_form.controls["contactid"].value);
        self.loading.dismiss();
      });
    }).catch( function(result){
      console.log('Error results from formSchedule.loadContacts: ', result);
      self.loading.dismiss();
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
      title: 'Confirm Inactivation',
      message: 'Are you certain you want to inactivate this scheduled reminder?',
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
          text: 'Inactivate',
          handler: () => {
            console.log('Inactivate clicked');
            this.saving = true;
            this.scheduleSave.recordid =  this.card_form.controls["actschedid"].value;
            this.scheduleSave.profileid = this.card_form.get('profile').value;
            this.scheduleSave.userid = this.RestService.userId;
            this.scheduleSave.active = 'N';
              var restURL="https://ap6oiuyew6.execute-api.us-east-1.amazonaws.com/dev/SchedulesByAccount";
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
              var body = JSON.stringify(this.scheduleSave);
              var self = this;
              console.log('Calling Post', this.scheduleSave);
              apigClient.invokeApi(params, pathTemplate, method, additionalParams, body)
              .then(function(result){
                self.RestService.results = result.data;
                console.log('Happy Path: ' + self.RestService.results);
                self.category.title = "Schedule";
                self.loading.dismiss();
                self.nav.pop();
              }).catch( function(result){
                console.log('Error result from formSchedule.delete: ',result);
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
    var strProfiles = "";
    this.saving = true;
    this.profilesNotify = this.card_form.get('profilesnotify') as FormArray
    if (this.card_form.get('actschedid').value !==undefined && this.card_form.get('actschedid').value !==null) {
      this.scheduleSave.recordid = this.card_form.get('actschedid').value;
      this.scheduleSave.profileid = this.card_form.get('profile').value;
      this.scheduleSave.active = 'Y';
      this.scheduleSave.userid = this.RestService.userId;
      if (this.profilesNotify.dirty) {
        for (var j = 0; j < this.profilesNotify.length; j++) {
          if (this.profilesNotify.at(j).value.selected) {
            strProfiles = strProfiles + this.profilesNotify.at(j).value.profileid + ', ';
          }
        }
        strProfiles = strProfiles.substring(0, strProfiles.length -2);
        console.log('String Profiles final: ' + strProfiles);
        this.scheduleSave.notifyprofiles = strProfiles;
      }
      if (this.card_form.get('interval').dirty){
        this.scheduleSave.interval = this.card_form.get('interval').value;
      }
      if (this.card_form.get('nextdate').dirty){
        this.scheduleSave.nextdate = this.card_form.get('nextdate').value;
      }
      if (this.card_form.get('contactid').dirty){
        this.scheduleSave.contactid = this.card_form.get('contactid').value;
      }
      if (this.card_form.get('day90alert').dirty){
        this.scheduleSave.day90alert = this.card_form.get('day90alert').value;
      }
      if (this.card_form.get('day30alert').dirty){
        this.scheduleSave.day30alert = this.card_form.get('day30alert').value;
      }
      if (this.card_form.get('day7alert').dirty){
        this.scheduleSave.day7alert = this.card_form.get('day7alert').value;
      }
    } else {
      this.scheduleSave.profileid = this.card_form.get('profile').value;
      this.scheduleSave.userid = this.RestService.currentProfile;  //placeholder for user to device mapping and user identification
      this.scheduleSave.scheduletemplateid = this.curRec.recordid;
      this.scheduleSave.active = 'Y';
      for (j = 0; j < this.profilesNotify.length; j++) {
        if (this.profilesNotify.at(j).value.selected) {
          strProfiles = strProfiles + this.profilesNotify.at(j).value.profileid + ', ';
        }
      }
      strProfiles = strProfiles.substring(0, strProfiles.length -2);
      console.log('String Profiles2 final: ' + strProfiles);
      this.scheduleSave.notifyprofiles = strProfiles;
      this.scheduleSave.interval = this.card_form.get('interval').value;
      this.scheduleSave.nextdate = this.card_form.get('nextdate').value;
      this.scheduleSave.contactid = this.card_form.get('contactid').value;
      this.scheduleSave.day90alert = this.card_form.get('day90alert').value;
      this.scheduleSave.day30alert = this.card_form.get('day30alert').value;
      this.scheduleSave.day7alert = this.card_form.get('day7alert').value;
    }
    var customDirty = false;
    if (this.isCustom) {
      if (!this.newRec) {
        this.scheduleModelSave.recordid = this.card_form.get('recordid').value;
        this.scheduleModelSave.type = this.card_form.get('type').value;
        if (this.card_form.get('name').dirty){
          this.scheduleModelSave.name = this.card_form.get('name').value;
          customDirty = true;
        }
        if (this.card_form.get('description').dirty){
          this.scheduleModelSave.description = this.card_form.get('description').value;
          customDirty = true;
        }
        if (this.card_form.get('interval').dirty){
          this.scheduleModelSave.interval = this.card_form.get('interval').value;
          customDirty = true;
        }
        if (customDirty) {
          this.scheduleSaveArray.items.push(this.scheduleSave);
          this.scheduleModelSave.activatedschedules = this.scheduleSaveArray;
        }
      } else {
        this.scheduleModelSave.name = this.card_form.get('name').value;
        this.scheduleModelSave.description = this.card_form.get('description').value;
        this.scheduleModelSave.type = "custom repeating";
        this.scheduleModelSave.interval = this.card_form.get('interval').value;
        this.scheduleModelSave.accountid = this.RestService.Profiles[0].accountid;
        customDirty = true;
        this.scheduleSaveArray.items.push(this.scheduleSave);
        this.scheduleModelSave.activatedschedules = this.scheduleSaveArray;
      }
    }
      var restURL="https://ap6oiuyew6.execute-api.us-east-1.amazonaws.com/dev/SchedulesByAccount";
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
      var body;
      //MM 10-5-18 Custom dirty represents that the scheduleModelSave object needs to be sent
      if (!customDirty) {
        body = JSON.stringify(this.scheduleSave);
        console.log('Calling Post AS', body);
      } else {
        body = JSON.stringify(this.scheduleModelSave);
        console.log('Calling Post Model', body);
      }
      var self = this;
      apigClient.invokeApi(params, pathTemplate, method, additionalParams, body)
      .then(function(result){
        self.RestService.results = result.data;
        console.log('Happy Path: ' + self.RestService.results);
        self.card_form.markAsPristine();
        self.category.title = "Schedules & Alerts";
        self.loading.dismiss();
        self.nav.pop();
      }).catch( function(result){
        alert('There is an error in updating the schedule.  It has been logged and will be reviewed by technical support');
        console.log('result error form formSchedule.save: ',result);
        self.loading.dismiss();
      });
  }

  public today() {
    return new Date().toISOString().substring(0,10);
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
      return moment(dateString).format('MM-DD-YYYY hh:mm a');
    }
  }

  async ionViewCanLeave() {
    if (!this.saving && this.card_form.dirty) {
      const shouldLeave = await this.confirmLeave();
      return shouldLeave;
    } else {
      return true;
    }
  }

  confirmLeave(): Promise<Boolean> {
    let resolveLeaving;
    const canLeave = new Promise<Boolean>(resolve => resolveLeaving = resolve);
    const alert = this.alertCtrl.create({
      title: 'Unsaved changes',
      message: 'Do you want to leave user without saving changes?',
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
    console.log('Confirm Leave Answer: ', canLeave);
    return canLeave
  }

  setProfileID(profileid) {
    var isActivated = false;
    var listFilter = "";
    var strNextDate;

    let alert = this.alertCtrl.create({
      title: 'Unsaved changes',
      message: 'Do you want to leave user without saving changes?',
      buttons: [
        {
          text: 'No',
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'Yes',
          handler: () => {
            console.log('Yes clicked');
            this.isNotSelected = false;
            this.profilesNotify = this.card_form.get('profilesnotify') as FormArray
            for (var j = 0; j < this.profilesNotify.length; j++) {
              this.profilesNotify.at(j).get('selected').setValue(false);
            }
            if (this.curRec !== undefined && this.curRec.physiciantypes !== undefined && this.curRec.physiciantypes !== '') {
              listFilter = this.curRec.physiciantypes;
            }
            this.activeProfileID = profileid;
            this.card_form.controls["profile"].setValue(profileid);
            this.card_form.markAsPristine();
            this.loadContacts(listFilter);
            if (this.curRec !== undefined && this.curRec.activatedSchedules !== undefined && this.curRec.activatedSchedules.length > 0) {
              for (j = 0; j < this.curRec.activatedSchedules.length; j++) {
                if (profileid == this.curRec.activatedSchedules[j].profileid) {
                  //console.log('Found in activated schedule when navigating from dirty!');
                  isActivated = true;
                  this.hasActiveSched = true;
                  this.card_form.controls["actschedid"].setValue(this.curRec.activatedSchedules[j].recordid);
                  this.card_form.controls["contactid"].setValue(this.curRec.activatedSchedules[j].contactid);
                  this.card_form.controls["interval"].setValue(this.curRec.activatedSchedules[j].interval);
                  this.card_form.controls["nextdate"].setValue(this.curRec.activatedSchedules[j].nextdate);
                  if (this.curRec.activatedSchedules[j].day90alert == 'Y') {
                    this.card_form.controls["day90alert"].setValue('Y');
                  } else if (this.curRec.activatedSchedules[j].day90alert == 'N') {
                    this.card_form.controls["day90alert"].setValue('N');
                  }
                  if (this.curRec.activatedSchedules[j].day30alert == 'Y') {
                    this.card_form.controls["day30alert"].setValue('Y');
                  } else if (this.curRec.activatedSchedules[j].day30alert == 'N') {
                    this.card_form.controls["day30alert"].setValue('N');
                  }
                  if (this.curRec.activatedSchedules[j].day7alert == 'Y') {
                    this.card_form.controls["day7alert"].setValue('Y');
                  } else if (this.curRec.activatedSchedules[j].day7alert == 'N') {
                    this.card_form.controls["day7alert"].setValue('N');
                  }
                  var notifys = this.curRec.activatedSchedules[j].notifyprofiles;
                  notifys = notifys.split(",");
                  this.profilesNotify = this.card_form.get('profilesnotify') as FormArray;
                  for (var l = 0; l < notifys.length; l++) {
                    for (var k = 0; k < this.profilesNotify.length; k++) {
                      var setSelected = this.profilesNotify.at(k) as FormGroup;
                      if (Number(notifys[l].trim()) == setSelected.value.profileid) {
                        setSelected.controls["selected"].setValue(true);
                        console.log('Set selected for ' + setSelected.value.profileid);
                      } else {
                        //console.log ('Nofifys id: ' + notifys[l].trim() + ' profilesNotify id: ' + setSelected.value.profileid);
                      }
                    }
                  }
                }
                this.card_form.markAsPristine();
              }
              if (!isActivated) {
                this.hasActiveSched = false;
                console.log('Schedule is not activated for profile: ' + this.activeProfileID);
                this.card_form.controls["actschedid"].setValue(null);
                this.card_form.controls["interval"].setValue(this.curRec.interval);
                this.card_form.controls["contactid"].setValue(null);
                console.log('ContactId should be null - 4: ' + this.card_form.controls["contactid"].value);
                strNextDate = this.yearDefaultNext + "-" + String(this.monthDefaultNext) + '-01';
                this.card_form.controls["day90alert"].setValue('N');
                this.card_form.controls["day30alert"].setValue('Y');
                this.card_form.controls["day7alert"].setValue('N');
                this.card_form.markAsPristine();
              }
            } else {
              this.hasActiveSched = false;
              if (this.curRec !== undefined) {
                this.card_form.controls["interval"].setValue(this.curRec.interval);
              } else {
                this.card_form.controls["interval"].setValue(296); //Annually as default
              }
              console.log('Schedule is not activated for profile: ' + this.activeProfileID);
              this.card_form.controls["actschedid"].setValue(null);
              this.card_form.controls["contactid"].setValue(null);
              console.log('ContactId should be null - 3: ' + this.card_form.controls["contactid"].value);
              strNextDate = this.yearDefaultNext + "-" + String(this.monthDefaultNext) + '-01';
              //console.log('Next Date: ' + strNextDate);
              this.card_form.controls["nextdate"].setValue(strNextDate);
              this.card_form.controls["day90alert"].setValue('N');
              this.card_form.controls["day30alert"].setValue('Y');
              this.card_form.controls["day7alert"].setValue('N');
              this.card_form.markAsPristine();
            }
          }
        }
      ]
    });

    if (!this.saving && this.card_form.dirty) {
      alert.present();
    } else {
      this.isNotSelected = false;
      this.profilesNotify = this.card_form.get('profilesnotify') as FormArray
      for (var j = 0; j < this.profilesNotify.length; j++) {
        this.profilesNotify.at(j).get('selected').setValue(false);
      }
      if (this.curRec !== undefined && this.curRec.physiciantypes !== undefined && this.curRec.physiciantypes !== '') {
        listFilter = this.curRec.physiciantypes;
      }
      this.activeProfileID = profileid;
      this.card_form.controls["profile"].setValue(profileid);
      this.loadContacts(listFilter);
      if (this.curRec !== undefined && this.curRec.activatedSchedules !== undefined && this.curRec.activatedSchedules.length > 0) {
        for (j = 0; j < this.curRec.activatedSchedules.length; j++) {
          if (profileid == this.curRec.activatedSchedules[j].profileid) {
            isActivated = true;
            this.hasActiveSched = true;
            //console.log('Found in activated schedule when navigating from clean: ' + this.curRec.activatedSchedules[j].recordid);
            this.card_form.controls["actschedid"].setValue(this.curRec.activatedSchedules[j].recordid);
            this.card_form.controls["contactid"].setValue(this.curRec.activatedSchedules[j].contactid);
            this.card_form.controls["interval"].setValue(this.curRec.activatedSchedules[j].interval);
            this.card_form.controls["nextdate"].setValue(this.curRec.activatedSchedules[j].nextdate);
            if (this.curRec.activatedSchedules[j].day90alert == 'Y') {
              this.card_form.controls["day90alert"].setValue('Y');
            } else if (this.curRec.activatedSchedules[j].day90alert == 'N') {
              this.card_form.controls["day90alert"].setValue('N');
            }
            if (this.curRec.activatedSchedules[j].day30alert == 'Y') {
              this.card_form.controls["day30alert"].setValue('Y');
            } else if (this.curRec.activatedSchedules[j].day30alert == 'N') {
              this.card_form.controls["day30alert"].setValue('N');
            }
            if (this.curRec.activatedSchedules[j].day7alert == 'Y') {
              this.card_form.controls["day7alert"].setValue('Y');
            } else if (this.curRec.activatedSchedules[j].day7alert == 'N') {
              this.card_form.controls["day7alert"].setValue('N');
            }
            var notifys = this.curRec.activatedSchedules[j].notifyprofiles;
            notifys = notifys.split(",");
            this.profilesNotify = this.card_form.get('profilesnotify') as FormArray;
            for (var l = 0; l < notifys.length; l++) {
              for (var k = 0; k < this.profilesNotify.length; k++) {
                if (Number(notifys[l].trim()) == this.profilesNotify.at(k).value.profileid) {
                  var setSelected = this.profilesNotify.at(k) as FormGroup;
                  setSelected.controls["selected"].setValue(true);
                } else {
                  //console.log ('Nofifys id: ' + notifys[l].trim() + ' profilesNotify id: ' + this.profilesNotify.at(k).value.profileid);
                }
              }
            }
            this.card_form.markAsPristine();
          }
        }
        if (!isActivated) {
          this.hasActiveSched = false;
          console.log('Schedule is not activated for profile: ' + this.activeProfileID);
          this.card_form.controls["actschedid"].setValue(null);
          this.card_form.controls["interval"].setValue(this.curRec.interval);
          strNextDate = this.yearDefaultNext + "-" + String(this.monthDefaultNext) + '-01';
          this.card_form.controls["nextdate"].setValue(strNextDate);
          this.card_form.controls["contactid"].setValue(null);
          console.log('ContactId should be null - 2: ' + this.card_form.controls["contactid"].value);
          this.card_form.controls["day90alert"].setValue('N');
          this.card_form.controls["day30alert"].setValue('Y');
          this.card_form.controls["day7alert"].setValue('N');
          this.card_form.markAsPristine();
        }
      } else {
        this.hasActiveSched = false;
        if (this.curRec !== undefined) {
          this.card_form.controls["interval"].setValue(this.curRec.interval);
        } else {
          this.card_form.controls["interval"].setValue(296); //Annually as default
        }
        console.log('Schedule is not activated for profile: ' + this.activeProfileID);
        this.card_form.controls["actschedid"].setValue(null);
        strNextDate = this.yearDefaultNext + "-" + String(this.monthDefaultNext) + '-01';
        console.log('Next Date: ' + strNextDate);
        this.card_form.controls["nextdate"].setValue(strNextDate);
        this.card_form.controls["contactid"].setValue(null);
        console.log('ContactId should be null - 1: ' + this.card_form.controls["contactid"].value);
        this.card_form.controls["day90alert"].setValue('N');
        this.card_form.controls["day30alert"].setValue('Y');
        this.card_form.controls["day7alert"].setValue('N');
        this.card_form.markAsPristine();
      }
      this.card_form.markAsPristine();
    }
  }

  setDefault(profileid) {
    var isActivated = false;
    var listFilter = "";
    var strNextDate;

    this.isNotSelected = false;
    this.profilesNotify = this.card_form.get('profilesnotify') as FormArray
    for (var j = 0; j < this.profilesNotify.length; j++) {
      this.profilesNotify.at(j).get('selected').setValue(false);
    }
    if (this.curRec !== undefined && this.curRec.physiciantypes !== undefined && this.curRec.physiciantypes !== '') {
      listFilter = this.curRec.physiciantypes;
    }
    this.activeProfileID = profileid;
    this.card_form.controls["profile"].setValue(profileid);
    if (this.curRec !== undefined && this.curRec.activatedSchedules !== undefined && this.curRec.activatedSchedules.length > 0) {
      for (j = 0; j < this.curRec.activatedSchedules.length; j++) {
        if (profileid == this.curRec.activatedSchedules[j].profileid) {
          isActivated = true;
          this.hasActiveSched = true;
          console.log('Found in activated schedule when navigating from clean: ' + this.curRec.activatedSchedules[j].recordid);
          this.card_form.controls["actschedid"].setValue(this.curRec.activatedSchedules[j].recordid);
          this.card_form.controls["contactid"].setValue(this.curRec.activatedSchedules[j].contactid);
          this.card_form.controls["interval"].setValue(this.curRec.activatedSchedules[j].interval);
          this.card_form.controls["nextdate"].setValue(this.curRec.activatedSchedules[j].nextdate);
          if (this.curRec.activatedSchedules[j].day90alert == 'Y') {
            this.card_form.controls["day90alert"].setValue('Y');
          } else if (this.curRec.activatedSchedules[j].day90alert == 'N') {
            this.card_form.controls["day90alert"].setValue('N');
          }
          if (this.curRec.activatedSchedules[j].day30alert == 'Y') {
            this.card_form.controls["day30alert"].setValue('Y');
          } else if (this.curRec.activatedSchedules[j].day30alert == 'N') {
            this.card_form.controls["day30alert"].setValue('N');
          }
          if (this.curRec.activatedSchedules[j].day7alert == 'Y') {
            this.card_form.controls["day7alert"].setValue('Y');
          } else if (this.curRec.activatedSchedules[j].day7alert == 'N') {
            this.card_form.controls["day7alert"].setValue('N');
          }
          var notifys = this.curRec.activatedSchedules[j].notifyprofiles;
          notifys = notifys.split(",");
          this.profilesNotify = this.card_form.get('profilesnotify') as FormArray;
          for (var l = 0; l < notifys.length; l++) {
            for (var k = 0; k < this.profilesNotify.length; k++) {
              if (Number(notifys[l].trim()) == this.profilesNotify.at(k).value.profileid) {
                var setSelected = this.profilesNotify.at(k) as FormGroup;
                setSelected.controls["selected"].setValue(true);
              } else {
                //console.log ('Nofifys id: ' + notifys[l].trim() + ' profilesNotify id: ' + this.profilesNotify.at(k).value.profileid);
              }
            }
          }
          this.card_form.markAsPristine();
        }
      }
      if (!isActivated) {
        this.hasActiveSched = false;
        console.log('Schedule is not activated for profile: ' + this.activeProfileID);
        this.card_form.controls["actschedid"].setValue(null);
        this.card_form.controls["interval"].setValue(this.curRec.interval);
        strNextDate = this.yearDefaultNext + "-" + String(this.monthDefaultNext) + '-01';
        this.card_form.controls["nextdate"].setValue(strNextDate);
        this.card_form.controls["contactid"].setValue(null);
        console.log('ContactId should be null - 2: ' + this.card_form.controls["contactid"].value);
        this.card_form.controls["day90alert"].setValue('N');
        this.card_form.controls["day30alert"].setValue('Y');
        this.card_form.controls["day7alert"].setValue('N');
        this.card_form.markAsPristine();
      }
    } else {
      this.hasActiveSched = false;
      if (this.curRec !== undefined) {
        this.card_form.controls["interval"].setValue(this.curRec.interval);
      } else {
        this.card_form.controls["interval"].setValue(296); //Annually as default
      }
      console.log('Schedule is not activated for profile: ' + this.activeProfileID);
      this.card_form.controls["actschedid"].setValue(null);
      strNextDate = this.yearDefaultNext + "-" + String(this.monthDefaultNext) + '-01';
      console.log('Next Date: ' + strNextDate);
      this.card_form.controls["nextdate"].setValue(strNextDate);
      this.card_form.controls["contactid"].setValue(null);
      console.log('ContactId should be null - 1: ' + this.card_form.controls["contactid"].value);
      this.card_form.controls["day90alert"].setValue('N');
      this.card_form.controls["day30alert"].setValue('Y');
      this.card_form.controls["day7alert"].setValue('N');
      this.card_form.markAsPristine();
    }
    this.readProfilesNotify();
    this.loadContacts(listFilter);

  }

  readTargetDate() {
    console.log('Target Value: ' + this.card_form.controls["nextdate"].value);
    console.log('Target: ', this.card_form.controls["nextdate"]);
  }

  getMaxDate() {
    if (this.yearDefaultNext == undefined || this.yearDefaultNext == null) {
      this.yearDefaultNext = moment(new Date()).format('YYYY');
      console.log('Had to set yearDefaultNext in getMaxDate: ' + this.yearDefaultNext);
    }

    var maxYear = Number(this.yearDefaultNext) + 5;
    return String(maxYear) + '-12-31';
  }

  readProfilesNotify() {
    var isSelected = false;
    this.profilesNotify = this.card_form.get('profilesnotify') as FormArray;
    for (var j = 0; j < this.profilesNotify.length; j++) {
      if (this.profilesNotify.at(j).value.selected) {
        isSelected = true;
      } else {
        //console.log("from readProfilesNotify - j = " + j + " answer is " + this.profilesNotify.at(j).value.selected);
      }
    }
    this.notifySelected = isSelected;
    console.log('Notify Selected: ' + this.notifySelected);
  }

  createItem(): FormGroup {
    return this.formBuilder.group({
      profileid: new FormControl(),
      firstname: new FormControl(),
      photopath: new FormControl(),
      selected: new FormControl(),
    });
  }

  addItem(): void {
    this.profilesNotify = this.card_form.get('profilesnotify') as FormArray;
    this.profilesNotify.push(this.createItem());
  }

  addExistingProfiles() {
    this.profilesNotify = this.card_form.get('profilesnotify') as FormArray;
    this.profilesNotify.removeAt(0);
    for (var j = 0; j < this.RestService.Profiles.length; j++) {
      this.profilesNotify.push(this.addExistingProfile(j));
    }
  }

  addExistingProfile(index): FormGroup {
    return this.formBuilder.group({
      profileid: new FormControl(this.RestService.Profiles[index].profileid),
      firstname: new FormControl(this.RestService.Profiles[index].title),
      photopath: new FormControl(this.RestService.Profiles[index].imageURL),
      selected: new FormControl(false),
    });
  }

  presentLoadingDefault() {
    //console.log('present Loading');
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
