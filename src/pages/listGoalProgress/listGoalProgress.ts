import { Component, Self } from '@angular/core';
import { NavController, NavParams, LoadingController } from 'ionic-angular';
import { FeedModel } from '../feed/feed.model';

import 'rxjs/Rx';

import { ListGoalsModel, ListGoals } from '../../pages/listGoals/listGoals.model';
import { ListGoalsService } from '../../pages/listGoals/listGoals.service';
import { RestService } from '../../app/services/restService.service';
import { ListGoalProgressDetailPage } from '../../pages/listGoalProgressDetail/listGoalProgressDetail';
import { HistoryItemModel } from '../../pages/history/history.model';

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
    this.loading = this.loadingCtrl.create();
    this.feed.category = navParams.get('category');
  }

  ionViewWillEnter() {
    this.loading.present();
    this.loadData();

  }

  ionViewDidLoad() {
    this.loading.present();
    this.loadData();
    /*
    this.list2Service
      .getData()
      .then(data => {
        this.list2.items = this.RestService.results;
        alert('Allergy Response: ' + this.RestService.results);   
        alert('Transfer to List Items: ' +  this.list2.items);   
       
        this.loading.dismiss();
      });
      */
  }

  loadData() {
    //alert('Feed Category: ' + this.feed.category.title);
    //alert('Current Profile ID: ' + this.RestService.currentProfile);
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
        //alert('Allergy Response: ' + this.RestService.results);   
        //alert('Transfer to List Items: ' +  this.list2.items);   
       console.log("Results Data for Get Goals: ", self.list2.items);
        self.loading.dismiss();
      });
      
      //alert('Async Check from Invoke: ' + self.RestService.results);   
      
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
