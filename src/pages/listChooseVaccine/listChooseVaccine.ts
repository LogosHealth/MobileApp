import { Component } from '@angular/core';
import { NavController, AlertController, NavParams, LoadingController, ViewController } from 'ionic-angular';
import { FeedModel } from '../feed/feed.model';
import 'rxjs/Rx';
import { ChooseVaccineModel, ChooseVaccine } from './listChooseVaccine.model';
import { ChooseVaccineService } from './listChooseVaccine.service';
import { RestService } from '../../app/services/restService.service';
import { FormVaccinesPage } from '../../pages/formVaccines/formVaccines';

var moment = require('moment-timezone');

@Component({
  selector: 'listChooseVaccine',
  templateUrl: 'listChooseVaccine.html'
})
export class ListChooseVaccine {
  list2: ChooseVaccineModel = new ChooseVaccineModel();
  feed: FeedModel = new FeedModel();
  formName: string = "listChooseVaccine";
  loading: any;
  resultData: any;
  userTimezone: any;
  type: any;
  noData: boolean = false;
  isSelectRelated: boolean = false;
  aboutProfile: any = null;
  chosenRecord: ChooseVaccine = new ChooseVaccine();
  fromVisit: any;
  saving: boolean = false;
  historical: any = 'N';

  constructor(
    public nav: NavController,
    public alertCtrl: AlertController,
    public list2Service: ChooseVaccineService,
    public navParams: NavParams,
    public RestService:RestService,
    public loadingCtrl: LoadingController,
    public viewCtrl: ViewController,
  ) {
    this.feed.category = navParams.get('category');
    this.aboutProfile = navParams.get('aboutProfile');
    this.fromVisit = navParams.get('fromVisit');
    this.historical = navParams.get('historical');

    if (this.fromVisit !== undefined && this.fromVisit !== null) {
      console.log('listChoose Vaccine - from Visit: ', this.fromVisit);
    }

    if (this.feed.category.title == 'Select Vaccine') {
      this.isSelectRelated = true;
    }

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
    //var dtExpiration = dtNow;  //for testing
    var self = this;

    if (dtNow < dtExpiration) {
      this.presentLoadingDefault();
      this.loadData();
    } else {
      this.presentLoadingDefault();
      this.RestService.refreshCredentials(function(err, results) {
        if (err) {
          console.log('Need to login again!!! - Credentials expired from listChooseVaccine');
          self.loading.dismiss();
          self.RestService.appRestart();
        } else {
          console.log('From listChooseVaccine - Credentials refreshed!');
          self.loadData();
        }
      });
    }
  }

  loadData() {
    var restURL: string;
    restURL="https://ap6oiuyew6.execute-api.us-east-1.amazonaws.com/dev/VaccineSelectByProfile";

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
    var additionalParams;

    if (!this.isSelectRelated) {
      additionalParams = {
        queryParams: {
            profileid: this.RestService.currentProfile
        }
      };
      console.log('listChooseVaccine - Standard View - profileid: ' + this.RestService.currentProfile);
    } else if (this.aboutProfile !== null && this.aboutProfile > 0) {
      additionalParams = {
        queryParams: {
            profileid: this.aboutProfile
        }
      };
      console.log('listChooseVaccine - Select View - about profileid: ' + this.aboutProfile);
    } else if (this.historical !== undefined && this.historical !== null && this.historical == 'Y') {
      additionalParams = {
        queryParams: {
            profileid: this.RestService.currentProfile,
            historical: this.historical
        }
      }
    } else {
      additionalParams = {
        queryParams: {
            profileid: this.RestService.currentProfile
        }
      };
      console.log('listChooseVaccine - Select View - profileid: ' + this.RestService.currentProfile);
    }

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
            self.list2.items = self.RestService.results;
            self.noData = false;
            console.log("Results Data for loadData: ", self.list2.items);
        } else {
          self.noData = true;
          self.list2.items = [];
          console.log('Results from listProcedure.loadData', self.RestService.results);
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

  saveRecord(){
    var dtNow = moment(new Date());
    var dtExpiration = moment(this.RestService.AuthData.expiration);
    var self = this;

    if (dtNow < dtExpiration) {
      this.presentLoadingDefault();
      this.saveRecordDo();
    } else {
      this.presentLoadingDefault();
      this.RestService.refreshCredentials(function(err, results) {
        if (err) {
          console.log('Need to login again!!! - Credentials expired from ' + self.formName + '.saveRecord');
          self.loading.dismiss();
          self.RestService.appRestart();
        } else {
          console.log('From ' + self.formName + '.saveRecord - Credentials refreshed!');
          self.saveRecordDo();
        }
      });
    }
  }

  saveRecordDo(){
    var strMode = null;

    this.saving = true;
    this.chosenRecord.userid = this.RestService.currentProfile;
    if (this.fromVisit !== undefined && this.fromVisit !== null) {
      console.log('listChooseVaccine Save - fromVisit: ', this.fromVisit);
      console.log('listChooseVaccine Save - chosen: ', this.chosenRecord);
      this.chosenRecord.visitid = this.fromVisit.recordid;
      this.chosenRecord.visitdate = this.fromVisit.visitdate;
      if (this.fromVisit.mode !== undefined && this.fromVisit.mode !== null) {
        strMode = this.fromVisit.mode;
      }
      if (this.chosenRecord.profileid == undefined || this.chosenRecord.profileid == null) {
        this.chosenRecord.profileid = this.fromVisit.profileid;
      }
    } else if (this.aboutProfile !== undefined && this.aboutProfile !== null) {
      if (this.chosenRecord.profileid == undefined || this.chosenRecord.profileid == null) {
        this.chosenRecord.profileid = this.aboutProfile;
      }
    } else {
      if (this.chosenRecord.profileid == undefined || this.chosenRecord.profileid == null) {
        this.chosenRecord.profileid = this.RestService.currentProfile;
      }
    }
    var restURL="https://ap6oiuyew6.execute-api.us-east-1.amazonaws.com/dev/VaccineSelectByProfile";
    var config = {
      invokeUrl: restURL,
      accessKey: this.RestService.AuthData.accessKeyId,
      secretKey: this.RestService.AuthData.secretKey,
      sessionToken: this.RestService.AuthData.sessionToken,
      region:'us-east-1'
    };
    var apigClient = this.RestService.AWSRestFactory.newClient(config);
    var params = {
      //pathParameters: this.vaccineSave
    };
    var pathTemplate = '';
    var method = 'POST';
    var additionalParams;

    if (strMode !== undefined && strMode !== null) {
      additionalParams = {
        queryParams: {
          mode: strMode
        }
      };
    } else {
      additionalParams = {
        queryParams: {
        }
      };
    }

    var body = JSON.stringify(this.chosenRecord);
    var self = this;
    console.log('Calling Post', this.chosenRecord);
    apigClient.invokeApi(params, pathTemplate, method, additionalParams, body)
    .then(function(result){
      //self.RestService.results = result.data;
      console.log('Happy Path: ', result.data);
      self.chosenRecord.vaccinescheduleid = result.data;
      self.loading.dismiss();
      self.dismiss(false);
    }).catch( function(result){
      console.log('Error in formVisit.save: ',result);
      self.loading.dismiss();
      alert('There was an error saving this data.  Please try again later');
      self.dismiss(false);
    });
  }

  openRecord(recordId) {
    console.log("Goto Form index: " + recordId);
    if (!this.isSelectRelated) {
      this.nav.push(FormVaccinesPage, { recId: recordId });
    } else {
      this.chosenRecord = this.RestService.results[recordId];
      if (this.historical !== undefined && this.historical !== null && this.historical == 'Y') {
        this.dismiss(false);
      } else {
        this.saveRecord();
      }
    }
  }

  cancelSelectRelated() {
    //fromCancel = true
    this.dismiss(true);
  }

  dismiss(fromCancel) {
    if (fromCancel) {
      this.chosenRecord = null;
    }
    let data = this.chosenRecord;
    this.viewCtrl.dismiss(data);
  }

  formatDateTime(dateString) {
    return moment.utc(dateString).format('MMM DD YYYY');
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
