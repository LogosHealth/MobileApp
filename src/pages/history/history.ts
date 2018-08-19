import { Component } from '@angular/core';
import { NavController, LoadingController, Events } from 'ionic-angular';

//import { FeedPage } from '../feed/feed';
import { List2Page } from '../list-2/list-2';
import { ListAllergiesPage } from '../listAllergies/listAllergies';
import { ListVaccinesPage } from '../listVaccines/listVaccines';
import { ListLabsPage } from '../listLabs/listLabs';

import 'rxjs/Rx';
import { HistoryModel } from './history.model';
import { HistoryService } from './history.service';
import { RestService } from '../../app/services/restService.service';

var moment = require('moment-timezone');

@Component({
  selector: 'listing-page',
  templateUrl: 'history.html',
})
export class HistoryPage {
  listing: HistoryModel = new HistoryModel();
  loading: any;

  constructor(
    public nav: NavController,
    public listingService: HistoryService,
    public loadingCtrl: LoadingController,
    public RestService:RestService,
    private event:Events
     
  ) {
    this.loading = this.loadingCtrl.create();
    this.event.subscribe('ProfileChangeFromListing', (profileid) => {
      this.setCurrentProfile(profileid);
    })
    this.event.subscribe('ProfileChangeFromSettings', (profileid) => {
      this.setCurrentProfile(profileid);
    })    
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
            //alert('Yup! ' + this.RestService.Profiles[i].profileid);
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

    console.log('ivwe historytab dtDiff: ' + dtDiff + ' dtExp: ' + dtExpiration + ' dtNow: ' + dtNow);
    if (dtDiff <= 0) {
    	console.log('Need to login again!!! - Credentials expired from historytab');
    	this.RestService.appRestart();
    } else if (dtDiff < 30) {
    	console.log('Calling Refresh Credentials from historytab dtDiff: ' + dtDiff + ' dtExp: ' + dtExpiration + ' dtNow: ' + dtNow);
    	this.RestService.refreshCredentials();
    }
  }


  setCurrentProfile(profileid: any) {
    //alert('Start setCurrentProfile');
    for (var i = 0; i < this.listing.populars.length; i++) {
      if (this.listing.populars[i].profileid == this.RestService.currentProfile) {
        this.listing.populars[i].checked = "checked";
        //alert('Yup CurProfile History! ' + this.listing.populars[i].profileid + ' ' + this.listing.populars[i].checked);
      } else {
        this.listing.populars[i].checked = "";            
        //alert('Nope CurProfile History! ' + this.listing.populars[i].profileid + ' Checked: ' + this.listing.populars[i].checked);
      }
    }    
  }
  
  //ionSelected() {
    //alert('History Selected');
  //}

  goToFeed(category: any) {
    console.log("Clicked goToFeed", category);
    if (category.title == 'Allergies') {
      this.nav.push(ListAllergiesPage, { category: category });
    } else if (category.title == 'Vaccines') {
      this.nav.push(ListVaccinesPage, { category: category });
    } else if (category.title == 'Lab/Test Results') {
      this.nav.push(ListLabsPage, { category: category });
    } else    {
      this.nav.push(List2Page, { category: category });      
    }
  }

  setProfileID(profileID: any) {
    this.RestService.currentProfile = profileID;
    this.event.publish('ProfileChangeFromHistory', profileID);

    //alert("Profile selected: " + this.RestService.currentProfile);
  }

}
