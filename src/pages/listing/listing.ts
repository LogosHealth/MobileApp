import { Component } from '@angular/core';
import { NavController, LoadingController, Events } from 'ionic-angular';

import { FeedPage } from '../feed/feed';
import 'rxjs/Rx';

import { ListingModel } from './listing.model';
import { ListingService } from './listing.service';
import { RestService } from '../../app/services/restService.service';

import { ListOrderPage } from '../listOrder/listOrder';


@Component({
  selector: 'listing-page',
  templateUrl: 'listing.html',
})
export class ListingPage {
  listing: ListingModel = new ListingModel();
  loading: any;

  constructor(
    public nav: NavController,
    public listingService: ListingService,
    public loadingCtrl: LoadingController,
    public RestService:RestService,
    private event:Events
  ) {
    this.loading = this.loadingCtrl.create();
    this.event.subscribe('ProfileChangeFromHistory', (profileid) => {
      this.setCurrentProfile(profileid);
    })
//    this.event.subscribe('TabSelectToday', (profileid) => {
//      this.setCurrentProfile(profileid);
//    })
  }

  ionViewDidLoad() {
    this.loading.present();
    this.listingService
      .getData()
      .then(data => {
        this.listing.banner_image = data.banner_image;
        this.listing.banner_title = data.banner_title;
        this.listing.populars = this.RestService.Profiles;
        this.listing.categories = data.categories;
        this.loading.dismiss();
      });
  }

  //ionSelected() {
    //alert('Listing Selected');
  //}

  setCurrentProfile(profileid: any) {
    //alert('Start setCurrentProfile');
    for (var i = 0; i < this.listing.populars.length; i++) {
        if (this.listing.populars[i].profileid == this.RestService.currentProfile) {
          this.listing.populars[i].checked = "checked";
          //alert('Yup CurProfile! ' + this.listing.populars[i].profileid + ' Checked: ' + this.listing.populars[i].checked);
        } else {
          this.listing.populars[i].checked = "";            
          //alert('Nope CurProfile! ' + this.listing.populars[i].profileid + ' Checked: ' + this.listing.populars[i].checked);
        }
    }    
  }

  goToFeed(category: any) {
    console.log("Clicked goToFeed", category);
    if (category.title == 'Order a Meal') {
      this.nav.push(ListOrderPage, { category: category });
    } else    {
      this.nav.push(FeedPage, { category: category });
    }
  }
  
  setProfileID(profileID: any) {    
    this.RestService.currentProfile = profileID;
    this.event.publish('ProfileChangeFromListing', profileID);
    //alert("Profile selected: " + this.RestService.currentProfile);
  }
}
