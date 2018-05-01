import { Component } from '@angular/core';
import { NavController, LoadingController } from 'ionic-angular';

import { FeedPage } from '../feed/feed';
import 'rxjs/Rx';

import { HistoryModel } from './history.model';
import { HistoryService } from './history.service';
import { RestService } from '../../app/services/restService.service';

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
    public RestService:RestService
     
  ) {
    this.loading = this.loadingCtrl.create();
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


  goToFeed(category: any) {
    console.log("Clicked goToFeed", category);
    this.nav.push(FeedPage, { category: category });
  }

}
