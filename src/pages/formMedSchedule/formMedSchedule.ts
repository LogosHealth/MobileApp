import { Component } from '@angular/core';
import { NavController, NavParams, AlertController, LoadingController, ViewController } from 'ionic-angular';
import { Validators, FormGroup, FormControl, FormArray, FormBuilder } from '@angular/forms';
import { RestService } from '../../app/services/restService.service';
import { HistoryItemModel } from '../../pages/history/history.model';
import { Eligible } from '../../pages/listSchedule/listSchedule.model';
//import { ToDoNotify } from '../../pages/listVisit/listVisit.model';
import { TreatmentResult, ScheduleTime, ScheduleTimes } from '../../pages/listMedication/listMedication.model';

var moment = require('moment-timezone');

@Component({
  selector: 'formSchedule-page',
  templateUrl: 'formMedSchedule.html'
})
export class FormMedSchedule {
  loading: any;
  section: string;
  titleName: string;
  targetDate: string;
  formName: string = "formMedSchedule";
  recId: number;
  card_form: FormGroup;
  profilesNotify: FormArray;
  curRec: any;
  newTask: boolean = false;
  newRec: boolean = false;
  saving: boolean = false;
  saved: boolean = false;
  showTips: boolean = true;
  isNotSelected: boolean = true;
  notifySelected: boolean = false;
  hasActiveSched: boolean = true;
  activeProfileID: number;
  profiles = [];
  realProfiles = [];
  modelSave: TreatmentResult  = new TreatmentResult();
  category: HistoryItemModel = new HistoryItemModel();
  userTimezone: any;
  timeNow: any;
  hourNow: any;
  minuteNow: any;
  momentNow: any;
  monthNow: any;
  yearNow: any;
  startDateOffset: any;
  tzoffset: any;
  monthDefaultNext: any;
  yearDefaultNext: any;
  categories_checkbox_open: boolean;
  categories_checkbox_result;
  times: FormArray;
  timesData: ScheduleTimes = new ScheduleTimes();
  fromTreatment: any;
  medication: any;
  mode: any;
  medCompleted: boolean = false;
  isNotify: boolean = false;
  isActiveMode: boolean = false;
  isDisabled: boolean = true;
  doseOffset: number = 0;
  endDateCalc: any;

  constructor(public nav: NavController, public alertCtrl: AlertController, public RestService:RestService,
    public navParams: NavParams, public loadingCtrl: LoadingController,
    public formBuilder: FormBuilder, public viewCtrl: ViewController) {

    //this.recId = navParams.get('recId');
    this.fromTreatment = navParams.get('fromTreatment');
    this.medication = navParams.get('medication');

    console.log('MedSchedule fromTreatment: ', this.fromTreatment);
    console.log('MedSchedule medication: ', this.medication);

    if (this.medication !== undefined && this.medication.mode !== undefined) {
      this.mode = this.medication.mode;
    }
    if (this.medication !== undefined && this.medication !== null && this.medication.completeflag !== undefined) {
      if (this.medication.completeflag == 'Y') {
        this.medCompleted = true;
      }
    }

    //this.curRec = RestService.results[this.recId];
    var self = this;
    this.RestService.curProfileObj(function (error, results) {
      if (!error) {
        self.userTimezone = results.timezone;
      }
    });
    this.momentNow = moment(new Date());
    this.tzoffset = (new Date()).getTimezoneOffset() /60; //offset in hours

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
    //console.log("Hour Now: " + this.hourNow + ", Minute Now:  " + this.minuteNow + ", Time Now" + this.timeNow);
    if (this.monthNow < 11) {
      this.monthDefaultNext = Number(this.monthNow) + 2;
      if (this.monthDefaultNext < 10) {
        this.monthDefaultNext = '0' + String(this.monthDefaultNext);
      } else {
        this.monthDefaultNext = String(this.monthDefaultNext);
        this.yearDefaultNext = String(this.yearNow);
      }
      //console.log('Month Next: ' + this.monthDefaultNext);
    } else if (this.monthNow == 11) {
      this.monthDefaultNext = '01';
      //console.log('Month Next: ' + this.monthDefaultNext);
      this.yearDefaultNext = String(Number(this.yearNow) +1);
    } else { //month is 12
      this.monthDefaultNext = '02';
      this.yearDefaultNext = String(Number(this.yearNow) +1);
      //console.log('Month Next: ' + this.monthDefaultNext);
    }
    //console.log('Month Default Next:' + this.monthDefaultNext);
    var eligibles = [];
    var eligible: Eligible = new Eligible();
    for (var j = 0; j < this.RestService.Profiles.length; j++) {
      eligible = new Eligible();
      eligible.profileid = this.RestService.Profiles[j].profileid;
      eligible.firstname = this.RestService.Profiles[j].title;
      eligible.photopath = this.RestService.Profiles[j].imageURL;
      eligibles.push(eligible);
    }
    this.profiles = eligibles;

    if (this.fromTreatment.isnotify !== undefined && this.fromTreatment.isnotify == 'Y') {
      this.isNotify = true;
    }

    var doseState;
    if (this.fromTreatment.dosetrackingstate !== undefined && this.fromTreatment.dosetrackingstate !== null) {
      doseState = this.fromTreatment.dosetrackingstate;
    } else {
      doseState = 'activated';
    }
    console.log('Dose State: ' + doseState);

    var notifyOffset;
    if (this.fromTreatment.notifyoffset !== undefined && this.fromTreatment.notifyoffset !== null) {
      notifyOffset = this.fromTreatment.notifyoffset;
    } else {
      notifyOffset = 0;
    }

    this.card_form = new FormGroup({
      recordid: new FormControl(),
      treatmentid: new FormControl(this.fromTreatment.recordid),
      medicationname: new FormControl({value: this.medication.medicationname, disabled: true}),
      startdate: new FormControl({value: this.fromTreatment.startdate, disabled: true}),
      startinginventory: new FormControl({value: this.medication.startinginventory, disabled: true}),
      inventory: new FormControl({value: this.medication.inventory, disabled: true}),
      inventoryunit: new FormControl(this.medication.inventoryunit),
      dosage: new FormControl({value: this.fromTreatment.dosage, disabled: true}),
      doseunits: new FormControl(this.fromTreatment.doseunits),
      dosefrequency: new FormControl({value: this.fromTreatment.dosefrequency, disabled: true}),
      enddate: new FormControl({value: this.fromTreatment.enddate, disabled: true}),
      projectedenddate: new FormControl({value: null, disabled: true}),
      dosetrackingtype: new FormControl({value: this.fromTreatment.dosetrackingtype, disabled: true}),
      dosetrackingstate: new FormControl(doseState),
      isnotify: new FormControl(this.isNotify),
      notifyoffset: new FormControl(notifyOffset),
      notifyprofiles: new FormControl(this.fromTreatment.notifyprofiles),
      active: new FormControl('Y'),
      profilesnotify: this.formBuilder.array([ this.createItem() ], Validators.required),
      times: this.formBuilder.array([]),
    });
    console.log('Dose Units - initial entry: ', this.card_form.get('doseunits').value);
    this.addExistingProfiles();
  }

  ionViewWillEnter() {
    var dtNow = moment(new Date());
    var dtExpiration = moment(this.RestService.AuthData.expiration);
    var self = this;

    if (dtNow < dtExpiration) {
      this.presentLoadingDefault();
      this.loadDetails();
      this.loading.dismiss();
    } else {
      this.presentLoadingDefault();
      this.RestService.refreshCredentials(function(err, results) {
        if (err) {
          console.log('Need to login again!!! - Credentials expired from formMedicalEvent');
          self.loading.dismiss();
          self.RestService.appRestart();
        } else {
          console.log('From formMedicalEvent - Credentials refreshed!');
          self.loadDetails();
          self.loading.dismiss();
        }
      });
    }
  }

  ionViewWillLeave() {
    var data;
    console.log('ionViewWillLeave() called');
    if (this.saved) {
      data = this.fromTreatment;
      console.log('Data saved and sent for extract', data);
    } else {
      data = null;
    }
    this.nav.getPrevious().data.newSched = data;
  }

  loadDetails() {
    //this.presentLoadingDefault();
    var restURL: string;
    restURL="https://ap6oiuyew6.execute-api.us-east-1.amazonaws.com/dev/DoseScheduleTreatment";
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
            treatmentid: this.fromTreatment.recordid,
        }
    };
    var body = '';
    var self = this;

    apigClient.invokeApi(params, pathTemplate, method, additionalParams, body)
    .then(function(result){
      console.log('Result from medSched.loaddetails: ', result);
      console.log('result.data.length: ', result.data.length);
      console.log('result.data[0].recordid: ', result.data[0].recordid);
      if (result.data.length > 0 && result.data[0].recordid !== undefined) {
        self.timesData.items = [];
        self.timesData.items = result.data;
        self.newRec = false;
        self.addExistingTimes();
        self.loading.dismiss();
      } else {
        console.log('No data from getDetails');
        self.newRec = true;
        self.addNewTimes();
        self.loading.dismiss();
      }
    }).catch( function(result){
      console.log('Err from formMedication.loadDetails: ', result);
      self.loading.dismiss();
      alert('There was an error retrieving this data.  Please try again later');
    });
  }

  leaveRecord() {
    this.nav.pop();
  }

  saveRecord(){
    var dtNow = moment(new Date());
    var dtExpiration = moment(this.RestService.AuthData.expiration);
    var self = this;

    if (dtNow < dtExpiration) {
      if (this.newRec && this.endDateCalc.hasPastDose) {
        this.confirmBackDate(function(err, result) {
          if (err) {
            console.log('Err from confirmBackDate: ' + err);
          } else {
            if (result == true) {
              self.presentLoadingDefault();
              self.saveRecordDo();
            }
          }
        });
      } else {
        this.presentLoadingDefault();
        this.saveRecordDo();
      }
    } else {
      this.presentLoadingDefault();
      this.RestService.refreshCredentials(function(err, results) {
        if (err) {
          console.log('Need to login again!!! - Credentials expired from formChooseNotify.saveRecord');
          self.loading.dismiss();
          self.RestService.appRestart();
        } else {
          console.log('From formChooseNotify.saveRecord - Credentials refreshed!');
          if (self.newRec && self.endDateCalc.hasPastDose) {
            self.loading.dismiss();
            self.confirmBackDate(function(err, result) {
              if (err) {
                console.log('Err from confirmBackDate: ' + err);
                self.loading.dismiss();
              } else {
                if (result == true) {
                  self.presentLoadingDefault();
                  self.saveRecordDo();
                }
              }
            });
          } else {
            self.saveRecordDo();
          }
        }
      });
    }
  }

  saveRecordDo(){
    var strProfiles = "";
    this.saving = true;

    this.modelSave.recordid = this.card_form.get('treatmentid').value;
    this.modelSave.profileid = this.RestService.currentProfile;
    this.modelSave.userid = this.RestService.userId;
    this.modelSave.dosetrackingstate = this.card_form.get('dosetrackingstate').value;
    this.modelSave.active = 'Y';

    if (this.userTimezone !== undefined) {
      this.modelSave.timezone = this.userTimezone;
    }
    if (this.card_form.get('isnotify').value == true) {
      this.modelSave.isnotify = 'Y';
    } else {
      this.modelSave.isnotify = 'N';
    }
    if (this.card_form.get('notifyoffset').dirty){
      this.modelSave.notifyoffset = this.card_form.get('notifyoffset').value;
      this.fromTreatment.notifyoffset = this.card_form.get('notifyoffset').value;
    }
    if (this.endDateCalc.hasPastDose) {
      this.modelSave.backCalculate = 'Y';
      this.modelSave.backCalculateFrom = this.medication.inventory;
      this.modelSave.reftablefieldid = this.medication.recordid;
      if (this.fromTreatment !== undefined && this.fromTreatment.startDate !== undefined) {
        this.modelSave.startdate = this.fromTreatment.startDate;
      }
      if (this.fromTreatment !== undefined && this.fromTreatment.dosage !== undefined) {
        this.modelSave.dosage = this.fromTreatment.dosage;
      }
      if (this.fromTreatment !== undefined && this.fromTreatment.doseunits !== undefined) {
        this.modelSave.doseunits = this.fromTreatment.doseunits;
      }
      if (this.fromTreatment !== undefined && this.fromTreatment.startdate !== undefined) {
        this.modelSave.startdate = this.fromTreatment.startdate;
      }
    }

    if (this.profilesNotify.dirty) {
      for (var j = 0; j < this.profilesNotify.length; j++) {
        if (this.profilesNotify.at(j).value.selected) {
          strProfiles = strProfiles + this.profilesNotify.at(j).value.profileid + ', ';
        }
      }
      strProfiles = strProfiles.substring(0, strProfiles.length -2);
      console.log('String Profiles final: ' + strProfiles);
      this.modelSave.notifyprofiles = strProfiles;
      this.fromTreatment.notifyprofiles = strProfiles;
    }

    this.times = this.card_form.get('times') as FormArray;
    if (this.times.dirty) {
      var impTimes: ScheduleTimes = new ScheduleTimes();
      var impTime: ScheduleTime;
      var timeForm;

      impTimes.items = [];

      for (j = 0; j < this.times.length; j++) {
        timeForm = this.times.at(j) as FormGroup;
        if (timeForm.dirty) {
          impTime = new ScheduleTime();
          impTime.recordid = timeForm.get("recordid").value;
          impTime.treatmentid = this.card_form.get('treatmentid').value;
          impTime.profileid = this.RestService.currentProfile;
          impTime.dosenumber = timeForm.get("dosenumber").value;
          if (timeForm.get("startdate").dirty) {
            impTime.startdate = timeForm.get("startdate").value;
          }
          if (timeForm.get("dosetime").dirty) {
            impTime.dosetime = timeForm.get("dosetime").value;
          }
          impTimes.items.push(impTime);
        }
      }
      this.modelSave.scheduletimes = impTimes;
      this.fromTreatment.scheduletimes = impTimes;
    }

    var restURL="https://ap6oiuyew6.execute-api.us-east-1.amazonaws.com/dev/DoseScheduleTreatment";
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
          userid: this.RestService.userId
      }
    };

    var body;
    //MM 10-5-18 Custom dirty represents that the scheduleModelSave object needs to be sent
    body = JSON.stringify(this.modelSave);
    var self = this;
    console.log('Calling Post', this.modelSave);
    apigClient.invokeApi(params, pathTemplate, method, additionalParams, body)
    .then(function(result){
      self.card_form.markAsPristine();
      self.category.title = "Visit";
      self.saved = true;
      self.loading.dismiss();
      self.dismiss();
    }).catch( function(result){
      alert('There is an error in updating the schedule.  It has been logged and will be reviewed by technical support');
      console.log('Result: ',result);
      console.log(body);
      self.category.title = "Visit";
      self.loading.dismiss();
      self.dismiss();
      alert('There was an error saving this data.  Please try again later');
    });
}

  public today() {
    return moment().format('YYYY-MM-DD');;
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

  confirmBackDate(callback) {
    const alert = this.alertCtrl.create({
      title: 'Start Date is in the past',
      message: "When activating a passive dose schedule which starts in the past, Logos Health will back-populate the dose history and adjust the inventory.  Continue?",
      buttons: [
        {
          text: 'No',
          role: 'cancel',
          handler: () => callback(null, false)
        },
        {
          text: 'Yes',
          handler: () => callback(null, true)
        }
      ]
    });
    alert.present();
    //console.log('Confirm Leave Answer: ', canLeave);
  }

  readTargetDate() {
    console.log('Target Value: ' + this.card_form.controls["nextdate"].value);
    console.log('Target: ', this.card_form.controls["nextdate"]);
  }

  getMaxDate() {
    var maxYear = Number(this.yearDefaultNext) + 5;
    return String(maxYear) + '-12-31';
  }

  readProfilesNotify() {
    var isSelected = false;
    this.profilesNotify = this.card_form.get('profilesnotify') as FormArray;
    //console.log("from readProfilesNotify - profilesNotify.length: ", this.profilesNotify);
    for (var j = 0; j < this.profilesNotify.length; j++) {
      if (this.profilesNotify.at(j).value.selected) {
        isSelected = true;
      }
    }
    this.notifySelected = isSelected;
    //console.log('Notify Selected: ' + this.notifySelected);
    console.log('readProfilesNotify isNotify: ' + this.isNotify);
    return this.isNotify;
  }

 populateProfilesNotify() {
  if (this.fromTreatment.notifyprofiles !== undefined && this.fromTreatment.notifyprofiles !== null && this.fromTreatment.notifyprofiles !== "") {
    var notp = this.fromTreatment.notifyprofiles;
    var notifys = notp.split(",");
    this.profilesNotify = this.card_form.get('profilesnotify') as FormArray;
    for (var l = 0; l < notifys.length; l++) {
      for (var k = 0; k < this.profilesNotify.length; k++) {
        if (Number(notifys[l].trim()) == this.profilesNotify.at(k).value.profileid) {
          this.profilesNotify.at(k).get("selected").setValue(true);
          //console.log('Set selected for ' + this.profilesNotify.at(k).value.profileid);
        }
      }
    }
    this.card_form.markAsPristine();
  }
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
    this.realProfiles = this.RestService.getRealProfiles();
    for (var j = 0; j < this.realProfiles.length; j++) {
      this.profilesNotify.push(this.addExistingProfile(j));
    }
    console.log('Profiles Notify ', this.profilesNotify);
    this.populateProfilesNotify();
  }

  addExistingProfile(index): FormGroup {
    return this.formBuilder.group({
      profileid: new FormControl(this.realProfiles[index].profileid),
      firstname: new FormControl(this.realProfiles[index].title),
      photopath: new FormControl(this.realProfiles[index].imageURL),
      selected: new FormControl(false),
    });
  }

  addExistingTimes() {
    this.times = this.card_form.get('times') as FormArray;
    if (this.timesData !== undefined && this.timesData.items.length > 0 && this.timesData.items[0].recordid !== undefined) {
        var exitLoop = 0;
        while (this.times.length !== 0 || exitLoop > 9) {
          this.times.removeAt(0);
          exitLoop = exitLoop + 1;
        }

        for (var j = 0; j < this.timesData.items.length; j++) {
          this.times.push(this.addExistingTime(j));
        }
      console.log('Once symptoms are saved with medical event');
    }
    this.projectEndDate();
  }

  addExistingTime(index): FormGroup {
    return this.formBuilder.group({
      recordid: new FormControl({value: this.timesData.items[index].recordid, disabled: true}),
      treatmentid: new FormControl({value: this.timesData.items[index].treatmentid, disabled: true}),
      profileid: new FormControl({value: this.timesData.items[index].profileid, disabled: true}),
      startdate: new FormControl({value: this.timesData.items[index].startdate, disabled: true}),
      dosenumber: new FormControl({value: this.timesData.items[index].dosenumber, disabled: true}),
      dosetime: new FormControl(this.timesData.items[index].dosetime),
    });
  }

  addNewTimes() {
    this.times = this.card_form.get('times') as FormArray;
    var exitLoop = 0;
    var timesCount = 0;
    var doseFrequency;

    while (this.times.length !== 0 || exitLoop > 9) {
      this.times.removeAt(0);
      exitLoop = exitLoop + 1;
    }

    doseFrequency = this.fromTreatment.dosefrequency;
    this.card_form.get('dosefrequency').setValue(this.fromTreatment.dosefrequency);
    this.card_form.get('dosetrackingtype').setValue(this.fromTreatment.dosetrackingtype);

    if (doseFrequency == 'Once Daily') {
      timesCount = 1;
    } else if (doseFrequency == 'Twice Daily'){
      timesCount = 2;
      this.doseOffset = 12;
    } else if (doseFrequency == 'Every 8 Hours'){
      timesCount = 3;
      this.doseOffset = 8;
    } else if (doseFrequency == 'Every 6 Hours'){
      timesCount = 4;
      this.doseOffset = 6;
    } else if (doseFrequency == 'Every 4 Hours'){
      timesCount = 6;
      this.doseOffset = 4;
    }

    console.log('AddNewTimes - count: ' + timesCount);
    for (var j = 0; j < timesCount; j++) {
        this.times.push(this.addNewTime(j));
    }
    this.projectEndDate();
  }

  addNewTime(index): FormGroup {
    return this.formBuilder.group({
      recordid: new FormControl({value: null, disabled: true}),
      treatmentid: new FormControl({value: null, disabled: true}),
      profileid: new FormControl({value: null, disabled: true}),
      startdate: new FormControl({value: null, disabled: true}),
      dosenumber: new FormControl({value: index + 1, disabled: true}, Validators.required),
      dosetime: new FormControl(null, Validators.required),
    });
  }

  projectEndDate() {
    this.endDateCalc = {
      inventory: this.medication.inventory,
      startDate: moment(this.fromTreatment.startdate),
      nowDate: this.momentNow,
      dosefrequency: this.fromTreatment.dosefrequency,
      dosage: this.fromTreatment.dosage,
      newRec: this.newRec,
    }
    //console.log('Initial Start Date = ' + this.endDateCalc.startDate.format('MMM-DD-YY hh:mm a'));
    //console.log('Initial Start Date String = ' + this.fromTreatment.startdate);

    if (this.endDateCalc.dosefrequency == 'Once Daily') {
      this.endDateCalc.perDay = 1;
    } else if (this.endDateCalc.dosefrequency == 'Twice Daily'){
      this.endDateCalc.perDay = 2;
    } else if (this.endDateCalc.dosefrequency == 'Every 8 Hours'){
      this.endDateCalc.perDay = 3;
    } else if (this.endDateCalc.dosefrequency == 'Every 6 Hours'){
      this.endDateCalc.perDay = 4;
    } else if (this.endDateCalc.dosefrequency == 'Every 4 Hours'){
      this.endDateCalc.perDay = 6;
    } else {
      console.log('Error with dosefrequency value: ' + this.endDateCalc.dosefrequency);
      this.endDateCalc.perDay = 1;
    }

    this.endDateCalc.perDay = this.endDateCalc.perDay * Number(this.endDateCalc.dosage);
    this.endDateCalc.daysCovered = Math.trunc(this.endDateCalc.inventory/this.endDateCalc.perDay);
    console.log('Days Covered: ' + this.endDateCalc.daysCovered + ', inventory: ' + this.endDateCalc.inventory + ', ' +
    ', perDay: ' + this.endDateCalc.perDay);

    if (this.endDateCalc.newRec) {
      var dtStart = moment(this.fromTreatment.startdate);
      this.startDateOffset = (new Date(this.fromTreatment.startdate)).getTimezoneOffset() /60; //offset in hours

      //moment automatically treats as UTC - so have to acccount by adding offset
      dtStart = dtStart.add(this.startDateOffset, 'hours');
      this.endDateCalc.startDate = this.endDateCalc.startDate.add(this.startDateOffset, 'hours');
      this.endDateCalc.projEndDT = dtStart.add(this.endDateCalc.daysCovered, 'days');

      if (this.fromTreatment.dosetrackingstate == 'paused') {
        this.endDateCalc.projEndDate = 'N/A';
      } else {
        this.endDateCalc.projEndDate = this.endDateCalc.projEndDT.format('MMM-DD-YY');
      }
      //console.log('Start date after calc end date: ' + this.endDateCalc.startDate.format('MMM-DD-YY hh:mm a'))
      if (this.fromTreatment.dosetrackingtype == 'passive') {
        if (this.endDateCalc.startDate < this.endDateCalc.nowDate) {
          this.endDateCalc.hasPastDose = true;
          //this.endDateCalc.backDateDays = this.endDateCalc.nowDate.diff(this.endDateCalc.startDate, 'days');
          //console.log('Is past date: backDateDays = ' + this.endDateCalc.backDateDays);
          console.log('Is past date: Start Date = ' + this.endDateCalc.startDate.format('MMM-DD-YY hh:mm a'));
          console.log('Is past date: Now Date = ' + this.endDateCalc.nowDate.format('MMM-DD-YY hh:mm a'));
        } else {
          console.log('Not past date: Start Date = ' + this.endDateCalc.startDate.format('MMM-DD-YY hh:mm a'));
          console.log('Not past date: Now Date = ' + this.endDateCalc.nowDate.format('MMM-DD-YY hh:mm a'));
          this.endDateCalc.hasPastDose = false;
        }
      } else {
        this.endDateCalc.hasPastDose = false;
      }
    } else {
      this.endDateCalc.projEndDate = this.endDateCalc.nowDate.add(this.endDateCalc.daysCovered, 'days').format('MMM-DD-YY');
      this.endDateCalc.hasPastDose = false;
    }


    if (this.mode !== undefined && this.mode == 'cabinet') {
      this.card_form.get('projectedenddate').setValue(this.endDateCalc.projEndDate);
      console.log('End Date Calc: ', this.endDateCalc);
    }

    //Sets the notify flag and disables if tracking mode is active
    if (this.fromTreatment.dosetrackingtype == 'active') {
      this.card_form.get('isnotify').setValue(true);
      this.isNotify = true;
      this.isActiveMode = true;
    }

  }

  checkNotify() {
    //console.log('check Notify ', this.card_form.get('isnotify').value);
    this.isNotify = this.card_form.get('isnotify').value;
    }

  saveNotReady() {
    var isNotifyLocal = this.readProfilesNotify();
    console.log('isNotifyLocal from saveNotReady: ' + isNotifyLocal);

    var returnVal = false;
    if (this.isNotify) {
      if (!this.card_form.dirty || !this.card_form.valid || !this.notifySelected) {
        returnVal = true;
      }
    } else {
      if (!this.card_form.dirty || !this.card_form.valid) {
        returnVal = true;
      }
    }

    return returnVal;
  }

  dismiss() {
    var data;
    console.log('Choose Notify dismissed called');
    if (this.saved) {
      data = this.modelSave;
      console.log('Data saved and sent for extract');
    } else {
      data = null;
    }
    this.viewCtrl.dismiss(data);
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
