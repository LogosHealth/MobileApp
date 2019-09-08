import { Component } from '@angular/core';
import { NavController, NavParams, LoadingController, ModalController } from 'ionic-angular';
import { FeedModel } from '../feed/feed.model';
import 'rxjs/Rx';
import { ListVaccinesModel, ListVaccines } from './listVaccines.model';
import { ListVaccinesService } from './listVaccines.service';
import { RestService } from '../../app/services/restService.service';
import { FormVaccinesPage } from '../../pages/formVaccines/formVaccines';
import { ListContactModel } from '../../pages/listContacts/listContacts.model';
import { ListContactService } from '../../pages/listContacts/listContacts.service';
import { ListChooseVaccine } from '../listChooseVaccine/listChooseVaccine';

var moment = require('moment-timezone');

@Component({
  selector: 'listExercisePage',
  templateUrl: 'listVaccines.html'
})
export class ListVaccinesPage {
  list2: ListVaccinesModel = new ListVaccinesModel();
  feed: FeedModel = new FeedModel();
  loading: any;
  resultData: any;
  listContacts: ListContactModel = new ListContactModel();
  noData: boolean = false;
  isSelectRelated: boolean = false;
  formName: string = "listVaccines";
  objSelection: any;
  formSave: ListVaccines = new ListVaccines();

  constructor(
    public nav: NavController,
    public list2Service: ListVaccinesService,
    public listContactService: ListContactService,
    public navParams: NavParams,
    public RestService:RestService,
    public loadingCtrl: LoadingController,
    public modalCtrl: ModalController
  ) {
    this.feed.category = navParams.get('category');
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
          console.log('Need to login again!!! - Credentials expired from listVaccines');
          self.loading.dismiss();
          self.RestService.appRestart();
        } else {
          console.log('From listVaccines - Credentials refreshed!');
          self.loadData();
        }
      });
    }
  }

  loadData() {
    var restURL: string;
    restURL="https://ap6oiuyew6.execute-api.us-east-1.amazonaws.com/dev/VaccinesByProfile";
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
        if (self.RestService.results !== undefined && self.RestService.results[0] !== undefined && self.RestService.results[0].recordid !== undefined &&
          self.RestService.results[0].recordid > 0) {
            self.list2.items = self.RestService.results;
            self.noData = false;
            console.log("Results Data for Get Vaccines: ", self.list2.items);
            self.loadContacts();
        } else {
          console.log('Results from listVaccines.loadData', self.RestService.results);
          self.noData = true;
          self.loadContacts();
        }
      });
    }).catch( function(result){
      console.log(result);
      self.noData = true;
      self.loading.dismiss();
      alert('There was an error retrieving this data.  Please try again later');
    });
  }

  loadContacts() {
    var restURL: string;
    restURL="https://ap6oiuyew6.execute-api.us-east-1.amazonaws.com/dev/ContactByProfile";
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
            contacttype: "doctor"
        }
    };
    var body = '';
    var self = this;
    var contacts = [];

    apigClient.invokeApi(params, pathTemplate, method, additionalParams, body)
    .then(function(result){
      contacts = result.data;
      self.listContactService
      .getData()
      .then(data => {
        self.listContacts.items = contacts;
        self.loading.dismiss();
      });
    }).catch( function(result){
      console.log(result);
      self.loading.dismiss();
      alert('There was an error retrieving this data.  Please try again later');
    });
  }

  getName(contactid) {
    if(this.listContacts.items !== undefined) {
      for (var j = 0; j < this.listContacts.items.length; j++) {
        if (this.listContacts.items[j].recordid == contactid) {
          return this.listContacts.items[j].title;
        }
      }
    } else {
      return null;
    }
  }

  openRecord(recordId) {
    this.nav.push(FormVaccinesPage, { recId: recordId });
  }

  formatDateTime(dateString) {
    return moment.utc(dateString).format('MMM DD YYYY');
  }

  addNew() {
    var self = this;
    var cat = {title: 'Select Vaccine'};
    let profileModal = this.modalCtrl.create(ListChooseVaccine, { category: cat, historical: 'Y' });
    profileModal.onDidDismiss(data => {
      if (data !==undefined && data !== null) {
        self.objSelection = data;
        console.log('Data from listVaccine.addNew: ', self.objSelection);
        console.log('Cur Profile ID: ', self.RestService.currentProfile);

        self.navSaveRecord(function(err, results) {
          if (err) {
            console.log('ListVaccine.addNew - err: ', err);
            alert('Error in Saving Vaccine.  Please try again later');
          } else {
            console.log('ListVaccine.addNew - results: ', results);
            //self.formSave.recordid = results;
            self.nav.push(FormVaccinesPage, { loadFromId: results });
          }
        });
      }
    });
    profileModal.present();
  }

  navSaveRecord(callback){
    var dtNow = moment(new Date());
    var dtExpiration = moment(this.RestService.AuthData.expiration);
    var self = this;

    if (dtNow < dtExpiration) {
      this.presentLoadingDefault();
      this.navSaveRecordDo(function (err, results) {
        if (err) {
          callback(err, null);
        } else {
          callback(null, results);
        }
      });
    } else {
      this.presentLoadingDefault();
      this.RestService.refreshCredentials(function(err, results) {
        if (err) {
          console.log('Need to login again!!! - Credentials expired from ' + self.formName + '.saveRecord');
          self.loading.dismiss();
          self.RestService.appRestart();
        } else {
          console.log('From ' + self.formName + '.saveRecord - Credentials refreshed!');
          self.navSaveRecordDo(function (err, results) {
            if (err) {
              callback(err, null);
            } else {
              callback(null, results);
            }
          });
        }
      });
    }
  }

  navSaveRecordDo(callback){
    this.formSave.vaccineinfoid = this.objSelection.recordid;
    this.formSave.name = this.objSelection.vaccinename;
    this.formSave.profileid = this.RestService.currentProfile;
    this.formSave.userid = this.RestService.userId;
    this.formSave.active = 'Y';

    var restURL="https://ap6oiuyew6.execute-api.us-east-1.amazonaws.com/dev/VaccinesByProfile";
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
      var additionalParams = {
          queryParams: {
              profileid: this.RestService.currentProfile
          }
      };
      var body = JSON.stringify(this.formSave);
      var self = this;
      console.log('Calling Post', this.formSave);
      apigClient.invokeApi(params, pathTemplate, method, additionalParams, body)
      .then(function(result){
        console.log('Happy Path: ', result);
        self.loading.dismiss();
        callback(null, result.data);
      }).catch( function(result){
        console.log('Error from listVaccines.save: ',result);
        self.loading.dismiss();
        alert('There was an error saving this data.  Please try again later');
        callback(result, null);
      });
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
