import { Component } from '@angular/core';
import { NavController,  NavParams, AlertController, LoadingController } from 'ionic-angular';
import { Validators, FormGroup, FormControl, FormArray } from '@angular/forms';
import { RestService } from '../../app/services/restService.service';
import { ListVaccinesModel, ListVaccines, ListVaccineSchedule } from '../../pages/listVaccines/listVaccines.model';
import { HistoryItemModel } from '../../pages/history/history.model';
import { ListContactModel } from '../../pages/listContacts/listContacts.model';
import { ListContactService } from '../../pages/listContacts/listContacts.service';
import { FormVisitPage } from '../../pages/formVisit/formVisit';
import { FormContactPage } from '../../pages/formContact/formContact';


var moment = require('moment-timezone');

@Component({
  selector: 'formVisit1-page',
  templateUrl: 'formVaccines.html'
})
export class FormVaccinesPage {
  section: string;
  formName: string = "formVaccines";
  recId: number;
  card_form: FormGroup;
  vaccine_array: FormArray;
  vaccine_schedule: FormGroup;
  curRec: any;
  newRec: boolean = false;
  newObj: any;
  saving: boolean = false;
  loading: any;
  listContacts: ListContactModel = new ListContactModel();
  vaccineModelSave: ListVaccinesModel  = new ListVaccinesModel();
  vaccineSave: ListVaccines = new ListVaccines();
  vaccineSched: ListVaccineSchedule = new ListVaccineSchedule();
  category: HistoryItemModel = new HistoryItemModel();
  categories_checkbox_open: boolean;
  categories_checkbox_result;

  constructor(public nav: NavController, public alertCtrl: AlertController, public RestService:RestService, public listContactService: ListContactService,
    public loadingCtrl: LoadingController, public navParams: NavParams) {

    this.recId = navParams.get('recId');
    this.newObj = navParams.get('newObj');
    if (this.newObj !== undefined && this.newObj !== null) {
      this.curRec = this.newObj;
      this.newRec = true;
    } else {
      this.curRec = RestService.results[this.recId];
    }

    this.vaccine_array = new FormArray([]);
    if (this.curRec.schedules !== undefined && this.curRec.schedules.length > 0) {
      for (var i = 0; i < this.curRec.schedules.length; i++) {
        var dtSched;
        if (this.curRec.schedules[i].datereceived == 'Invalid date') {
          dtSched = '';
        } else {
          dtSched = new Date(this.curRec.schedules[i].datereceived).toISOString();
        }
        this.vaccine_schedule = new FormGroup({
          recordid: new FormControl(this.curRec.schedules[i].recordid),
          vaccine_templateid: new FormControl(),
          interval: new FormControl(this.curRec.schedules[i].interval),
          agerangelow: new FormControl(this.curRec.schedules[i].agerangelow),
          agerangehigh: new FormControl(this.curRec.schedules[i].agerangehigh),
          agerangeunit: new FormControl(this.curRec.schedules[i].agerangeunit),
          notes: new FormControl(this.curRec.schedules[i].notes),
          datereceived: new FormControl(this.formatDate(dtSched), Validators.required),
          contactid: new FormControl(this.curRec.schedules[i].contactid, Validators.required),
          visitid: new FormControl(this.curRec.schedules[i].visitid),
          title: new FormControl(this.curRec.schedules[i].title),
          firstname: new FormControl(this.curRec.schedules[i].firstname),
          lastname: new FormControl('Dr. ' + this.curRec.schedules[i].lastname)
        });
        this.vaccine_array.push(this.vaccine_schedule);
      }
      this.card_form = new FormGroup({
        recordid: new FormControl(this.curRec.recordid),
        vaccine_name: new FormControl(this.curRec.name),
        description: new FormControl(this.curRec.description),
        protectfrom: new FormControl(this.curRec.protectfrom),
        profileid: new FormControl(this.curRec.profileid),
        confirmed: new FormControl(this.curRec.confirmed),
        schedules: this.vaccine_array
      });
      console.log('Form vaccine sched forms- ', this.card_form.get('schedules'));
    } else {
      console.log('A newly saved vaccine record more manual schedule entry - newRec = '+ this.newRec);

      this.card_form = new FormGroup({
        recordid: new FormControl(this.curRec.recordid),
        vaccine_name: new FormControl(this.curRec.name),
        description: new FormControl(this.curRec.description),
        protectfrom: new FormControl(this.curRec.protectfrom),
        profileid: new FormControl(this.curRec.profileid),
        confirmed: new FormControl(this.curRec.confirmed),
        schedules: this.vaccine_array
      });
    }
  }

  ionViewWillEnter() {
    var dtNow = moment(new Date());
    var dtExpiration = moment(this.RestService.AuthData.expiration);
    var self = this;

    if (dtNow < dtExpiration) {
      this.presentLoadingDefault();
      this.loadSchedules();
    } else {
      this.presentLoadingDefault();
      this.RestService.refreshCredentials(function(err, results) {
        if (err) {
          console.log('Need to login again!!! - Credentials expired from ' + self.formName);
          self.loading.dismiss();
          self.RestService.appRestart();
        } else {
          console.log('From '+ self.formName + ' - Credentials refreshed!');
          self.loadSchedules();
        }
      });
    }
  }
/*
  loadContacts() {
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
      //email: accountInfo.getEmail()
    };
    var pathTemplate = '';
    var method = 'GET';
    var additionalParams = {
        queryParams: {
            profileid: this.RestService.currentProfile,
            contacttype: "doctor"
        }
    };
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
        self.loadSchedules();
        self.loading.dismiss();
      });
    }).catch( function(result){
      console.log(result);
      self.loadSchedules();
      self.loading.dismiss();
      alert('There was an error retrieving this data.  Please try again later');
    });
  }
*/

  loadSchedules() {
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
      //email: accountInfo.getEmail()
    };
    var pathTemplate = '';
    var method = 'GET';
    var additionalParams = {
        queryParams: {
            profileid: this.RestService.currentProfile,
            contacttype: "doctor"
        }
    };
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
        self.loading.dismiss();
      });
    }).catch( function(result){
      console.log(result);
      self.loading.dismiss();
      alert('There was an error retrieving this data.  Please try again later');
    });
  }

  confirmRecord(){
    var dtNow = moment(new Date());
    var dtExpiration = moment(this.RestService.AuthData.expiration);
    var self = this;

    if (dtNow < dtExpiration) {
      this.presentLoadingDefault();
      this.confirmRecordDo();
    } else {
      this.presentLoadingDefault();
      this.RestService.refreshCredentials(function(err, results) {
        if (err) {
          console.log('Need to login again!!! - Credentials expired from ' + self.formName + '.confirmRecord');
          self.loading.dismiss();
          self.RestService.appRestart();
        } else {
          console.log('From ' + self.formName + '.confirmRecord - Credentials refreshed!');
          self.confirmRecordDo();
        }
      });
    }
  }

  confirmRecordDo(){
    this.saving = true;
    this.vaccineSave.schedules = [];
    this.vaccineSave.recordid = this.card_form.get('recordid').value;
    this.vaccineSave.confirmed = 'Y';
    if (this.card_form.get('schedules') !== null) {
      var vaccineSaveArray = this.card_form.get('schedules') as FormArray;
      var isChanged = false;
      for (var i = 0; i < vaccineSaveArray.length ; i++) {
        console.log('VaccineSaveArray: ', vaccineSaveArray);
        this.vaccineSched = new ListVaccineSchedule;
        isChanged = false;
        if (vaccineSaveArray.controls[i].get('contactid').dirty) {
          isChanged = true;
          this.vaccineSched.contactid = vaccineSaveArray.controls[i].get('contactid').value;
        }
        if (vaccineSaveArray.controls[i].get('visitid').dirty) {
          isChanged = true;
          this.vaccineSched.visitid = vaccineSaveArray.controls[i].get('visitid').value;
        }
        if (vaccineSaveArray.controls[i].get('datereceived').dirty) {
          isChanged = true;
          this.vaccineSched.datereceived = vaccineSaveArray.controls[i].get('datereceived').value;
        }
        if (isChanged) {
          this.vaccineSched.recordid = vaccineSaveArray.controls[i].get('recordid').value;
          //console.log('Record id: ' + this.vaccineSched.recordid);
          this.vaccineSave.schedules.push(this.vaccineSched);
        }
      }
    }

      var restURL="https://ap6oiuyew6.execute-api.us-east-1.amazonaws.com/dev/VaccinesByProfile";
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
              userid: this.RestService.userId
          }
      };
      var body = JSON.stringify(this.vaccineSave);
      var self = this;
      console.log('Calling Post', this.vaccineSave);
      apigClient.invokeApi(params, pathTemplate, method, additionalParams, body)
      .then(function(result){
        self.RestService.results = result.data;
        console.log('Happy Path: ' + self.RestService.results);
        self.category.title = "Vaccines";
        self.loading.dismiss();
        self.nav.pop();
      }).catch( function(result){
        console.log('Error in formVaccine.confirm: ',result);
        self.loading.dismiss();
        alert('There was an error saving this data.  Please try again later');
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
              //alert('Going to delete');
              this.vaccineSave.schedules = [];
              this.vaccineSave.recordid = this.card_form.get('recordid').value;
              this.vaccineSave.active = 'N';
              var restURL="https://ap6oiuyew6.execute-api.us-east-1.amazonaws.com/dev/VaccinesByProfile";
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
                      userid: this.RestService.userId
                  }
              };
              var body = JSON.stringify(this.vaccineSave);
              var self = this;
              console.log('Calling Post', this.vaccineSave);
              apigClient.invokeApi(params, pathTemplate, method, additionalParams, body)
              .then(function(result){
                self.RestService.results = result.data;
                console.log('Happy Path: ' + self.RestService.results);
                self.category.title = "Vaccines";
                self.loading.dismiss();
                self.nav.pop();
              }).catch( function(result){
                console.log('Error in formVaccines.delete: ',result);
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
    this.vaccineSave.schedules = [];
    this.vaccineSave.recordid = this.card_form.get('recordid').value;
    if (!this.card_form.valid) {
      this.vaccineSave.confirmed = 'N';
    }

    if (this.card_form.get('schedules') !== null) {
      var vaccineSaveArray = this.card_form.get('schedules') as FormArray;
      var isChanged = false;
      for (var i = 0; i < vaccineSaveArray.length ; i++) {
        console.log('VaccineSaveArray: ', vaccineSaveArray);
        this.vaccineSched = new ListVaccineSchedule;
        isChanged = false;
        if (vaccineSaveArray.controls[i].get('datereceived').dirty) {
          isChanged = true;
          this.vaccineSched.datereceived = vaccineSaveArray.controls[i].get('datereceived').value;
          console.log('datereceived: ' + this.vaccineSched.datereceived);
        }
        if (vaccineSaveArray.controls[i].get('visitid').dirty) {
          isChanged = true;
          this.vaccineSched.visitid = vaccineSaveArray.controls[i].get('visitid').value;
        }
        if (vaccineSaveArray.controls[i].get('contactid').dirty) {
          isChanged = true;
          this.vaccineSched.contactid = vaccineSaveArray.controls[i].get('contactid').value;
        }
        if (isChanged) {
          this.vaccineSched.recordid = vaccineSaveArray.controls[i].get('recordid').value;
          //console.log('Record id: ' + this.vaccineSched.recordid);
          this.vaccineSave.schedules.push(this.vaccineSched);
        }
      }
    }
     var restURL="https://ap6oiuyew6.execute-api.us-east-1.amazonaws.com/dev/VaccinesByProfile";
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
              userid: this.RestService.userId
          }
      };
      var body = JSON.stringify(this.vaccineSave);
      var self = this;
      console.log('Calling Post', this.vaccineSave);
      apigClient.invokeApi(params, pathTemplate, method, additionalParams, body)
      .then(function(result){
        self.RestService.results = result.data;
        console.log('Happy Path: ' + self.RestService.results);
        self.category.title = "Vaccines";
        self.loading.dismiss();
        self.nav.pop();
      }).catch( function(result){
        console.log('Error in formVaccines.save: ',result);
        self.loading.dismiss();
        alert('There was an error saving this data.  Please try again later');
      });
  }

  gotoVisCon(index) {
    var isVisit = false;
    var visitid;
    var isContact = false;
    var contactid;
    var cat;

    this.vaccine_array = this.card_form.get('schedules') as FormArray;
    this.vaccine_schedule  = this.vaccine_array.at(index) as FormGroup;

    if (this.vaccine_schedule.get('visitid') !== undefined && this.vaccine_schedule.get('visitid') !== null
      && this.vaccine_schedule.get('visitid').value !== undefined && this.vaccine_schedule.get('visitid').value > 0 ) {
        visitid = this.vaccine_schedule.get('visitid').value;
        isVisit = true;
    }
    if (this.vaccine_schedule.get('contactid') !== undefined && this.vaccine_schedule.get('contactid') !== null
      && this.vaccine_schedule.get('contactid').value !== undefined && this.vaccine_schedule.get('contactid').value > 0 ) {
        contactid = this.vaccine_schedule.get('contactid').value;
        isContact = true;
    }

    if (isVisit) {
      cat = {title: 'Visit'};
      this.nav.push(FormVisitPage, { loadFromId: visitid, category: cat });
    } else if (isContact) {
      cat = {title: 'Contact'};
      this.nav.push(FormContactPage, { loadFromId: contactid, category: cat });
    } else {
      console.log('formVaccine GotoVisCon - visCon not found!');
    }

  }

  addNew() {
    alert('Adding soon!!!');
  }

  public today() {
    return new Date().toISOString().substring(0,10);
  }

  formatDate(dateString) {
    return moment(dateString).format('MMM-DD-YYYY');
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
    alert('Coming soon.  This button will allow you to link pictures and documents (e.g. PDFs) of physical medical records, images, etc.');
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
