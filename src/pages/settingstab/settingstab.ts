import { Component } from '@angular/core';
import { NavController, LoadingController, Events } from 'ionic-angular';
import 'rxjs/Rx';
import { FormFoodPref } from '../formFoodPref/formFoodPref';
import { List2Page } from '../list-2/list-2';
import { ListGoalsPage } from '../listGoals/listGoals';
import { FormAboutMe } from '../formAboutMe/formAboutMe';
import { SettingsModel } from './settingstab.model';
import { SettingsService } from './settingstab.service';
import { ListSchedulePage } from '../listSchedule/listSchedule';


import { RestService } from '../../app/services/restService.service';

var moment = require('moment-timezone');

@Component({
  selector: 'listing-page',
  templateUrl: 'settingstab.html',
})
export class SettingsTabPage {
  listing: SettingsModel = new SettingsModel();
  loading: any;

  constructor(
    public nav: NavController,
    public listingService: SettingsService,
    public loadingCtrl: LoadingController,
    public RestService:RestService,
    private event:Events
     
  ) {
    this.loading = this.loadingCtrl.create();
    this.event.subscribe('ProfileChangeFromListing', (profileid) => {
      this.setCurrentProfile(profileid);
    })
    this.event.subscribe('ProfileChangeFromHistory', (profileid) => {
      this.setCurrentProfile(profileid);
    })
  //  this.event.subscribe('TabSelectHistory', (profileid) => {
  //    this.setCurrentProfile(profileid);
  //  })
    
  }

  ionViewDidLoad() {
    this.loading.present();
    this.listingService
      .getData()
      .then(data => {
        this.listing.banner_image = data.banner_image;
        this.listing.banner_title = data.banner_title;

        for (var i = 0; i < this.RestService.Profiles.length; i++) {
          if (this.RestService.Profiles[i].profileid == this.RestService.currentProfile) {
            this.RestService.Profiles[i].checked = "checked";
          } else {
            this.RestService.Profiles[i].checked = "";            
          }
        }
        this.listing.populars = this.RestService.Profiles;

        this.listing.categories = data.categories;
        this.loading.dismiss();
      });
  }

  ionViewWillEnter() {
    var dtNow = moment(new Date());
    var dtExpiration = moment(this.RestService.AuthData.expiration);
    var dtDiff = dtExpiration.diff(dtNow, 'minutes');

    if (dtDiff <= 0) {
    	console.log('Need to login again!!! - Credentials expired from settingstab');
    	this.RestService.appRestart();
    } else if (dtDiff < 30) {
    	console.log('Calling Refresh Credentials from settingstab dtDiff: ' + dtDiff + ' dtExp: ' + dtExpiration + ' dtNow: ' + dtNow);
    	this.RestService.refreshCredentials();
    }
  }

  setCurrentProfile(profileid: any) {
    //alert('Start setCurrentProfile');
    for (var i = 0; i < this.listing.populars.length; i++) {
      if (this.listing.populars[i].profileid == this.RestService.currentProfile) {
        this.listing.populars[i].checked = "checked";
        //alert('Yup CurProfile Settings! ' + this.listing.populars[i].profileid + ' ' + this.listing.populars[i].checked);
      } else {
        this.listing.populars[i].checked = "";            
        //alert('Nope CurProfile Settings! ' + this.listing.populars[i].profileid + ' ' + this.listing.populars[i].checked);
      }
    }    
  }
  
  //ionSelected() {
    //alert('History Selected');
  //}

  goToFeed(category: any) {
    console.log("Clicked goToFeed", category);
    if (category.title == 'Food Preferences') {
      this.nav.push(FormFoodPref, { category: category });
    } else if (category.title == 'Set Goals') {
      this.nav.push(ListGoalsPage, { category: category });      
    } else if (category.title == 'About Me') {
      this.nav.push(FormAboutMe, { category: category, homePage: this });      
    } else if (category.title == 'Schedules & Alerts') {
      this.nav.push(ListSchedulePage, { category: category });      
    } else {
      this.nav.push(List2Page, { category: category });      
    }
  }

  setProfileID(profileID: any) {
    this.RestService.currentProfile = profileID;
    this.event.publish('ProfileChangeFromSettings', profileID);

    //alert("Profile selected: " + this.RestService.currentProfile);
  }

  refreshProfiles() {
    alert('Refresh Profiles called!');
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
        //This is where you would put a success callback
    }).catch( function(result){
        console.log(body);
    });
  }

}
