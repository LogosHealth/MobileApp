import { Component } from '@angular/core';
import { NavController, NavParams, LoadingController } from 'ionic-angular';
import { FeedModel } from '../feed/feed.model';
import 'rxjs/Rx';
import { ListNutritionModel } from './listNutrition.model';
import { ListNutritionService } from './listNutrition.service';
import { RestService } from '../../app/services/restService.service';
import { FormNutritionPage } from '../../pages/formNutrition/formNutrition';

var moment = require('moment-timezone');

@Component({
  selector: 'listExercisePage',
  templateUrl: 'listNutrition.html'
})
export class ListNutritionPage {
  list2: ListNutritionModel = new ListNutritionModel();
  feed: FeedModel = new FeedModel();
  loading: any;
  resultData: any;
  userTimezone: any;

  constructor(
    public nav: NavController,
    public list2Service: ListNutritionService,
    public navParams: NavParams,
    public RestService:RestService,
    public loadingCtrl: LoadingController
  ) {
    this.feed.category = navParams.get('category');
    var self = this;
    this.RestService.curProfileObj(function (error, results) {
      if (!error) {
        self.userTimezone = results.timezone;
      }
    });
  }

  ionViewWillEnter() {
    var dtNow = moment(new Date());
    var dtExpiration = moment(this.RestService.AuthData.expiration);
    var self = this;

    if (dtNow < dtExpiration) {
      this.presentLoadingDefault();
      this.loadData();
    } else {
      this.presentLoadingDefault();
      this.RestService.refreshCredentials(function(err, results) {
        if (err) {
          console.log('Need to login again!!! - Credentials expired from listNutrition');
          self.loading.dismiss();
          self.RestService.appRestart();
        } else {
          console.log('From listNutrition - Credentials refreshed!');
          self.loadData();
        }
      });
    }
  }

  loadData() {
    var restURL: string;
    restURL="https://ap6oiuyew6.execute-api.us-east-1.amazonaws.com/dev/NutritionByProfile";
    var config = {
      invokeUrl: restURL,
      accessKey: this.RestService.AuthData.accessKeyId,
      secretKey: this.RestService.AuthData.secretKey,
      sessionToken: this.RestService.AuthData.sessionToken,
      region:'us-east-1'
    };
    var apigClient = this.RestService.AWSRestFactory.newClient(config);
    var params = {
      //email: accountInfo.getEmail()
    };
    var pathTemplate = '';
    var method = 'GET';
    var additionalParams = {
        queryParams: {
            profileid: this.RestService.currentProfile
        }
    };
    var body = '';
    var self = this;

    apigClient.invokeApi(params, pathTemplate, method, additionalParams, body)
    .then(function(result){
      self.RestService.results = result.data;
      self.list2Service
      .getData()
      .then(data => {
        console.log('Meals: ', self.RestService.results);
        if (self.RestService.results !== undefined && self.RestService.results[0] !== undefined && self.RestService.results[0].meals !== undefined &&
          self.RestService.results[0].meals[0] !== undefined && self.RestService.results[0].meals[0].recordid !== undefined &&
          self.RestService.results[0].meals[0].recordid > 0) {
            self.list2.items = self.RestService.results;
            console.log("Results Data for Get Nutrition: ", self.list2.items);
        } else {
          console.log('Results from listNutrition.loadData', self.RestService.results);
        }
        self.loading.dismiss();
      });
    }).catch( function(result){
        console.log(result);
        self.loading.dismiss();
        alert('There was an error retrieving this data.  Please try again later');
    });
  }

  openRecord(recordId) {
    console.log("Goto Form index: " + recordId);
    this.nav.push(FormNutritionPage, { recId: recordId });
  }

  addNew() {
    this.nav.push(FormNutritionPage);
  }

  formatDateTime(dateString) {
    if (this.userTimezone !== undefined && this.userTimezone !== null && this.userTimezone !=="") {
      return moment(dateString).tz(this.userTimezone).format('dddd, MMMM DD');
    } else {
      return moment(dateString).format('dddd, MMMM DD');
    }
  }
/*
  formatDateTimeTitle(dateString) {
    if (this.userTimezone !== undefined && this.userTimezone !== null && this.userTimezone !=="") {
      return moment(dateString).tz(this.userTimezone).format('dddd, MMMM DD');
    } else {
      return moment(dateString).format('dddd, MMMM DD');
    }
  }
*/
  formatTime(timeString) {
    var timeSplit = timeString.split(":");
    var hour = timeSplit[0];
    var minute = timeSplit[1];

    if (Number(hour) > 11) {
      if (Number(hour) == 12 ) {
        return hour + ":" + minute + " PM";
      } else {
        return (Number(hour) - 12) + ":" + minute + " PM";
      }
    } else {
      if (Number(hour) == 0) {
        return "12:" + minute + " AM";
      } else {
        return hour + ":" + minute + " AM";
      }
    }
  }

  caloriesTotal(index) {
    var totalCalories = 0;
    //console.log ('index : ', index);
    //console.log ('List2 single index : ', this.list2.items[index]);
    //alert('Index record count: ' + this.list2.items[index].meals.length);
    for (var j = 0; j < this.list2.items[index].meals.length; j++) {
      if (this.list2.items[index].meals[j].calories !== undefined && this.list2.items[index].meals[j].calories !== null && this.list2.items[index].meals[j].calories !== "") {
        totalCalories = totalCalories + Number(this.list2.items[index].meals[j].calories);
      }
    }
    return totalCalories;
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
