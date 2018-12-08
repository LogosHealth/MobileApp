import { Component } from '@angular/core';
import { NavController, NavParams, AlertController, LoadingController } from 'ionic-angular';
import { Validators, FormGroup, FormControl, FormsModule } from '@angular/forms';
import { RestService } from '../../app/services/restService.service';
import { HistoryItemModel } from '../../pages/history/history.model';
import { DictionaryModel, DictionaryItem } from '../../pages/models/dictionary.model';
import { DictionaryService } from '../../pages/models/dictionary.service';
import { FormFindContactModel, FormFindContactItem } from './formFindContact.model';
import { FormFindContactService } from './formFindContact.service';
import { FormContactPage } from '../../pages/formContact/formContact';

var moment = require('moment-timezone');

@Component({
  selector: 'formFindContact',
  templateUrl: 'formFindContact.html'
})
export class FormFindContact {
  loading: any;
  formName: string = "formFindContact";
  card_form: FormGroup;
  saving: boolean = false;
  contactSave: FormFindContactItem = new FormFindContactItem();
  category: HistoryItemModel = new HistoryItemModel();
  userTimezone: any;
  dictionaries: DictionaryModel = new DictionaryModel();
  findcontacts: FormFindContactModel = new FormFindContactModel();
  stateList: DictionaryItem[];
  doctorTypeList: DictionaryItem[];
  searchready: Boolean = false;
  saveready: Boolean = false;
  dsEligible: Boolean = false;
  lastSearch: Boolean = false;

  constructor(public nav: NavController, public alertCtrl: AlertController, public RestService:RestService, public formFindContactService: FormFindContactService,
    public navParams: NavParams, public loadingCtrl: LoadingController, public categoryList: FormsModule, public dictionaryService: DictionaryService) {

      this.categoryList = "physician";
      var self = this;
    this.RestService.curProfileObj(function (error, results) {
      if (!error) {
        self.userTimezone = results.timezone;
      }
    });
    this.card_form = new FormGroup({
      categoryList: new FormControl(),
      contactid: new FormControl(),
      facilitytype: new FormControl(),
      firstname: new FormControl(),
      lastname: new FormControl(null, Validators.required),
      city: new FormControl(),
      state: new FormControl(),
      zipcode: new FormControl(),
      contacts: new FormControl(),
      doctortype: new FormControl(1001),
      covered: new FormControl()
    });
  }

  ionViewWillEnter() {
    var dtNow = moment(new Date());
    var dtExpiration = moment(this.RestService.AuthData.expiration);
    var self = this;

    if (dtNow < dtExpiration) {
      this.loading = this.loadingCtrl.create();
      this.loading.present();
      this.loadDictionaries();
    } else {
      this.loading = this.loadingCtrl.create();
      this.loading.present();
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
        self.stateList = self.dictionaries.items[0].dictionary; //index 0 as aligned with sortIndex
        self.doctorTypeList = self.dictionaries.items[1].dictionary; //index 1 as aligned with sortIndex
        self.loading.dismiss();
      });
    }).catch( function(result){
        console.log(body);
        self.loading.dismiss();
    });
  }

  getStateTerm(index) {
    var stateTerm = "";
    for (var j = 0; j < this.stateList.length; j++) {
      if (this.stateList[j].recordid == index) {
        stateTerm = this.stateList[j].codeddictionary;
      }
    }
    return stateTerm;
  }

  findContacts() {
    var dtNow = moment(new Date());
    var dtExpiration = moment(this.RestService.AuthData.expiration);
    var self = this;

    if (dtNow < dtExpiration) {
      this.loading = this.loadingCtrl.create();
      this.loading.present();
      this.findContactsDo();
    } else {
      this.loading = this.loadingCtrl.create();
      this.loading.present();
      this.RestService.refreshCredentials(function(err, results) {
        if (err) {
          console.log('Need to login again!!! - Credentials expired from ' + self.formName + '.findContacts');
          self.loading.dismiss();
          self.RestService.appRestart();
        } else {
          console.log('From '+ self.formName + '.findContacts - Credentials refreshed!');
          self.findContactsDo();
        }
      });
    }
  }

  findContactsDo() {
    var restURL: string;
    var contactInfo = "Dr. ";
    var hasData = false;
    var strLastName = "";
    var strFirstName = "";
    var strCity = "";
    var intState = "";
    var strStateCode = "";
    var intZipCode = "";
    var profileid = this.RestService.currentProfile;

    console.log('FindContacts categoryList: ' + this.categoryList);
    if (this.categoryList == "physician") {
      if (this.card_form.controls["lastname"].value !== null && this.card_form.controls["lastname"].value.trim() !== "") {
        hasData = true;
        contactInfo = contactInfo + this.card_form.controls["lastname"].value + " ";
        strLastName = this.card_form.controls["lastname"].value;
      }
      if (this.card_form.controls["firstname"].dirty && this.card_form.controls["firstname"].value !== null) {
        contactInfo = contactInfo + this.card_form.controls["firstname"].value + " ";
        strFirstName = this.card_form.controls["firstname"].value;
      }
    } else {
      if (this.card_form.controls["facilitytype"].value !== null && this.card_form.controls["facilitytype"].value.trim() !== "") {
        hasData = true;
        contactInfo = this.card_form.controls["facilitytype"].value + " near me ";
        strLastName = this.card_form.controls["facilitytype"].value;
      }
    }

    if (hasData) {
      if ((this.card_form.controls["city"].dirty && this.card_form.controls["city"].value.length > 2) && this.card_form.controls["state"].dirty) {
        contactInfo = contactInfo + this.card_form.controls["city"].value + " ";
        strCity = this.card_form.controls["city"].value;
        contactInfo = contactInfo + this.getStateTerm(this.card_form.controls["state"].value) + " ";
        strStateCode = this.getStateTerm(this.card_form.controls["state"].value);
        intState = this.card_form.controls["state"].value;
        if (this.card_form.controls["zipcode"].dirty && this.card_form.controls["zipcode"].value.length == 5) {
          contactInfo = contactInfo + this.card_form.controls["zipcode"].value + " ";
          intZipCode = this.card_form.controls["zipcode"].value;
        }
      } else if (this.card_form.controls["zipcode"].dirty && this.card_form.controls["zipcode"].value.length == 5) {
        contactInfo = contactInfo + this.card_form.controls["zipcode"].value + " ";
        intZipCode = this.card_form.controls["zipcode"].value;
        if (this.card_form.controls["city"].dirty && this.card_form.controls["city"].value.length > 2) {
          contactInfo = contactInfo + this.card_form.controls["city"].value + " ";
          strCity = this.card_form.controls["city"].value;
        }
        if (this.card_form.controls["state"].dirty) {
          contactInfo = contactInfo + this.getStateTerm(this.card_form.controls["state"].value) + " ";
          strStateCode = this.getStateTerm(this.card_form.controls["state"].value);
          intState = this.card_form.controls["state"].value;
          }
      } else {
        hasData = false;
      }
    }

    if (hasData) {
      this.loading = this.loadingCtrl.create();
      this.loading.present();
      console.log('Contact Info from findContacts: ' + contactInfo);
      restURL="https://ap6oiuyew6.execute-api.us-east-1.amazonaws.com/dev/FindContactByNameZip";
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
            contactInfo: contactInfo,
            firstName: strFirstName,
            lastName: strLastName,
            city: strCity,
            state: intState,
            stateCode: strStateCode,
            zipCode: intZipCode,
            profileid: profileid
          }
      };
      var body = '';
      var self = this;
      apigClient.invokeApi(params, pathTemplate, method, additionalParams, body)
      .then(function(result){
        if (Array.isArray(result.data)) {
          var resultData = result.data;
          self.formFindContactService
          .getData()
          .then(data => {
            self.findcontacts.items = resultData;
            if (self.findcontacts.items[0].googlesearch !== undefined && self.findcontacts.items[0].googlesearch == 'N') {
              self.dsEligible = true;
              self.lastSearch = false;
            } else {
              self.dsEligible = false;
              self.lastSearch = true;
            }
            console.log("Results Data for FindContactByNameZip: ", self.findcontacts.items);
            self.loading.dismiss();
          });
        } else {
          self.dsEligible = false;
          self.lastSearch = true;
          self.loading.dismiss();
        }
      }).catch( function(result){
          console.log(body);
          self.loading.dismiss();
      });
    } else {
      var message;
      if (this.categoryList == "facility") {
        message = 'Search requires at least a facility type and [city and state] or valid [zipcode].';
      } else {
        message = 'Search requires at least a last name and [city and state] or valid [zipcode].';
      }

      let alert = this.alertCtrl.create({
        title: 'More data needed for search',
        message: message,
        buttons: [
          {
            text: 'OK',
            role: 'OK',
            handler: () => {
              console.log('OK clicked');
            }
          }
        ]
      });
      alert.present();
    }
  }

  callDS() {
    var dtNow = moment(new Date());
    var dtExpiration = moment(this.RestService.AuthData.expiration);
    var self = this;

    if (dtNow < dtExpiration) {
      this.loading = this.loadingCtrl.create();
      this.loading.present();
      this.callDSDo();
    } else {
      this.loading = this.loadingCtrl.create();
      this.loading.present();
      this.RestService.refreshCredentials(function(err, results) {
        if (err) {
          console.log('Need to login again!!! - Credentials expired from ' + self.formName + '.callDS');
          self.loading.dismiss();
          self.RestService.appRestart();
        } else {
          console.log('From '+ self.formName + '.callDS - Credentials refreshed!');
          self.callDSDo();
        }
      });
    }
  }

  callDSDo() {
    var restURL: string;
    var contactInfo = "Dr. ";
    var hasData = false;
    var strLastName = "";
    var strFirstName = "";
    var strCity = "";
    var intState = "";
    var strStateCode = "";
    var intZipCode = "";
    var placeids = "";

    if (this.categoryList == "physician") {
      if (this.card_form.controls["lastname"].value !== null && this.card_form.controls["lastname"].value.trim() !== "") {
        hasData = true;
        contactInfo = contactInfo + this.card_form.controls["lastname"].value + " ";
        strLastName = this.card_form.controls["lastname"].value;
      }
      if (this.card_form.controls["firstname"].dirty && this.card_form.controls["firstname"].value !== null) {
        contactInfo = contactInfo + this.card_form.controls["firstname"].value + " ";
        strFirstName = this.card_form.controls["firstname"].value;
      }
    } else {
      if (this.card_form.controls["facilitytype"].value !== null && this.card_form.controls["facilitytype"].value.trim() !== "") {
        hasData = true;
        contactInfo = this.card_form.controls["facilitytype"].value + " near me ";
        strLastName = this.card_form.controls["facilitytype"].value;
      }
    }

    if (hasData) {
      for (var j = 0; j < this.findcontacts.items.length; j++) {
        placeids = placeids + this.findcontacts.items[j].place_id + ",";
        console.log('Place id: ' + this.findcontacts.items[j].place_id);
      }
      placeids = placeids.substring(0, placeids.length - 1);
      console.log('Place ID string: ' + placeids);
      if ((this.card_form.controls["city"].dirty && this.card_form.controls["city"].value.length > 2) && this.card_form.controls["state"].dirty) {
        contactInfo = contactInfo + this.card_form.controls["city"].value + " ";
        strCity = this.card_form.controls["city"].value;
        contactInfo = contactInfo + this.getStateTerm(this.card_form.controls["state"].value) + " ";
        strStateCode = this.getStateTerm(this.card_form.controls["state"].value);
        intState = this.card_form.controls["state"].value;
        if (this.card_form.controls["zipcode"].dirty && this.card_form.controls["zipcode"].value.length == 5) {
          contactInfo = contactInfo + this.card_form.controls["zipcode"].value + " ";
          intZipCode = this.card_form.controls["zipcode"].value;
        }
      } else if (this.card_form.controls["zipcode"].dirty && this.card_form.controls["zipcode"].value.length == 5) {
        contactInfo = contactInfo + this.card_form.controls["zipcode"].value + " ";
        intZipCode = this.card_form.controls["zipcode"].value;
        if (this.card_form.controls["city"].dirty && this.card_form.controls["city"].value.length > 2) {
          contactInfo = contactInfo + this.card_form.controls["city"].value + " ";
          strCity = this.card_form.controls["city"].value;
        }
        if (this.card_form.controls["state"].dirty) {
          contactInfo = contactInfo + this.getStateTerm(this.card_form.controls["state"].value) + " ";
          strStateCode = this.getStateTerm(this.card_form.controls["state"].value);
          intState = this.card_form.controls["state"].value;
          }
      } else {
        hasData = false;
      }
    }

    if (hasData) {
      this.loading = this.loadingCtrl.create();
      this.loading.present();
      console.log('Contact Info from findContacts: ' + contactInfo);
      restURL="https://ap6oiuyew6.execute-api.us-east-1.amazonaws.com/dev/FindContactByNameZip";
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
            contactInfo: contactInfo,
            placeids: placeids,
            firstName: strFirstName,
            lastName: strLastName,
            city: strCity,
            state: intState,
            stateCode: strStateCode,
            zipCode: intZipCode,
            deepSearch: 'Y'
          }
      };
      var body = '';
      var self = this;
      apigClient.invokeApi(params, pathTemplate, method, additionalParams, body)
      .then(function(result){
        if (Array.isArray(result.data)) {
          var resultData = result.data;
          self.formFindContactService
          .getData()
          .then(data => {
            self.findcontacts.items = resultData;
            self.dsEligible = false;
            self.lastSearch = true;
            console.log("Results Data for FindContactByNameZip: ", self.findcontacts.items);
            self.loading.dismiss();
          });
        } else {
          self.dsEligible = false;
          self.lastSearch = true;
          self.loading.dismiss();
        }
      }).catch( function(result){
          console.log(body);
          self.loading.dismiss();
      });
    } else {
      var message;
      if (this.categoryList == "facility") {
        message = 'Deep search requires at least a facility type and [city and state] or valid [zipcode].';
      } else {
        message = 'Deep search requires at least a last name and [city and state] or valid [zipcode].';
      }
      let alert = this.alertCtrl.create({
        title: 'More data needed for search',
        message: message,
        buttons: [
          {
            text: 'OK',
            role: 'OK',
            handler: () => {
              console.log('OK clicked');
            }
          }
        ]
      });
      alert.present();
    }
  }

  getContactId (place_id) {
    var retcontactid = null;
    for (var j = 0; j < this.findcontacts.items.length; j++) {
      if (this.findcontacts.items[j].place_id == place_id) {
        console.log('Found place_id: ' + this.findcontacts.items[j].place_id);
        console.log('ContactId for place_id: ' +  this.findcontacts.items[j].contactid);
        if (this.findcontacts.items[j].contactid !== undefined && this.findcontacts.items[j].contactid > 0) {
          retcontactid = this.findcontacts.items[j].contactid;
        }
      }
    }
    return retcontactid;
  }

  createContact() {
    this.saving = true;
    this.nav.push(FormContactPage);
  }

  saveRecord(){
    var dtNow = moment(new Date());
    var dtExpiration = moment(this.RestService.AuthData.expiration);
    var self = this;

    if (dtNow < dtExpiration) {
      this.loading = this.loadingCtrl.create();
      this.loading.present();
      this.saveRecordDo();
    } else {
      this.loading = this.loadingCtrl.create();
      this.loading.present();
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
      var restURL="https://ap6oiuyew6.execute-api.us-east-1.amazonaws.com/dev/FindContactByNameZip";
      this.contactSave.profileid = this.RestService.currentProfile;
      this.contactSave.userid = this.RestService.userId;
      this.contactSave.place_id = this.card_form.controls["contacts"].value;
      var checkContactId;
      checkContactId = this.getContactId(this.contactSave.place_id);
      if ( checkContactId !==null) {
        this.contactSave.contactid = checkContactId;
      }
      this.contactSave.lastname = this.card_form.controls["lastname"].value;
      if (this.card_form.controls["facilitytype"].value !==null) {
        this.contactSave.facilitytype = this.card_form.controls["facilitytype"].value;
      } else if (this.card_form.controls["doctortype"].value !==null) {
        this.contactSave.doctortype = this.card_form.controls["doctortype"].value;
      }
      if (this.card_form.controls["covered"].value !==null) {
        this.contactSave.covered = this.card_form.controls["covered"].value;
      }
      if (this.card_form.controls["firstname"].value !==null) {
        this.contactSave.firstname = this.card_form.controls["firstname"].value;
      }
      if (this.card_form.controls["city"].value !==null) {
        this.contactSave.city = this.card_form.controls["city"].value;
      }
      if (this.card_form.controls["state"].value !==null) {
        this.contactSave.state = this.card_form.controls["state"].value;
        this.contactSave.statecode = this.getStateTerm(this.card_form.controls["state"].value);
      }
      if (this.card_form.controls["zipcode"].value !==null) {
        this.contactSave.zipcode = this.card_form.controls["zipcode"].value;
      }
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
      var body = JSON.stringify(this.contactSave);
      var self = this;
      console.log('Calling Post', this.contactSave);
      apigClient.invokeApi(params, pathTemplate, method, additionalParams, body)
      .then(function(result){
        self.RestService.results = result.data;
        console.log('Happy Path: ' + self.RestService.results);
        self.category.title = "Medical Contacts";
        self.loading.dismiss();
        self.nav.pop();
      }).catch( function(result){
        console.log('Result: ',result);
        self.loading.dismiss();
      });
  }

  setPhysician() {
    this.categoryList = "physician";
  }

  setFacility() {
    this.categoryList = "facility";
  }

  checkSaveReady() {
    if (this.card_form.controls["contacts"].dirty) {
      this.saveready = true;
      console.log('contacts value: ' + this.card_form.controls["contacts"].value);
      console.log('doctortype: ' + this.card_form.controls["doctortype"].value);
    } else {
      this.saveready = false;
    }
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

  updateCalc() {
    if (this.card_form.get('starttime').value !== null && this.card_form.get('waketime').value !== null) {
      var startSplit = this.card_form.get('starttime').value.split(":");
      var startHour = Number(startSplit[0]);
      var startMinRatio = (Number(startSplit[1]))/60;
      var wakeSplit = this.card_form.get('waketime').value.split(":");
      var wakeHour = Number(wakeSplit[0]);
      var wakeMinRatio = (Number(wakeSplit[1]))/60;
      var duration;

      if ((wakeHour + wakeMinRatio) >=(startHour + startMinRatio)) {
        duration = (wakeHour + wakeMinRatio) - (startHour + startMinRatio);
      } else {
        duration = (24 - (startHour + startMinRatio)) + (wakeHour + wakeMinRatio);
      }
      this.card_form.get('hoursslept').setValue(duration);
    } else {
      if (this.card_form.get('starttime').value !== null || this.card_form.get('waketime').value !== null) {
        this.card_form.get('hoursslept').setValue(null);
      }
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

}
