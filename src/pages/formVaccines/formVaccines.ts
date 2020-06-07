import { Component } from '@angular/core';
import { NavController,  NavParams, AlertController, LoadingController, ModalController } from 'ionic-angular';
import { Validators, FormGroup, FormControl, FormBuilder, FormArray } from '@angular/forms';
import { RestService } from '../../app/services/restService.service';
import { ListVaccinesModel, ListVaccines, ListVaccineSchedule, ListVaccineSTModel } from '../../pages/listVaccines/listVaccines.model';
import { HistoryItemModel } from '../../pages/history/history.model';
import { ListContactModel } from '../../pages/listContacts/listContacts.model';
import { ListContactService } from '../../pages/listContacts/listContacts.service';
import { FormVisitPage } from '../../pages/formVisit/formVisit';
import { FormContactPage } from '../../pages/formContact/formContact';
import { ListContactPage } from '../../pages/listContacts/listContacts';


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
  pageName: any = 'Vaccine Page';
  newRec: boolean = false;
  loadFromId: any;
  saving: boolean = false;
  loading: any;
  checkSave: boolean = false;
  listContacts: ListContactModel = new ListContactModel();
  vaccineModelSave: ListVaccinesModel  = new ListVaccinesModel();
  vaccineSave: ListVaccines = new ListVaccines();
  vaccineSched: ListVaccineSchedule = new ListVaccineSchedule();
  category: HistoryItemModel = new HistoryItemModel();
  categories_checkbox_open: boolean;
  categories_checkbox_result;
  stModelAll: ListVaccineSTModel = new ListVaccineSTModel();
  stModelPick: ListVaccineSTModel = new ListVaccineSTModel();

  constructor(public nav: NavController, public alertCtrl: AlertController, public RestService:RestService, public listContactService: ListContactService,
    public formBuilder: FormBuilder, public loadingCtrl: LoadingController, public modalCtrl: ModalController, public navParams: NavParams) {
    var adminBy;

    this.recId = navParams.get('recId');
    this.loadFromId = navParams.get('loadFromId');
    if (this.loadFromId !== undefined && this.loadFromId !== null) {
      this.newRec = true;
    } else {
      this.curRec = RestService.results[this.recId];
    }

    this.vaccine_array = new FormArray([]);
    if (this.curRec !== undefined && this.curRec.schedules !== undefined && this.curRec.schedules.length > 0) {
      for (var i = 0; i < this.curRec.schedules.length; i++) {
        var dtSched;
        if (this.curRec.schedules[i].datereceived == 'Invalid date') {
          dtSched = '';
        } else {
          dtSched = new Date(this.curRec.schedules[i].datereceived).toISOString();
        }


        if (this.curRec.schedules[i].lastname !== undefined && this.curRec.schedules[i].lastname !== null) {
          adminBy = 'Dr. ' + this.curRec.schedules[i].lastname;
        } else {
          adminBy = this.curRec.schedules[i].title;
        }

        this.vaccine_schedule = new FormGroup({
          recordid: new FormControl(this.curRec.schedules[i].recordid),
          vaccine_templateid: new FormControl(this.curRec.schedules[i].vaccine_templateid, Validators.required),
          interval: new FormControl(this.curRec.schedules[i].interval),
          agerangelow: new FormControl(this.curRec.schedules[i].agerangelow),
          agerangehigh: new FormControl(this.curRec.schedules[i].agerangehigh),
          agerangeunit: new FormControl(this.curRec.schedules[i].agerangeunit),
          notes: new FormControl(this.curRec.schedules[i].notes),
          datereceivedtext: new FormControl(this.formatDate(dtSched)),
          datereceived: new FormControl(dtSched, Validators.required),
          contactid: new FormControl(this.curRec.schedules[i].contactid),
          visitid: new FormControl(this.curRec.schedules[i].visitid),
          title: new FormControl(this.curRec.schedules[i].title),
          firstname: new FormControl(this.curRec.schedules[i].firstname),
          lastname: new FormControl(adminBy),
          active: new FormControl('Y')
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
      this.pageName = this.curRec.name;
      console.log('Form vaccine sched forms- ', this.card_form.get('schedules'));
    } else {
      this.newRec = true;
      console.log('A newly saved vaccine record more manual schedule entry - newRec = '+ this.newRec);

      if (this.curRec !==undefined) {
        this.card_form = new FormGroup({
          recordid: new FormControl(this.curRec.recordid),
          vaccine_name: new FormControl(this.curRec.name),
          description: new FormControl(this.curRec.description),
          protectfrom: new FormControl(this.curRec.protectfrom),
          profileid: new FormControl(this.curRec.profileid),
          confirmed: new FormControl(this.curRec.confirmed),
          schedules: this.vaccine_array
        });
        this.pageName = this.curRec.name;
      } else {
        this.card_form = new FormGroup({
          recordid: new FormControl(),
          vaccine_name: new FormControl(),
          description: new FormControl(),
          protectfrom: new FormControl(),
          profileid: new FormControl(),
          confirmed: new FormControl(),
          schedules: this.vaccine_array
        });
      }
    }
  }

  ionViewWillEnter() {
    var dtNow = moment(new Date());
    var dtExpiration = moment(this.RestService.AuthData.expiration);
    var self = this;

    this.card_form.markAsPristine();
    this.checkSave = false;
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

  fillFormDetails() {
    var curPage = this.card_form;
    console.log('Start formVaccine.fillFormDetails');
    curPage.get("recordid").setValue(this.curRec.recordid);
    curPage.get("vaccine_name").setValue(this.curRec.name);
    curPage.get("description").setValue(this.curRec.description);
    curPage.get("protectfrom").setValue(this.curRec.protectfrom);
    curPage.get("profileid").setValue(this.curRec.profileid);
    curPage.get("confirmed").setValue(this.curRec.confirmed);

    if (this.curRec.schedules !== undefined && this.curRec.schedules !== null && this.curRec.schedules.length > 0) {
      console.log('formVaccine.fillFormDetails goto fillSchedules');
      this.fillSchedules();
    } else {
      console.log('formVaccine.fillFormDetails goto addNewSchedule');
      this.addNewSchedule();
    }
  };

  addNewSchedule() {
    console.log('Start fromVaccine.addNewSchedule');
    this.vaccine_array = this.card_form.get('schedules') as FormArray;
    this.vaccine_array.insert(0, this.createSchedule());
    this.setSTItems();
  }

  createSchedule(): FormGroup {
    return this.formBuilder.group({
      recordid: new FormControl(),
      vaccine_templateid: new FormControl(null, Validators.required),
      interval: new FormControl(),
      agerangelow: new FormControl(),
      agerangehigh: new FormControl(),
      agerangeunit: new FormControl(),
      notes: new FormControl(),
      datereceived: new FormControl(null, Validators.required),
      contactid: new FormControl(),
      visitid: new FormControl(),
      title: new FormControl(),
      firstname: new FormControl(),
      lastname: new FormControl(),
      active: new FormControl('Y')
    });
  }

  fillSchedules() {
    this.vaccine_array = this.card_form.get('schedules') as FormArray;
    var exitLoop = 0;
    while (this.vaccine_array.length !== 0 || exitLoop > 9) {
      this.vaccine_array.removeAt(0);
      exitLoop = exitLoop + 1;
    }
    for (var j = 0; j < this.curRec.schedules.length; j++) {
        this.vaccine_array.push(this.addExistingSchedule(j));
    }
    this.setSTItems();
  }

  addExistingSchedule(index): FormGroup {
    var dtSched = new Date(this.curRec.schedules[index].datereceived).toISOString();
    var adminBy;

    if (this.curRec.schedules[index].lastname !== undefined && this.curRec.schedules[index].lastname !== null) {
      adminBy = 'Dr. ' + this.curRec.schedules[index].lastname;
    } else {
      adminBy = this.curRec.schedules[index].title;
    }

    return this.formBuilder.group({
      recordid: new FormControl(this.curRec.schedules[index].recordid),
      vaccine_templateid: new FormControl(this.curRec.schedules[index].vaccine_templateid, Validators.required),
      interval: new FormControl(this.curRec.schedules[index].interval),
      agerangelow: new FormControl(this.curRec.schedules[index].agerangelow),
      agerangehigh: new FormControl(this.curRec.schedules[index].agerangehigh),
      agerangeunit: new FormControl(this.curRec.schedules[index].agerangeunit),
      notes: new FormControl(this.curRec.schedules[index].notes),
      datereceivedtext: new FormControl(this.formatDate(dtSched)),
      datereceived: new FormControl(dtSched, Validators.required),
      contactid: new FormControl(this.curRec.schedules[index].contactid),
      visitid: new FormControl(this.curRec.schedules[index].visitid),
      title: new FormControl(this.curRec.schedules[index].title),
      firstname: new FormControl(this.curRec.schedules[index].firstname),
      lastname: new FormControl(adminBy),
      active: new FormControl('Y')
    });
  }

  setSTItems() {
    if (this.newRec) {
      this.stModelPick = this.stModelAll;
      console.log('formVaccine.setST picklist: ', this.stModelPick);
      console.log('formVaccine.setST stAll: ', this.stModelAll);
    } else {
      this.filterCompletedSTs();
    }
  }

  filterCompletedSTs() {
    this.stModelPick.items = [];
    var blnMatch;

    console.log('start filterCompletedSTs sched: ', this.curRec.schedules);
    console.log('start filterCompletedSTs stAll: ', this.stModelAll.items);
    for (var k = 0; k < this.stModelAll.items.length; k++) {
      blnMatch = false;
      for (var j = 0; j < this.curRec.schedules.length; j++) {
        if (this.curRec.schedules[j].vaccine_templateid == this.stModelAll.items[k].vaccine_templateid) {
          blnMatch = true;
          if (this.stModelAll.items[k].latest == 'Y') {
              this.stModelPick.items.push(this.stModelAll.items[k]);
          }
        }
      }
      if (!blnMatch) {
        this.stModelPick.items.push(this.stModelAll.items[k]);
      } else {
        console.log('formVaccine filter STs match: ',  this.stModelAll.items[k]);
      }
    }
    console.log('formVaccine.filterSTs filterItems ', this.stModelPick.items);
  }

  loadSchedules() {
    var restURL: string;
    var vaccineid;
    restURL="https://ap6oiuyew6.execute-api.us-east-1.amazonaws.com/dev/VaccinesByProfile";
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

    if (this.curRec !== undefined && this.curRec !== null && this.curRec.recordid !== undefined && this.curRec.recordid !== null) {
      vaccineid = this.curRec.recordid;
    } else if (this.loadFromId !== undefined && this.loadFromId !== null) {
      vaccineid = this.loadFromId;
    } else {
      console.log('No vaccine id - issue');
      vaccineid = 1;
    }

    console.log('formVaccine-getSchedules vaccined id: ' +  vaccineid);
    var additionalParams = {
        queryParams: {
            profileid: this.RestService.currentProfile,
            vaccineid: vaccineid,
        }
    };
    var body = '';
    var self = this;
    apigClient.invokeApi(params, pathTemplate, method, additionalParams, body)
    .then(function(result){
      self.stModelAll.items = result.data;
      console.log('formVaccine.loadSchel stModelAll: ', self.stModelAll.items);
      if (self.loadFromId !== undefined && self.loadFromId !== null && self.loadFromId > 0) {
        self.loadDetails();
      } else {
        self.loading.dismiss();
        if (self.newRec) {
          console.log("formVaccine.loadSched - newRec: " + self.newRec);
          self.addNewSchedule();
        } else {
          console.log("formVaccine.loadSched - newRec: " + self.newRec);
          self.setSTItems();
        }
      }
    }).catch( function(result){
      console.log(result);
      alert('There was an error retrieving this data.  Please try again later');
      if (self.loadFromId !== undefined && self.loadFromId !== null && self.loadFromId > 0) {
        self.loadDetails();
      } else {
        self.loading.dismiss();
      }
  });
  }

  loadDetails() {
    //this.presentLoadingDefault();
    var restURL: string;
    restURL="https://ap6oiuyew6.execute-api.us-east-1.amazonaws.com/dev/VaccinesByProfile";
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
      console.log('Result from formVaccine.loadDetails - loadFromID: ' + self.loadFromId, result);
      if (result !== undefined && result.data !== undefined && result.data[0] !== undefined && result.data[0].recordid > 0) {
        self.recId = 0;
        self.curRec = result.data[0];
        self.pageName = self.curRec.name;
        self.loading.dismiss();
        console.log('formVaccine.loadDetails: ', self.curRec);
        self.fillFormDetails();
      } else {
        console.log('formVaccine.loadDetails - no data: ', result);
        self.loading.dismiss();
      }
    }).catch( function(result){
      console.log('Err from formProc.loadDetails: ', result);
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
              this.vaccineSave.userid = this.RestService.userId;
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
                console.log('Happy Path: ', self.RestService.results);
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
    this.vaccineSave.name = this.card_form.get('vaccine_name').value;
    this.vaccineSave.userid = this.RestService.userId;
    this.vaccineSave.profileid = this.RestService.currentProfile;
    this.vaccineSave.active = 'Y';

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
          this.vaccineSched.vaccine_templateid = vaccineSaveArray.controls[i].get('vaccine_templateid').value;
          this.vaccineSched.recordid = vaccineSaveArray.controls[i].get('recordid').value;
          this.vaccineSched.active = vaccineSaveArray.controls[i].get('active').value;
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
    this.vaccineSave.schedules = [];
    this.vaccineSave.recordid = this.card_form.get('recordid').value;
    this.vaccineSave.name = this.card_form.get('vaccine_name').value;
    this.vaccineSave.userid = this.RestService.userId;
    this.vaccineSave.profileid = this.RestService.currentProfile;
    this.vaccineSave.active = 'Y';

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
          this.vaccineSched.vaccine_templateid = vaccineSaveArray.controls[i].get('vaccine_templateid').value;
          this.vaccineSched.recordid = vaccineSaveArray.controls[i].get('recordid').value;
          this.vaccineSched.active = vaccineSaveArray.controls[i].get('active').value;
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
        console.log('Happy Path: ', result);
        self.loading.dismiss();
        callback(null, result.data);
      }).catch( function(result){
        console.log('Error from forVaccine.navsave: ',result);
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
                if (self.newRec) {
                  self.curRec = {recordid: results};
                  self.loadFromId = results;
                  //self.card_form.get("recordid").setValue(results);
                  console.log('new VaccineSched record: ', self.curRec);
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
    if (!this.saving && (this.card_form.dirty) && this.checkSave) {
      alert.present();
    } else {
      this.loadFromId = this.curRec.recordid;
      this.checkSave = false;
      callback(null, true);
    }
  }

  gotoVisCon(index) {
    var isVisit = false;
    var visitid;
    var isContact = false;
    var contactid;
    var cat;

    var self = this;
    this.checkSave = true;

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

    this.confirmSaveDirect(function(err, result) {
      if (err) {
        console.log('Error in gotoVisCon.confirmSaveDirect' + err);
        alert('There is an error in saving the record from gotoVisCon');
      } else {
        if (result) {
          if (isVisit) {
            cat = {title: 'Visit'};
            self.nav.push(FormVisitPage, { loadFromId: visitid, category: cat });
          } else if (isContact) {
            cat = {title: 'Contact'};
            self.nav.push(FormContactPage, { loadFromId: contactid, category: cat });
          } else {
            console.log('formVaccine GotoVisCon - visCon not found!');
          }
        } else if (!result) {
          console.log('gotoVisit.ConfirmSaveDirect - User cancelled');
        }
      }
    });
  }

  newContact(index) {
    var self = this;

    console.log('Called newContact');
    var cat = {title: 'Select Heathcare Provider'};
    let profileModal = self.modalCtrl.create(ListContactPage, { category: cat });

    profileModal.onDidDismiss(data => {
      if (data !==undefined && data !== null) {
        self.vaccine_array = self.card_form.get('schedules') as FormArray;
        self.vaccine_schedule  = self.vaccine_array.at(index) as FormGroup;

        console.log('newContact - response: ', data);
        console.log('newContact - vac sch: ', self.vaccine_schedule);
        console.log('newContact - index: ', index);
        self.vaccine_schedule.get('contactid').setValue(data.recordid);
        self.vaccine_schedule.get('contactid').markAsDirty();
        self.vaccine_schedule.get('title').setValue(data.title);
        self.vaccine_schedule.get('firstname').setValue(data.firstname);
        if (data.lastname !== undefined && data.lastname !== null) {
          self.vaccine_schedule.get('lastname').setValue('Dr. ' + data.lastname);
        } else {
          self.vaccine_schedule.get('lastname').setValue(data.title);
        }
      } else {
        console.log('User selected cancel');
      }
    });
    profileModal.present();
  }

  cancel() {
    this.nav.pop();
  }

  addNew() {
    this.addNewSchedule();
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
