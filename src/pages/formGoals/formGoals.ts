import { Component } from '@angular/core';
import { NavController, NavParams, AlertController, LoadingController } from 'ionic-angular';
import { Validators, FormGroup, FormControl, FormArray, FormsModule } from '@angular/forms';
import { RestService } from '../../app/services/restService.service';
import { ListGoalsModel, ListGoals } from '../../pages/listGoals/listGoals.model';
import { HistoryItemModel } from '../../pages/history/history.model';
import { DictionaryModel, Dictionary, DictionaryItem } from '../../pages/models/dictionary.model';
import { DictionaryService } from '../../pages/models/dictionary.service';


@Component({
  selector: 'formGoals-page',
  templateUrl: 'formGoals.html'
})
export class FormGoalsPage {
  loading: any;
  section: string;
  formName: string = "formGoals";
  recId: number;
  card_form: FormGroup;
  goal_array: FormArray;
  goal_schedule: FormGroup;
  curRec: any;
  newRec: boolean = false;
  goalsModelSave: ListGoalsModel  = new ListGoalsModel();
  goalsSave: ListGoals = new ListGoals();
  category: HistoryItemModel = new HistoryItemModel();
  dictionaries: DictionaryModel = new DictionaryModel();
  daysList: DictionaryItem[];
  goalUnitList: DictionaryItem[];
  rewardTimingList: DictionaryItem[];

  categories_checkbox_open: boolean;
  categories_checkbox_result;

  constructor(public nav: NavController, public alertCtrl: AlertController, public RestService:RestService, 
    public navParams: NavParams, public loadingCtrl: LoadingController, public dictionaryService: DictionaryService) {
    this.recId = navParams.get('recId');

    this.loading = this.loadingCtrl.create();
    this.curRec = RestService.results[this.recId]; 

    if (this.recId !== undefined) {
      this.card_form = new FormGroup({
        recordid: new FormControl(this.curRec.recordid),
        version: new FormControl(this.curRec.version),
        goalname: new FormControl(this.curRec.goalname),
        goaltype: new FormControl(this.curRec.goaltype),
        goalnumber: new FormControl(this.curRec.goalnumber),
        goalunit: new FormControl(this.curRec.goalunit),
        goalunitvalue: new FormControl(this.curRec.goalunitvalue),
        daysperweek: new FormControl(this.curRec.daysperweek),
        daysperweekvalue: new FormControl(this.curRec.daysperweekvalue),
        reward: new FormControl(this.curRec.reward),
        rewardtiming: new FormControl(this.curRec.rewardtiming),
        rewardtimingvalue: new FormControl(this.curRec.rewardtimingvalue),
        active: new FormControl(this.curRec.active)
      });    
    } else {
      this.newRec = true;
      this.card_form = new FormGroup({
        recordid: new FormControl(),
        version: new FormControl(),
        goalname: new FormControl(),
        goaltype: new FormControl(),
        goalnumber: new FormControl(),
        goalunit: new FormControl(),
        goalunitvalue: new FormControl(),
        daysperweek: new FormControl(),
        daysperweekvalue: new FormControl(),
        reward: new FormControl(),
        rewardtiming: new FormControl(),
        rewardtimingvalue: new FormControl(),
        active: new FormControl()
      });    
    }
  }

  ionViewWillEnter() {
    this.loading.present();
    this.loadData();
  }

  ionViewDidLoad() {
    this.loading.present();
    this.loadData();
  }

  loadData() {
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
        self.daysList = self.dictionaries.items[0].dictionary; //index 0 as aligned with sortIndex
        self.rewardTimingList = self.dictionaries.items[2].dictionary; //index 2 as aligned with sortIndex

        if(self.newRec) {
          self.goalUnitList = self.dictionaries.items[1].dictionary; //index 1 as aligned with sortIndex
        } else {
          if(self.curRec.goaltype == 'task') {
            self.getTaskList(self.dictionaries.items[1].dictionary, function (error, results) {
              if (error) {
                console.log('Error in getTaskList: ' + error);
                self.goalUnitList = self.dictionaries.items[1].dictionary; //index 1 as aligned with sortIndex
              } else {
                self.goalUnitList = results;
              }
            });
          } else {
            self.goalUnitList = self.dictionaries.items[1].dictionary; //index 1 as aligned with sortIndex
          }
        }

        self.loading.dismiss();
      });
      
    }).catch( function(result){
        console.log(body);
    });

  }

  checkFromGoalType() {
    var self = this;
    if(this.card_form.get('goaltype').value == 'task') {
      //alert('check From Goal Type called - goaltype = ' + this.card_form.get('goaltype').value);
      this.getTaskList(this.dictionaries.items[1].dictionary, function (error, results) {
        if (error) {
          //alert('check From Goal Type - error: ' + error);
          console.log('Error in getTaskList: ' + error);
          self.goalUnitList = this.dictionaries.items[1].dictionary; //index 1 as aligned with sortIndex
        } else {
          self.goalUnitList = results;
          //alert('check From Goal Type - success');
        }
      });
    } else {
      //alert('check From Goal Type - not task');
      self.goalUnitList = this.dictionaries.items[1].dictionary; //index 1 as aligned with sortIndex
    }

  }

  getTaskList(dictionaryItems, callback) {
    var dictionaryItem = new DictionaryItem();
    var taskList = [];

    for (var i = 0; i < dictionaryItems.length; i++) {
      if(dictionaryItems[i].dictionarycode == 'Minutes') {
        dictionaryItem = dictionaryItems[i];
        taskList.push(dictionaryItem);
      } else if (dictionaryItems[i].dictionarycode == 'Number') {
        dictionaryItem = dictionaryItems[i];
        taskList.push(dictionaryItem);
      }
    }
    if (taskList.length == 2) {
      callback(null, taskList);
    } else {
      callback("Error expected two choice options for task, but got " + taskList.length, null);
    }
  }

  deleteRecord(){
    let alert = this.alertCtrl.create({
      title: 'Confirm Delete',
      message: 'Do you certain you want to delete this record?',
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
            //alert('Going to delete');
            this.goalsSave.recordid = this.card_form.get('recordid').value;
            this.goalsSave.version = this.card_form.get('version').value;
            this.goalsSave.profileid = this.RestService.currentProfile;
            this.goalsSave.userid = this.RestService.currentProfile;  //placeholder for user to device mapping and user identification
            this.goalsSave.active = 'N';
            var restURL="https://ap6oiuyew6.execute-api.us-east-1.amazonaws.com/dev/GoalsByProfile";
    
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
            var body = JSON.stringify(this.goalsSave);
            var self = this;
        
            console.log('Calling Post', this.goalsSave);    
            apigClient.invokeApi(params, pathTemplate, method, additionalParams, body)
            .then(function(result){
              self.RestService.results = result.data;
              console.log('Happy Path: ' + self.RestService.results);
              self.category.title = "Set Goals";
              //self.nav.push(ListVaccinesPage, { category: self.category });      
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

  saveRecord(){
    //alert('Save Button Selected');
    this.goalsSave.recordid = this.card_form.get('recordid').value;
    this.goalsSave.version = this.card_form.get('version').value + 1;
    this.goalsSave.goalname = this.card_form.get('goalname').value;
    this.goalsSave.goaltype = this.card_form.get('goaltype').value;
    this.goalsSave.profileid = this.RestService.currentProfile;
    this.goalsSave.userid = this.RestService.currentProfile;  //placeholder for user to device mapping and user identification
    this.goalsSave.goalnumber = this.card_form.get('goalnumber').value;
    this.goalsSave.goalunit = this.card_form.get('goalunit').value;
    this.goalsSave.daysperweek = this.card_form.get('daysperweek').value;
    this.goalsSave.reward = this.card_form.get('reward').value;
    this.goalsSave.rewardtiming = this.card_form.get('rewardtiming').value;
    
    var restURL="https://ap6oiuyew6.execute-api.us-east-1.amazonaws.com/dev/GoalsByProfile";
    
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
    var body = JSON.stringify(this.goalsSave);
    var self = this;

    console.log('Calling Post', this.goalsSave);    
    apigClient.invokeApi(params, pathTemplate, method, additionalParams, body)
    .then(function(result){
      self.RestService.results = result.data;
      console.log('Happy Path: ' + self.RestService.results);
      self.category.title = "Set Goals";
      //self.nav.push(ListVaccinesPage, { category: self.category });      
      self.nav.pop();      
    }).catch( function(result){
      console.log('Result: ',result);
      console.log(body);
    });
  }

  public today() {
    return new Date().toISOString().substring(0,10);
  }

}
