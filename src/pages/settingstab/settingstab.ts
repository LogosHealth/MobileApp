import { Component } from '@angular/core';
import { NavController, LoadingController, Events } from 'ionic-angular';

//import { FeedPage } from '../feed/feed';
import { FormFoodPref } from '../formFoodPref/formFoodPref';

import { List2Page } from '../list-2/list-2';
import { ListGoalsPage } from '../listGoals/listGoals';

import 'rxjs/Rx';
import { SettingsModel } from './settingstab.model';
import { SettingsService } from './settingstab.service';
import { RestService } from '../../app/services/restService.service';

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
    } else {
      this.nav.push(List2Page, { category: category });      
    }
  }

  setProfileID(profileID: any) {
    this.RestService.currentProfile = profileID;
    this.event.publish('ProfileChangeFromSettings', profileID);

    //alert("Profile selected: " + this.RestService.currentProfile);
  }

}
