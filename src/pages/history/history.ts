import { Component } from '@angular/core';
import { NavController, LoadingController, Platform } from 'ionic-angular';
import { List2Page } from '../list-2/list-2';
import { ListAllergiesPage } from '../listAllergies/listAllergies';
import { ListVaccinesPage } from '../listVaccines/listVaccines';
import { ListLabsPage } from '../listLabs/listLabs';
import { ListContactPage } from '../listContacts/listContacts';
import { ListMedicalEvent } from '../listMedicalEvent/listMedicalEvent';
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
  formName: string = "history";

  constructor(
    public nav: NavController,
    public listingService: HistoryService,
    public loadingCtrl: LoadingController,
    public RestService:RestService,
    private platform: Platform,
  ) {
    this.platform.ready().then((rdy) => {
      console.log('History platform ready');
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
          console.log('From history - Credentials refreshed!');
          self.loading.dismiss();
        }
      });
    }
  }

  goToFeed(category: any) {
    console.log("Clicked goToFeed", category);
    if (category.title == 'Allergies') {
      this.nav.push(ListAllergiesPage, { category: category });
    } else if (category.title == 'Vaccines') {
      this.nav.push(ListVaccinesPage, { category: category });
    } else if (category.title == 'Lab/Test Results') {
      this.nav.push(ListLabsPage, { category: category });
    } else if (category.title == 'Medical Contacts') {
      this.nav.push(ListContactPage, { category: category });
    } else if (category.title == 'Medical Events') {
      this.nav.push(ListMedicalEvent, { category: category });
  } else    {
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
