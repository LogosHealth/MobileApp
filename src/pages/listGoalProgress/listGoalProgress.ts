import { Component } from '@angular/core';
import { NavController, NavParams, LoadingController } from 'ionic-angular';
import { FeedModel } from '../feed/feed.model';
import 'rxjs/Rx';
import { ListGoalsModel } from '../../pages/listGoals/listGoals.model';
import { ListGoalsService } from '../../pages/listGoals/listGoals.service';
import { RestService } from '../../app/services/restService.service';
import { ListGoalProgressDetailPage } from '../../pages/listGoalProgressDetail/listGoalProgressDetail';
import { HistoryItemModel } from '../../pages/history/history.model';

var moment = require('moment-timezone');

@Component({
  selector: 'listGoalsPage',
  templateUrl: 'listGoalProgress.html'
})
export class ListGoalProgressPage {
  list2: ListGoalsModel = new ListGoalsModel();
  feed: FeedModel = new FeedModel();
  loading: any;
  resultData: any;
  category: HistoryItemModel = new HistoryItemModel();

  constructor(
    public nav: NavController,
    public list2Service: ListGoalsService,
    public navParams: NavParams,
    public RestService:RestService,
    public loadingCtrl: LoadingController
  ) {
    this.feed.category = navParams.get('category');
  }

  ionViewWillEnter() {
    var dtNow = moment(new Date());
    var dtExpiration = moment(this.RestService.AuthData.expiration);
    var self = this;

    if (dtNow < dtExpiration) {
      this.loading = this.loadingCtrl.create();
      this.loading.present();
      this.loadData();
    } else {
      this.loading = this.loadingCtrl.create();
      this.loading.present();
      this.RestService.refreshCredentials(function(err, results) {
        if (err) {
          console.log('Need to login again!!! - Credentials expired from listGoalProgress');
          self.loading.dismiss();
          self.RestService.appRestart();
        } else {
          console.log('From listGoalProgress - Credentials refreshed!');
          self.loadData();
        }
      });
    }
  }

  loadData() {
    var restURL: string;
    restURL="https://ap6oiuyew6.execute-api.us-east-1.amazonaws.com/dev/GoalsByProfile";
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
            profileid: this.RestService.currentProfile,
            getStats: 'Y'
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
        self.list2.items = self.RestService.results;
        console.log("Results Data for Get Goals: ", self.list2.items);
        self.loading.dismiss();
      });
    }).catch( function(result){
        console.log(body);
        self.loading.dismiss();
    });
  }

  openRecord(recordId) {
    console.log("Goto Form index: " + recordId);
    this.category.title = this.RestService.results[recordId].goalname;
    //console.log("Recordid from index: " + this.list2[recordId].recordid);
    this.nav.push(ListGoalProgressDetailPage, { recId: recordId, category: this.category });
    //alert('Open Record:' + recordId);
  }
}
