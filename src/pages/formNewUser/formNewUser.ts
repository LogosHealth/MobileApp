import { Component } from '@angular/core';
import { NavController, NavParams, AlertController, LoadingController, ViewController } from 'ionic-angular';
import { Validators, FormGroup, FormControl } from '@angular/forms';
import { RestService } from '../../app/services/restService.service';

var moment = require('moment-timezone');

@Component({
  selector: 'formExercise-page',
  templateUrl: 'formNewUser.html'
})
export class FormNewUser {
  loading: any;
  section: string;
  formName: string = "FormNewUser";
  recId: number;
  card_form: FormGroup;
  curRec: any;
  newRec: boolean = false;
  saving: boolean = false;
  showTips: boolean = true;
  changeUser: boolean = false;
  userUpdated: boolean = false;
  userAction:string;
  categories_checkbox_open: boolean;
  categories_checkbox_result;
  email: string;
  profileid: number;

  constructor(public nav: NavController, public alertCtrl: AlertController, public RestService:RestService,
    public navParams: NavParams, public loadingCtrl: LoadingController, public viewCtrl: ViewController) {

      this.email = navParams.get('email');
      console.log('Email in newUser: ' + this.email);
      this.card_form = new FormGroup({
        firstname: new FormControl(null, Validators.required),
        lastname: new FormControl(null, Validators.required),
        birthdate: new FormControl(null, Validators.required),
    });
  }

  saveRecord(){
    var dtNow = moment(new Date());
    var dtExpiration = moment(this.RestService.AuthData.expiration);
    var self = this;

    if (dtNow < dtExpiration) {
      this.presentLoadingDefault();
      this.saveRecordDo();
    } else {
      this.presentLoadingDefault();
      this.RestService.refreshCredentials(function(err, results) {
        if (err) {
          console.log('Need to login again!!! - Credentials expired from formChooseProfile.saveRecord');
          self.loading.dismiss();
          self.RestService.appRestart();
        } else {
          console.log('From formChooseProfile.saveRecord - Credentials refreshed!');
          self.saveRecordDo();
        }
      });
    }
  }

  saveRecordDo(){
    this.saving = true;
      var restURL="https://ap6oiuyew6.execute-api.us-east-1.amazonaws.com/dev/GetProfilesByEmail";
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
              email: this.email
          }
      };
      console.log('newUser save Birthdate: ' + this.card_form.get('birthdate').value);
      var profileData = {firstname: this.card_form.get('firstname').value,
                        lastname: this.card_form.get('lastname').value,
                        birthdate: this.card_form.get('birthdate').value,};
      var body = JSON.stringify(profileData);
      var self = this;
      console.log('Calling Post', body);
      apigClient.invokeApi(params, pathTemplate, method, additionalParams, body)
      .then(function(result){
        console.log('Happy Path for AddNewUser Save: ', result);
        self.profileid = result.data;
        self.loading.dismiss();
        self.dismiss();
      }).catch( function(result){
        console.log('AddNewUser Save Error: ',result);
        self.loading.dismiss();
        self.dismiss();
        alert('There was an error saving this data.  Please try again later');
      });
  }

  cancelAction(){
    let alert = this.alertCtrl.create({
      title: 'Are you sure?',
      message: 'Without this information, you cannot use Logos Health.  Click Cancel to go back or Confirm to exit',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'Confirm',
          handler: () => {
            console.log('Confirm clicked');
            this.dismiss();
          }
        }
      ]
    });
    alert.present();
  }

  dismiss() {
    let data = { 'profileid': this.profileid };
    this.viewCtrl.dismiss(data);
  }

  public today() {
    var momentNow = moment(new Date()).format('YYYY-MM-DD');
    return momentNow;
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
