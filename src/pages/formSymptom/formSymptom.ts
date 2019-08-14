import { Component } from '@angular/core';
import { NavController, NavParams, AlertController, LoadingController, PopoverController } from 'ionic-angular';
import { Validators, FormGroup, FormControl, FormArray, FormBuilder } from '@angular/forms';
import { RestService } from '../../app/services/restService.service';
//import { ListMeasureModel, ListMeasure } from '../../pages/listMeasure/listMeasure.model';
import { HistoryItemModel } from '../../pages/history/history.model';
import { FormMedication } from '../../pages/formMedication/formMedication';
import { MenuTreatment } from '../../pages/menuTreatment/menuTreatment';
import { SymptomModel, Symptom } from './formSymptom.model';

var moment = require('moment-timezone');

@Component({
  selector: 'formVisit1-page',
  templateUrl: 'formSymptom.html'
})
export class FormSymptomPage {
  section: string;
  formName: string = "formSymptom";
  loading: any;
  recId: number;
  goalname: string;
  card_form: FormGroup;
  curRec: any;
  newRec: boolean = false;
  saving: boolean = false;
  showTips: boolean = true;
  formModelSave: SymptomModel  = new SymptomModel();
  formSave: Symptom = new Symptom();
  category: HistoryItemModel = new HistoryItemModel();
  userTimezone: any;
  categories_checkbox_open: boolean;
  categories_checkbox_result;
  timeNow: any;
  hourNow: any;
  minuteNow: any;
  momentNow: any;
  medicaleventid: any;
  loadsymptomid: any;
  checkSave: boolean = false;
  treatments: FormArray;
  loadFromId: any;
  fromEvent: any;

  constructor(public nav: NavController, public alertCtrl: AlertController, public RestService:RestService, public loadingCtrl: LoadingController,
    public navParams: NavParams, public popoverCtrl:PopoverController, public formBuilder: FormBuilder) {

    this.recId = navParams.get('recId');
    this.loadFromId = navParams.get('loadFromId');
    console.log('formSymptom loadFromId: ' + this.loadFromId);
    this.fromEvent = navParams.get('fromEvent');
    console.log('formSymptom fromEvent: ', this.fromEvent);
    this.curRec = RestService.results[this.recId];

    var self = this;
    //var tzoffset = (new Date()).getTimezoneOffset() * 60000; //offset in milliseconds
    //var localISOTime = (new Date(Date.now() - tzoffset)).toISOString().slice(0, -1);
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
    this.RestService.curProfileObj(function (error, results) {
      if (!error) {
        self.userTimezone = results.timezone;
      }
    });

    if (this.recId !== undefined) {
      console.log('formSymptom curRec: ', this.curRec);
      var dom = null;
      var symName = null;
      if (this.curRec.symptomname !== undefined) {
        symName = this.curRec.symptomname;
      } else if (this.curRec.full_symptom !== undefined) {
        symName = this.curRec.full_symptom;
      }
      if (this.curRec.dateofmeasure !== undefined) {
        dom = this.curRec.dateofmeasure;
      } else if (this.curRec.startdate !== undefined) {
        dom = this.curRec.startdate;
      }
      this.card_form = new FormGroup({
        recordid: new FormControl(this.curRec.recordid),
        symptom: new FormControl(symName, Validators.required),
        symptomdescription: new FormControl(this.curRec.symptomdescription),
        dateofmeasure: new FormControl(this.formatDateTimeSaved(dom)),
        enddate: new FormControl(this.formatDateTime(this.curRec.enddate)),
        endtime: new FormControl(this.formatTime(this.curRec.enddate)),
        profileid: new FormControl(this.curRec.profileid),
        userid: new FormControl(this.RestService.userId),
        medicalevent: new FormControl(),
        treatments: this.formBuilder.array([]),
      });
    } else {
      this.newRec = true;
      this.card_form = new FormGroup({
        recordid: new FormControl(),
        symptom: new FormControl(null, Validators.required),
        symptomdescription: new FormControl(),
        dateofmeasure: new FormControl(),
        starttime: new FormControl(),
        enddate: new FormControl(),
        endtime: new FormControl(),
        profileid: new FormControl(),
        userid: new FormControl(),
        medicalevent: new FormControl(),
        treatments: this.formBuilder.array([]),
      });
    }
  }

  ionViewWillEnter() {
    this.checkSave = false;
    this.nav.getPrevious().data.refresh = false;
    if (this.loadFromId !== undefined && this.loadFromId !== null && this.loadFromId > 0 ) {
      this.loadDataSymptom();
    }
  }

  loadDataSymptom() {
    this.presentLoadingDefault();
    var restURL: string;
    restURL="https://ap6oiuyew6.execute-api.us-east-1.amazonaws.com/dev/SymptomByProfile";
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
      self.loading.dismiss();
      self.recId = 0;
      self.curRec = result.data[0];
      console.log('formSymptom.loadDetails: ', self.curRec);
      self.fillFormDetails();
    }).catch( function(result){
        console.log(result);
        self.loading.dismiss();
        alert('There was an error retrieving this data.  Please try again later');
    });
  }

  fillFormDetails() {
    var dom = null;
    var symName = null;
    if (this.curRec.symptomname !== undefined) {
      symName = this.curRec.symptomname;
    } else if (this.curRec.full_symptom !== undefined) {
      symName = this.curRec.full_symptom;
    }
    if (this.curRec.dateofmeasure !== undefined) {
      dom = this.curRec.dateofmeasure;
    } else if (this.curRec.startdate !== undefined) {
      dom = this.curRec.startdate;
    }

    console.log('Add data from fillFormDetails: ', this.curRec);
    this.card_form.get('recordid').setValue(this.curRec.recordid);
    this.card_form.get('symptom').setValue(symName);
    this.card_form.get('symptomdescription').setValue(this.curRec.symptomdescription);
    this.card_form.get('dateofmeasure').setValue(this.formatDateTimeSaved(dom));
    this.card_form.get('enddate').setValue(this.formatDateTime(this.curRec.enddate));
    this.card_form.get('endtime').setValue(this.formatTime(this.curRec.enddate));
    this.card_form.get('medicalevent').setValue(this.curRec.medicalevent);

    if (this.curRec.treatments !== undefined && this.curRec.treatments.items !== undefined && this.curRec.treatments.items.length > 0) {
      this.addExistingTreatments();
    }
    console.log('Event term from fillformdetails'+ this.curRec.medicationname);
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
              var restURL="https://ap6oiuyew6.execute-api.us-east-1.amazonaws.com/dev/SymptomByProfile";
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
                console.log('Error in formSymptom.delete: ',result);
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
    if (this.card_form.get('starttime').dirty) {
      strTime = this.card_form.get('starttime').value;
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

calculateEndDate() {
  var dtString;
  var offsetDate;
  var offset;
  var finalDate;
  var strDate;
  var strTime = '00:00';
  //console.log('Date of Measure: ' + this.card_form.get('dateofmeasure').value);
  //console.log('Start Time: ' + this.card_form.get('starttime').value);
  if (this.userTimezone !== undefined && this.userTimezone !== null && this.userTimezone !== "") {
    strDate = this.momentNow.tz(this.userTimezone).format('YYYY-MM-DD');
  } else {
    strDate = this.momentNow.format('YYYY-MM-DD');
  }
  if (this.card_form.get('enddate').dirty) {
    strDate = this.card_form.get('enddate').value;
  }
  if (this.card_form.get('endtime').dirty) {
    strTime = this.card_form.get('endtime').value;
  }
  dtString = strDate + ' ' + strTime;
  offsetDate = new Date(moment(dtString).toISOString());
  offset = offsetDate.getTimezoneOffset() / 60;
  if (this.userTimezone !== undefined && this.userTimezone !== null && this.userTimezone !== "") {
    finalDate = moment(dtString).tz(this.userTimezone).add(offset, 'hours').format('YYYY-MM-DD HH:mm');
    console.log('Final end date with timezone: ' + finalDate);
  } else {
    finalDate = moment(dtString).add(offset, 'hours').format('YYYY-MM-DD HH:mm');
    console.log('Final end date with no timezone: ' + finalDate);
  }
  return finalDate;
}

  saveRecordDo(){
    this.saving = true;
    if (this.card_form.get('recordid').value !==undefined && this.card_form.get('recordid').value !==null) {
      this.formSave.recordid = this.card_form.get('recordid').value;
      this.formSave.profileid = this.RestService.currentProfile;
      this.formSave.userid = this.RestService.userId;
      this.formSave.active = 'Y';

      if (this.card_form.get('symptom').dirty){
        this.formSave.symptomname = this.card_form.get('symptom').value;
      }
      if (this.card_form.get('symptomdescription').dirty){
        this.formSave.symptomdescription = this.card_form.get('symptomdescription').value;
      }
      if (this.card_form.get('enddate').dirty && this.card_form.get('enddate').value !== null){
        this.formSave.enddate = this.calculateEndDate();
      }
    } else {
      //New Insert

      //If this symptom was created from a medical condition (through the medical condition page), add the medical condition reference
      if (this.fromEvent !== undefined && this.fromEvent !== null && this.fromEvent.medicaleventid > 0) {
        this.formSave.medicaleventid = this.fromEvent.medicaleventid;
      } else {
        console.log('Symptom insert not from Event: ', this.fromEvent);
      }

      this.formSave.symptomname = this.card_form.get('symptom').value;
      if (this.card_form.get('symptomdescription').dirty){
        this.formSave.symptomdescription = this.card_form.get('symptomdescription').value;
      }
      if (this.card_form.get('dateofmeasure').dirty || this.card_form.get('starttime').dirty){
        this.formSave.startdate = this.calculateDateTime();
      }
      if (this.card_form.get('enddate').dirty && this.card_form.get('enddate').value !== null){
        this.formSave.enddate = this.calculateEndDate();
      }
      this.formSave.profileid = this.RestService.currentProfile;
      this.formSave.userid = this.RestService.userId;
      this.formSave.active = 'Y';
    }
      var restURL="https://ap6oiuyew6.execute-api.us-east-1.amazonaws.com/dev/SymptomByProfile";
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
        console.log('Happy Path: ', self.RestService.results);
        self.category.title = "Measure";
        self.loading.dismiss();
        self.nav.pop();
      }).catch( function(result){
        console.log('Error from formSymptom.save: ',result);
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
      this.formSave.recordid = this.card_form.get('recordid').value;
      this.formSave.profileid = this.RestService.currentProfile;
      this.formSave.userid = this.RestService.userId;
      this.formSave.active = 'Y';
      if (this.card_form.get('symptom').dirty){
        this.formSave.symptomname = this.card_form.get('symptom').value;
      }
      if (this.card_form.get('symptomdescription').dirty){
        this.formSave.symptomdescription = this.card_form.get('symptomdescription').value;
      }
      if (this.card_form.get('enddate').dirty && this.card_form.get('enddate').value !== null){
        this.formSave.enddate = this.calculateEndDate();
      }
      if (this.card_form.get('medicaleventid').value !== null && this.card_form.get('medicaleventid').value > 0) {
        this.formSave.medicaleventid = this.card_form.get('medicaleventid').value;
      }
    } else {
      this.formSave.symptomname = this.card_form.get('symptom').value;
      if (this.card_form.get('symptomdescription').dirty){
        this.formSave.symptomdescription = this.card_form.get('symptomdescription').value;
      }
      if (this.card_form.get('dateofmeasure').dirty || this.card_form.get('starttime').dirty){
        this.formSave.startdate = this.calculateDateTime();
      }
      if (this.card_form.get('enddate').dirty && this.card_form.get('enddate').value !== null){
        this.formSave.enddate = this.calculateEndDate();
      }
      if (this.card_form.get('medicaleventid').value !== null && this.card_form.get('medicaleventid').value > 0) {
        this.formSave.medicaleventid = this.card_form.get('medicaleventid').value;
      }
      this.formSave.profileid = this.RestService.currentProfile;
      this.formSave.userid = this.RestService.userId;
      this.formSave.active = 'Y';
    }
      var restURL="https://ap6oiuyew6.execute-api.us-east-1.amazonaws.com/dev/SymptomByProfile";
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
        this.curRec.recordid = result.data[0];
        this.curRec.symptomname = this.card_form.get('symptomname').value;
        self.loading.dismiss();
        callback(null, result.data);
      }).catch( function(result){
        console.log('Error from formSymptom.save: ',result);
        self.loading.dismiss();
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

  hasEndDate() {
    if (this.card_form.get('enddate').value !== undefined && this.card_form.get('enddate').value !== null){
      return true;
    } else {
      return false;
    }
  }

  formatDateTimeTitle(dateString) {
    if (this.userTimezone !== undefined && this.userTimezone !== null && this.userTimezone !=="") {
      return moment(dateString).tz(this.userTimezone).format('dddd, MMMM DD');
    } else {
      return moment(dateString).format('dddd, MMMM DD');
    }
  }

  formatDateTimeSaved(dateString) {
    if (dateString !== undefined && dateString !== null && dateString !== "") {
      if (this.userTimezone !== undefined && this.userTimezone !=="") {
        return moment(dateString).tz(this.userTimezone).format('MMM DD YYYY hh:mm a');
      } else {
        return moment(dateString).format('MMM DD YYYY hh:mm a');
      }
    } else {
      return null;
    }
  }

  formatDateTime(dateString) {
    console.log('FormatDateTime: datestring: ' + dateString);
    if (dateString !== undefined && dateString !== null && dateString !== "") {
      if (this.userTimezone !== undefined && this.userTimezone !=="") {
        console.log('formatDateTime has tz return is: ' + moment(dateString).tz(this.userTimezone).toISOString());
        return moment(dateString).tz(this.userTimezone).toISOString();
      } else {
        console.log('formatDateTime no tz return is: ' + moment(dateString).format('MMM DD YYYY'));
        return moment(dateString).format('MMM DD YYYY');
      }
    } else {
      return null;
    }
  }

  formatTime(dateString) {
    if (dateString !== undefined && dateString !== null && dateString !== "") {
      if (this.userTimezone !== undefined && this.userTimezone !=="") {
        return moment(dateString).tz(this.userTimezone).format('hh:mm A');
      } else {
        return moment(dateString).format('hh:mm A');
      }
    } else {
      return null;
    }
  }

  noSymptom() {
    if (this.card_form.get('symptom').value == null || this.card_form.get('symptom').value == "") {
      return true;
    } else {
      return false;
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
    if (dataObj !== undefined && dataObj !== null) {

      if (dataObj == 'Medication') {
        this.checkSave = true;
        var cat = {title: dataObj};
        console.log('Form load menu - curRec.recordid: ' +  this.curRec.recordid);
        var formSymptom = {symptomid: this.curRec.symptomid, symptomname: this.curRec.symptomname}
        this.nav.push(FormMedication, {category: cat, fromEvent: formSymptom});
      } else if (dataObj == 'Procedure') {
        console.log('Add Procedure');
      } else if (dataObj == 'Rehab Therapy') {
        console.log('Add Rehab Therapy');
      } else {
        console.log ('No data in loadMenu');
      }
    }
  }

  updateSymptomTreatment(index) {
    var cat;
    var treatments = this.card_form.get('treatments') as FormArray;
    var objType = treatments.at(index).get('type').value;
    var objRecordid = treatments.at(index).get('reftablefieldid').value;

    //console.log('treatment Obj: ', this.postVisit[0].diagnoses[parentIndex].treatments.items[index]);
    //console.log('objType from updateTreatment: ' + objType + ', Comparison: ' + objType2);
    //console.log('objType from updateTreatment: ' + objRecordid + ', Comparison: ' + objRecordid2);
    if (objType == 'medication') {
      cat = {title: 'Medication'};
      var formSymptom = {symptomid: this.curRec.symptomid, symptomname: this.curRec.symptomname}
      this.nav.push(FormMedication, { loadFromId: objRecordid, category: cat, formSymptom: formSymptom });
    }
  }

  addExistingTreatments() {
    this.treatments = this.card_form.get('treatments') as FormArray;
    if (this.curRec !== undefined && this.curRec.treatments !== undefined && this.curRec.treatments.items !== undefined
      && this.curRec.treatments.items.length > 0) {

        var exitLoop = 0;
        while (this.treatments.length !== 0 || exitLoop > 9) {
          this.treatments.removeAt(0);
          exitLoop = exitLoop + 1;
        }
        for (var j = 0; j < this.curRec.treatments.items.length; j++) {
          this.treatments.push(this.addExistingTreatment(j));
        }
      console.log('Once symptoms are saved with medical event');
    }
  }

  addExistingTreatment(index): FormGroup {
    return this.formBuilder.group({
      recordid: new FormControl({value: this.curRec.treatments.items[index].recordid, disabled: true}),
      reftable: new FormControl({value: this.curRec.treatments.items[index].reftable, disabled: true}),
      reftablefield: new FormControl({value: this.curRec.treatments.items[index].reftablefield, disabled: true}),
      reftablefieldid: new FormControl({value: this.curRec.treatments.items[index].reftablefieldid, disabled: true}),
      reftablefields: new FormControl({value: this.curRec.treatments.items[index].reftablefields, disabled: true}),
      type: new FormControl({value: this.curRec.treatments.items[index].type, disabled: true}),
      namevalue: new FormControl({value: this.curRec.treatments.items[index].namevalue, disabled: true}),
      indication: new FormControl({value: this.curRec.treatments.items[index].indication, disabled: true}),
      dateofmeasure: new FormControl({value: this.curRec.treatments.items[index].dateofmeasure, disabled: true}),
    });
  }

  async ionViewCanLeave() {
    if (!this.saving && (this.card_form.dirty) && !this.checkSave) {
      const shouldLeave = await this.confirmLeave();
      return shouldLeave;
    } else if (!this.saving && (this.card_form.dirty) && this.checkSave) {
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
