import { Component } from '@angular/core';
import { NavController, NavParams, AlertController, LoadingController } from 'ionic-angular';
import { Validators, FormGroup, FormControl, FormBuilder } from '@angular/forms';
import { RestService } from '../../app/services/restService.service';
import { AboutMeService } from '../../pages/formAboutMe/formAboutMe.service';
import { HistoryItemModel } from '../../pages/history/history.model';
import { DictionaryModel, DictionaryItem } from '../../pages/models/dictionary.model';
import { DictionaryService } from '../../pages/models/dictionary.service';
import { TextMaskModule, conformToMask } from 'angular2-text-mask';
import { ListContact } from '../../pages/listContacts/listContacts.model';

var moment = require('moment-timezone');

@Component({
  selector: 'formVisit1-page',
  templateUrl: 'formContact.html'
})
export class FormContactPage {
  section: string;
  recId: number;
  formName: string = "formContact";
  card_form: FormGroup;
  curRec: any;
  newRec: Boolean = false;
  dictionaries: DictionaryModel = new DictionaryModel();
  category: HistoryItemModel = new HistoryItemModel();
  loading: any;
  saving: boolean = false;
  firstnamelock: boolean = false;
  lastnamelock: boolean = false;
  fromgoogle: boolean = false;
  masks: any;
  textMask: TextMaskModule = new TextMaskModule();
  isfacility: boolean = false;
  stateList: DictionaryItem[];
  doctorTypeList: DictionaryItem[];
  saveModel: ListContact = new ListContact();
  loadFromId: number;

  constructor(public nav: NavController, public alertCtrl: AlertController, public RestService:RestService, public AboutMeService: AboutMeService,
    public navParams: NavParams,  public loadingCtrl: LoadingController, public dictionaryService: DictionaryService, public formBuilder: FormBuilder) {

    this.recId = navParams.get('recId');
    this.curRec = RestService.results[this.recId];
    this.loadFromId = navParams.get('loadFromId');

    if (this.recId !== undefined) {
      //console.log('FacilityType: ' + this.curRec.facilitytype);
      if(this.curRec.facilitytype !== undefined && this.curRec.facilitytype !== null && this.curRec.facilitytype !== "") {
        this.isfacility = true;
      }
    }
    this.masks = {
      phoneNumber: ['(', /[1-9]/, /\d/, /\d/, ')', ' ', /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/],
    };
    if (this.recId !== undefined) {
      this.card_form = new FormGroup({
        recordid: new FormControl(this.curRec.recordid),
        title: new FormControl(this.curRec.title),
        firstname: new FormControl(this.curRec.firstname),
        firstnamelock: new FormControl(this.curRec.firstnamelock),
        lastname: new FormControl(this.curRec.lastname),
        lastnamelock: new FormControl(this.curRec.lastnamelock),
        suffix: new FormControl(this.curRec.suffix),
        streetaddress: new FormControl(this.curRec.streetaddress),
        city: new FormControl(this.curRec.city),
        state: new FormControl(this.curRec.state),
        zipcode: new FormControl(this.curRec.zipcode),
        phonenumber: new FormControl(this.curRec.phonenumber),
        email: new FormControl(this.curRec.email),
        website: new FormControl(this.curRec.website),
        latitude: new FormControl(this.curRec.latitude),
        longitude: new FormControl(this.curRec.longitude),
        badaddress: new FormControl(this.curRec.badaddress),
        fromgoogle: new FormControl(this.curRec.fromgoogle),
        facilitytype: new FormControl(this.curRec.facilitytype),
        googleurl: new FormControl(this.curRec.googleurl),
        profile2contactid: new FormControl(this.curRec.profile2contactid),
        relationship: new FormControl(this.curRec.relationship),
        doctortype: new FormControl(this.curRec.doctortype),
        covered: new FormControl(this.curRec.covered),
        profileid: new FormControl(this.curRec.profileid),
        timezone: new FormControl(this.curRec.timezone),
        active: new FormControl(this.curRec.active),
      });
      if (this.curRec.firstnamelock !== undefined && this.curRec.firstnamelock == 'Y') {
        this.firstnamelock = true;
      }
      if (this.curRec.lastnamelock !== undefined && this.curRec.lastnamelock == 'Y') {
        this.lastnamelock = true;
      }
      if (this.curRec.fromgoogle !== undefined && this.curRec.fromgoogle == 'Y') {
        this.fromgoogle = true;
      }
    } else {
      this.newRec = true;
      this.card_form = new FormGroup({
        recordid: new FormControl(),
        title: new FormControl(),
        firstname: new FormControl(),
        firstnamelock: new FormControl(),
        lastname: new FormControl(null, Validators.required),
        lastnamelock: new FormControl(),
        suffix: new FormControl(),
        streetaddress: new FormControl(),
        city: new FormControl(),
        state: new FormControl(),
        zipcode: new FormControl(),
        phonenumber: new FormControl(null, Validators.required),
        email: new FormControl(),
        website: new FormControl(),
        latitude: new FormControl(),
        longitude: new FormControl(),
        badaddress: new FormControl(),
        fromgoogle: new FormControl('N'),
        googleurl: new FormControl(),
        facilitytype: new FormControl(),
        profile2contactid: new FormControl(),
        relationship: new FormControl(),
        doctortype: new FormControl(null, Validators.required),
        covered: new FormControl(),
        profileid: new FormControl(),
        timezone: new FormControl(),
        active: new FormControl(),
      });
      }
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
          console.log('Need to login again!!! - Credentials expired from listSleep');
          self.loading.dismiss();
          self.RestService.appRestart();
        } else {
          console.log('From listSleep - Credentials refreshed!');
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
      //self.RestService.results = result.data;
      self.dictionaryService
      .getData()
      .then(data => {
        self.dictionaries.items = result.data;
        console.log("Results Data for Get Dictionaries: ", self.dictionaries.items);
        self.stateList = self.dictionaries.items[0].dictionary; //index 0 as aligned with sortIndex
        self.doctorTypeList = self.dictionaries.items[1].dictionary;
        if (self.curRec !== undefined && self.curRec.phonenumber !== undefined && self.curRec.phonenumber !== null && self.curRec.phonenumber !== "") {
          var phoneNumber = String(self.curRec.phonenumber);
          var phoneNumberMask = ['(', /[1-9]/, /\d/, /\d/, ')', ' ', /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/];
          var conformedPhoneNumber = conformToMask(
            phoneNumber,
            phoneNumberMask,
            {guide: false}
          );
          self.card_form.controls["phonenumber"].setValue(conformedPhoneNumber.conformedValue);
        }

        if (self.loadFromId !== undefined && self.loadFromId !== null && self.loadFromId > 0) {
          self.loadDetails();
        } else {
          self.loading.dismiss();
        }
      });
    }).catch( function(result){
      if (self.loadFromId !== undefined && self.loadFromId !== null && self.loadFromId > 0) {
        self.loadDetails();
      } else {
        console.log('Catch Result from formContact.loadDictionaries: ', result);
        self.loading.dismiss();
        alert('There was an error retrieving this data.  Please try again later');
      }
    });
  }

  loadDetails() {
    //this.presentLoadingDefault();
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
            loadFromId: this.loadFromId,
        }
    };
    var body = '';
    var self = this;

    apigClient.invokeApi(params, pathTemplate, method, additionalParams, body)
    .then(function(result){
      self.loadFromId = null;
      if (result !== undefined && result.data !== undefined && result.data[0] !== undefined && result.data[0].recordid !==undefined) {
        self.recId = 0;
        self.curRec = result.data[0];
        self.newRec = false;
        console.log('formContact.loadDetails: ', self.curRec);
        self.loadMainRecord();
      } else {
        console.log('No data from formContact.loadDetails');
      }
      self.loading.dismiss();
    }).catch( function(result){
      self.loadFromId = null;
      console.log('Err from formContact.loadDetails: ', result);
      self.loading.dismiss();
      alert('There was an error retrieving this data.  Please try again later');
    });
  }

  loadMainRecord() {
    this.card_form.get('recordid').setValue(this.curRec.recordid);
    this.card_form.get('title').setValue(this.curRec.title);
    this.card_form.get('firstname').setValue(this.curRec.firstname);
    this.card_form.get('firstnamelock').setValue(this.curRec.firstnamelock);
    this.card_form.get('lastname').setValue(this.curRec.lastname);
    this.card_form.get('lastnamelock').setValue(this.curRec.lastnamelock);
    this.card_form.get('suffix').setValue(this.curRec.suffix);
    this.card_form.get('streetaddress').setValue(this.curRec.streetaddress);
    this.card_form.get('city').setValue(this.curRec.city);
    this.card_form.get('state').setValue(this.curRec.state);
    this.card_form.get('zipcode').setValue(this.curRec.zipcode);
    this.card_form.get('phonenumber').setValue(this.curRec.phonenumber);
    this.card_form.get('email').setValue(this.curRec.email);
    this.card_form.get('website').setValue(this.curRec.website);
    this.card_form.get('latitude').setValue(this.curRec.latitude);
    this.card_form.get('longitude').setValue(this.curRec.longitude);
    this.card_form.get('badaddress').setValue(this.curRec.badaddress);
    this.card_form.get('fromgoogle').setValue(this.curRec.fromgoogle);
    this.card_form.get('facilitytype').setValue(this.curRec.facilitytype);
    this.card_form.get('googleurl').setValue(this.curRec.googleurl);
    this.card_form.get('profile2contactid').setValue(this.curRec.profile2contactid);
    this.card_form.get('relationship').setValue(this.curRec.relationship);
    this.card_form.get('doctortype').setValue(this.curRec.doctortype);
    this.card_form.get('covered').setValue(this.curRec.covered);
    this.card_form.get('profileid').setValue(this.curRec.profileid);
    this.card_form.get('timezone').setValue(this.curRec.timezone);
    this.card_form.get('active').setValue(this.curRec.active);
  }

  public today() {
    return new Date().toJSON().split('T')[0];
  }

  trimLastCharPhone() {
    // Determine de max length to trim the extra character
    var phonenumber = this.card_form.get('phonenumber').value;
    if (phonenumber !== undefined && phonenumber !== null){
      if (phonenumber.length > 14 && phonenumber.substring(13, 14) !== "_" && phonenumber.substring(13, 14) !== " ") {
        this.card_form.get('phonenumber').setValue(phonenumber.substring(0,14));
      }
    } else {
      return "";
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
          console.log('Need to login again!!! - Credentials expired from formContact.deleteRecord');
          self.loading.dismiss();
          self.RestService.appRestart();
        } else {
          console.log('From formContact.deleteRecord - Credentials refreshed!');
          self.deleteRecordDo();
        }
      });
    }
  }

  deleteRecordDo(){
    let alert2 = this.alertCtrl.create({
      title: 'Confirm Delete',
      message: 'Are you certain you want to inactivate this medical contact?',
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
              this.saveModel.profileid = this.RestService.currentProfile;
              this.saveModel.userid = this.RestService.userId;
              this.saveModel.recordid = this.card_form.controls["recordid"].value;
              this.saveModel.profile2contactid = this.card_form.controls["profile2contactid"].value;
              this.saveModel.active = 'N';
              var restURL="https://ap6oiuyew6.execute-api.us-east-1.amazonaws.com/dev/ContactByProfile";
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
              var body = JSON.stringify(this.saveModel);
              var self = this;
              console.log('Calling Post', this.saveModel);
              apigClient.invokeApi(params, pathTemplate, method, additionalParams, body)
                .then(function(result){
                  self.RestService.results = result.data;
                  console.log('Happy Path: ' + self.RestService.results);
                  self.loading.dismiss();
                  self.RestService.backFromChild = true;
                  self.RestService.needsFormRefresh = true;
                  self.nav.pop();
                }).catch( function(result){
                  console.log('Error in deleting contact: ',result);
                  alert('There was an error in removing this contact.  Please try again later');
                  self.loading.dismiss();
              });
          }
        }
      ]
    });
    alert2.present();
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
          console.log('Need to login again!!! - Credentials expired from formContacts.saveRecord');
          self.loading.dismiss();
          self.RestService.appRestart();
        } else {
          console.log('From formContacts.saveRecord - Credentials refreshed!');
          self.saveRecordDo();
        }
      });
    }
  }

  saveRecordDo(){
    this.saving = true;
    this.saveModel.profileid = this.RestService.currentProfile;
    this.saveModel.userid = this.RestService.userId;
    this.saveModel.active = 'Y';
    if (!this.newRec) {
      this.saveModel.recordid = this.curRec.recordid;
      this.saveModel.profile2contactid = this.curRec.profile2contactid;
    }
    this.saveModel.fromgoogle = this.card_form.controls["fromgoogle"].value;
    if (this.card_form.controls["firstname"].dirty) {
      this.saveModel.firstname = this.card_form.controls["firstname"].value;
    }
    if (this.card_form.controls["lastname"].dirty) {
      this.saveModel.lastname = this.card_form.controls["lastname"].value;
    }
    if (this.card_form.controls["streetaddress"].dirty) {
      this.saveModel.streetaddress = this.card_form.controls["streetaddress"].value;
    }
    if (this.card_form.controls["city"].dirty) {
      this.saveModel.city = this.card_form.controls["city"].value;
    }
    if (this.card_form.controls["state"].dirty) {
      this.saveModel.state = this.card_form.controls["state"].value;
    }
    if (this.card_form.controls["zipcode"].dirty) {
      this.saveModel.zipcode = this.card_form.controls["zipcode"].value;
    }
    if (this.card_form.controls["phonenumber"].dirty) {
      this.saveModel.phonenumber = this.card_form.controls["phonenumber"].value.replace(/\D+/g, '');
    }
    if (this.card_form.controls["email"].dirty) {
      this.saveModel.email = this.card_form.controls["email"].value;
    }
    if (this.card_form.controls["website"].dirty) {
      this.saveModel.website = this.card_form.controls["website"].value;
    }
    if (this.card_form.controls["latitude"].dirty) {
      this.saveModel.latitude = this.card_form.controls["latitude"].value;
    }
    if (this.card_form.controls["longitude"].dirty) {
      this.saveModel.longitude = this.card_form.controls["longitude"].value;
    }
    if (this.card_form.controls["timezone"].dirty) {
      this.saveModel.timezone = this.card_form.controls["timezone"].value;
    }
    if (this.card_form.controls["doctortype"].dirty) {
      this.saveModel.doctortype = this.card_form.controls["doctortype"].value;
    }
    if (this.card_form.controls["covered"].dirty) {
      this.saveModel.covered = this.card_form.controls["covered"].value;
    }
      var restURL="https://ap6oiuyew6.execute-api.us-east-1.amazonaws.com/dev/ContactByProfile";
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
      var body = JSON.stringify(this.saveModel);
      var self = this;
      console.log('Calling Post', this.saveModel);
      apigClient.invokeApi(params, pathTemplate, method, additionalParams, body)
        .then(function(result){
          self.RestService.results = result.data;
          if (!self.newRec) {
            console.log('Happy Path: ' + self.RestService.results);
            self.category.title = "Medical Contacts";
            self.loading.dismiss();
            self.RestService.backFromChild = true;
            self.RestService.needsFormRefresh = true;
            self.nav.pop();
          } else {
            self.loading.dismiss();
            self.RestService.backFromChild = true;
            self.RestService.needsFormRefresh = true;
            self.nav.pop();
          }
      }).catch( function(result){
          console.log('Result: ',result);
          self.loading.dismiss();
          alert('There was an error saving this data.  Please try again later');
        });
  }

  async ionViewCanLeave() {
    this.RestService.backFromChild = true;
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
