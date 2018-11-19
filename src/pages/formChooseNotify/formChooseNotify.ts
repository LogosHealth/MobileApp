import { Component } from '@angular/core';
import { NavController, NavParams, AlertController, LoadingController, ViewController } from 'ionic-angular';
import { Validators, FormGroup, FormControl, FormArray, FormBuilder } from '@angular/forms';
import { RestService } from '../../app/services/restService.service';
import { HistoryItemModel } from '../../pages/history/history.model';
import { ListSchedule, ActivatedSchedule, ActivatedSchedules, Eligibles, Eligible } from '../../pages/listSchedule/listSchedule.model';
import { ToDoNotify } from '../../pages/listVisit/listVisit.model';
import { DictionaryModel, DictionaryItem } from '../../pages/models/dictionary.model';
import { DictionaryService } from '../../pages/models/dictionary.service';
import { ListContactModel } from '../../pages/listContacts/listContacts.model';
import { ListContactService } from '../../pages/listContacts/listContacts.service';


var moment = require('moment-timezone');

@Component({
  selector: 'formSchedule-page',
  templateUrl: 'formChooseNotify.html'
})
export class FormChooseNotify {
  loading: any;
  section: string;
  titleName: string;
  targetDate: string;
  formName: string = "formChooseNotify";
  recId: number;
  todoIndex: number;
  objectType: any;
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
  //profilesNotify = FormArray;
  scheduleModelSave: ListSchedule  = new ListSchedule();
  scheduleSave: ActivatedSchedule = new ActivatedSchedule();
  scheduleSaveArray: ActivatedSchedules = new ActivatedSchedules();

  modelSave: ToDoNotify  = new ToDoNotify();

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
    public listContactService: ListContactService, public formBuilder: FormBuilder, public viewCtrl: ViewController) {

  //MM 10-30-18 There are currently three scenarios which will triggers this form corresponding to objecttype - "visit", "task", "todo for visit"
  //"visit" - curRec will be the visit obj - todonotify will be the child obj visitreminder
  //"task" - curRec will be the task obj - todonotify will the the child obj taskreminder
  //"todo for visit" - curRec will be visit obj, todoIndex will be populated, and the todonotify will be the notifyschedule obj attached to the appropriate todo by index
    this.recId = navParams.get('recId');
    this.todoIndex = navParams.get('todoIndex');
    this.objectType = navParams.get('object');
    this.curRec = RestService.results[this.recId];
    console.log('choooseNotify inputs: recId: ' + this.recId + ', todoindex: ' + this.todoIndex);
    console.log('Cur rec from chooseInfo: ', this.curRec);

  //MM 10-30-18 We will use the objectType to drive population into a generic todo object
    if (this.objectType == "visit") {
      this.titleName = "Visit " + this.curRec.physician.title;
      this.targetDate = this.curRec.visitdate;
      if (this.curRec.visitreminder !== undefined && this.curRec.visitreminder !== null) {
        this.modelSave.recordid = this.curRec.visitreminder.recordid;
        this.modelSave.taskid = this.curRec.visitreminder.taskid;
        this.modelSave.visitid = this.curRec.visitreminder.visitid;
        this.modelSave.notifyprofiles = this.curRec.visitreminder.notifyprofiles;
        this.modelSave.alerttitle = this.curRec.visitreminder.alerttitle;
        this.modelSave.alerttext = this.curRec.visitreminder.alerttext;
        this.modelSave.targetdate = this.curRec.visitreminder.targetdate;
        this.modelSave.daybefore = this.curRec.visitreminder.daybefore;
        this.modelSave.nightbefore = this.curRec.visitreminder.nightbefore;
        this.modelSave.morningof = this.curRec.visitreminder.morningof;
        this.modelSave.hourbefore = this.curRec.visitreminder.hourbefore;
        this.modelSave.thirtyminute = this.curRec.visitreminder.thirtyminute;
        this.modelSave.fifteenminute = this.curRec.visitreminder.fifteenminute;
        this.modelSave.active = this.curRec.visitreminder.active;
      } else {
        this.newRec = true;
        this.modelSave.visitid = this.curRec.recordid;
        this.modelSave.alerttitle = "visit " + this.curRec.physician.title;
        this.modelSave.alerttext = "In preparation for " + this.curRec.firstname + " to visit " + this.curRec.physician.title + " on " + this.formatDateTime(this.curRec.visitdate);
        this.modelSave.targetdate = this.curRec.visitdate;
        this.modelSave.daybefore = 'N';
        this.modelSave.nightbefore = 'N';
        this.modelSave.morningof = 'Y';
        this.modelSave.hourbefore = 'N';
        this.modelSave.thirtyminute = 'Y';
        this.modelSave.fifteenminute = 'N';
        this.modelSave.active = 'Y';
      }
    } else if (this.objectType == "task") {
      console.log('Put task code here: ');

    } else if (this.objectType == "todo for visit") {
      this.titleName = this.curRec.todos.items[this.todoIndex].taskname;
      this.targetDate = this.curRec.todos.items[this.todoIndex].duedate;
      if (this.curRec.todos.items[this.todoIndex].notifyschedule !== undefined && this.curRec.todos.items[this.todoIndex].notifyschedule !== null) {
        this.modelSave.recordid = this.curRec.todos.items[this.todoIndex].notifyschedule.recordid;
        this.modelSave.taskid = this.curRec.todos.items[this.todoIndex].notifyschedule.taskid;
        this.modelSave.visitid = this.curRec.todos.items[this.todoIndex].notifyschedule.visitid;
        this.modelSave.notifyprofiles = this.curRec.todos.items[this.todoIndex].notifyschedule.notifyprofiles;
        this.modelSave.alerttitle = this.curRec.todos.items[this.todoIndex].notifyschedule.alerttitle;
        this.modelSave.alerttext = this.curRec.todos.items[this.todoIndex].notifyschedule.alerttext;
        this.modelSave.targetdate = this.curRec.todos.items[this.todoIndex].notifyschedule.targetdate;
        this.modelSave.daybefore = this.curRec.todos.items[this.todoIndex].notifyschedule.daybefore;
        this.modelSave.nightbefore = this.curRec.todos.items[this.todoIndex].notifyschedule.nightbefore;
        this.modelSave.morningof = this.curRec.todos.items[this.todoIndex].notifyschedule.morningof;
        this.modelSave.hourbefore = this.curRec.todos.items[this.todoIndex].notifyschedule.hourbefore;
        this.modelSave.thirtyminute = this.curRec.todos.items[this.todoIndex].notifyschedule.thirtyminute;
        this.modelSave.fifteenminute = this.curRec.todos.items[this.todoIndex].notifyschedule.fifteenminute;
        this.modelSave.active = this.curRec.todos.items[this.todoIndex].notifyschedule.active;
      } else {
        this.newRec = true;
        this.modelSave.taskid = this.curRec.todos.items[this.todoIndex].recordid;
        if (this.modelSave.taskid == undefined || this.modelSave.taskid == null) {
          this.modelSave.visitid = this.curRec.recordid;
          this.newTask = true;
        }
        this.modelSave.alerttitle = this.curRec.todos.items[this.todoIndex].taskname;
        this.modelSave.alerttext = "In preparation for " + this.curRec.firstname + " to visit " + this.curRec.physician.title + " on " + this.formatDateTime(this.curRec.visitdate);
        this.modelSave.targetdate = this.curRec.todos.items[this.todoIndex].duedate;
        this.modelSave.daybefore = 'N';
        this.modelSave.nightbefore = 'N';
        this.modelSave.morningof = 'Y';
        this.modelSave.hourbefore = 'N';
        this.modelSave.thirtyminute = 'Y';
        this.modelSave.fifteenminute = 'N';
        this.modelSave.active = 'Y';
      }
    } else {
      console.log('Obj type not found: ' + this.objectType);
    }

    console.log('Visit Obj from formChooseNotify curRec: ', this.curRec);
    console.log('Model Save Loaded', this.modelSave);

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
      eligible.photopath = this.RestService.Profiles[j].image;
      eligibles.push(eligible);
    }
    this.profiles = eligibles;


    if (!this.newRec) {
      this.card_form = new FormGroup({
        recordid: new FormControl(this.modelSave.recordid),
        visitid: new FormControl(this.modelSave.visitid),
        taskid: new FormControl(this.modelSave.taskid),
        profilesnotify: this.formBuilder.array([ this.createItem() ], Validators.required),
        notifyprofiles: new FormControl(this.modelSave.notifyprofiles),
        alerttitle: new FormControl(this.modelSave.alerttitle),
        alerttext: new FormControl(this.modelSave.alerttext),
        targetdate: new FormControl(this.modelSave.targetdate),
        daybefore: new FormControl(this.modelSave.daybefore),
        nightbefore: new FormControl(this.modelSave.nightbefore),
        morningof: new FormControl(this.modelSave.morningof),
        hourbefore: new FormControl(this.modelSave.hourbefore),
        thirtyminutes: new FormControl(this.modelSave.thirtyminute),
        fifteenminutes: new FormControl(this.modelSave.fifteenminute),
        active: new FormControl(this.modelSave.active),
     });
    } else {
      //this.newRec = true;
      this.card_form = new FormGroup({
        recordid: new FormControl(),
        visitid: new FormControl(this.modelSave.visitid),
        taskid: new FormControl(this.modelSave.taskid),
        profilesnotify: this.formBuilder.array([ this.createItem() ], Validators.required),
        notifyprofiles: new FormControl(),
        alerttitle: new FormControl(this.modelSave.alerttitle),
        alerttext: new FormControl(this.modelSave.alerttext),
        targetdate: new FormControl(this.modelSave.targetdate),
        daybefore: new FormControl(this.modelSave.daybefore),
        nightbefore: new FormControl(this.modelSave.nightbefore),
        morningof: new FormControl(this.modelSave.morningof),
        hourbefore: new FormControl(this.modelSave.hourbefore),
        thirtyminutes: new FormControl(this.modelSave.thirtyminute),
        fifteenminutes: new FormControl(this.modelSave.fifteenminute),
        active: new FormControl('Y'),
      });
    }
    this.addExistingProfiles();
  }

  ionViewWillEnter() {
    //this.loading = this.loadingCtrl.create();
    //this.loading.present();
  }

  leaveRecord() {
    this.nav.pop();
  }

  saveRecord(){
    var strProfiles = "";
    this.saving = true;

    this.loading = this.loadingCtrl.create();
    this.loading.present();


    if (this.profilesNotify.dirty) {
      for (var j = 0; j < this.profilesNotify.length; j++) {
        if (this.profilesNotify.at(j).value.selected) {
          strProfiles = strProfiles + this.profilesNotify.at(j).value.profileid + ', ';
          //console.log('Profile Id for profile Notify: ' + this.profilesNotify.at(j).value.profileid);
        }
      }
      strProfiles = strProfiles.substring(0, strProfiles.length -2);
      console.log('String Profiles final: ' + strProfiles);
      this.modelSave.notifyprofiles = strProfiles;
    }
    if (this.card_form.get('daybefore').dirty){
      this.modelSave.daybefore = this.card_form.get('daybefore').value;
    }
    if (this.card_form.get('nightbefore').dirty){
      this.modelSave.nightbefore = this.card_form.get('nightbefore').value;
    }
    if (this.card_form.get('morningof').dirty){
      this.modelSave.morningof = this.card_form.get('morningof').value;
    }
    if (this.card_form.get('hourbefore').dirty){
      this.modelSave.hourbefore = this.card_form.get('hourbefore').value;
    }
    if (this.card_form.get('thirtyminutes').dirty){
      this.modelSave.thirtyminute = this.card_form.get('thirtyminutes').value;
    }
    if (this.card_form.get('fifteenminutes').dirty){
      this.modelSave.fifteenminute = this.card_form.get('fifteenminutes').value;
    }


    var dtNow = moment(new Date());
    var dtExpiration = moment(this.RestService.AuthData.expiration);

    if (dtNow < dtExpiration) {
      var restURL="https://ap6oiuyew6.execute-api.us-east-1.amazonaws.com/dev/ReminderByEvent";

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
      var additionalParams;

      if (!this.newTask) {
        additionalParams = {
          queryParams: {
              userid: this.RestService.userId
          }
        };
        console.log('Not new task');
      } else {
        additionalParams = {
          queryParams: {
              userid: this.RestService.userId, action: 'createTask', profileid: this.curRec.profileid
          }
        };
        console.log('New task');
      }
      var body;

      //MM 10-5-18 Custom dirty represents that the scheduleModelSave object needs to be sent
      body = JSON.stringify(this.modelSave);

      var self = this;
      apigClient.invokeApi(params, pathTemplate, method, additionalParams, body)
      .then(function(result){
        //self.RestService.results = result.data;
        console.log('Happy Path: ', self.RestService.results);
        self.card_form.markAsPristine();
        //alert('This notification schedule has been successfully updated.');
        self.category.title = "Visit";
        self.saved = true;
        self.loading.dismiss();
        self.dismiss();
        //self.nav.pop();
      }).catch( function(result){
        alert('There is an error in updating the schedule.  It has been logged and will be reviewed by technical support');
        console.log('Result: ',result);
        console.log(body);
        self.category.title = "Visit";
        self.loading.dismiss();
        self.dismiss();
        //self.nav.pop();
      });
    } else {
      console.log('Need to login again!!! - Credentials expired from formSchedule - SaveData dtExpiration = ' + dtExpiration + ' dtNow = ' + dtNow);
      this.loading.dismiss();
      this.RestService.appRestart();
    }
  }

  public today() {
    return new Date().toISOString().substring(0,10);
  }

  formatDateTime(dateString) {
    //alert('FormatDateTime called');
    if (this.userTimezone !== undefined && this.userTimezone !=="") {
      return moment(dateString).tz(this.userTimezone).format('dddd, MMMM DD');
    } else {
      return moment(dateString).format('dddd, MMMM DD');
    }
  }

  formatDateTime2(dateString) {
    //alert('FormatDateTime called');
    if (this.userTimezone !== undefined && this.userTimezone !=="") {
      return moment(dateString).tz(this.userTimezone).format('MM-DD-YYYY hh:mm A');
    } else {
      return moment(dateString).format('MM-DD-YYYY hh:mm a');
    }
  }

  formatDateTime3(dateString) {
    var tzoffset = (new Date()).getTimezoneOffset() /60; //offset in hours
    var dtConvert = moment(dateString);
    dtConvert = moment(dtConvert).add(tzoffset, 'hours');
    return dtConvert.format('dddd, MMM DD hh:mm A');
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
        //console.log("from readProfilesNotify - j = " + j + " answer is " + this.profilesNotify.at(j).value.selected);
      } else {
        //console.log("from readProfilesNotify - j = " + j + " answer is " + this.profilesNotify.at(j).value.selected);
      }
    }
    this.notifySelected = isSelected;
    console.log('Notify Selected: ' + this.notifySelected);
  }

 populateProfilesNotify() {
  if (this.modelSave.notifyprofiles !== undefined && this.modelSave.notifyprofiles !== null && this.modelSave.notifyprofiles !== "") {
    var notp = this.modelSave.notifyprofiles;
    var notifys = notp.split(",");

    this.profilesNotify = this.card_form.get('profilesnotify') as FormArray;
    for (var l = 0; l < notifys.length; l++) {
      for (var k = 0; k < this.profilesNotify.length; k++) {
        if (Number(notifys[l].trim()) == this.profilesNotify.at(k).value.profileid) {
          this.profilesNotify.at(k).get("selected").setValue(true);
          //console.log('Set selected for ' + this.profilesNotify.at(k).value.profileid);
        } else {
          //console.log ('Nofifys id: ' + notifys[l].trim() + ' profilesNotify id: ' + this.profilesNotify.at(k).value.profileid);
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
    for (var j = 0; j < this.RestService.Profiles.length; j++) {
      this.profilesNotify.push(this.addExistingProfile(j));
    }
    console.log('Profiles Notify ', this.profilesNotify);
    this.populateProfilesNotify();
  }

  addExistingProfile(index): FormGroup {
    return this.formBuilder.group({
      profileid: new FormControl(this.RestService.Profiles[index].profileid),
      firstname: new FormControl(this.RestService.Profiles[index].title),
      photopath: new FormControl(this.RestService.Profiles[index].image),
      selected: new FormControl(false),
    });
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
}
