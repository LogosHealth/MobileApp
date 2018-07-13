import { Component, Self } from '@angular/core';
import { NavController, NavParams, LoadingController } from 'ionic-angular';
import { FeedModel } from '../feed/feed.model';

import 'rxjs/Rx';

import { ListGoalsModel, ListGoalWeeks } from '../../pages/listGoals/listGoals.model';
import { ListGoalsService } from '../../pages/listGoals/listGoals.service';
import { RestService } from '../../app/services/restService.service';
import { FormGoalsPage } from '../../pages/formGoals/formGoals';
import { FormExercisePage } from '../../pages/formExercise/formExercise';

var moment = require('moment');

@Component({
  selector: 'listGoalsPage',
  templateUrl: 'listGoalProgressDetail.html'
})
export class ListGoalProgressDetailPage {
  list1: ListGoalsModel = new ListGoalsModel();
  list2: Array<ListGoalWeeks>;

  feed: FeedModel = new FeedModel();
  loading: any;
  resultData: any;
  recId: number;
  curRec: any;

  constructor(
    public nav: NavController,
    public list2Service: ListGoalsService,
    public navParams: NavParams,
    public RestService:RestService,
    public loadingCtrl: LoadingController
  ) {
    this.recId = navParams.get('recId');
    this.loading = this.loadingCtrl.create();
    this.feed.category = navParams.get('category');
    this.curRec = RestService.results[this.recId]; 
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
    this.list2 = this.curRec.weeks;
    this.loading.dismiss();
  }

  openRecord(recordId) {
    console.log("Goto Form index: " + recordId);
    //console.log("Recordid from index: " + this.list2[recordId].recordid);
    this.nav.push(FormGoalsPage, { recId: recordId });
    //alert('Open Record:' + recordId);
  }  
  shortDate(dateString) {
    return moment(dateString).format("MMMM DD");
  }

  shortEndDate(dateStartString, dateEndString) {
    if (moment(dateStartString).format("MMMM") !== moment(dateEndString).format("MMMM")) {
      return moment(dateEndString).format("MMMM DD");
    } else {
      return moment(dateEndString).format("DD");
    }
  }

  addToday(item) {
    
    if (this.curRec.goaltype =='exercise') {
      this.nav.push(FormExercisePage, { goalname: this.curRec.goalname });
    } else {
      alert('Goal type: ' + this.curRec.goaltype);    
    }
  }

  notCurrent(index) {
    if (index > 0) {
      return true;
    } else {
      return false;
    }
  }
}
