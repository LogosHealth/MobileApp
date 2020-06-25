import { Component } from '@angular/core';
import { NavController, NavParams, AlertController, LoadingController, PopoverController } from 'ionic-angular';
import { FormGroup, FormControl, FormArray, FormsModule } from '@angular/forms';
import { RestService } from '../../app/services/restService.service';
import { Academy, AcademyModel } from '../../pages/formAcademy/formAcademy.model';
//import { FoodPrefService } from '../../pages/formFoodPref/foodPref.service';
import { HistoryItemModel } from '../../pages/history/history.model';

var moment = require('moment-timezone');

@Component({
  selector: 'formVisit1-page',
  templateUrl: 'formAcademy.html'
})
export class FormAcademy {
  formName: string = "formAcademy";
  section: string;
  recId: number;
  card_form: FormGroup;
  form_array: FormArray;
  form_group: FormGroup;
  curRec: any;
  academyModel: AcademyModel = new AcademyModel();
  category: HistoryItemModel = new HistoryItemModel();
  loading: any;
  saving: boolean = false;
  categoryKey = [];
  controlKey = [];
  control2Category = [];
  saveAcademy: Academy = new Academy();
  saveAcademyModel: AcademyModel = new AcademyModel();
  categories_checkbox_open: boolean;
  categories_checkbox_result;
  userTimezone: any;
  momentNow: any;

  constructor(public nav: NavController, public alertCtrl: AlertController, public RestService:RestService,
    public navParams: NavParams, public categoryList: FormsModule, public popoverCtrl:PopoverController, public loadingCtrl: LoadingController) {
    this.recId = navParams.get('recId');
    this.categoryList = "food";

    this.card_form = new FormGroup({
      LatestNews: new FormControl(),
      COVID19: new FormControl(),
      Fitness: new FormControl(),
      Nutrition: new FormControl(),
    });

    var self = this;
    this.RestService.curProfileObj(function (error, results) {
      if (!error) {
        self.userTimezone = results.timezone;
      }
    });
    this.momentNow = moment(new Date());
  }

  ionViewWillEnter() {
    var dtNow = moment(new Date());
    var dtExpiration = moment(this.RestService.AuthData.expiration);
    var self = this;

    if (dtNow < dtExpiration) {
      this.presentLoadingDefault();
      this.loadData();
    } else {
      this.presentLoadingDefault();
      this.RestService.refreshCredentials(function(err, results) {
        if (err) {
          console.log('Need to login again!!! - Credentials expired from ' + self.formName);
          self.loading.dismiss();
          self.RestService.appRestart();
        } else {
          console.log('From '+ self.formName + ' - Credentials refreshed!');
          self.loadData();
        }
      });
    }
  }

  loadData() {
    var restURL: string;

    restURL="https://ap6oiuyew6.execute-api.us-east-1.amazonaws.com/dev/AcademyByProfile";
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
      self.academyModel.items = result.data;
      console.log('load data - items: ', self.academyModel.items);
      self.loadForm();
    }).catch( function(result){
        console.log('Error Result from foodAcademy.loadData: ', result);
        self.loading.dismiss();
        alert('There was an error retrieving this data.  Please try again later');
    });
  }

  loadForm() {
    for (var i = 0; i < this.academyModel.items.length; i++) {
      if(this.academyModel.items[i].subscribe == 'Y') {
        this.card_form.controls[this.academyModel.items[i].name].setValue(true);
      }
    }
    this.loading.dismiss();
  }

  UpdateModel(controlName) {
    if (this.card_form.controls[controlName].dirty) {
      for (var i = 0; i < this.academyModel.items.length; i++) {
        if (this.academyModel.items[i].name == controlName) {
          if (this.card_form.controls[controlName].value) {
            this.academyModel.items[i].subscribe = 'Y';
          } else {
            this.academyModel.items[i].subscribe = 'N';
          }
          this.academyModel.items[i].dirty = 'Y';
        }
      }
    }
  }

  public today() {
    //Used as max day in date of measure control
    var momentNow;

    if (this.userTimezone !== undefined && this.userTimezone !== null && this.userTimezone !== "") {
      momentNow = this.momentNow.tz(this.userTimezone).format('YYYY-MM-DD');
    } else {
      momentNow = this.momentNow.format('YYYY-MM-DD');
    }
    //console.log('From Today momentNow: ' + momentNow);
    return momentNow;
  }

  saveData(){
    var dtNow = moment(new Date());
    var dtExpiration = moment(this.RestService.AuthData.expiration);
    var self = this;

    if (dtNow < dtExpiration) {
      this.presentLoadingDefault();
      this.saveDataDo();
    } else {
      this.presentLoadingDefault();
      this.RestService.refreshCredentials(function(err, results) {
        if (err) {
          console.log('Need to login again!!! - Credentials expired from ' + self.formName + '.saveRecord');
          self.loading.dismiss();
          self.RestService.appRestart();
        } else {
          console.log('From ' + self.formName + '.saveRecord - Credentials refreshed!');
          self.saveDataDo();
        }
      });
    }
  }

  saveDataDo() {
    var self = this;
    this.saving = true;
    this.saveAcademy = new Academy();
    this.saveAcademyModel = new AcademyModel();
    this.saveAcademyModel.items = new Array<Academy>();

    //console.log('academy.save: ', this.saveAcademyModel);
    console.log("Academy Final: ", this.saveAcademyModel);
      var restURL="https://ap6oiuyew6.execute-api.us-east-1.amazonaws.com/dev/AcademyByProfile";
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

      this.saveAcademyModel.userid = this.RestService.currentProfile;
      console.log('academyModel.items: ', this.academyModel.items);
      for (var i = 0; i < this.academyModel.items.length; i++) {
        if (this.academyModel.items[i].dirty == 'Y') {
          this.saveAcademy = new Academy();
          this.saveAcademy.recordid = this.academyModel.items[i].recordid;
          this.saveAcademy.subscribe = this.academyModel.items[i].subscribe;
          this.saveAcademyModel.items.push(this.saveAcademy);
        }
      }

      var body = JSON.stringify(this.saveAcademyModel);
      console.log('Calling Post', this.saveAcademyModel);
      apigClient.invokeApi(params, pathTemplate, method, additionalParams, body)
        .then(function(result){
          self.RestService.results = result.data;
          console.log('Happy Path: ' + self.RestService.results);
          self.loadData();
          self.nav.pop();
        }).catch( function(result){
          console.log('Result: ',result);
          self.loading.dismiss();
          alert('There was an error saving this data.  Please try again later');
        });
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

  presentLoadingDefault() {
    if (this.loading == undefined || this.loading == null) {
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

}
