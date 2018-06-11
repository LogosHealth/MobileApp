import { Component } from '@angular/core';
import { NavController, SegmentButton, NavParams, AlertController, Form } from 'ionic-angular';
import { Validators, FormGroup, FormControl, FormArray } from '@angular/forms';
import { counterRangeValidator } from '../../components/counter-input/counter-input';
import { RestService } from '../../app/services/restService.service';
import { FoodPrefModel, FoodPrefFilterModel } from '../../pages/formFoodPref/foodPref.model';
import { HistoryModel, HistoryItemModel } from '../../pages/history/history.model';
import { CallNumber } from '@ionic-native/call-number';

@Component({
  selector: 'formFoodPref-page',
  templateUrl: 'formFoodPref.html'
})
export class FormFoodPref {
  section: string;
  recId: number;
  card_form: FormGroup;
  form_array: FormArray;
  form_group: FormGroup;
  curRec: any;
  modelSave: FoodPrefFilterModel  = new FoodPrefFilterModel();
  listSave: FoodPrefModel = new FoodPrefModel();
  category: HistoryItemModel = new HistoryItemModel();
  
  categories_checkbox_open: boolean;
  categories_checkbox_result;

  constructor(public nav: NavController, public alertCtrl: AlertController, public RestService:RestService, 
    public navParams: NavParams, private callNumber: CallNumber) {
    this.recId = navParams.get('recId');
   // this.section = "event";

    this.curRec = RestService.results[this.recId]; 
    
    this.card_form = new FormGroup({
        //exp_date: new FormControl(this.curRec.startdate, Validators.required),
        recordid: new FormControl(null),
        name: new FormControl(null),
        description: new FormControl(null),
        cost: new FormControl(null),
        calories: new FormControl(null),
        totalfat: new FormControl(null),
        saturatedfat: new FormControl(null),
        transfat: new FormControl(null),
        sodium: new FormControl(null),
        carbs: new FormControl(null),
        caloriesfromfat: new FormControl(null),
        protein: new FormControl(null),
        cholesterol: new FormControl(null),
        dietaryfiber: new FormControl(null),
        sugars: new FormControl(null),
        restaurantid: new FormControl(null),
        restaurantname: new FormControl(null),
        address: new FormControl(null),
        city: new FormControl(null),
        phone: new FormControl(null),
        image: new FormControl(null)
      });  
  }

  call2Order(){
    var phoneNum = this.curRec.phone;
    this.callNumber.callNumber(phoneNum, true)
      .then(() => alert('Launched dialer!'))
      .catch(() => alert('This capability is only availabe through call-capable devices.  Please manually call: ' + phoneNum + ' to order.'));
  }

  public today() {
    return new Date().toISOString().substring(0,10);
  }

  runSearch() {
    alert('More to add');
  }

}
