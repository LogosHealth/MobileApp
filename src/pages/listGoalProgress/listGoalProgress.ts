import { Component } from '@angular/core';
import { NavController, NavParams, LoadingController } from 'ionic-angular';
import { FeedModel } from '../feed/feed.model';
import 'rxjs/Rx';
import { ListGoalsModel } from '../../pages/listGoals/listGoals.model';
import { ListGoalsService } from '../../pages/listGoals/listGoals.service';
import { RestService } from '../../app/services/restService.service';
import { ListGoalProgressDetailPage } from '../../pages/listGoalProgressDetail/listGoalProgressDetail';
import { FormTaskPage } from '../../pages/formTask/formTask';
import { HistoryItemModel } from '../../pages/history/history.model';

var moment = require('moment-timezone');

@Component({
  selector: 'listExercisePage',
  templateUrl: 'listGoalProgress.html'
})
export class ListGoalProgressPage {
  list2: ListGoalsModel = new ListGoalsModel();
  feed: FeedModel = new FeedModel();
  loading: any;
  resultData: any;
  category: HistoryItemModel = new HistoryItemModel();
  noData: boolean = false;

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
      this.presentLoadingDefault();
      if (this.feed.category.title == 'Achieve') {
        this.loadData();
      } else if (this.feed.category.title == 'My Tasks') {
        this.loadTaskData();
      }
    } else {
      this.presentLoadingDefault();
      this.RestService.refreshCredentials(function(err, results) {
        if (err) {
          console.log('Need to login again!!! - Credentials expired from listGoalProgress');
          self.loading.dismiss();
          self.RestService.appRestart();
        } else {
          console.log('From listGoalProgress - Credentials refreshed!');
          if (self.feed.category.title == 'Achieve') {
            self.loadData();
          } else if (self.feed.category.title == 'My Tasks') {
            self.loadTaskData();
          }
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

    //moment() retrieves now in local time
    var localNowDate = moment().format('YYYY-MM-DD')
    var localNowDateTime = moment().format('YYYY-MM-DD HH:mm')
    console.log ('listGoalProgress.loadData Now(in local time) ', moment().format('YYYY-MM-DD HH:mm'));
    console.log ('listGoalProgress.loadData Now(in local time) ', moment().format('YYYY-MM-DD'));
    var pathTemplate = '';
    var method = 'GET';
    var additionalParams = {
        queryParams: {
            profileid: this.RestService.currentProfile,
            localNowDate: localNowDate,
            localNowDateTime: localNowDateTime,
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
        if (self.RestService.results !== undefined && self.RestService.results[0] !== undefined && self.RestService.results[0].recordid !== undefined &&
          self.RestService.results[0].recordid > 0) {
            self.noData = false;
            self.list2.items = self.RestService.results;
            console.log("Results Data for Get Goals: ", self.list2.items);
        } else {
          self.noData = true;
          console.log('Results from listGoalProgress.loadData', self.RestService.results);
            self.list2.items = [];
        }
        self.loading.dismiss();
      });
    }).catch( function(result){
        console.log(result);
        self.noData = true;
        self.list2.items = [];
        self.loading.dismiss();
        alert('There was an error retrieving this data.  Please try again later');
    });
  }

  loadTaskData() {
    var restURL: string;
    restURL="https://ap6oiuyew6.execute-api.us-east-1.amazonaws.com/dev/TasksByProfile";
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
            upcoming: 'Y'
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
        if (self.RestService.results !== undefined && self.RestService.results[0] !== undefined && self.RestService.results[0].recordid !== undefined &&
          self.RestService.results[0].recordid > 0) {
            self.noData = false;
            self.list2.items = self.RestService.results;
            console.log("Results Data for Get Goals: ", self.list2.items);
        } else {
            console.log('Results from listGoalProgress.loadData', self.RestService.results);
            self.noData = true;
            self.list2.items = [];
          }
        self.loading.dismiss();
      });
    }).catch( function(result){
        console.log(result);
        self.noData = true;
        self.list2.items = [];
        self.loading.dismiss();
        alert('There was an error retrieving this data.  Please try again later');
    });
  }

  openRecord(recordId) {
    console.log("Goto Form index: " + recordId);
    if (this.feed.category.title == 'Achieve') {
      this.category.title = this.RestService.results[recordId].goalname;
      this.nav.push(ListGoalProgressDetailPage, { recId: recordId, category: this.category });
    } else if (this.feed.category.title == 'My Tasks') {
      this.nav.push(FormTaskPage, { recId: recordId, category: this.category, upcoming: true });
    }
  }

  addNew() {
    this.nav.push(FormTaskPage, { category: this.category, upcoming: true });
  }

  flipSearch() {
    if (this.feed.category.title == 'Achieve') {
      this.feed.category.title = 'My Tasks';
      this.list2.items = [];
      this.presentLoadingDefault();
      this.loadTaskData();
    } else if (this.feed.category.title == 'My Tasks') {
      this.feed.category.title = 'Achieve';
      this.list2.items = [];
      this.presentLoadingDefault();
      this.loadData();
    }
  }

  formatDateTime(dateString) {
    return moment.utc(dateString).format('MMM DD YYYY hh:mm A');
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
