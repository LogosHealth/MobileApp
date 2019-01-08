import { Component } from '@angular/core';
import { NavController, NavParams, AlertController, LoadingController} from 'ionic-angular';
import { FormGroup, FormControl, FormArray } from '@angular/forms';
import { RestService } from '../../app/services/restService.service';
import { ListOrderModel, ListOrder } from '../../pages/listOrder/listOrder.model';
import { HistoryItemModel } from '../../pages/history/history.model';
import { CallNumber } from '@ionic-native/call-number';

@Component({
  selector: 'formOrder-page',
  templateUrl: 'formOrder.html'
})
export class FormOrderPage {
  section: string;
  formName: string = "formOrder";
  loading: any;
  recId: number;
  card_form: FormGroup;
  form_array: FormArray;
  form_group: FormGroup;
  curRec: any;
  saving: boolean = false;
  showTips: boolean = true;
  modelSave: ListOrderModel  = new ListOrderModel();
  listSave: ListOrder = new ListOrder();
  category: HistoryItemModel = new HistoryItemModel();
  categories_checkbox_open: boolean;
  categories_checkbox_result;

  constructor(public nav: NavController, public alertCtrl: AlertController, public RestService:RestService, public loadingCtrl: LoadingController,
    public navParams: NavParams, private callNumber: CallNumber) {

    this.recId = navParams.get('recId');
    this.curRec = RestService.results[this.recId];
    this.card_form = new FormGroup({
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

  call2Order(){
    var phoneNum = this.curRec.phone;
    this.callNumber.callNumber(phoneNum, true)
      .then(() => alert('Launched dialer!'))
      .catch(() => alert('This capability is only availabe through call-capable devices.  Please manually call: ' + phoneNum + ' to order.'));
  }

  public today() {
    return new Date().toISOString().substring(0,10);
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
