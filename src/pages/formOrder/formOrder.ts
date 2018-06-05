import { Component } from '@angular/core';
import { NavController, SegmentButton, NavParams, AlertController, Form } from 'ionic-angular';
import { Validators, FormGroup, FormControl, FormArray } from '@angular/forms';
import { counterRangeValidator } from '../../components/counter-input/counter-input';
import { RestService } from '../../app/services/restService.service';
import { ListOrderModel, ListOrder } from '../../pages/listOrder/listOrder.model';
import { ListOrderPage } from '../listOrder/listOrder';
import { HistoryModel, HistoryItemModel } from '../../pages/history/history.model';

@Component({
  selector: 'formOrder-page',
  templateUrl: 'formOrder.html'
})
export class FormOrderPage {
  section: string;
  recId: number;
  card_form: FormGroup;
  form_array: FormArray;
  form_group: FormGroup;
  curRec: any;
  modelSave: ListOrderModel  = new ListOrderModel();
  listSave: ListOrder = new ListOrder();
  category: HistoryItemModel = new HistoryItemModel();
  
  categories_checkbox_open: boolean;
  categories_checkbox_result;

  constructor(public nav: NavController, public alertCtrl: AlertController, public RestService:RestService, 
    public navParams: NavParams) {
    this.recId = navParams.get('recId');
   // this.section = "event";

    this.curRec = RestService.results[this.recId]; 
    
    this.card_form = new FormGroup({
        //exp_date: new FormControl(this.curRec.startdate, Validators.required),
        recordid: new FormControl(this.curRec.recordid),
        name: new FormControl(this.curRec.name),
        description: new FormControl(this.curRec.description),
        cost: new FormControl(this.curRec.cost),
        calories: new FormControl(this.curRec.calories),
        totalfat: new FormControl(this.curRec.totalfat),
        saturatedfat: new FormControl(this.curRec.saturatedfat),
        transfat: new FormControl(this.curRec.transfat),
        sodium: new FormControl(this.curRec.sodium),
        carbs: new FormControl(this.curRec.carbs),
        caloriesfromfat: new FormControl(this.curRec.caloriesfromfat),
        protein: new FormControl(this.curRec.protein),
        cholesterol: new FormControl(this.curRec.cholesterol),
        dietaryfiber: new FormControl(this.curRec.dietaryfiber),
        sugars: new FormControl(this.curRec.sugars),
        restaurantid: new FormControl(this.curRec.restaurantid),
        restaurantname: new FormControl(this.curRec.restaurantname),
        address: new FormControl(this.curRec.address),
        city: new FormControl(this.curRec.city),
        phone: new FormControl(this.curRec.phone),
        image: new FormControl(this.curRec.image)
      });  
  }

  confirmRecord(){
    this.listSave.recordid = this.card_form.get('recordid').value;

    if (this.card_form.get('schedules') !== null) {
      var vaccineSaveArray = this.card_form.get('schedules') as FormArray;
      var isChanged = false;
      for (var i = 0; i < vaccineSaveArray.length ; i++) {
        console.log('VaccineSaveArray: ', vaccineSaveArray);
        isChanged = false;
        if (vaccineSaveArray.controls[i].get('exp_date').dirty) {
          isChanged = true;
        }
        if (vaccineSaveArray.controls[i].get('physician').dirty) {
          isChanged = true;
        }
        if (isChanged) {
        }
      }  
    } else {
      if (this.card_form.get('exp_date').dirty) {
      }
      if (this.card_form.get('physician').dirty) {
      }  
    }

    var restURL="https://ap6oiuyew6.execute-api.us-east-1.amazonaws.com/dev/VaccinesByProfile";
    
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
    var body = JSON.stringify(this.listSave);
    var self = this;

    console.log('Calling Post', this.listSave);    
    apigClient.invokeApi(params, pathTemplate, method, additionalParams, body)
    .then(function(result){
      self.RestService.results = result.data;
      console.log('Happy Path: ' + self.RestService.results);
      self.category.title = "Vaccines";
      //self.nav.push(ListVaccinesPage, { category: self.category });      
      self.nav.pop();      
    }).catch( function(result){
      console.log('Result: ',result);
      console.log(body);
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
            this.listSave.recordid = this.card_form.get('recordid').value;
            var restURL="https://ap6oiuyew6.execute-api.us-east-1.amazonaws.com/dev/VaccinesByProfile";
    
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
            var body = JSON.stringify(this.listSave);
            var self = this;
        
            console.log('Calling Post', this.listSave);    
            apigClient.invokeApi(params, pathTemplate, method, additionalParams, body)
            .then(function(result){
              self.RestService.results = result.data;
              console.log('Happy Path: ' + self.RestService.results);
              self.category.title = "Vaccines";
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
    this.listSave.recordid = this.card_form.get('recordid').value;
    if (!this.card_form.valid) {
    }

    if (this.card_form.get('schedules') !== null) {
      var vaccineSaveArray = this.card_form.get('schedules') as FormArray;
      var isChanged = false;
      for (var i = 0; i < vaccineSaveArray.length ; i++) {
        console.log('VaccineSaveArray: ', vaccineSaveArray);
        isChanged = false;
        if (vaccineSaveArray.controls[i].get('exp_date').dirty) {
          isChanged = true;
        }
        if (vaccineSaveArray.controls[i].get('physician').dirty) {
          isChanged = true;
        }
        if (isChanged) {
          //console.log('Record id: ' + this.vaccineSched.recordid);
        }
      }  
    } else {
      if (this.card_form.get('exp_date').dirty) {
      }
      if (this.card_form.get('physician').dirty) {
      }  
    }

    var restURL="https://ap6oiuyew6.execute-api.us-east-1.amazonaws.com/dev/VaccinesByProfile";
    
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
    var body = JSON.stringify(this.listSave);
    var self = this;

    console.log('Calling Post', this.listSave);    
    apigClient.invokeApi(params, pathTemplate, method, additionalParams, body)
    .then(function(result){
      self.RestService.results = result.data;
      console.log('Happy Path: ' + self.RestService.results);
      self.category.title = "Vaccines";
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
