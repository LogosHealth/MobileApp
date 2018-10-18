import { Component, ViewChild } from '@angular/core';
import { NavController, LoadingController, Platform, ModalController, Events } from 'ionic-angular';

import { FeedPage } from '../feed/feed';
import 'rxjs/Rx';

import { ListingModel } from './listing.model';
import { ListingService } from './listing.service';
import { RestService } from '../../app/services/restService.service';

import { ListOrderPage } from '../listOrder/listOrder';
import { ListGoalProgressPage } from '../listGoalProgress/listGoalProgress';
import { ListExercisePage } from '../listExercise/listExercise';
import { ListSleepPage } from '../listSleep/listSleep';
import { ListMeasurePage } from '../listMeasure/listMeasure';
import { ListNutritionPage } from '../listNutrition/listNutrition';
import { ListVisitPage } from '../listVisit/listVisit';
import { FormChooseProfile } from '../formChooseProfile/formChooseProfile'
import { ListAlertPage } from '../listAlert/listAlert';
import { LocalNotifications } from '@ionic-native/local-notifications';
import { Chart } from 'chart.js';

var moment = require('moment-timezone');

@Component({
  selector: 'listing-page',
  templateUrl: 'listing.html',
})
export class ListingPage {
  @ViewChild('lineCanvas') lineCanvas;

  listing: ListingModel = new ListingModel();
  loading: any;
  curUser: any;
  userCount: number = 0;
  lineChart: any;

  constructor(
    public nav: NavController,
    public listingService: ListingService,
    public loadingCtrl: LoadingController,
    public RestService:RestService,
    private platform: Platform,
    private localNotifications: LocalNotifications,
    public events: Events,
    public modalCtrl: ModalController
  ) {
    var self = this;
    this.platform.ready().then((rdy) => {
      this.loading = this.loadingCtrl.create();

      self.localNotifications.on('click').subscribe((notification)  => {
        console.log("notification id from click event " + notification.id);
        //alert("notification id = " + notification.id);
        //alert("page from = " + notification.data.secret);
        if (notification.data.secret == 'scheduleinstance') {
          console.log('Click Notification - state of nav: ', self.nav);
          alert("Please go to the Visit tile and schedule this appointment");
          //self.nav.popToRoot();
          //self.nav.push(ListVisitPage);
          //self.events.publish('updateScreen');
        }
      });
    });
  }

  ionViewDidLoad() {
    this.loading.present();

    this.userCount = this.RestService.Profiles.length;

    this.listingService
      .getData()
      .then(data => {
        this.listing.banner_image = data.banner_image;
        this.listing.banner_title = data.banner_title;
        //this.listing.populars = this.RestService.Profiles;
        this.listing.categories = data.categories;

        var self = this;
        this.RestService.curUserObj(function (error, results) {
          if (!error) {
            self.curUser = results;
            console.log('Initial curUser', self.curUser);
            self.RestService.currentProfile = self.RestService.userId;

            self.lineChart = new Chart(self.lineCanvas.nativeElement, {
              type: 'line',
              data: {
                  labels: ["Jun", "Jul", "Aug", "Sep"],
                  datasets: [
                      {
                          label: "Cal Burned/Week (Target 2500/week)",
                          fill: false,
                          lineTension: 0.1,
                          backgroundColor: "rgba(0,0,0,1)",
                          borderColor: "rgba(0,0,0,1)",
                          borderCapStyle: 'butt',
                          borderDash: [],
                          borderDashOffset: 0.0,
                          borderJoinStyle: 'miter',
                          pointBorderColor: "rgba(0,0,0,1)",
                          pointBackgroundColor: "#fff",
                          pointBorderWidth: 1,
                          pointHoverRadius: 5,
                          pointHoverBackgroundColor: "rgba(0,0,0,1)",
                          pointHoverBorderColor: "rgba(220,220,220,1)",
                          pointHoverBorderWidth: 2,
                          pointRadius: 1,
                          pointHitRadius: 10,
                          data: [.95, 1.05, .70, 1.20],
                          spanGaps: false,
                      }, {
                        label: "Cal Intake/Week (Target 21000/week)",
                        fill: false,
                        lineTension: 0.1,
                        backgroundColor: "rgba(115, 18, 18, 1)",
                        borderColor: "rgba(115, 18, 18, 1)",
                        borderCapStyle: 'butt',
                        borderDash: [],
                        borderDashOffset: 0.0,
                        borderJoinStyle: 'miter',
                        pointBorderColor: "rgba(115, 18, 18, 1)",
                        pointBackgroundColor: "#fff",
                        pointBorderWidth: 1,
                        pointHoverRadius: 5,
                        pointHoverBackgroundColor: "rgba(115, 18, 18, 1)",
                        pointHoverBorderColor: "rgba(220,220,220,1)",
                        pointHoverBorderWidth: 2,
                        pointRadius: 1,
                        pointHitRadius: 10,
                        data: [.99, 1.05, 1.10, .87],
                        spanGaps: false,
                    }, {
                      label: "Weight (Target 225)",
                      fill: false,
                      lineTension: 0.1,
                      backgroundColor: "rgba(199, 56, 224, 1)",
                      borderColor: "rgba(199, 56, 224, 1)",
                      borderCapStyle: 'butt',
                      borderDash: [],
                      borderDashOffset: 0.0,
                      borderJoinStyle: 'miter',
                      pointBorderColor: "rgba(199, 56, 224, 1)",
                      pointBackgroundColor: "#fff",
                      pointBorderWidth: 1,
                      pointHoverRadius: 5,
                      pointHoverBackgroundColor: "rgba(199, 56, 224, 1)",
                      pointHoverBorderColor: "rgba(220,220,220,1)",
                      pointHoverBorderWidth: 2,
                      pointRadius: 1,
                      pointHitRadius: 10,
                      data: [1.01, 1.00, .99, .96],
                      spanGaps: false,
                  },


                    ]
                    }
                });

            //Initial setting of checked field
            for (var i = 0; i < self.RestService.Profiles.length; i++) {
              if (self.RestService.Profiles[i].profileid == self.RestService.currentProfile) {
                self.RestService.Profiles[i].checked = "checked";
                console.log('Initial User Set - i = ' + i);
              }
            }
            self.nav.push(ListAlertPage, { autoload: true });
            //console.log('Results from listing curUser usertitle: ', self.curUser);
          } else {
            console.log('Error from get curUserObj: ', error);
            self.nav.push(ListAlertPage, { autoload: true });
          }
        });
      });
  }

  public getCurrentUserName() {
    if (this.curUser !== undefined) {
      return this.curUser.title;
    } else {
      return 'Nobody';
    }
  }

  changeUser() {
    let profileModal = this.modalCtrl.create(FormChooseProfile, { action: 'changeUser' });

    profileModal.onDidDismiss(data => {
      console.log('Data from getDefaultUser: ', data);
      if (data !== undefined) {
        //console.log('Data from getDefaultUser: ', data);
        if (data.userUpdated) {
          this.ionViewDidLoad();
        }
      }
    });
    profileModal.present();
  }

  getButtonLabel() {
    if (this.curUser !== undefined) {
      return "Not " + this.curUser.title + "?";
    } else {
      return "";
    }
  }

  ionViewWillEnter() {
    var dtNow = moment(new Date());
    var dtExpiration = moment(this.RestService.AuthData.expiration);
    var dtDiff = dtExpiration.diff(dtNow, 'minutes');

      if (dtDiff <= 0) {
        console.log('Need to login again!!! - Credentials expired from Listingtab');
        this.RestService.appRestart();
      } else if (dtDiff < 30) {
        console.log('Calling Refresh Credentials from Listingtab dtDiff: ' + dtDiff + ' dtExp: ' + dtExpiration + ' dtNow: ' + dtNow);
        this.RestService.refreshCredentials();
        if (this.loading !== undefined) {
          this.loading.dismiss();
        }
      } else {
        if (this.loading !== undefined) {
          this.loading.dismiss();
        }
      }
  }

  goToFeed(category: any) {
    console.log("Clicked goToFeed", category);
    if (category.title == 'Order a Meal') {
      this.nav.push(ListOrderPage, { category: category });
    } else if (category.title == 'Achieve') {
      this.nav.push(ListGoalProgressPage, { category: category });
    } else if (category.title == 'Invest in You') {
      this.nav.push(ListExercisePage, { category: category });
    } else if (category.title == 'Sleep') {
      this.nav.push(ListSleepPage, { category: category });
    } else if (category.title == 'Measure') {
      this.nav.push(ListMeasurePage, { category: category });
    } else if (category.title == 'Nutrition') {
      this.nav.push(ListNutritionPage, { category: category });
    } else if (category.title == 'Visit') {
      this.nav.push(ListVisitPage, { category: category });
    } else {
      this.nav.push(FeedPage, { category: category });
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

}
