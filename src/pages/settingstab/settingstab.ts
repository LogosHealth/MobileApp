import { Component } from '@angular/core';
import { NavController, LoadingController, Platform } from 'ionic-angular';
import 'rxjs/Rx';
import { FormFoodPref } from '../formFoodPref/formFoodPref';
import { List2Page } from '../list-2/list-2';
import { ListGoalsPage } from '../listGoals/listGoals';
import { FormAboutMe } from '../formAboutMe/formAboutMe';
import { SettingsModel } from './settingstab.model';
import { SettingsService } from './settingstab.service';
import { ListSchedulePage } from '../listSchedule/listSchedule';
import { FormLifestyle } from '../formLifestyle/formLifestyle';
import { RestService } from '../../app/services/restService.service';

var moment = require('moment-timezone');

@Component({
  selector: 'listing-page',
  templateUrl: 'settingstab.html',
})
export class SettingsTabPage {
  listing: SettingsModel = new SettingsModel();
  loading: any;
  formName: string = "settings";

  constructor(
    public nav: NavController,
    public listingService: SettingsService,
    public loadingCtrl: LoadingController,
    private platform: Platform,
    public RestService:RestService,
  ) {
    this.platform.ready().then((rdy) => {
      console.log('SettingTab Platform ready');
    });
  }

  ionViewDidLoad() {
    this.presentLoadingDefault();
    this.listingService
      .getData()
      .then(data => {
        this.listing.banner_image = data.banner_image;
        this.listing.banner_title = data.banner_title;
        //this.listing.populars = this.RestService.Profiles;
        this.listing.categories = data.categories;
        if (this.loading !==undefined) {
          this.loading.dismiss();
        }
      });
  }

  ionViewWillEnter() {
    var dtNow = moment(new Date());
    var dtExpiration = moment(this.RestService.AuthData.expiration);
    var self = this;

    //if expired - refresh token
    if (dtNow > dtExpiration) {
      this.presentLoadingDefault();
      this.RestService.refreshCredentials(function(err, results) {
        if (err) {
          console.log('Need to login again!!! - Credentials expired from history');
          self.loading.dismiss();
          self.RestService.appRestart();
        } else {
          self.loading.dismiss();
          console.log('From history - Credentials refreshed!');
        }
      });
    }
  }

  goToFeed(category: any) {
    console.log("Clicked goToFeed", category);
    if (category.title == 'Food Preferences') {
      this.nav.push(FormFoodPref, { category: category });
    } else if (category.title == 'Set Goals') {
      this.nav.push(ListGoalsPage, { category: category });
    } else if (category.title == 'Profile') {
      this.nav.push(FormAboutMe, { category: category, homePage: this });
    } else if (category.title == 'Schedules & Alerts') {
      this.nav.push(ListSchedulePage, { category: category });
    } else if (category.title == 'Lifestyle') {
        this.nav.push(FormLifestyle, { category: category });
    } else if (category.title == 'Transform Paper Records') {
        alert('Coming soon.  This will be a service where users can upload pdf medical records and have electronic records created for a one time fee.');
    } else {
      this.nav.push(List2Page, { category: category });
    }
  }

  setProfileID(profileID, index) {
    this.RestService.currentProfile = profileID;
    for (var i = 0; i < this.RestService.Profiles.length; i++) {
      if (i == index) {
        this.RestService.Profiles[i].checked = "checked";
      } else {
        this.RestService.Profiles[i].checked = "";
      }
    }
  }

  refreshProfiles() {
    var dtNow = moment(new Date());
    var dtExpiration = moment(this.RestService.AuthData.expiration);
    var self = this;

    if (dtNow < dtExpiration) {
      this.presentLoadingDefault();
      this.refreshProfilesDo();
    } else {
      this.presentLoadingDefault();
      this.RestService.refreshCredentials(function(err, results) {
        if (err) {
          console.log('Need to login again!!! - Credentials expired from listSleep');
          self.loading.dismiss();
          self.RestService.appRestart();
        } else {
          console.log('From listSleep - Credentials refreshed!');
          self.refreshProfilesDo();
        }
      });
    }
  }

  refreshProfilesDo() {
    //alert('Refresh Profiles called!');
    console.log('Refresh Profiles called!');
    var self = this;
    var email = this.RestService.AuthData.email;
    var config = {
      invokeUrl: "https://ap6oiuyew6.execute-api.us-east-1.amazonaws.com/dev/GetProfilesByEmail",
      accessKey: this.RestService.AuthData.accessKeyId,
      secretKey: this.RestService.AuthData.secretKey,
      sessionToken: this.RestService.AuthData.sessionToken,
      region:'us-east-1'
    };
    var apigClient = this.RestService.AWSRestFactory.newClient(config);
    var params = {
      email: email
    };
    var pathTemplate = '';
    var method = 'GET';
    var additionalParams = {
        queryParams: {
          email: email
        }
    };
    var body = '';
    apigClient.invokeApi(params, pathTemplate, method, additionalParams, body)
    .then(function(result){
      //console.log(result.data);
      var resultData = JSON.stringify(result.data);
      self.RestService.Profiles = result.data;
      console.log('Body: ', resultData);
      self.listing.populars = self.RestService.Profiles;
      self.loading.dismiss();
    }).catch( function(result){
        console.log(body);
        self.loading.dismiss();
    });
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
