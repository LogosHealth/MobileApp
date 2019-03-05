import { Component } from '@angular/core';
import { NavController, NavParams, AlertController, LoadingController } from 'ionic-angular';
import { Validators, FormGroup, FormControl, FormArray, FormBuilder } from '@angular/forms';
import { RestService } from '../../app/services/restService.service';
import { HistoryItemModel } from '../../pages/history/history.model';
import { ListMedicationModel, ListMedication } from '../../pages/listMedication/listMedication.model';
import { ListMedicationService } from '../../pages/listMedication/listMedication.service';
import { ListEventModel, ListEvent } from '../../pages/listEvent/listEvent.model';
import { ListEventService } from '../../pages/listEvent/listEvent.service';
import { ListAllergiesModel, ListAllergies } from '../../pages/listAllergies/listAllergies.model';
import { ListAllergiesService } from '../../pages/listAllergies/listAllergies.service';

var moment = require('moment-timezone');

@Component({
  selector: 'formExercise-page',
  templateUrl: 'formAllergy.html'
})
export class FormAllergyPage {
  loading: any;
  section: string;
  formName: string = "formAllergy";
  recId: number;
  goalname: string;
  card_form: FormGroup;
  curRec: any;
  newRec: boolean = false;
  saving: boolean = false;
  currentMeds: FormArray;
  events: FormArray;
  list2: ListAllergiesModel = new ListAllergiesModel();
  listMeds: ListMedicationModel = new ListMedicationModel();
  listEvents: ListEventModel = new ListEventModel();
  formModelSave: ListAllergiesModel  = new ListAllergiesModel();
  formSave: ListAllergies = new ListAllergies();
  category: HistoryItemModel = new HistoryItemModel();
  userTimezone: any;
  categories_checkbox_open: boolean;
  categories_checkbox_result;

  constructor(public nav: NavController, public alertCtrl: AlertController, public RestService:RestService,
    public navParams: NavParams, public loadingCtrl: LoadingController, public formBuilder: FormBuilder, public list2Service: ListAllergiesService,
    public listMedicationService: ListMedicationService, public listEventService: ListEventService) {

    this.recId = navParams.get('recId');
    this.curRec = RestService.results[this.recId];
    var self = this;
    this.RestService.curProfileObj(function (error, results) {
      if (!error) {
        self.userTimezone = results.timezone;
      }
    });
    if (this.recId !== undefined) {
      console.log('Start Date: ' + this.curRec.startdate);
      this.card_form = new FormGroup({
        recordid: new FormControl(this.curRec.recordid),
        allergyname: new FormControl(this.curRec.name),
        severity: new FormControl(this.curRec.severity),
        currentmeds: this.formBuilder.array([ this.createMed() ]),
        description: new FormControl(this.curRec.description),
        startdate: new FormControl(this.curRec.startdate),
        medicallyconfirmed: new FormControl(this.curRec.medicallyconfirmed),
        events: this.formBuilder.array([ this.createEvent() ]),
        confirmed: new FormControl(this.curRec.confirmed),
        active: new FormControl(this.curRec.active),
        profileid: new FormControl(this.curRec.profileid),
        userid: new FormControl(this.curRec.userid)
      });
    } else {
      this.newRec = true;
      this.card_form = new FormGroup({
        recordid: new FormControl(),
        allergyname: new FormControl(null, Validators.required),
        currentmeds: this.formBuilder.array([ this.createMed() ]),
        severity: new FormControl(),
        description: new FormControl(),
        startdate: new FormControl(),
        medicallyconfirmed: new FormControl(),
        events: this.formBuilder.array([ this.createEvent() ]),
        confirmed: new FormControl(),
        active: new FormControl(),
        profileid: new FormControl(),
        userid: new FormControl()
      });
    }
  }

  ionViewDidLoad() {
    var dtNow = moment(new Date());
    var dtExpiration = moment(this.RestService.AuthData.expiration);
    var self = this;

    if (dtNow < dtExpiration) {
      this.presentLoadingDefault();
      this.loadData();
    } else {
      this.presentLoadingDefault();
      this.RestService.refreshCredentials(function(err, results) {
        if (err) {
          console.log('Need to login again!!! - Credentials expired from formAllergy');
          self.loading.dismiss();
          self.RestService.appRestart();
        } else {
          console.log('From formAllergy - Credentials refreshed!');
          self.loadData();
        }
      });
    }
  }

  ionViewWillEnter() {
    this.nav.getPrevious().data.refresh = false;
  }

  loadData() {
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
            eventid: this.curRec.recordid
        }
    };
    var body = '';
    var self = this;
    apigClient.invokeApi(params, pathTemplate, method, additionalParams, body)
    .then(function(result){
      if (Array.isArray(result.data)) {
        var resultData = result.data;
        self.listMedicationService
        .getData()
        .then(data => {
          self.listMeds.items = resultData;
          console.log('ListMeds: ',  self.listMeds.items);
          if (self.listMeds !== undefined && self.listMeds !== null && self.listMeds.items.length > 0) {
            self.addExistingMeds();
          }
          self.loadData2();
        });
      } else {
        console.log('Result.data from getMeds not array: ', result.data);
        self.loadData2();
      }
    }).catch( function(result){
        console.log(body);
        self.loadData2();
    });
  }

  loadData2() {
    var restURL: string;
    restURL="https://ap6oiuyew6.execute-api.us-east-1.amazonaws.com/dev/EventByProfile";
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
            eventid: this.curRec.recordid
        }
    };
    var body = '';
    var self = this;
    apigClient.invokeApi(params, pathTemplate, method, additionalParams, body)
    .then(function(result){
      if (Array.isArray(result.data)) {
        var resultData = result.data;
        self.listEventService
        .getData()
        .then(data => {
          self.listEvents.items = resultData;
          console.log('ListEvents: ',  self.listEvents.items);
          if (self.listEvents !== undefined && self.listEvents !== null && self.listEvents.items.length > 0) {
            self.addExistingEvents();
          }
          self.loading.dismiss();
          });
      } else {
        console.log('Result.data from getEvents not array: ', result.data);
        self.loading.dismiss();
      }
    }).catch( function(result){
        console.log(body);
        self.loading.dismiss();
    });
}

  createMed () {
    return this.formBuilder.group({
      recordid: new FormControl(),
      medicationname: new FormControl(),
      startdate: new FormControl(),
    });
  }

  addExistingMeds() {
    this.currentMeds = this.card_form.get('currentmeds') as FormArray;
    this.currentMeds.removeAt(0);
    console.log('From addExistingMeds listMeds length: ' + this.listMeds.items.length);
    for (var j = 0; j < this.listMeds.items.length; j++) {
      console.log('From addExistingMeds listMeds medication name: ' + this.listMeds.items[j].medicationname);
      this.currentMeds.push(this.addExistingMed(j));
    }
    console.log('From addExistingMeds currentMeds length: ' + this.currentMeds.length);
  }

  addExistingMed(index): FormGroup {
    return this.formBuilder.group({
      recordid: new FormControl(this.listMeds.items[index].recordid),
      medicationname: new FormControl(this.listMeds.items[index].medicationname),
      startdate: new FormControl(this.listMeds.items[index].startdate),
    });
  }

  addMed() {
    console.log('Coming');
  }

  showMed(index) {
    console.log('Coming');
  }

  createEvent () {
    return this.formBuilder.group({
      recordid: new FormControl(),
      medicalevent: new FormControl(),
      startdate: new FormControl(),
    });
  }

  addExistingEvents() {
    this.events = this.card_form.get('events') as FormArray;
    this.events.removeAt(0);
    for (var j = 0; j < this.listEvents.items.length; j++) {
      this.events.push(this.addExistingEvent(j));
    }
  }

  addExistingEvent(index): FormGroup {
    return this.formBuilder.group({
      recordid: new FormControl(this.listEvents.items[index].recordid),
      medicalevent: new FormControl(this.listEvents.items[index].medicalevent),
      startdate: new FormControl(this.listEvents.items[index].startdate),
    });
  }

  addEvent() {
    console.log('Coming');
  }

  showEvent(index) {
    console.log('Coming');
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
          console.log('Need to login again!!! - Credentials expired from formAllergy.deleteRecord');
          self.loading.dismiss();
          self.RestService.appRestart();
        } else {
          console.log('From formAllergy.deleteRecord - Credentials refreshed!');
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
              this.formSave.recordid = this.card_form.get('recordid').value;
              this.formSave.profileid = this.RestService.currentProfile;
              this.formSave.userid = this.RestService.userId;
              this.formSave.active = 'N';
              var restURL="https://ap6oiuyew6.execute-api.us-east-1.amazonaws.com/dev/AllergiesByProfile";
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
                console.log('Result: ',result);
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
          console.log('Need to login again!!! - Credentials expired from formAllergy.saveRecord');
          self.loading.dismiss();
          self.RestService.appRestart();
        } else {
          console.log('From formAllergy.saveRecord - Credentials refreshed!');
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
    } else {
      this.formSave.profileid = this.RestService.currentProfile;
      this.formSave.userid = this.RestService.userId;
      this.formSave.active = 'Y';
    }
    if (this.card_form.get('allergyname').dirty) {
      this.formSave.name = this.card_form.get('allergyname').value;
    }
    if (this.card_form.get('severity').dirty) {
      this.formSave.severity = this.card_form.get('severity').value;
    }
    if (this.card_form.get('description').dirty) {
      this.formSave.description = this.card_form.get('description').value;
    }
    if (this.card_form.get('startdate').dirty) {
      this.formSave.startdate = this.card_form.get('startdate').value;
    }
    //currentmeds: this.formBuilder.array([ this.createMed() ]),
    //events: this.formBuilder.array([ this.createEvent() ]),
    //medicallyconfirmed: new FormControl(this.curRec.medicallyconfirmed),

      var restURL="https://ap6oiuyew6.execute-api.us-east-1.amazonaws.com/dev/AllergiesByProfile";
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
        console.log('Result: ',result);
        self.loading.dismiss();
      });
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
