import { Component } from '@angular/core';
import { NavController, NavParams, AlertController, LoadingController, ViewController } from 'ionic-angular';
import { Validators, FormGroup, FormControl } from '@angular/forms';
import { RestService } from '../../app/services/restService.service';

var moment = require('moment-timezone');

@Component({
  selector: 'formExercise-page',
  templateUrl: 'formChooseProfile.html'
})
export class FormChooseProfile {
  loading: any;
  section: string;
  formName: string = "FormChooseProfile";
  recId: number;
  card_form: FormGroup;
  curRec: any;
  newRec: boolean = false;
  saving: boolean = false;
  showTips: boolean = true;
  changeUser: boolean = false;
  selectUser: boolean = false;
  selectedUser;
  userUpdated: boolean = false;
  userAction:string;
  categories_checkbox_open: boolean;
  categories_checkbox_result;

  constructor(public nav: NavController, public alertCtrl: AlertController, public RestService:RestService,
    public navParams: NavParams, public loadingCtrl: LoadingController, public viewCtrl: ViewController) {
    this.curRec = this.RestService.Profiles;
    this.userAction = navParams.get('action');
    if (this.userAction == 'changeUser') {
      console.log('User Action is changeUser: ');
      this.changeUser = true;
    } else if (this.userAction == 'selectUser') {
      this.selectUser = true;
    } else {
      console.log('User Action is set User: ', this.userAction);
    }
    console.log('Choose Profile curRec: ', this.curRec);
    this.card_form = new FormGroup({
        profileid: new FormControl(null, Validators.required),
    });
  }

  sendUser() {
    this.selectedUser = this.card_form.get('profileid').value;
    this.dismiss();
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
      var restURL="https://ap6oiuyew6.execute-api.us-east-1.amazonaws.com/dev/UserByDevice";
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
              //profileid: this.RestService.currentProfile
          }
      };
      var profileData;
      console.log('Device ID from Save Data in Choose Profile: ' + this.RestService.deviceUUID);
      var userid = this.card_form.get('profileid').value;
      if (!this.changeUser) {
        profileData = {
          'userid':this.card_form.get('profileid').value,
          'deviceid':this.RestService.deviceUUID,
          'accountid':this.RestService.Profiles[0].accountid,
          'action':'insert',
        };
      } else {
        profileData = {
          'userid':this.card_form.get('profileid').value,
          'deviceid':this.RestService.deviceUUID,
          'accountid':this.RestService.Profiles[0].accountid,
          'action':'update',
        };
      }
      var body = JSON.stringify(profileData);
      var self = this;
      console.log('Calling Post', profileData);
      apigClient.invokeApi(params, pathTemplate, method, additionalParams, body)
      .then(function(result){
        console.log('Happy Path Chooose Profile Save: ', result);
        self.RestService.userId = userid;
        self.userUpdated = true;
        self.loading.dismiss();
        self.dismiss();
      }).catch( function(result){
        console.log('formChooseProfile Save Error: ',result);
        self.loading.dismiss();
        self.dismiss();
        alert('There was an error saving this data.  Please try again later');
      });
  }

  updateUser() {
    this.RestService.userId = this.card_form.get('profileid').value;
    this.userUpdated = true;
    this.dismiss();
  }

  cancelAction() {
    this.userUpdated = false;
    this.dismiss();
  }

  dismiss() {
    let data = { 'userUpdated': this.userUpdated, 'profileid':this.selectedUser };
    this.viewCtrl.dismiss(data);
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
