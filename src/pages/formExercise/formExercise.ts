import { Component } from '@angular/core';
import { NavController, NavParams, AlertController, LoadingController } from 'ionic-angular';
import { Validators, FormGroup, FormControl, FormArray, FormsModule } from '@angular/forms';
import { RestService } from '../../app/services/restService.service';
import { ListExerciseModel, ListExercise } from '../../pages/listExercise/listExercise.model';
import { HistoryItemModel } from '../../pages/history/history.model';
import { ListGoalsModel } from '../../pages/listGoals/listGoals.model';
import { ListGoalsService } from '../../pages/listGoals/listGoals.service';

var moment = require('moment-timezone');

@Component({
  selector: 'formExercise-page',
  templateUrl: 'formExercise.html'
})
export class FormExercisePage {
  loading: any;
  section: string;
  formName: string = "formExercise";
  recId: number;
  goalname: string;
  card_form: FormGroup;
  goal_array: FormArray;
  goal_schedule: FormGroup;
  curRec: any;
  newRec: boolean = false;
  goalsModelSave: ListExerciseModel  = new ListExerciseModel();
  exerciseSave: ListExercise = new ListExercise();
  category: HistoryItemModel = new HistoryItemModel();
  userTimezone: any;
  list2: ListGoalsModel = new ListGoalsModel();

  categories_checkbox_open: boolean;
  categories_checkbox_result;

  constructor(public nav: NavController, public alertCtrl: AlertController, public RestService:RestService, 
    public navParams: NavParams, public loadingCtrl: LoadingController, public list2Service: ListGoalsService) {
    this.recId = navParams.get('recId');
    this.goalname = navParams.get('goalname');
    if (this.goalname == undefined) {
      alert('No goal name');
      this.goalname = "";
    }  

    this.loading = this.loadingCtrl.create();
    this.curRec = RestService.results[this.recId]; 

    var self = this;
    this.RestService.curProfileObj(function (error, results) {
      if (!error) {
        self.userTimezone = results.timezone;
      }
    });


    //add caloriesburnedvalue generator    
    if (this.recId !== undefined) {
      var cbSplit;
      var numCB = null;
      if(this.curRec.caloriesburned !== undefined && this.curRec.caloriesburned !== null && this.curRec.caloriesburned !== "") {
        var cbSplit = this.curRec.caloriesburned.split(" ");                                 
        if (Number(cbSplit[0]) !== NaN) {
          numCB = cbSplit[0];
        }
      }
 
      this.card_form = new FormGroup({
        recordid: new FormControl(this.curRec.recordid),
        exercisetype: new FormControl(this.curRec.exercisetype, Validators.required),
        exercisetime: new FormControl(this.curRec.exercisetime),
        caloriesburned: new FormControl(this.curRec.caloriesburned),
        caloriesburnedvalue: new FormControl(numCB, Validators.min(0)),
        distance: new FormControl(this.curRec.distance),
        reps: new FormControl(this.curRec.reps),
        goalname: new FormControl(this.curRec.goalname),
        goalid: new FormControl(this.curRec.goalid),
        dateofmeasure: new FormControl(this.formatDateTime(this.curRec.dateofmeasure)),
        confirmed: new FormControl(this.curRec.confirmed),
        profileid: new FormControl(this.curRec.profileid),
        userid: new FormControl(this.curRec.userid)
      });    
    } else {
      this.newRec = true;
      this.card_form = new FormGroup({
        recordid: new FormControl(),
        exercisetype: new FormControl("", Validators.required),
        exercisetime: new FormControl(),
        caloriesburned: new FormControl(),
        caloriesburnedvalue: new FormControl("", Validators.min(0)),
        distance: new FormControl(),
        reps: new FormControl(),
        goalname: new FormControl(this.goalname),
        goalid: new FormControl(),
        dateofmeasure: new FormControl(),
        confirmed: new FormControl(),
        profileid: new FormControl(),
        userid: new FormControl()
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

    restURL="https://ap6oiuyew6.execute-api.us-east-1.amazonaws.com/dev/GoalsByProfile";
    
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
            goaltype: 'exercise'
          }
    };
    var body = '';
    var self = this;

    apigClient.invokeApi(params, pathTemplate, method, additionalParams, body)
    .then(function(result){
      self.RestService.results = result.data;
      self.list2Service
      .getData()
      .then(data => {
        self.list2.items = self.RestService.results;
        //alert('Allergy Response: ' + this.RestService.results);   
        //alert('Transfer to List Items: ' +  this.list2.items);   
       console.log("Results Data for Get Goals: ", self.list2.items);
        self.loading.dismiss();
      });
      
      //alert('Async Check from Invoke: ' + self.RestService.results);   
      
    }).catch( function(result){
        console.log(body);
        self.loading.dismiss();
    });
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
            this.exerciseSave.recordid = this.card_form.get('recordid').value;
            this.exerciseSave.profileid = this.RestService.currentProfile;
            this.exerciseSave.userid = this.RestService.currentProfile;  //placeholder for user to device mapping and user identification
            this.exerciseSave.active = 'N';
            var restURL="https://ap6oiuyew6.execute-api.us-east-1.amazonaws.com/dev/ExerciseByProfile";
    
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
            var body = JSON.stringify(this.exerciseSave);
            var self = this;
        
            console.log('Calling Post', this.exerciseSave);    
            apigClient.invokeApi(params, pathTemplate, method, additionalParams, body)
            .then(function(result){
              self.RestService.results = result.data;
              console.log('Happy Path: ' + self.RestService.results);
              self.category.title = "Invest in You";
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
    if (this.card_form.get('recordid').value !==undefined && this.card_form.get('recordid').value !==null) {

    } else {
      this.exerciseSave.exercisetype = this.card_form.get('exercisetype').value;
      this.exerciseSave.exercisetime = this.card_form.get('exercisetime').value;
      this.exerciseSave.profileid = this.RestService.currentProfile;
      this.exerciseSave.userid = this.RestService.currentProfile;  //placeholder for user to device mapping and user identification
      this.exerciseSave.caloriesburned = this.card_form.get('caloriesburnedvalue').value;
      this.exerciseSave.distance = this.card_form.get('distance').value;
      this.exerciseSave.reps = this.card_form.get('reps').value;
      this.exerciseSave.goalname = this.card_form.get('goalname').value;
    }
    
    var restURL="https://ap6oiuyew6.execute-api.us-east-1.amazonaws.com/dev/ExerciseByProfile";
    
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
    var body = JSON.stringify(this.exerciseSave);
    var self = this;

    console.log('Calling Post', this.exerciseSave);    
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

  formatDateTime(dateString) {
    //alert('FormatDateTime called');
    if (this.userTimezone !== undefined && this.userTimezone !=="") {
      return moment(dateString).tz(this.userTimezone).format('MM-DD-YYYY hh:mm A');
    } else {
      return moment(dateString).format('MM-DD-YYYY hh:mm a');
    }
  }

}
