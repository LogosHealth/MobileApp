import { Component } from '@angular/core';
import { NavController, SegmentButton, NavParams, AlertController, Form,  LoadingController } from 'ionic-angular';
import { Validators, FormGroup, FormControl, FormArray, FormsModule } from '@angular/forms';
import { counterRangeValidator } from '../../components/counter-input/counter-input';
import { RestService } from '../../app/services/restService.service';
import { AboutMe } from '../../pages/formAboutMe/formAboutMe.model';
import { AboutMeService } from '../../pages/formAboutMe/formAboutMe.service';
import { HistoryModel, HistoryItemModel } from '../../pages/history/history.model';
import { DictionaryModel, Dictionary, DictionaryItem } from '../../pages/models/dictionary.model';
import { DictionaryService } from '../../pages/models/dictionary.service';

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

  relation2primaryList: DictionaryItem[];
  stateList: DictionaryItem[];
  relationList: DictionaryItem[];
  bloodTypeList: DictionaryItem[];
  rhFactorList:  DictionaryItem[];
  genderList: DictionaryItem[];
  raceList: DictionaryItem[];
  ethnicityList: DictionaryItem[];
  speciesList: DictionaryItem[];
  breedList: DictionaryItem[];

  saveItem: AboutMe = new AboutMe();
  saveModel: AboutMe = new AboutMe();

  constructor(public nav: NavController, public alertCtrl: AlertController, public RestService:RestService, public AboutMeService: AboutMeService,
    public navParams: NavParams,  public loadingCtrl: LoadingController, public dictionaryService: DictionaryService) {
    this.loading = this.loadingCtrl.create();
    
    this.card_form = new FormGroup({
      profileid: new FormControl(this.list2.profileid),
      physicalprofileid: new FormControl(this.list2.physicalprofileid),
      firstname: new FormControl(this.list2.firstname),
      lastname: new FormControl(this.list2.lastname),
      ssn: new FormControl(this.list2.ssn),
      primaryflag: new FormControl(this.list2.primaryflag),
      streetaddress: new FormControl(this.list2.streetaddress),
      city: new FormControl(this.list2.city),
      state: new FormControl(this.list2.state),
      zipcode: new FormControl(this.list2.zipcode),
      timezone: new FormControl(this.list2.timezone),
      phonenumber: new FormControl(this.list2.phonenumber),
      emergencycontactname: new FormControl(this.list2.emergencycontactname),
      emergencycontactnumber: new FormControl(this.list2.emergencycontactnumber),
      emergencycontactrelation: new FormControl(this.list2.emergencycontactrelation),
      insurancename: new FormControl(this.list2.insurancename),
      insurancenumber: new FormControl(this.list2.insurancenumber),
      relationtoprimary: new FormControl(this.list2.relationtoprimary),
      biologicalparent: new FormControl(this.list2.biologicalparent),
      medicalconsent: new FormControl(this.list2.medicalconsent),
      birthdate: new FormControl(this.list2.birthdate),
      age: new FormControl(this.list2.age),
      bloodtype: new FormControl(this.list2.bloodtype),
      rhfactor: new FormControl(this.list2.rhfactor),
      gender: new FormControl(this.list2.gender),
      ethnicity: new FormControl(this.list2.ethnicity),
      ispet: new FormControl(this.list2.ispet),
      species: new FormControl(this.list2.species),
      breed: new FormControl(this.list2.breed),
      confirmed: new FormControl(this.list2.confirmed),
      active: new FormControl(this.list2.active)
    });  
  }

  ionViewDidLoad() {
    //alert('Begin:' + this.searchTerm);
    this.loading.present();
    this.loadData();
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
        this.loadDictionaries();            
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
        self.relation2primaryList = self.dictionaries.items[0].dictionary; //index 0 as aligned with sortIndex


        self.loading.dismiss();
      });
      
    }).catch( function(result){
        console.log(body);
    });

  }



  public today() {
    return new Date().toISOString().substring(0,10);
  }


}
