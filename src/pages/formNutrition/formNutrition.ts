import { Component } from '@angular/core';
import { NavController, NavParams, AlertController, LoadingController } from 'ionic-angular';
import { Validators, FormGroup, FormControl, FormArray, FormsModule, FormBuilder } from '@angular/forms';
import { RestService } from '../../app/services/restService.service';
import { ListNutritionModel, ListNutrition, ListNutritionDay } from '../../pages/listNutrition/listNutrition.model';
import { ListNutritionService } from '../../pages/listNutrition/listNutrition.service';

import { HistoryItemModel } from '../../pages/history/history.model';
import { ListGoalsModel } from '../../pages/listGoals/listGoals.model';

var moment = require('moment-timezone');

@Component({
  selector: 'formVaccines-page',
  templateUrl: 'formNutrition.html'
})
export class FormNutritionPage {
  loading: any;
  section: string;
  formName: string = "formMood";
  recId: number;
  goalname: string;
  card_form: FormGroup;
  meals: FormArray; 
  goal_array: FormArray;
  goal_schedule: FormGroup;
  curRec: any;
  newRec: boolean = false;
  formModelSave: ListNutritionModel  = new ListNutritionModel();
  formDaySave: ListNutritionDay = new ListNutritionDay(); 
  formSave: ListNutrition = new ListNutrition(); 
  category: HistoryItemModel = new HistoryItemModel();
  userTimezone: any;
  list2: ListGoalsModel = new ListGoalsModel();

  categories_checkbox_open: boolean;
  categories_checkbox_result;

  constructor(public nav: NavController, public alertCtrl: AlertController, public RestService:RestService, 
    public navParams: NavParams, public loadingCtrl: LoadingController, public formBuilder: FormBuilder) {
    this.recId = navParams.get('recId');

    this.loading = this.loadingCtrl.create();
    this.curRec = RestService.results[this.recId]; 
    console.log('Cur Rec: ', this.curRec);

    var self = this;
    this.RestService.curProfileObj(function (error, results) {
      if (!error) {
        self.userTimezone = results.timezone;
      }
    });

    if (this.recId !== undefined) {
      this.card_form = new FormGroup({
          dayofmeasure: new FormControl(this.curRec.dayofmeasure),
          meals: this.formBuilder.array([ this.createItem() ]),
          profileid: new FormControl(this.curRec.profileid),
          userid: new FormControl(this.curRec.userid)
      });  
      this.addExistingMeals();
    } else {
      this.newRec = true;
      this.card_form = new FormGroup({
        dayofmeasure: new FormControl(),
        meals: this.formBuilder.array([ this.createItem() ]),
        profileid: new FormControl(),
        userid: new FormControl()
      });    
    }
  }

  ionViewWillEnter() {
    this.nav.getPrevious().data.refresh = false;
  }

  deleteRecord(){
    var mealsArray: FormArray;
    var mealSave: ListNutrition;
    var meal: FormGroup;

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
            this.formDaySave.meals = [];
            mealsArray = this.card_form.get('meals') as FormArray;            
            for (var j = 0; j < mealsArray.length; j++) {
              mealSave = new ListNutrition();
              meal = mealsArray.at(j) as FormGroup;
              if (meal.get("recordid").value !== null) {
                mealSave.recordid = meal.get("recordid").value;
                mealSave.active = 'N';
                mealSave.profileid = this.RestService.currentProfile;
                mealSave.userid = this.RestService.currentProfile;
                this.formDaySave.meals.push(mealSave);
              }
            }  

            if (this.formDaySave.meals !== undefined && this.formDaySave.meals.length > 0) {
              var restURL="https://ap6oiuyew6.execute-api.us-east-1.amazonaws.com/dev/NutritionByProfile";
    
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
              var body = JSON.stringify(this.formDaySave);
              var self = this;
          
              console.log('Calling Post', this.formDaySave);    
              apigClient.invokeApi(params, pathTemplate, method, additionalParams, body)
              .then(function(result){
                self.RestService.results = result.data;
                console.log('Happy Path: ' + self.RestService.results);
                self.category.title = "Nutrition";
                self.nav.pop();      
              }).catch( function(result){
                console.log('Result: ',result);
                console.log(body);
              });     
            } else {
              console.log('No saved Records - Delete goes back.');
              self.category.title = "Nutrition";
              self.nav.pop();      
            }
          }
        }
      ]
    });
    alert.present();
  }

  saveRecord(){
    var mealsArray: FormArray;
    var meal: FormGroup;
    var mealSave: ListNutrition;
    var isDirty = false;
    var dtDET;

    this.formDaySave.meals = new Array<ListNutrition>() ;
    mealsArray = this.card_form.get('meals') as FormArray;            
    for (var j = 0; j < mealsArray.length; j++) {
      isDirty = false;
      meal = mealsArray.at(j) as FormGroup;
      mealSave = new ListNutrition();
      if (meal.get("recordid").value !== undefined && meal.get("recordid").value !== null && meal.get("recordid").value !== "") {
        mealSave.recordid = meal.get("recordid").value;
      }
      if (meal.get("meal").dirty) {
        mealSave.meal = meal.get("meal").value;
        isDirty = true;
      }
      if (meal.get("food").dirty) {
        mealSave.food = meal.get("food").value;
        isDirty = true;
      }
      if (meal.get("amount").dirty) {
        mealSave.amount = meal.get("amount").value;
        isDirty = true;
      }
      if (meal.get("calories").dirty) {
        mealSave.calories = meal.get("calories").value;
        isDirty = true;
      }
      if (isDirty) {
        mealSave.profileid = this.RestService.currentProfile;
        mealSave.userid = this.RestService.currentProfile;
        mealSave.active = 'Y';
        if (this.userTimezone !== undefined && this.userTimezone !== null && this.userTimezone !== "") {
          mealSave.timezone = this.userTimezone;          
        }
        this.formDaySave.meals.push(mealSave);
      } else {
        console.log('No change for index: ' + j);
      }
    }
    if (this.formDaySave.meals.length !== undefined && this.formDaySave.meals.length > 0) {
      if (this.userTimezone !== undefined) {
        if (this.card_form.get('dayofmeasure').value !== undefined && this.curRec == undefined ) {
          dtDET = moment.tz(this.card_form.get('dayofmeasure').value, this.userTimezone);
        } else if (this.card_form.get('dayofmeasure').value !== undefined && this.curRec.dayofmeasure !== undefined) {
          var dtTranslate = new Date(this.card_form.get('dayofmeasure').value);
          dtDET = moment.tz(dtTranslate.toUTCString(), this.userTimezone);
        } else {
          var dtTranslate = new Date();         
          dtDET = moment.tz(dtTranslate.toUTCString(), this.userTimezone);
        }
        console.log('Date Sent: ' + dtDET.utc().format('MM-DD-YYYY HH:mm'));
      } else {
        var dtTranslate = new Date();         
        dtDET = moment(dtTranslate.toUTCString());
        console.log('No usertimezone: ' + dtDET.format('MM-DD-YYYY HH:mm'));
      }        

      this.formDaySave.dayofmeasure =  dtDET.utc().format('YYYY-MM-DD HH:mm');
    }

    var restURL="https://ap6oiuyew6.execute-api.us-east-1.amazonaws.com/dev/NutritionByProfile";
    
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
    var body = JSON.stringify(this.formDaySave);
    var self = this;

    console.log('Calling Post', this.formDaySave);    
    apigClient.invokeApi(params, pathTemplate, method, additionalParams, body)
    .then(function(result){
      self.RestService.results = result.data;
      console.log('Happy Path: ' + self.RestService.results);
      self.category.title = "Nutrition";
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

  addExistingMeals() {
    this.meals = this.card_form.get('meals') as FormArray;
    this.meals.removeAt(0);
    for (var j = 0; j < this.curRec.meals.length; j++) {
      this.meals.push(this.addExistingMeal(j));              
    }    
  }

  addExistingMeal(index): FormGroup {
    return this.formBuilder.group({
      recordid: new FormControl(this.curRec.meals[index].recordid),
      meal: new FormControl(this.curRec.meals[index].meal),
      food: new FormControl(this.curRec.meals[index].food),
      amount: new FormControl(this.curRec.meals[index].amount),
      calories: new FormControl(this.curRec.meals[index].calories),
      active: new  FormControl('Y'),
    });
  }  

  createItem(): FormGroup {
    return this.formBuilder.group({
      recordid: new FormControl(),
      meal: new FormControl(),
      food: new FormControl(),
      amount: new FormControl(),
      calories: new FormControl(),
      active: new  FormControl('Y'),
    });
  }  
  
  addItem(): void {
    this.meals = this.card_form.get('meals') as FormArray;
    this.meals.push(this.createItem());
  }

  getMinDayDate() {
    var momentNow = moment(new Date());
    if  (this.userTimezone !== undefined && this.userTimezone !=="") {
      var dayoftheweek = momentNow.tz(this.userTimezone).format('dddd');
    } else {
      var dayoftheweek = momentNow.format('dddd');
    }
  
  
    if (dayoftheweek == 'Sunday') {
      var offSet = 0
    } else if (dayoftheweek == 'Monday') {
      offSet = 1		
    } else if (dayoftheweek == 'Tuesday') {
      offSet = 2				
    } else if (dayoftheweek == 'Wednesday') {
      offSet = 3				
    } else if (dayoftheweek == 'Thursday') {
      offSet = 4				
    } else if (dayoftheweek == 'Friday') {
      offSet = 5				
    } else if (dayoftheweek == 'Saturday') {
      offSet = 6				
    }
  
    if (this.userTimezone !== undefined && this.userTimezone !=="") {
      var startofWeek = moment(momentNow).tz(this.userTimezone).subtract(offSet, 'days');
    } else {
      var startofWeek = moment(momentNow).subtract(offSet, 'days');
    }
    //console.log('Start of Week: ' + startofWeek);
    return startofWeek.format("YYYY-MM-DD");
  }

}
