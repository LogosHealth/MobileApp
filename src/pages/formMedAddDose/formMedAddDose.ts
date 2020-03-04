import { Component } from '@angular/core';
import { NavController, NavParams, AlertController, LoadingController, ViewController } from 'ionic-angular';
import { Validators, FormGroup, FormControl } from '@angular/forms';
import { RestService } from '../../app/services/restService.service';
import { MedAddDose } from './formMedAddDose.model';
import { ListDoseHistory } from '../../pages/listDoseHistory/listDoseHistory';


//import { bool } from 'aws-sdk/clients/signer';

var moment = require('moment-timezone');

@Component({
  selector: 'formExercise-page',
  templateUrl: 'formMedAddDose.html'
})
export class FormMedAddDose {
  loading: any;
  section: string;
  formName: string = "FormMedAddDose";
  recId: number;
  card_form: FormGroup;
  curRec: any;
  newRec: boolean = false;
  saving: boolean = false;
  showTips: boolean = true;
  changeUser: boolean = false;
  selectUser: boolean = false;
  selectedUser;
  userUpdated: boolean = false;
  objIncluded:string;
  fromEvent;
  fromSymptom;
  fromTreatment;
  medication;
  categories_checkbox_open: boolean;
  categories_checkbox_result;
  doseProfileId: any = 0;
  doseConditionId;
  doseCondition;
  fromCondition: boolean = false;
  momentNow: any;
  userTimezone: any;
  formSave: MedAddDose = new MedAddDose();
  dtNow: any = moment(Date()).format('YYYY-MM-DDTHH:mm');
  eventList: any = [];
  currentEvent: any;

  constructor(public nav: NavController, public alertCtrl: AlertController, public RestService:RestService,
    public navParams: NavParams, public loadingCtrl: LoadingController, public viewCtrl: ViewController) {
    this.curRec = this.RestService.getRealProfiles();
    this.objIncluded = navParams.get('objIncluded');
    this.fromEvent = navParams.get('fromEvent');
    this.fromSymptom = navParams.get('fromSymptom');
    this.fromTreatment = navParams.get('fromTreatment');
    this.medication = navParams.get('medication');
    //console.log('dtNow: ' + this.dtNow);
    console.log('medication: ', this.medication);
    console.log('fromEvent: ', this.fromEvent);
    console.log('fromSymptom: ', this.fromSymptom);
    console.log('fromTreatment: ', this.fromTreatment);

    if (this.objIncluded == 'symptom') {
      this.doseProfileId = this.fromSymptom.profileid;
      this.doseConditionId = this.fromSymptom.symptomid;
      this.doseCondition = this.fromSymptom.symptom;
      this.fromCondition = true;
    } else if (this.objIncluded == 'event') {
      this.doseProfileId = this.fromEvent.profileid;
      this.doseConditionId = this.fromEvent.medicaleventid;
      this.doseCondition = this.fromEvent.medicalevent;
      this.fromCondition = true;
    } else if (this.objIncluded == 'treatment event' || this.objIncluded == 'treatment symptom') {
      this.doseProfileId = this.fromTreatment.profileid;
      this.doseConditionId = this.fromTreatment.conditionid;
      this.doseCondition = this.fromTreatment.indication;
      this.fromCondition = true;
    }

    console.log('Choose Profile curRec: ', this.curRec);

    var self = this;
    this.RestService.curProfileObj(function (error, results) {
      if (!error) {
        self.userTimezone = results.timezone;
      }
    });
    this.momentNow = moment(new Date());

    if (this.objIncluded == 'symptom' || this.objIncluded == 'event') {
      this.card_form = new FormGroup({
        profileid: new FormControl(this.doseProfileId, Validators.required),
        condition: new FormControl(this.doseCondition, Validators.required),
        conditionid: new FormControl(this.doseConditionId, Validators.required),
        medication: new FormControl(this.medication.medicationname, Validators.required),
        medicationid: new FormControl(this.medication.recordid),
        dose: new FormControl(null, Validators.required),
        doseunit: new FormControl(this.medication.inventoryunit),
        dateofmeasure: new FormControl(this.dtNow),
        timeofmeasure: new FormControl(this.dtNow),
        treatmentid: new FormControl(),
      });
    } else if (this.objIncluded == 'treatment event' || this.objIncluded == 'treatment symptom') {
     // console.log('From Treatment Initialize form doseProfileId: ' + this.doseProfileId);
      //console.log('From Treatment Initialize form doseCondition: ' + this.doseCondition);
      //console.log('From Treatment Initialize form doseConditionId: ' + this.doseConditionId);
      //console.log('From Treatment Initialize form namevalue: ' + this.fromTreatment.namevalue);
      //console.log('From Treatment Initialize form medicationid: ' + this.fromTreatment.medicationid);
      //console.log('From Treatment Initialize form dosage: ' + this.fromTreatment.dosage);
      //console.log('From Treatment Initialize form treatmentid: ' + this.fromTreatment.treatmentid);
      this.card_form = new FormGroup({
        profileid: new FormControl(this.doseProfileId, Validators.required),
        condition: new FormControl(this.doseCondition, Validators.required),
        conditionid: new FormControl(this.doseConditionId, Validators.required),
        medication: new FormControl(this.fromTreatment.namevalue, Validators.required),
        medicationid: new FormControl(this.fromTreatment.medicationid, Validators.required),
        dose: new FormControl(this.fromTreatment.dosage, Validators.required),
        doseunit: new FormControl(this.fromTreatment.doseunits),
        dateofmeasure: new FormControl(this.dtNow),
        timeofmeasure: new FormControl(this.dtNow),
        treatmentid: new FormControl(this.fromTreatment.treatmentid, Validators.required),
      });
    } else {
      this.card_form = new FormGroup({
        profileid: new FormControl(),
        condition: new FormControl(null, Validators.required),
        conditionid: new FormControl(null, Validators.required),
        medication: new FormControl(this.medication.medicationname, Validators.required),
        medicationid: new FormControl(this.medication.recordid),
        dose: new FormControl(null, Validators.required),
        doseunit: new FormControl(this.medication.inventoryunit),
        dateofmeasure: new FormControl(this.dtNow),
        timeofmeasure: new FormControl(this.dtNow),
        treatmentid: new FormControl(),
      });
    }
  }

  sendUser() {
    this.saveRecord();
    //this.dismiss();
  }

  loadEventList() {
    this.presentLoadingDefault();
    console.log('Start loadEventList!');
    var restURL: string;
    restURL="https://ap6oiuyew6.execute-api.us-east-1.amazonaws.com/dev/EventListByProfile";
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
            profileid: this.doseProfileId,
        }
    };
    var body = '';
    var self = this;

    apigClient.invokeApi(params, pathTemplate, method, additionalParams, body)
    .then(function(result){
      if (result !== undefined && result.data !== undefined && result.data[0] !== undefined && result.data[0].recordid > 0) {
        self.eventList = result.data;
        self.loading.dismiss();
        console.log('formMedication.loadEventList: ', self.eventList);
      } else {
        console.log('formMedication.loadEventList - no data: ', result);
        self.loading.dismiss();
      }
    }).catch( function(result){
      console.log('Err from formMedication.loadEventList: ', result);
      self.loading.dismiss();
      alert('There was an error retrieving this data.  Please try again later');
    });
  }

  showHistory() {
    var cat;

    cat = {title: 'Dose History'};
    this.nav.push(ListDoseHistory, {treatmentid: this.fromTreatment.treatmentid, treatment: this.fromTreatment, category: cat});

  }

  noHistory() {

  }

  loseFocus() {
    var newProfile;

    if (this.card_form.get('profileid').value !== undefined && this.card_form.get('profileid').value !== null &&
    this.card_form.get('profileid').value > 0) {
      newProfile = this.card_form.get('profileid').value;
      if (newProfile !== this.doseProfileId) {
        this.doseProfileId = newProfile;
        this.loadEventList();
      }
    }
  }

  setCurrentEvent(item) {
    this.currentEvent = item;
    console.log('From setCurEvt: currentEvent ', this.currentEvent);
    if (this.currentEvent.type == 'medicalevent') {
      this.card_form.get('conditionid').setValue(this.currentEvent.recordid);
      this.card_form.get('condition').setValue(this.currentEvent.name);
    } else if (this.currentEvent.type == 'symptom') {
      this.card_form.get('conditionid').setValue(this.currentEvent.recordid);
      this.card_form.get('condition').setValue(this.currentEvent.name);
    } else {
      console.log('Error in setCurEvt bad type: ' + this.currentEvent.type);
    }
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
          console.log('Need to login again!!! - Credentials expired from formChooseProfile.saveRecord');
          self.loading.dismiss();
          self.RestService.appRestart();
        } else {
          console.log('From formChooseProfile.saveRecord - Credentials refreshed!');
          self.saveRecordDo();
        }
      });
    }
  }

  saveRecordDo(){
    this.saving = true;
      var restURL="https://ap6oiuyew6.execute-api.us-east-1.amazonaws.com/dev/DoseHistoryTreatment";
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
            setFromSMC: 'Y'          }
      };

      this.formSave.profileid = this.card_form.get('profileid').value;
      this.formSave.userid = this.RestService.userId;
      this.formSave.dateofmeasure = this.calculateDateTime();
      this.formSave.dose = this.card_form.get('dose').value;
      this.formSave.doseunit = this.card_form.get('doseunit').value;
      this.formSave.active = 'Y';
      this.formSave.type = 'active';
      if (this.card_form.get('treatmentid').value !== undefined && this.card_form.get('treatmentid').value !== null
      && this.card_form.get('treatmentid').value > 0){
        this.formSave.treatmentid = this.card_form.get('treatmentid').value;
      } else {
        console.log('Treatment id field: ' + this.card_form.get('treatmentid').value);
      }

      if (this.card_form.get('medicationid').value !== undefined && this.card_form.get('medicationid').value !== null
      && this.card_form.get('medicationid').value > 0){
        this.formSave.medicationid = this.card_form.get('medicationid').value;
        this.formSave.medication =  this.card_form.get('medication').value;
      } else {
        console.log('Medication id field: ' + this.card_form.get('medicationid').value);
      }

      if (this.card_form.get('conditionid').value !== undefined && this.card_form.get('conditionid').value !== null
      && this.card_form.get('conditionid').value > 0){
        if (this.objIncluded == 'symptom' || this.objIncluded == 'treatment symptom') {
          this.formSave.symptomid = this.card_form.get('conditionid').value;
          this.formSave.condition = this.card_form.get('condition').value;
        } else if  (this.objIncluded == 'event' || this.objIncluded == 'treatment event') {
          this.formSave.medicaleventid = this.card_form.get('conditionid').value;
          this.formSave.condition = this.card_form.get('condition').value;
        } else if (!this.fromCondition) {
          if (this.currentEvent.type == 'medicalevent') {
            this.formSave.medicaleventid = this.card_form.get('conditionid').value;
            this.formSave.condition = this.card_form.get('condition').value;
          } else {
            //Catch all type == 'Symptom'
            this.formSave.symptomid = this.card_form.get('conditionid').value;
            this.formSave.condition = this.card_form.get('condition').value;
          }
        }
      } else {
        console.log('conditionid id field: ' + this.card_form.get('conditionid').value);
      }

      var body = JSON.stringify(this.formSave);
      var self = this;
      console.log('Calling Post', this.formSave);
      apigClient.invokeApi(params, pathTemplate, method, additionalParams, body)
      .then(function(result){
        console.log('Happy Path '+ self.formName + ' Save: ', result);
        self.userUpdated = true;
        self.loading.dismiss();
        self.dismiss();
      }).catch( function(result){
        console.log(self.formName +' Save Error: ',result);
        self.loading.dismiss();
        self.dismiss();
        alert('There was an error saving this data.  Please try again later');
      });
  }

  formatDate(dateString) {
    if (this.userTimezone !== undefined && this.userTimezone !== null && this.userTimezone !=="") {
      return moment(dateString).tz(this.userTimezone).format('MMM DD YYYY');
    } else {
      return moment(dateString).format('MMM DD YYYY');
    }
  }

  calculateDateTime() {
    var dtString;
    //var offsetDate;
    //var offset;
    //var finalDate;
    var strDate;
    var strDateArr;
    var strTime;
    var strTimeArr;
    //console.log('Date of Measure: ' + this.card_form.get('dateofmeasure').value);
    //console.log('timeofmeasure: ' + this.card_form.get('timeofmeasure').value);

    if (this.userTimezone !== undefined && this.userTimezone !== null && this.userTimezone !== "") {
      strDate = this.momentNow.tz(this.userTimezone).format('YYYY-MM-DD');
      strTime = this.momentNow.tz(this.userTimezone).format('HH:mm');
    } else {
      strDate = this.momentNow.format('YYYY-MM-DD');
      strTime = this.momentNow.format('HH:mm');
    }
    if (this.card_form.get('dateofmeasure').value !== undefined && this.card_form.get('dateofmeasure').value !== null) {
      strDateArr = this.card_form.get('dateofmeasure').value.split('T');
      strDate = strDateArr[0];
    }
    if (this.card_form.get('timeofmeasure').value !== undefined && this.card_form.get('timeofmeasure').value !== null) {
      strTimeArr = this.card_form.get('timeofmeasure').value.split('T');
      strTime = strTimeArr[1].substr(0, 5);
    } else {
      strTime = '00:00';
    }
    dtString = strDate + ' ' + strTime;
    console.log('Date before offset: ' + strDate);
    console.log('Time before offset: ' + strTime);
    console.log('Final date string before offset: ' + dtString);
/*
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
*/
  return dtString;

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

  updateUser() {
    this.RestService.userId = this.card_form.get('profileid').value;
    this.userUpdated = true;
    this.dismiss();
  }

  cancelAction() {
    this.userUpdated = false;
    this.dismiss();
  }

  dismiss() {
    let data = { 'userUpdated': this.userUpdated, 'profileid':this.selectedUser };
    this.viewCtrl.dismiss(data);
  }

  printDate() {
    console.log('Dose Date: ' + this.card_form.get('at').value );
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
