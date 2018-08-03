import { Component } from '@angular/core';
import { NavController, NavParams, AlertController, LoadingController } from 'ionic-angular';
import { Validators, FormGroup, FormControl, FormArray, FormsModule } from '@angular/forms';
import { RestService } from '../../app/services/restService.service';
import { ListMeasureModel, ListMeasure } from '../../pages/listMeasure/listMeasure.model';

import { HistoryItemModel } from '../../pages/history/history.model';
import { ListGoalsModel } from '../../pages/listGoals/listGoals.model';

var moment = require('moment-timezone');

@Component({
  selector: 'formVaccines-page',
  templateUrl: 'formWeight.html'
})
export class FormWeightPage {
  loading: any;
  section: string;
  formName: string = "formWeight";
  recId: number;
  goalname: string;
  card_form: FormGroup;
  goal_array: FormArray;
  goal_schedule: FormGroup;
  curRec: any;
  newRec: boolean = false;
  formModelSave: ListMeasureModel  = new ListMeasureModel();
  formSave: ListMeasure = new ListMeasure();
  category: HistoryItemModel = new HistoryItemModel();
  userTimezone: any;
  list2: ListGoalsModel = new ListGoalsModel();

  categories_checkbox_open: boolean;
  categories_checkbox_result;

  constructor(public nav: NavController, public alertCtrl: AlertController, public RestService:RestService, 
    public navParams: NavParams, public loadingCtrl: LoadingController) {
    this.recId = navParams.get('recId');

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
 
      this.card_form = new FormGroup({
        recordid: new FormControl(this.curRec.recordid),
        weight: new FormControl(this.curRec.weight),
        unitofmeasure: new FormControl(this.curRec.unitofmeasure),
        dateofmeasure: new FormControl(this.formatDateTime(this.curRec.dateofmeasure)),
        profileid: new FormControl(this.curRec.profileid),
        userid: new FormControl(this.curRec.userid)
      });    
    } else {
      this.newRec = true;
      this.card_form = new FormGroup({
        recordid: new FormControl(),
        weight: new FormControl("", Validators.required),
        unitofmeasure: new FormControl(),
        dateofmeasure: new FormControl(),
        profileid: new FormControl(),
        userid: new FormControl()
      });    
    }
  }

  ionViewWillEnter() {
    this.nav.getPrevious().data.refresh = false;
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
            this.formSave.recordid = this.card_form.get('recordid').value;
            this.formSave.profileid = this.RestService.currentProfile;
            this.formSave.userid = this.RestService.currentProfile;  //placeholder for user to device mapping and user identification
            this.formSave.active = 'N';
            var restURL="https://ap6oiuyew6.execute-api.us-east-1.amazonaws.com/dev/WeightByProfile";
    
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
      this.formSave.recordid = this.card_form.get('recordid').value;
      this.formSave.profileid = this.RestService.currentProfile;
      this.formSave.userid = this.RestService.currentProfile;  //placeholder for user to device mapping and user identification
      this.formSave.active = 'Y'; 
      if (this.card_form.get('weight').dirty){
        this.formSave.weight = this.card_form.get('weight').value;
      }
    } else {
      this.formSave.weight = this.card_form.get('weight').value;
      this.formSave.profileid = this.RestService.currentProfile;
      this.formSave.userid = this.RestService.currentProfile;  //placeholder for user to device mapping and user identification
      this.formSave.active = 'Y'; 
    }
    
    var restURL="https://ap6oiuyew6.execute-api.us-east-1.amazonaws.com/dev/WeightByProfile";
    
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
      console.log('Happy Path: ' + self.RestService.results);
      self.category.title = "Measure";
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
