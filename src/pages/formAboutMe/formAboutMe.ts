import { Component } from '@angular/core';
import { NavController, SegmentButton, NavParams, AlertController, Form,  LoadingController } from 'ionic-angular';
import { Validators, FormGroup, FormControl, FormArray, FormsModule, FormBuilder } from '@angular/forms';
import { counterRangeValidator } from '../../components/counter-input/counter-input';
import { RestService } from '../../app/services/restService.service';
import { AboutMe, RaceCode, LatestHeight, LatestWeight } from '../../pages/formAboutMe/formAboutMe.model';
import { AboutMeService } from '../../pages/formAboutMe/formAboutMe.service';
import { HistoryModel, HistoryItemModel } from '../../pages/history/history.model';
import { DictionaryModel, Dictionary, DictionaryItem } from '../../pages/models/dictionary.model';
import { DictionaryService } from '../../pages/models/dictionary.service';
import { TextMaskModule, conformToMask } from 'angular2-text-mask';

var moment = require('moment-timezone');


@Component({
  selector: 'formAboutMe-page',
  templateUrl: 'formAboutMe.html'
})
export class FormAboutMe {
  list2: AboutMe = new AboutMe();
  section: string;
  recId: number;
  formName: string = "formAboutMe";
  card_form: FormGroup;
  curRec: any;
  dictionaries: DictionaryModel = new DictionaryModel();
  category: HistoryItemModel = new HistoryItemModel();
  loading: any;
  saving: boolean = false;
  
  primaryUser: any;
  races: FormArray; 
  primary: boolean;
  isChild: boolean;
  isPet: boolean;
  masks: any;
  textMask: TextMaskModule = new TextMaskModule();

  stateList: DictionaryItem[];
  relationList: DictionaryItem[];
  bloodTypeList: DictionaryItem[];
  genderList: DictionaryItem[];
  raceList: DictionaryItem[];
  ethnicityList: DictionaryItem[];
  speciesList: DictionaryItem[];

  saveModel: AboutMe = new AboutMe();

  constructor(public nav: NavController, public alertCtrl: AlertController, public RestService:RestService, public AboutMeService: AboutMeService,
    public navParams: NavParams,  public loadingCtrl: LoadingController, public dictionaryService: DictionaryService, public formBuilder: FormBuilder) {
    this.loading = this.loadingCtrl.create();
    
    this.loadData();

    this.masks = {
      phoneNumber: ['(', /[1-9]/, /\d/, /\d/, ')', ' ', /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/],
      ssn: [ /\d/, /\d/, /\d/, '-', /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/]
    };    

    this.card_form = new FormGroup({
      profileid: new FormControl(),
      physicalprofileid: new FormControl(),
      firstname: new FormControl(null, Validators.required),
      lastname: new FormControl(null, Validators.required),
      ssn: new FormControl(),
      primaryflag: new FormControl(),
      streetaddress: new FormControl(null, Validators.required),
      city: new FormControl(null, Validators.required),
      state: new FormControl(null, Validators.required),
      zipcode: new FormControl(null, Validators.required),
      latitude: new FormControl(),
      longitude: new FormControl(),
      timezone: new FormControl(),
      phonenumber: new FormControl(),
      email: new FormControl(),
      emergencycontact: new FormControl(),
      emergencycontactphone: new FormControl(),
      emergencycontactrelation: new FormControl(),
      insurancename: new FormControl(),
      insurancenumber: new FormControl(),
      relationtoprimary: new FormControl(),
      biologicalparent: new FormControl(),
      medicalconsent: new FormControl(),
      birthdate: new FormControl(null, Validators.required),
      age: new FormControl(),
      bloodtype: new FormControl(),
      gender: new FormControl(),
      ethnicity: new FormControl(),
      ispet: new FormControl(),
      species: new FormControl(),
      breed: new FormControl(),
      races: this.formBuilder.array([ this.createItem() ]),
      weight: new FormControl(),
      heightfeet: new FormControl(),
      heightinches: new FormControl(null, [Validators.min(0), Validators.max(11)]),
      confirmed: new FormControl(),
      active: new FormControl(),
    });  

    console.log('From constructor - BDay: ' + this.card_form.controls["birthdate"].value);
    console.log('From constructor - BDay invalid?: ' + this.card_form.controls["birthdate"].invalid);

    if (this.list2.races !== undefined && this.list2.races.length > 0) {
      this.addExistingRaces();
    }
  }

  ionViewDidLoad() {
    //alert('Begin:' + this.searchTerm);
    this.loading.present();
    //this.loadData();
  }
 
  loadData() {
    //alert('Feed Category: ' + this.feed.category.title);
    //alert('Current Profile ID: ' + this.RestService.currentProfile);
    var restURL: string;

    if (this.RestService.currentProfile == undefined || this.RestService.currentProfile <= 0) {
      this.loading.dismiss();
      return;
    } else {
      console.log('currentProfile: ' + this.RestService.currentProfile);
    }

    restURL="https://ap6oiuyew6.execute-api.us-east-1.amazonaws.com/dev/AboutMeByProfile";
    
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
            profileid: this.RestService.currentProfile
        }
    };
    var body = '';
    var self = this;
    apigClient.invokeApi(params, pathTemplate, method, additionalParams, body)
    .then(function(result){
      self.RestService.results = result.data;
      self.AboutMeService
      .getData()
      .then(data => {
        self.list2 = self.RestService.results;
        console.log('Self list2', self.list2);
        if (self.list2[0].primaryuser !== undefined && self.list2[0].primaryuser !== null) {
          self.primaryUser = self.list2[0].primaryuser;
        }
        //console.log('Self Primary User', self.primaryUser);
        //console.log('Self Primary User FirstName', self.primaryUser.firstname);

        self.loadDictionaries();            
      });
      
      //alert('Async Check from Invoke: ' + self.RestService.results);   
      
    }).catch( function(result){
        console.log(body);
    });
  }

  loadDictionaries() {
    //alert('Feed Category: ' + this.feed.category.title);
    //alert('Current Profile ID: ' + this.RestService.currentProfile);
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
        //alert('Allergy Response: ' + this.RestService.results);   
        //alert('Transfer to List Items: ' +  this.list2.items);   
        console.log("Results Data for Get Dictionaries: ", self.dictionaries.items);
        self.stateList = self.dictionaries.items[0].dictionary; //index 0 as aligned with sortIndex
        self.relationList = self.dictionaries.items[1].dictionary; //index 0 as aligned with sortIndex
        self.bloodTypeList = self.dictionaries.items[2].dictionary; //index 0 as aligned with sortIndex
        self.genderList = self.dictionaries.items[3].dictionary; //index 0 as aligned with sortIndex
        self.raceList = self.dictionaries.items[4].dictionary; //index 0 as aligned with sortIndex
        self.ethnicityList = self.dictionaries.items[5].dictionary; //index 0 as aligned with sortIndex
        self.speciesList = self.dictionaries.items[6].dictionary; //index 0 as aligned with sortIndex

        self.card_form.controls["firstname"].setValue(self.list2[0].firstname);
        self.card_form.controls["lastname"].setValue(self.list2[0].lastname);

        if (self.list2[0].ssn !== undefined && self.list2[0].ssn !== null && self.list2[0].ssn !== "") {
          var ssn = String(self.list2[0].ssn);
          var ssnMask = self.masks.ssn;
          
          var conformedSSN = conformToMask(
            ssn,
            ssnMask,
            {guide: false}
          );          
          self.card_form.controls["ssn"].setValue(conformedSSN.conformedValue);
        }

        self.card_form.controls["primaryflag"].setValue(self.list2[0].primaryflag);
        if (self.list2[0].primaryflag == 'Y') {
          self.primary = true;
        } else {
          self.primary = false;
        }
        self.card_form.controls["streetaddress"].setValue(self.list2[0].streetaddress);
        self.card_form.controls["city"].setValue(self.list2[0].city);
        self.card_form.controls["state"].setValue(self.list2[0].state);
        self.card_form.controls["zipcode"].setValue(self.list2[0].zipcode);
        self.card_form.controls["latitude"].setValue(self.list2[0].latitude);
        self.card_form.controls["longitude"].setValue(self.list2[0].longitude);
        self.card_form.controls["timezone"].setValue(self.list2[0].timezone);

        if (self.list2[0].phonenumber !== undefined && self.list2[0].phonenumber !== null && self.list2[0].phonenumber !== "") {
          var phoneNumber = String(self.list2[0].phonenumber);
          var phoneNumberMask = ['(', /[1-9]/, /\d/, /\d/, ')', ' ', /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/];
          
          var conformedPhoneNumber = conformToMask(
            phoneNumber,
            phoneNumberMask,
            {guide: false}
          );          
          self.card_form.controls["phonenumber"].setValue(conformedPhoneNumber.conformedValue);
        }

        self.card_form.controls["email"].setValue(self.list2[0].email);
        self.card_form.controls["emergencycontact"].setValue(self.list2[0].emergencycontact);

        if (self.list2[0].emergencycontactphone !== undefined && self.list2[0].emergencycontactphone !== null 
          && self.list2[0].emergencycontactphone !== "") {
          var phoneENumber = String(self.list2[0].emergencycontactphone);
          var phoneENumberMask = ['(', /[1-9]/, /\d/, /\d/, ')', ' ', /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/];
          
          var conformedEPhoneNumber = conformToMask(
            phoneENumber,
            phoneENumberMask,
            {guide: false}
          );          
          //console.log('Emergency Phone Number: ' + conformedEPhoneNumber.conformedValue);
          self.card_form.controls["emergencycontactphone"].setValue(conformedEPhoneNumber.conformedValue);
        }

        self.card_form.controls["emergencycontactrelation"].setValue(self.list2[0].emergencycontactrelation);
        self.card_form.controls["insurancename"].setValue(self.list2[0].insurancename);
        self.card_form.controls["insurancenumber"].setValue(self.list2[0].insurancenumber);

        self.card_form.controls["relationtoprimary"].setValue(self.list2[0].relationtoprimary);

        if (self.list2[0].relationtoprimary !== undefined && self.list2[0].relationtoprimary !== null &&
          self.list2[0].relationtoprimary !== "") {

            //console.log("Relation to Primary: " + self.list2[0].relationtoprimary);
            //console.log("Relation to Primary Term: " + self.getRelationTerm(self.list2[0].relationtoprimary));
            if (self.getRelationTerm(self.list2[0].relationtoprimary) == 'Daughter' || 
            self.getRelationTerm(self.list2[0].relationtoprimary) == 'Son' ) {
              self.isChild = true;
              console.log('isChild true: ' + self.getRelationTerm(self.list2[0].relationtoprimary));
            } else {
              self.isChild = false;
              console.log('isChild false: ' + self.getRelationTerm(self.list2[0].relationtoprimary));
            }    
        }

        self.card_form.controls["biologicalparent"].setValue(self.list2[0].biologicalparent);
        self.card_form.controls["medicalconsent"].setValue(self.list2[0].medicalconsent);

        console.log('From load dictionaries - BDay from list2: ' + self.list2[0].birthdate);
        if (self.list2[0].birthdate !== undefined && self.list2[0].birthdate !== null && self.list2[0].birthdate !== "" && self.list2[0].birthdate !== "0000-00-00") {
          self.card_form.controls["birthdate"].setValue(self.list2[0].birthdate);
          console.log('set from list');
        }

        console.log('From load dictionaries - BDay: ' + self.card_form.controls["birthdate"].value);
        console.log('From load dictionaries - BDay invalid?: ' + self.card_form.controls["birthdate"].invalid);
    
        self.card_form.controls["age"].setValue(self.list2[0].age);
        self.card_form.controls["bloodtype"].setValue(self.list2[0].bloodtype);
        self.card_form.controls["gender"].setValue(self.list2[0].gender);
        self.card_form.controls["ethnicity"].setValue(self.list2[0].ethnicity);

        if (self.list2[0].relationtoprimary !== undefined && self.list2[0].relationtoprimary !== null &&
          self.list2[0].relationtoprimary !== "") {

            if (self.getRelationTerm(self.list2[0].relationtoprimary) == 'Pet') {
              self.isPet = true;
            } else {
              self.isPet = false;
            }    
        }

        self.card_form.controls["species"].setValue(self.list2[0].species);
        self.card_form.controls["breed"].setValue(self.list2[0].breed);
        self.card_form.controls["breed"].setValue(self.list2[0].breed);
        if (self.list2[0].races.length > 0) {
          self.addExistingRaces();
          //console.log('Adding Races - Length: ' + self.list2[0].races.length);
        } else {
          //console.log('No races to add');
        }

        if (self.list2[0].latestweight !== undefined) {
          self.card_form.controls["weight"].setValue(self.list2[0].latestweight.weight);
        }

        if (self.list2[0].latestheight !== undefined) {
          self.card_form.controls["heightfeet"].setValue(self.list2[0].latestheight.feet);
          self.card_form.controls["heightinches"].setValue(self.list2[0].latestheight.inches);
        }

        self.card_form.controls["confirmed"].setValue(self.list2[0].confirmed);
        console.log('Loaded profile confirmed: ' + self.card_form.controls["confirmed"].value);
        self.loading.dismiss();
      });
      
    }).catch( function(result){
        console.log(body);
    });

  }

  createItem () {
    return this.formBuilder.group({
      raceid: new FormControl(),
      racecode: new FormControl(),
      confirmed: new FormControl(),
    });

  }

  addExistingRaces() {
    this.races = this.card_form.get('races') as FormArray;
    this.races.removeAt(0);
    for (var j = 0; j < this.list2[0].races.length; j++) {
      this.races.push(this.addExistingRace(j));              
      //console.log('Race ID: ' + this.list2[0].races[j].raceid);
      //console.log('Racecode: ' + this.list2[0].races[j].racecode);
    }    
  }

  addExistingRace(index): FormGroup {
    return this.formBuilder.group({
      raceid: new FormControl(this.list2[0].races[index].raceid),
      racecode: new FormControl(this.list2[0].races[index].racecode),
      confirmed: new FormControl(this.list2[0].races[index].confirmed),
    });
  }  

  addRace() {
    this.races = this.card_form.get('races') as FormArray;
    this.races.push(this.createItem());  
  }

  removeRace(i) {
    this.races = this.card_form.get('races') as FormArray;
    this.races.removeAt(i); 
    this.races.markAsDirty();
  }

  relationChange(relation) {
    if (this.getRelationTerm(relation.recordid) == 'Pet') {
      this.isPet = true;
    } else {
      this.isPet = false;
    }    

    if (this.getRelationTerm(relation.recordid) == 'Daughter' || 
    this.getRelationTerm(relation.recordid) == 'Son' ) {
      this.isChild = true;
    } else {
      this.isChild = false;
    }    
  }

  public today() {
    return new Date().toJSON().split('T')[0];
    //return new Date().toISOString().substring(0,10);
  }

  trimLastCharPhone() {
    // Determine de max length to trim the extra character
    var phonenumber = this.card_form.get('phonenumber').value;
    //console.log('CharPhone: ', phonenumber);
    //console.log('CharPhone length: ', phonenumber.length);
    //console.log('CharPhone last char: ' + '"' + phonenumber.substring(13, 14) + '"');
    if (phonenumber !== undefined && phonenumber !== null){
      if (phonenumber.length > 14 && phonenumber.substring(13, 14) !== "_" && phonenumber.substring(13, 14) !== " ") {
        this.card_form.get('phonenumber').setValue(phonenumber.substring(0,14));
      }  
    } else {
      return "";
    }
  }

  trimLastCharEPhone() {
    // Determine de max length to trim the extra character
    var phonenumber = this.card_form.get('emergencycontactphone').value;
    //console.log('CharPhone: ', phonenumber);
    //console.log('CharPhone length: ', phonenumber.length);
    //console.log('CharPhone last char: ' + '"' + phonenumber.substring(13, 14) + '"');
    if (phonenumber !== undefined && phonenumber !== null){
      if (phonenumber.length > 14 && phonenumber.substring(13, 14) !== "_" && phonenumber.substring(13, 14) !== " ") {
        this.card_form.get('emergencycontactphone').setValue(phonenumber.substring(0,14));
      }  
    } else {
      return "";
    }
  }

  trimLastCharSSN() {
    // Determine de max length to trim the extra character
    var ssn = this.card_form.get('ssn').value;
    //console.log('Charssn: ', ssn);
    //console.log('Charssn length: ', ssn.length);
    //console.log('CharPhone last char: ' + '"' + ssn.substring(10, 11) + '"');
    if (ssn !== undefined && ssn !== null){
      if (ssn.length > 11 && ssn.substring(10, 11) !== "_" && ssn.substring(10, 11) !== " ") {
        this.card_form.get('ssn').setValue(ssn.substring(0,11));
      }  
    } else {
      return "";
    }
  }

  getPrimaryName() {
    if (this.primaryUser !== undefined) {
      if (this.primaryUser.firstname !== undefined) {
        return this.primaryUser.firstname; 
      } else {
        //console.log ('No First Name for Prirmary User'); 
      }
    } else {
      //console.log ('No Prirmary User'); 
    }
  } 

  getRelationTerm(relationId) {
    var relationTerm = "";
    for (var j = 0; j < this.relationList.length; j++) {
      if (this.relationList[j].recordid == relationId) {
        relationTerm = this.relationList[j].dictionarycode;
      }
    }
    return relationTerm;
  }

  copyAddress() {
    this.card_form.controls["streetaddress"].setValue(this.primaryUser.streetaddress);
    this.card_form.controls["streetaddress"].markAsDirty();
    this.card_form.controls["city"].setValue(this.primaryUser.city);
    this.card_form.controls["city"].markAsDirty();
    this.card_form.controls["state"].setValue(this.primaryUser.state);
    this.card_form.controls["state"].markAsDirty();
    this.card_form.controls["zipcode"].setValue(this.primaryUser.zipcode);
    this.card_form.controls["zipcode"].markAsDirty();
    this.card_form.controls["latitude"].setValue(this.primaryUser.latitude);
    this.card_form.controls["latitude"].markAsDirty();
    this.card_form.controls["longitude"].setValue(this.primaryUser.longitude);
    this.card_form.controls["longitude"].markAsDirty();
    this.card_form.controls["timezone"].setValue(this.primaryUser.timezone);
    this.card_form.controls["timezone"].markAsDirty();
  }

  copyInsurance() {
    this.card_form.controls["insurancename"].setValue(this.primaryUser.insurancename);
    this.card_form.controls["insurancename"].markAsDirty();
    this.card_form.controls["insurancenumber"].setValue(this.primaryUser.insurancenumber);
    this.card_form.controls["insurancenumber"].markAsDirty();
  }

  changeBDay() {
    var age = moment().diff(this.card_form.controls["birthdate"].value, 'years');
    this.card_form.controls["age"].setValue(age);
    this.card_form.controls["age"].markAsDirty();
  }

  deleteRecord(){
    var race: RaceCode = new RaceCode();

    let alert = this.alertCtrl.create({
      title: 'Confirm Delete',
      message: 'Are you certain you want to inactivate this profile?  By doing so, all information associated with ' + this.list2[0].firstname + ' will become unavailable.',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'Delete',
          handler: () => {
            console.log('Delete clicked');
            this.saving = true;

            this.saveModel.profileid = this.list2[0].profileid;
            this.saveModel.userid = this.list2[0].profileid;
            this.saveModel.physicalprofileid = this.list2[0].physicalprofileid;
            this.saveModel.active = 'N';
            if (this.list2[0].latestheight !== undefined) {
              this.saveModel.latestheight.heightid = this.list2[0].latestheight.heightid;
              this.saveModel.latestheight.active = 'N';
            }
            if (this.list2[0].latestweight !== undefined) {
              this.saveModel.latestweight.weightid = this.list2[0].latestweight.weightid;
              this.saveModel.latestweight.active = 'N';
            }
            for (var j = 0; j < this.list2[0].races.length; j++) {
              race = new RaceCode();
              race.raceid = this.list2[0].races[j].raceid;
              race.active = 'N';
              this.saveModel.races.push(race);
            }    
        
            var restURL="https://ap6oiuyew6.execute-api.us-east-1.amazonaws.com/dev/AboutMeByProfile";
    
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
                self.category.title = "About Me";
                self.nav.pop();      
            }).catch( function(result){
                console.log('Result: ',result);
                console.log(body);
            });     
          }
        }
      ]
    });
    alert.present();    
  }


  confirmRecord(){
    var race: RaceCode = new RaceCode();
    this.saving = true;

    this.saveModel.profileid = this.list2[0].profileid;
    this.saveModel.userid = this.list2[0].profileid;
    this.saveModel.physicalprofileid = this.list2[0].physicalprofileid;
    this.saveModel.active = 'Y';
    this.saveModel.confirmed = 'Y';

    if (this.card_form.controls["firstname"].dirty) {
      this.saveModel.firstname = this.card_form.controls["firstname"].value;
    }
    if (this.card_form.controls["lastname"].dirty) {
      this.saveModel.lastname = this.card_form.controls["lastname"].value;
    }
    if (this.card_form.controls["ssn"].dirty) {
      this.saveModel.ssn = this.card_form.controls["ssn"].value.replace(/\D+/g, '');
    }
    if (this.card_form.controls["primaryflag"].dirty) {
      this.saveModel.primaryflag = this.card_form.controls["primaryflag"].value;
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
    if (this.card_form.controls["latitude"].dirty) {
      this.saveModel.latitude = this.card_form.controls["latitude"].value;
    }
    if (this.card_form.controls["longitude"].dirty) {
      this.saveModel.longitude = this.card_form.controls["longitude"].value;
    }
    if (this.card_form.controls["timezone"].dirty) {
      this.saveModel.timezone = this.card_form.controls["timezone"].value;
    }
    if (this.card_form.controls["phonenumber"].dirty) {
      this.saveModel.phonenumber = this.card_form.controls["phonenumber"].value.replace(/\D+/g, '');
    }
    if (this.card_form.controls["email"].dirty) {
      this.saveModel.email = this.card_form.controls["email"].value;
    }
    if (this.card_form.controls["emergencycontact"].dirty) {
      this.saveModel.emergencycontact = this.card_form.controls["emergencycontact"].value;
    }
    if (this.card_form.controls["emergencycontactphone"].dirty) {
      this.saveModel.emergencycontactphone = this.card_form.controls["emergencycontactphone"].value.replace(/\D+/g, '');
    }
    if (this.card_form.controls["emergencycontactrelation"].dirty) {
      this.saveModel.emergencycontactrelation = this.card_form.controls["emergencycontactrelation"].value;
    }
    if (this.card_form.controls["insurancename"].dirty) {
      this.saveModel.insurancename = this.card_form.controls["insurancename"].value;
    }
    if (this.card_form.controls["insurancenumber"].dirty) {
      this.saveModel.insurancenumber = this.card_form.controls["insurancenumber"].value;
    }
    if (this.card_form.controls["relationtoprimary"].dirty) {
      this.saveModel.relationtoprimary = this.card_form.controls["relationtoprimary"].value;
    }
    if (this.card_form.controls["biologicalparent"].dirty) {
      this.saveModel.biologicalparent = this.card_form.controls["biologicalparent"].value;
    }
    if (this.card_form.controls["medicalconsent"].dirty) {
      this.saveModel.medicalconsent = this.card_form.controls["medicalconsent"].value;
    }
    if (this.card_form.controls["birthdate"].dirty) {
      this.saveModel.birthdate = this.card_form.controls["birthdate"].value;
    }
    if (this.card_form.controls["age"].dirty) {
      this.saveModel.age = this.card_form.controls["age"].value;
    }
    if (this.card_form.controls["bloodtype"].dirty) {
      this.saveModel.bloodtype = this.card_form.controls["bloodtype"].value;
    }
    if (this.card_form.controls["gender"].dirty) {
      this.saveModel.gender = this.card_form.controls["gender"].value;
    }
    if (this.card_form.controls["ethnicity"].dirty) {
      this.saveModel.ethnicity = this.card_form.controls["ethnicity"].value;
    }
    if (this.card_form.controls["species"].dirty) {
      this.saveModel.species = this.card_form.controls["species"].value;
    }
    if (this.card_form.controls["breed"].dirty) {
      this.saveModel.breed = this.card_form.controls["breed"].value;
    }

    var lw: LatestWeight = new LatestWeight();
    if (this.list2[0].latestweight !== undefined && this.list2[0].latestweight.confirmed !== 'Y') {
      lw.confirmed = 'Y';
      lw.weightid = this.list2[0].latestweight.weightid;
      if (this.card_form.controls["weight"].dirty) {
        lw.weight = this.card_form.controls["weight"].value;
      }
      this.saveModel.latestweight = lw;
    } else if (this.card_form.controls["weight"].dirty) {
      lw.weight = this.card_form.controls["weight"].value;
      lw.confirmed = 'Y';
      if (this.list2[0].latestweight !== undefined) {
        lw.weightid = this.list2[0].latestweight.weightid;
      }
      this.saveModel.latestweight = lw;
    }

    var hw: LatestHeight = new LatestHeight();
    if (this.list2[0].latestheight !== undefined && this.list2[0].latestheight.confirmed !== 'Y') {
      hw.confirmed = 'Y';
      hw.heightid = this.list2[0].latestheight.heightid;
      if (this.card_form.controls["heightfeet"].dirty) {
        hw.feet = this.card_form.controls["heightfeet"].value;
      }
      if (this.card_form.controls["heightinches"].dirty) {
        hw.inches = this.card_form.controls["heightinches"].value;
      }
      this.saveModel.latestheight = hw;
    } else if (this.card_form.controls["heightfeet"].dirty || this.card_form.controls["heightinches"].dirty) {
      if (this.card_form.controls["heightfeet"].dirty) {
        hw.feet = this.card_form.controls["heightfeet"].value;
      }
      if (this.card_form.controls["heightinches"].dirty) {
        hw.inches = this.card_form.controls["heightinches"].value;
      }
      hw.confirmed = 'Y';
      if (this.list2[0].latestheight !== undefined) {
        hw.heightid = this.list2[0].latestheight.heightid;
      }
      this.saveModel.latestheight = hw;
    }

    //Race mgmgt logic needed
    var raceArray: Array<RaceCode> = [];
    var raceControls = this.card_form.get('races') as FormArray;
    var raceControlCount = raceControls.length;
    var raceChange: boolean = false;
    var raceItemCount = this.list2[0].races.length;
    var race: RaceCode;
    var match: boolean;

    raceChange = raceControls.dirty;

    //Races not touched - confirm as needed         
    if (!raceChange) {
      console.log('Enter Loop 1: raceControlCount = ' +raceControlCount + ", raceItemCount = " + raceItemCount);
      for (var j = 0; j < this.list2[0].races.length; j++) {
        race = new RaceCode();

        if (this.list2[0].races[j].confirmed !== 'Y') {
          race.raceid = this.list2[0].races[j].raceid;
          race.confirmed = 'Y';
          raceArray.push(race);
        }
      }
      if (raceArray !== undefined && raceArray.length > 0) {
        this.saveModel.races = raceArray;
      }
    } else {
      console.log('Enter Loop 4: raceControlCount = ' +raceControlCount + ", raceItemCount = " + raceItemCount);
      for (var j = 0; j < this.list2[0].races.length; j++) {
        match = false;
        for (var k = 0; k < raceControls.length; k++) {
          if (this.list2[0].races[j].raceid == raceControls.controls[k].get("raceid").value) {
            match = true;
            if (raceControls.controls[k].get("racecode").dirty) {
              race = new RaceCode();
              race.raceid = this.list2[0].races[j].raceid;
              race.racecode = raceControls.controls[k].get("racecode").value;
              race.confirmed = 'Y';
              raceArray.push(race);
            } else if (this.list2[0].races[j].confirmed !=='Y') {
              race = new RaceCode();
              race.raceid = this.list2[0].races[j].raceid;
              race.confirmed = 'Y';
              raceArray.push(race);
            }
          }
        }
        //This race record deleted via UI
        if (!match) {
          race = new RaceCode();
          race.active = "N";
          race.raceid = this.list2[0].races[j].raceid;
          raceArray.push(race);
        } 
      }
      for (var k = 0; k < raceControls.length; k++) {
        if (raceControls.controls[k].get("raceid").value == null || raceControls.controls[k].get("raceid").value == undefined || 
          raceControls.controls[k].get("raceid").value == "") {
            race = new RaceCode();
            race.racecode = raceControls.controls[k].get("racecode").value;
            race.confirmed = 'Y';
            raceArray.push(race);
        }
      }
      if (raceArray !== undefined && raceArray.length > 0) {
        this.saveModel.races = raceArray;
      }
    }  

    var restURL="https://ap6oiuyew6.execute-api.us-east-1.amazonaws.com/dev/AboutMeByProfile";

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
        self.category.title = "About Me";
        self.nav.pop();      
    }).catch( function(result){
        console.log('Result: ',result);
        console.log(body);
    });     
  }

  saveRecord(){
    var race: RaceCode = new RaceCode();
    this.saving = true;

    this.saveModel.profileid = this.list2[0].profileid;
    this.saveModel.userid = this.list2[0].profileid;
    this.saveModel.physicalprofileid = this.list2[0].physicalprofileid;
    this.saveModel.active = 'Y';

    if (this.card_form.controls["firstname"].dirty) {
      this.saveModel.firstname = this.card_form.controls["firstname"].value;
    }
    if (this.card_form.controls["lastname"].dirty) {
      this.saveModel.lastname = this.card_form.controls["lastname"].value;
    }
    if (this.card_form.controls["ssn"].dirty) {
      this.saveModel.ssn = this.card_form.controls["ssn"].value.replace(/\D+/g, '');
    }
    if (this.card_form.controls["primaryflag"].dirty) {
      this.saveModel.primaryflag = this.card_form.controls["primaryflag"].value;
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
    if (this.card_form.controls["latitude"].dirty) {
      this.saveModel.latitude = this.card_form.controls["latitude"].value;
    }
    if (this.card_form.controls["longitude"].dirty) {
      this.saveModel.longitude = this.card_form.controls["longitude"].value;
    }
    if (this.card_form.controls["timezone"].dirty) {
      this.saveModel.timezone = this.card_form.controls["timezone"].value;
    }
    if (this.card_form.controls["phonenumber"].dirty) {
      this.saveModel.phonenumber = this.card_form.controls["phonenumber"].value.replace(/\D+/g, '');
    }
    if (this.card_form.controls["email"].dirty) {
      this.saveModel.email = this.card_form.controls["email"].value;
    }
    if (this.card_form.controls["emergencycontact"].dirty) {
      this.saveModel.emergencycontact = this.card_form.controls["emergencycontact"].value;
    }
    if (this.card_form.controls["emergencycontactphone"].dirty) {
      this.saveModel.emergencycontactphone = this.card_form.controls["emergencycontactphone"].value.replace(/\D+/g, '');
    }
    if (this.card_form.controls["emergencycontactrelation"].dirty) {
      this.saveModel.emergencycontactrelation = this.card_form.controls["emergencycontactrelation"].value;
    }
    if (this.card_form.controls["insurancename"].dirty) {
      this.saveModel.insurancename = this.card_form.controls["insurancename"].value;
    }
    if (this.card_form.controls["insurancenumber"].dirty) {
      this.saveModel.insurancenumber = this.card_form.controls["insurancenumber"].value;
    }
    if (this.card_form.controls["relationtoprimary"].dirty) {
      this.saveModel.relationtoprimary = this.card_form.controls["relationtoprimary"].value;
    }
    if (this.card_form.controls["biologicalparent"].dirty) {
      this.saveModel.biologicalparent = this.card_form.controls["biologicalparent"].value;
    }
    if (this.card_form.controls["medicalconsent"].dirty) {
      this.saveModel.medicalconsent = this.card_form.controls["medicalconsent"].value;
    }
    if (this.card_form.controls["birthdate"].dirty) {
      this.saveModel.birthdate = this.card_form.controls["birthdate"].value;
    }
    if (this.card_form.controls["age"].dirty) {
      this.saveModel.age = this.card_form.controls["age"].value;
    }
    if (this.card_form.controls["bloodtype"].dirty) {
      this.saveModel.bloodtype = this.card_form.controls["bloodtype"].value;
    }
    if (this.card_form.controls["gender"].dirty) {
      this.saveModel.gender = this.card_form.controls["gender"].value;
    }
    if (this.card_form.controls["ethnicity"].dirty) {
      this.saveModel.ethnicity = this.card_form.controls["ethnicity"].value;
    }
    if (this.card_form.controls["species"].dirty) {
      this.saveModel.species = this.card_form.controls["species"].value;
    }
    if (this.card_form.controls["breed"].dirty) {
      this.saveModel.breed = this.card_form.controls["breed"].value;
    }

    var lw: LatestWeight = new LatestWeight();
    if (this.card_form.controls["weight"].dirty) {
      lw.weight = this.card_form.controls["weight"].value;
      if (this.list2[0].latestweight !== undefined) {
        lw.weightid = this.list2[0].latestweight.weightid;
      }
      this.saveModel.latestweight = lw;
    }

    var hw: LatestHeight = new LatestHeight();
    if (this.card_form.controls["heightfeet"].dirty || this.card_form.controls["heightinches"].dirty) {
      if (this.card_form.controls["heightfeet"].dirty) {
        hw.feet = this.card_form.controls["heightfeet"].value;
      }
      if (this.card_form.controls["heightinches"].dirty) {
        hw.inches = this.card_form.controls["heightinches"].value;
      }
      if (this.list2[0].latestheight !== undefined) {
        hw.heightid = this.list2[0].latestheight.heightid;
      }
      this.saveModel.latestheight = hw;
    }

    //Race mgmgt logic needed
    var raceArray: Array<RaceCode> = [];
    var raceControls = this.card_form.get('races') as FormArray;
    var raceChange: boolean = false;
    var race: RaceCode;
    var match: boolean;

    raceChange = raceControls.dirty;

    //Races not touched - confirm as needed         
    if (raceChange) {
      for (var j = 0; j < this.list2[0].races.length; j++) {
        match = false;
        for (var k = 0; k < raceControls.length; k++) {
          if (this.list2[0].races[j].raceid == raceControls.controls[k].get("raceid").value) {
            match = true;
            if (raceControls.controls[k].get("racecode").dirty) {
              race = new RaceCode();
              race.raceid = this.list2[0].races[j].raceid;
              race.racecode = raceControls.controls[k].get("racecode").value;
              raceArray.push(race);
            }
          }
        }
        //This race record deleted via UI
        if (!match) {
          race = new RaceCode();
          race.active = "N";
          race.raceid = this.list2[0].races[j].raceid;
          raceArray.push(race);
        } 
      }
      for (var k = 0; k < raceControls.length; k++) {
        if (raceControls.controls[k].get("raceid").value == null || raceControls.controls[k].get("raceid").value == undefined || 
          raceControls.controls[k].get("raceid").value == "") {
            race = new RaceCode();
            race.racecode = raceControls.controls[k].get("racecode").value;
            raceArray.push(race);
        }
      }
      if (raceArray !== undefined && raceArray.length > 0) {
        this.saveModel.races = raceArray;
      }
    }  

    var restURL="https://ap6oiuyew6.execute-api.us-east-1.amazonaws.com/dev/AboutMeByProfile";

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
        self.category.title = "About Me";
        self.nav.pop();      
    }).catch( function(result){
        console.log('Result: ',result);
        console.log(body);
    });     
  }

  addNew() {

  }

  /*
  ionViewCanLeave() {
    if (!this.saving && this.card_form.dirty) {
      let alert = this.alertCtrl.create({
        title: 'Exit without Saving',
        message: 'Are you sure you want to exit without saving?',
        buttons: [
          {
            text: 'No',
            role: 'cancel',
            handler: () => {
              console.log('Cancel clicked');
            }
          },
          {
            text: 'Yes',
            handler: () => {
              console.log('Exit clicked');
              this.saving = true;
              this.category.title = "About Me";
              this.nav.pop();      
            }
          }   
        ]
      });
      alert.present();    
    }
  }
*/

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
