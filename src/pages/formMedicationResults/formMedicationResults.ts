import { Component } from '@angular/core';
import { NavController, NavParams, AlertController, LoadingController, PopoverController } from 'ionic-angular';
import { Validators, FormGroup, FormControl, FormArray, FormBuilder } from '@angular/forms';
import { RestService } from '../../app/services/restService.service';
import { TreatmentResult } from '../../pages/listMedication/listMedication.model';

import { HistoryItemModel } from '../../pages/history/history.model';
import { DictionaryModel, DictionaryItem } from '../../pages/models/dictionary.model';
import { ListOrderService } from '../../pages/listOrder/listOrder.service';
import { MenuTreatment } from '../../pages/menuTreatment/menuTreatment';
import { MenuHelp } from '../../pages/menuHelp/menuHelp';
import { FeedModel } from '../feed/feed.model';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/Rx';
import { CallNumber } from '@ionic-native/call-number';
import { FormMedSchedule } from '../../pages/formMedSchedule/formMedSchedule';

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

  listFilter: DictionaryModel = new DictionaryModel();
  medication: any;
  fromEvent: any;
  sideeffectdata: any;
  sideeffects: FormArray;

  constructor(public nav: NavController, public alertCtrl: AlertController, public RestService:RestService,
    public navParams: NavParams, public loadingCtrl: LoadingController, public list2Service: ListOrderService,
    public popoverCtrl:PopoverController, public formBuilder: FormBuilder, private callNumber: CallNumber
    ) {

    this.recId = navParams.get('recId');
    this.medication = navParams.get('medication');
    this.fromEvent = navParams.get('fromEvent');
    this.feed.category = navParams.get('category');

    if (this.feed.category == undefined || this.feed.category.title == undefined) {
      this.feed.category.title = 'Medication Info & Results';
    }
    //console.log('visitInfo: ', this.visitInfo);
    console.log('formMedication: recId: ' + this.recId );
    console.log('formMedication: medication: ', this.medication );
    console.log('formMedication: fromEvent: ', this.fromEvent );

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
    console.log('Init Medication - recId = ' + this.recId);
    if (this.recId !== undefined) {
      var allergy = false;
      if (this.curRec.allergyflag !== undefined && this.curRec.allergyflag == 'Y') {
        allergy = true;
      }
      var effective = true;
      if (this.curRec.effectiveflag !== undefined && this.curRec.effectiveflag == 'N') {
        effective = false;
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
        startdate: new FormControl(this.curRec.startdate),
        enddate: new FormControl(this.curRec.enddate),
        verbatimindication: new FormControl({value: this.curRec.verbatimindication, disabled: true}),
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
        dosetrackingtype: new FormControl(),

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
        startdate: new FormControl(),
        enddate: new FormControl(),
        verbatimindication: new FormControl({value: null, disabled: true}),
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
      restURL="https://ap6oiuyew6.execute-api.us-east-1.amazonaws.com/dev/SideEffectByMedication";
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
        self.loading.dismiss();
        self.sideeffectdata = result.data;
        self.addExistingSideEffects();
        console.log('formMedicationResults.loadDetails: ', self.curRec);
        self.loading.dismiss();
        }).catch( function(result){
          console.log('Err from formMedicationResults.loadDetails: ', result);
          self.loading.dismiss();
        });
     }
  }

  addExistingSideEffects() {
    console.log('Starting addExistingTreatmentResults');
    this.sideeffects = this.card_form.get('treatmentresults') as FormArray;
    if (this.sideeffectdata !== undefined && this.sideeffectdata.items !== undefined && this.sideeffectdata.items.length > 0) {
      var exitLoop = 0;

      while (this.sideeffects.length !== 0 || exitLoop > 9) {
        this.sideeffects.removeAt(0);
        exitLoop = exitLoop + 1;
      }
      for (var j = 0; j < this.curRec.treatmentresults.items.length; j++) {
        this.sideeffects.push(this.addExistingSideEffect(j));
      }
    }
  }

  addExistingSideEffect(index): FormGroup {
    console.log('Starting addExistingTreatmentResult index: ' + index);
    return this.formBuilder.group({
      recordid: new FormControl({value: this.sideeffectdata.items[index].recordid, disabled: true}),
      symptomid: new FormControl({value: this.sideeffectdata.items[index].symptomid, disabled: true}),
      medicaleventid: new FormControl({value: this.sideeffectdata.items[index].medicaleventid, disabled: true}),
      reftable: new FormControl({value: this.sideeffectdata.items[index].reftable, disabled: true}),
      reftablefield: new FormControl({value: this.sideeffectdata.items[index].reftablefield, disabled: true}),
      reftablefieldid: new FormControl({value: this.sideeffectdata.items[index].reftablefieldid, disabled: true}),
      reftablefields: new FormControl({value: this.sideeffectdata.items[index].reftablefields, disabled: true}),
      type: new FormControl({value: this.sideeffectdata.items[index].type, disabled: true}),
      namevalue: new FormControl({value: this.sideeffectdata.items[index].namevalue, disabled: true}),
      startdate: new FormControl({value: this.sideeffectdata.items[index].startdate, disabled: true}),
      enddate: new FormControl({value: this.sideeffectdata.items[index].enddate, disabled: true}),
      verbatimindication: new FormControl({value: this.sideeffectdata.items[index].verbatimindication, disabled: true}),
      dosage: new FormControl({value: this.sideeffectdata.items[index].dosage, disabled: true}),
      doseunits: new FormControl({value: this.sideeffectdata.items[index].doseunits, disabled: true}),
      dosefrequency: new FormControl({value: this.sideeffectdata.items[index].dosefrequency, disabled: true}),
      effectiveflag: new FormControl({value: this.sideeffectdata.items[index].effectiveflag, disabled: true}),
      allergyflag: new FormControl({value: this.sideeffectdata.items[index].allergyflag, disabled: true}),
      comments: new FormControl({value: this.sideeffectdata.items[index].comments, disabled: true}),
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
    var dtDET;

    this.saving = true;
    if (this.card_form.get('recordid').value !==undefined && this.card_form.get('recordid').value !==null) {
      this.eventSave.recordid = this.card_form.get('recordid').value;
      this.eventSave.profileid = this.RestService.currentProfile;
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
      this.eventSave.profileid = this.RestService.currentProfile;
      this.eventSave.userid = this.RestService.userId;
      this.eventSave.active = 'Y';
      if (this.card_form.get('medicaleventid').value !==undefined && this.card_form.get('medicaleventid').value > 0) {
        this.eventSave.medicaleventid = this.card_form.get('medicaleventid').value;
      } else if (this.card_form.get('symptomid').value !==undefined && this.card_form.get('symptomid').value > 0) {
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
  var helptext = "<b>Implicit:</b> Each dose will be automatically captured and removed from the current inventory based on dose schedule.<br><br>" +
  "<b>Explicit:</b> Each dose must be explicitly acknowledged through mobile notifications using voice interface.";

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

openSchedule () {
  this.nav.push(FormMedSchedule, {visit: this.curRec});
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
