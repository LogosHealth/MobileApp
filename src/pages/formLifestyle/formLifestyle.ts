import { Component } from '@angular/core';
import { NavController, NavParams, AlertController, LoadingController, PopoverController } from 'ionic-angular';
import { Validators, FormGroup, FormControl, FormArray, FormBuilder } from '@angular/forms';
import { RestService } from '../../app/services/restService.service';
import { Lifestyle, LifestyleItem, Occupation, StressLevel, TravelModel, OccupationModel } from '../../pages/formLifestyle/formLifestyle.model';
import { LifestyleService } from '../../pages/formLifestyle/formLifestyle.service';
import { ListOccupationPage } from '../../pages/listOccupation/listOccupation';
import { FormOccupationPage } from '../../pages/formOccupation/formOccupation';
import { ListStresslevelPage } from '../../pages/listStresslevel/listStresslevel';
import { FormStresslevelPage } from '../../pages/formStresslevel/formStresslevel';
import { ListTravelPage } from '../../pages/listTravel/listTravel';
import { FormTravelPage } from '../../pages/formTravel/formTravel';
import { MenuLifestyle } from '../../pages/menuLifestyle/menuLifestyle';
import { ListLifestyleItem } from '../../pages/listLifestyleItem/listLifestyleItem';
import { FormLifestyleItem } from '../../pages/formLifestyleItem/formLifestyleItem';


import { HistoryItemModel } from '../../pages/history/history.model';

var moment = require('moment-timezone');

@Component({
  selector: 'formVisit1-page',
  templateUrl: 'formLifestyle.html'
})
export class FormLifestyle {
  list2: Lifestyle = new Lifestyle();
  recId: number;
  formName: string = "formLifestyle";
  card_form: FormGroup;
  loading: any;
  saving: boolean = false;
  category: HistoryItemModel = new HistoryItemModel();
  curRec: Lifestyle = new Lifestyle();
  saveModel: Lifestyle = new Lifestyle();

  occupations: FormArray;
  stresslevel: FormArray;
  alcohol: FormArray;
  nicotine: FormArray;
  marijuana: FormArray;
  otherdrug: FormArray;
  travels: FormArray;

  newUser: Boolean = false;

  constructor(public nav: NavController,
    public alertCtrl: AlertController,
    public RestService:RestService,
    public LifestyleService: LifestyleService,
    public navParams: NavParams,
    public loadingCtrl: LoadingController,
    public popoverCtrl:PopoverController,
    public formBuilder: FormBuilder) {

    this.card_form = new FormGroup({
      recordid: new FormControl(),
      profileid: new FormControl(),
      occupations: this.formBuilder.array([ this.createOccupation() ]),
      stresslevel: this.formBuilder.array([ this.createStresslevel() ]),
      alcohol: this.formBuilder.array([ this.createLifestyleItem() ]),
      nicotine: this.formBuilder.array([ this.createLifestyleItem() ]),
      marijuana: this.formBuilder.array([ this.createLifestyleItem() ]),
      otherdrug: this.formBuilder.array([ this.createLifestyleItem() ]),
      hobbies: new FormControl(),
      travels: this.formBuilder.array([ this.createTravel() ]),
      active: new FormControl(),
    });
  }

  ionViewDidLoad() {
    var dtNow = moment(new Date());
    var dtExpiration = moment(this.RestService.AuthData.expiration);
    var self = this;

    if (this.RestService.refreshParent) {
      console.log('Turn off refresh Parent from FormLifestyle.ionViewDidLoad to prohibit double loading');
      this.RestService.refreshParent = false;
    }

    if (dtNow < dtExpiration) {
      this.presentLoadingDefault();
      this.loadData();
    } else {
      this.presentLoadingDefault();
      this.RestService.refreshCredentials(function(err, results) {
        if (err) {
          console.log('Need to login again!!! - Credentials expired from listSleep');
          self.loading.dismiss();
          self.RestService.appRestart();
        } else {
          console.log('From listSleep - Credentials refreshed!');
          self.loadData();
        }
      });
    }
  }

  ionViewWillEnter() {
    var dtNow = moment(new Date());
    var dtExpiration = moment(this.RestService.AuthData.expiration);
    var self = this;

    console.log('Enter FormLifestyle.ionViewWillEnter');
    if (this.RestService.refreshParent) {
      this.RestService.refreshParent = false;
      if (dtNow < dtExpiration) {
        this.presentLoadingDefault();
        this.loadData();
      } else {
        this.presentLoadingDefault();
        this.RestService.refreshCredentials(function(err, results) {
          if (err) {
            console.log('Need to login again!!! - Credentials expired from listSleep');
            self.loading.dismiss();
            self.RestService.appRestart();
          } else {
            console.log('From listSleep - Credentials refreshed!');
            self.loadData();
          }
        });
      }
    }
  }

  loadData() {
    var liItems = ['Alcohol', 'Nicotine', 'Rec Marijuana', 'Other Rec Drug'];
    var intCount = 4;
    var intActual = 0;

    var self = this;
    this.loadLifestyle(function(err, results) {
      if (err) {
        console.log('Error in load Data - Lifestyle: ', err);
        self.loading.dismiss();
      } else {
        self.loadOccupation(function(err, results) {
          if (err) {
            console.log('Error in load Data - Occupation: ', err);
            self.loading.dismiss();
          } else {
            self.addExistingOccupations();
            console.log('Success in formLifestyle - loadOccupations');
            self.loadTravel(function(err, results) {
              if (err) {
                console.log('Error in load Data - Travel: ', err);
                self.loading.dismiss();
              } else {
                self.addExistingTravels();
                console.log('Success in formLifestyle - loadTravels');
                self.loadStresslevel(function(err, results) {
                  if (err) {
                    console.log('Error in load Data - Stress level: ', err);
                    self.loading.dismiss();
                  } else {
                    self.addExistingStresslevels();
                    console.log('Success in formLifestyle - loadStresslevels');
                    for (var j = 0; j < liItems.length; j++) {
                      self.loadLifestyleItem(liItems[j], function(err, results) {
                        if (err) {
                          console.log('Error in LifestyleItem - Stress level: ', err);
                          intActual = intActual + 1;
                        } else {
                          intActual = intActual + 1;
                        }
                        if (intActual == intCount) {
                          console.log('Success in loading Lifestyle item');
                          self.addExistingLifestyleItems();
                          self.loading.dismiss();
                        } else {
                          if (intCount > 4) {
                            console.log('Break from Lifestyle item');
                            self.addExistingLifestyleItems();
                            self.loading.dismiss();
                          }
                        }
                      });
                    }
                  }
                });
              }
            });

          }
        });
      }
    });
  }

  loadLifestyle(callback){
    var dtNow = moment(new Date());
    var dtExpiration = moment(this.RestService.AuthData.expiration);
    var self = this;

    if (dtNow < dtExpiration) {
      this.loadLifestyleDo(function(err, result) {
        if (err) {
          callback(err, null);
        } else {
          callback(null, 'Success');
        }
      });
    } else {
      this.RestService.refreshCredentials(function(err, results) {
        if (err) {
          console.log('Need to login again!!! - Credentials expired from formAboutMe.deleteRecord');
          self.loading.dismiss();
          self.RestService.appRestart();
        } else {
          console.log('From formLifestyle.loadLifestyle - Credentials refreshed!');
          self.loadLifestyleDo(function(err, result) {
            if (err) {
              callback(err, null);
            } else {
              callback(null, 'Success');
            }
          });
        }
      });
    }
  }

  loadLifestyleDo(callback) {
    var restURL: string;
    if (this.RestService.currentProfile == undefined || this.RestService.currentProfile <= 0) {
      this.loading.dismiss();
      callback('No Profile', null);
    } else {
      console.log('currentProfile: ' + this.RestService.currentProfile);
    }
    restURL="https://ap6oiuyew6.execute-api.us-east-1.amazonaws.com/dev/LifestyleByProfile";
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
      console.log('getLifestyle: ', result.data);
      self.curRec.recordid = result.data[0].recordid;
      self.curRec.hobbies = result.data[0].hobbies;
      self.curRec.active = result.data[0].active;
      self.curRec.profileid = result.data[0].profileid;
      self.card_form.get('hobbies').setValue(self.curRec.hobbies);
      callback (null, 'Successs');
    }).catch( function(result){
        console.log('Error in loadLifestyle: ', result);
      });
  }

  loadOccupation(callback){
    var dtNow = moment(new Date());
    var dtExpiration = moment(this.RestService.AuthData.expiration);
    var self = this;

    if (dtNow < dtExpiration) {
      this.loadOccupationDo(function(err, result) {
        if (err) {
          callback(err, null);
        } else {
          callback(null, 'Success');
        }
      });
    } else {
      this.RestService.refreshCredentials(function(err, results) {
        if (err) {
          console.log('Need to login again!!! - Credentials expired from formAboutMe.deleteRecord');
          self.loading.dismiss();
          self.RestService.appRestart();
        } else {
          console.log('From formLifestyle.loadLifestyle - Credentials refreshed!');
          self.loadOccupationDo(function(err, result) {
            if (err) {
              callback(err, null);
            } else {
              callback(null, 'Success');
            }
          });
        }
      });
    }
  }

  loadOccupationDo(callback) {
    var restURL: string;
    if (this.RestService.currentProfile == undefined || this.RestService.currentProfile <= 0) {
      this.loading.dismiss();
      callback('No Profile', null);
    } else {
      console.log('currentProfile: ' + this.RestService.currentProfile);
    }
    restURL="https://ap6oiuyew6.execute-api.us-east-1.amazonaws.com/dev/OccupationByProfile";
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
            latest: 'Y'
        }
    };
    var body = '';
    var self = this;
    apigClient.invokeApi(params, pathTemplate, method, additionalParams, body)
    .then(function(result){
      console.log('getOccupation: ', result.data);
      console.log('getOccupation curRec: ', self.curRec);
      self.curRec.occupations = new OccupationModel();
      self.curRec.occupations.items = [];
      for (var j = 0; j < result.data.length; j++) {
        self.curRec.occupations.items.push(result.data[j]);
      }
      console.log('Cur Rec after loadOccupation: ', self.curRec);
      callback (null, 'Successs');
    }).catch( function(result){
      console.log('Error in loadOccupation: ', result);
      callback (null, 'Successs');
    });
  }

  loadTravel(callback){
    var dtNow = moment(new Date());
    var dtExpiration = moment(this.RestService.AuthData.expiration);
    var self = this;

    if (dtNow < dtExpiration) {
      this.loadTravelDo(function(err, result) {
        if (err) {
          callback(err, null);
        } else {
          callback(null, 'Success');
        }
      });
    } else {
      this.RestService.refreshCredentials(function(err, results) {
        if (err) {
          console.log('Need to login again!!! - Credentials expired from formAboutMe.loadTravel');
          self.loading.dismiss();
          self.RestService.appRestart();
        } else {
          console.log('From formLifestyle.loadTravel - Credentials refreshed!');
          self.loadTravelDo(function(err, result) {
            if (err) {
              callback(err, null);
            } else {
              callback(null, 'Success');
            }
          });
        }
      });
    }
  }

  loadTravelDo(callback) {
    var restURL: string;
    if (this.RestService.currentProfile == undefined || this.RestService.currentProfile <= 0) {
      this.loading.dismiss();
      callback('No Profile', null);
    } else {
      console.log('currentProfile: ' + this.RestService.currentProfile);
    }
    restURL="https://ap6oiuyew6.execute-api.us-east-1.amazonaws.com/dev/TravelByProfile";
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
            latest: 'Y'
        }
    };
    var body = '';
    var self = this;
    apigClient.invokeApi(params, pathTemplate, method, additionalParams, body)
    .then(function(result){
      console.log('getTravel: ', result.data);
      console.log('getTravel curRec: ', self.curRec);
      self.curRec.travels = new TravelModel();
      self.curRec.travels.items = [];
      for (var j = 0; j < result.data.length; j++) {
        if (result.data[j].recordid !== undefined) {
          self.curRec.travels.items.push(result.data[j]);
        }
      }
      console.log('Cur Rec after loadTravel: ', self.curRec);
      callback (null, 'Successs');
    }).catch( function(result){
      console.log('Error in loadTravel: ', result);
      callback (null, 'Successs');
    });
  }

  loadStresslevel(callback){
    var dtNow = moment(new Date());
    var dtExpiration = moment(this.RestService.AuthData.expiration);
    var self = this;

    if (dtNow < dtExpiration) {
      this.loadStresslevelDo(function(err, result) {
        if (err) {
          callback(err, null);
        } else {
          callback(null, 'Success');
        }
      });
    } else {
      this.RestService.refreshCredentials(function(err, results) {
        if (err) {
          console.log('Need to login again!!! - Credentials expired from formLifestyle.loadStresslevel');
          self.loading.dismiss();
          self.RestService.appRestart();
        } else {
          console.log('From formLifestyle.loadStresslevel - Credentials refreshed!');
          self.loadTravelDo(function(err, result) {
            if (err) {
              callback(err, null);
            } else {
              callback(null, 'Success');
            }
          });
        }
      });
    }
  }

  loadStresslevelDo(callback) {
    var restURL: string;
    if (this.RestService.currentProfile == undefined || this.RestService.currentProfile <= 0) {
      this.loading.dismiss();
      callback('No Profile', null);
    } else {
      console.log('currentProfile: ' + this.RestService.currentProfile);
    }
    restURL="https://ap6oiuyew6.execute-api.us-east-1.amazonaws.com/dev/StresslevelByProfile";
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
            latest: 'Y'
        }
    };
    var body = '';
    var self = this;
    apigClient.invokeApi(params, pathTemplate, method, additionalParams, body)
    .then(function(result){
      console.log('getStresslevel: ', result.data);
      console.log('getStresslevel curRec: ', self.curRec);
      if (result.data[0].recordid !== undefined) {
        self.curRec.stresslevel = new StressLevel;
        self.curRec.stresslevel.recordid = result.data[0].recordid;
        self.curRec.stresslevel.level = result.data[0].level;
        self.curRec.stresslevel.factors = result.data[0].factors;
        self.curRec.stresslevel.howmanage = result.data[0].howmanage;
        self.curRec.stresslevel.dateofmeasure = result.data[0].dateofmeasure;
        self.curRec.stresslevel.active = result.data[0].active;
        callback (null, 'Successs');
      } else {
        console.log('loadStresslevel - Data not found: ', result.data)
        callback (null, 'Successs');
      }
    }).catch( function(result){
      console.log('Error in loadStresslevel: ', result);
      callback (null, 'Successs');
    });
  }

  loadLifestyleItem(strType, callback){
    var dtNow = moment(new Date());
    var dtExpiration = moment(this.RestService.AuthData.expiration);
    var self = this;

    if (dtNow < dtExpiration) {
      this.loadLifestyleItemDo(strType, function(err, result) {
        if (err) {
          callback(err, null);
        } else {
          callback(null, 'Success');
        }
      });
    } else {
      this.RestService.refreshCredentials(function(err, results) {
        if (err) {
          console.log('Need to login again!!! - Credentials expired from formLifestyle.loadLifestyleItem');
          self.loading.dismiss();
          self.RestService.appRestart();
        } else {
          console.log('From formLifestyle.loadLifestyleItem - Credentials refreshed!');
          self.loadTravelDo(function(err, result) {
            if (err) {
              callback(err, null);
            } else {
              callback(null, 'Success');
            }
          });
        }
      });
    }
  }

  loadLifestyleItemDo(strType, callback) {
    var restURL: string;
    if (this.RestService.currentProfile == undefined || this.RestService.currentProfile <= 0) {
      this.loading.dismiss();
      callback('No Profile', null);
    } else {
      console.log('currentProfile: ' + this.RestService.currentProfile);
    }
    restURL="https://ap6oiuyew6.execute-api.us-east-1.amazonaws.com/dev/LifestyleItemByProfile";
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
            latest: 'Y',
            type: strType
        }
    };
    var body = '';
    var self = this;
    apigClient.invokeApi(params, pathTemplate, method, additionalParams, body)
    .then(function(result){
      console.log('getLifestyleItem: ', result.data);
      console.log('LifestyleItem curRec: ', self.curRec);
      if (result.data[0].recordid !== undefined) {
        if (strType == 'Alcohol') {
          self.curRec.alcohol = new LifestyleItem();
          self.curRec.alcohol.recordid = result.data[0].recordid;
          self.curRec.alcohol.type = result.data[0].type;
          self.curRec.alcohol.subtype = result.data[0].subtype;
          self.curRec.alcohol.does = result.data[0].does;
          self.curRec.alcohol.startdate = result.data[0].startdate;
          self.curRec.alcohol.enddate = result.data[0].enddate;
          self.curRec.alcohol.daysperweek = result.data[0].daysperweek;
          self.curRec.alcohol.itemsperday = result.data[0].itemsperday;
          self.curRec.alcohol.comments = result.data[0].comments;
        } else if (strType == 'Nicotine') {
          self.curRec.nicotine = new LifestyleItem();
          self.curRec.nicotine.recordid = result.data[0].recordid;
          self.curRec.nicotine.type = result.data[0].type;
          self.curRec.nicotine.subtype = result.data[0].subtype;
          self.curRec.nicotine.does = result.data[0].does;
          self.curRec.nicotine.startdate = result.data[0].startdate;
          self.curRec.nicotine.enddate = result.data[0].enddate;
          self.curRec.nicotine.daysperweek = result.data[0].daysperweek;
          self.curRec.nicotine.itemsperday = result.data[0].itemsperday;
          self.curRec.nicotine.comments = result.data[0].comments;
        } else if (strType == 'Rec Marijuana') {
          self.curRec.marijuana = new LifestyleItem();
          self.curRec.marijuana.recordid = result.data[0].recordid;
          self.curRec.marijuana.type = result.data[0].type;
          self.curRec.marijuana.subtype = result.data[0].subtype;
          self.curRec.marijuana.does = result.data[0].does;
          self.curRec.marijuana.startdate = result.data[0].startdate;
          self.curRec.marijuana.enddate = result.data[0].enddate;
          self.curRec.marijuana.daysperweek = result.data[0].daysperweek;
          self.curRec.marijuana.itemsperday = result.data[0].itemsperday;
          self.curRec.marijuana.comments = result.data[0].comments;
        } else if (strType == 'Other Rec Drug') {
          self.curRec.otherdrug = new LifestyleItem();
          self.curRec.otherdrug.recordid = result.data[0].recordid;
          self.curRec.otherdrug.type = result.data[0].type;
          self.curRec.otherdrug.subtype = result.data[0].subtype;
          self.curRec.otherdrug.does = result.data[0].does;
          self.curRec.otherdrug.startdate = result.data[0].startdate;
          self.curRec.otherdrug.enddate = result.data[0].enddate;
          self.curRec.otherdrug.daysperweek = result.data[0].daysperweek;
          self.curRec.otherdrug.itemsperday = result.data[0].itemsperday;
          self.curRec.otherdrug.comments = result.data[0].comments;
        }





        callback (null, 'Success');
      } else {
        console.log('LifestyleItem - Data not found: ', result.data)
        callback (null, 'Success');
      }
    }).catch( function(result){
      console.log('Error in LifestyleItem: ', result);
      callback (null, 'Success');
    });
  }


  createItem () {
    return this.formBuilder.group({
      raceid: new FormControl(),
      racecode: new FormControl(),
      confirmed: new FormControl(),
    });
  }

  public today() {
    return new Date().toJSON().split('T')[0];
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
          console.log('Need to login again!!! - Credentials expired from formAboutMe.saveRecord');
          self.loading.dismiss();
          self.RestService.appRestart();
        } else {
          console.log('From formAboutMe.saveRecord - Credentials refreshed!');
          self.saveRecordDo();
        }
      });
    }
  }

  saveRecordDo(){
    this.saving = true;
    if (!this.newUser) {
      this.saveModel.profileid = this.list2[0].profileid;
      this.saveModel.accountid = this.list2[0].accountid;
    } else {
      this.saveModel.accountid = this.list2[0].accountid;
    }
    this.saveModel.userid = this.RestService.userId;
    this.saveModel.active = 'Y';

      var restURL="https://ap6oiuyew6.execute-api.us-east-1.amazonaws.com/dev/AboutMeByProfile";
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
          profileid: this.RestService.currentProfile,
        }
      };
      var body = JSON.stringify(this.saveModel);
      var self = this;
      console.log('Calling Post', this.saveModel);
      apigClient.invokeApi(params, pathTemplate, method, additionalParams, body)
        .then(function(result){
          self.RestService.results = result.data;
          if (!self.newUser) {
            console.log('Happy Path: ' + self.RestService.results);
            self.category.title = "About Me";
            self.loading.dismiss();
            self.nav.pop();
          } else {
            self.navParams.get("homePage").refreshProfiles();
            self.loading.dismiss();
            self.nav.pop();
          }
      }).catch( function(result){
          console.log('Result: ',result);
          self.loading.dismiss();
      });
  }

  async ionViewCanLeave() {
    if (!this.saving && this.card_form.dirty) {
      const shouldLeave = await this.confirmLeave();
      return shouldLeave;
    }
  }

  confirmLeave(): Promise<Boolean> {
    let resolveLeaving;
    const canLeave = new Promise<Boolean>(resolve => resolveLeaving = resolve);
    const alert = this.alertCtrl.create({
      title: 'Exit without Saving',
      message: 'Do you want to exit without saving?',
      buttons: [
        {
          text: 'No',
          role: 'cancel',
          handler: () => resolveLeaving(false)
        },
        {
          text: 'Yes',
          handler: () => resolveLeaving(true)
        }
      ]
    });
    alert.present();
    return canLeave
  }

  addOccupation(): void {
    this.occupations = this.card_form.get('occupations') as FormArray;
    this.occupations.push(this.createOccupation());
  }

  addNewOccupation(): void {
    this.RestService.results = this.curRec.occupations.items;
    this.nav.push(FormOccupationPage);
  }

  createOccupation(): FormGroup {
    return this.formBuilder.group({
      recordid: new FormControl(),
      name: new FormControl({value: null, disabled: true}),
      description: new FormControl({value: null, disabled: true}),
      startdate: new  FormControl({value: null, disabled: true}),
      enddate: new  FormControl({value: null, disabled: true}),
      knownhazards: new  FormControl({value: null, disabled: true}),
      active: new  FormControl({value: 'Y', disabled: true}),
    });
  }

  addExistingOccupations() {
    this.occupations = this.card_form.get('occupations') as FormArray;
    if (this.curRec.occupations !== undefined && this.curRec.occupations.items !== undefined && this.curRec.occupations.items.length > 0) {
      var exitLoop = 0;
      while (this.occupations.length !== 0 || exitLoop > 9) {
        this.occupations.removeAt(0);
        exitLoop = exitLoop + 1;
      }
      console.log('Exising Occupations in list: ' + this.curRec.occupations.items.length);
      for (var j = 0; j < this.curRec.occupations.items.length; j++) {
        this.occupations.push(this.addExistingOccupation(j));
      }
    }
  }

  addExistingOccupation(index): FormGroup {
    return this.formBuilder.group({
      recordid: new FormControl({value: this.curRec.occupations.items[index].recordid, disabled: true}),
      name: new FormControl({value: this.curRec.occupations.items[index].name, disabled: true}),
      description: new FormControl({value: this.curRec.occupations.items[index].description, disabled: true}),
      startdate: new  FormControl({value: this.curRec.occupations.items[index].startdate, disabled: true}),
      enddate: new  FormControl({value: this.curRec.occupations.items[index].enddate, disabled: true}),
      knownhazards: new  FormControl({value: this.curRec.occupations.items[index].knownhazards, disabled: true}),
      active: new  FormControl({value: this.curRec.occupations.items[index].active, disabled: true}),
    });
  }

  viewAllOccupations() {
    var cat = {title: 'Occupation History'};
    this.nav.push(ListOccupationPage, { category:  cat});
  }

  viewDetailOccupation(index) {
    this.RestService.results = this.curRec.occupations.items;
    this.nav.push(FormOccupationPage, { recId:  index});
  }

  addStresslevel(): void {
    this.stresslevel = this.card_form.get('stresslevel') as FormArray;
    this.stresslevel.push(this.createOccupation());
  }

  addNewStresslevel(): void {
    this.RestService.results = this.curRec.stresslevel;
    this.nav.push(FormStresslevelPage);
  }
   createStresslevel(): FormGroup {
    return this.formBuilder.group({
      recordid: new FormControl({value: null, disabled: true}),
      level: new FormControl({value: null, disabled: true}),
      dateofmeasure: new FormControl({value: null, disabled: true}),
      factors: new  FormControl({value: null, disabled: true}),
      howmanage: new  FormControl({value: null, disabled: true}),
      active: new  FormControl({value: 'Y', disabled: true}),
    });
  }

  addExistingStresslevels() {
    this.stresslevel = this.card_form.get('stresslevel') as FormArray;
    if (this.curRec.stresslevel !== undefined && this.curRec.stresslevel.recordid !== undefined) {
      var exitLoop = 0;
      while (this.stresslevel.length !== 0 || exitLoop > 9) {
        this.stresslevel.removeAt(0);
        exitLoop = exitLoop + 1;
      }
      this.stresslevel.push(this.addExistingStresslevel());
    }
  }

  addExistingStresslevel(): FormGroup {
    return this.formBuilder.group({
      recordid: new FormControl({value: this.curRec.stresslevel.recordid, disabled: true}),
      level: new FormControl({value: this.curRec.stresslevel.level, disabled: true}),
      dateofmeasure: new FormControl({value: this.curRec.stresslevel.dateofmeasure, disabled: true}),
      factors: new  FormControl({value: this.curRec.stresslevel.factors, disabled: true}),
      howmanage: new  FormControl({value: this.curRec.stresslevel.howmanage, disabled: true}),
      active: new  FormControl({value: this.curRec.stresslevel.active, disabled: true}),
    });
  }

  viewAllStresslevels() {
    var cat = {title: 'Stress level History'};
    this.nav.push(ListStresslevelPage, { category:  cat});
  }

  viewDetailStresslevel(index) {
    console.log('viewDetailStresslevel begin: ', this.curRec);
    if (this.curRec.stresslevel !== undefined && this.curRec.stresslevel.recordid !== undefined) {
      console.log('viewDetailStresslevel not undefined: ' + this.curRec.stresslevel.recordid);
      this.RestService.results = [];
      this.RestService.results[index] = this.curRec.stresslevel;
      this.nav.push(FormStresslevelPage, { recId:  index});
    } else {
      console.log('viewDetailStresslevel is undefined!');
      this.nav.push(FormStresslevelPage);
    }

  }

  addTravel(): void {
    this.travels = this.card_form.get('travels') as FormArray;
    this.travels.push(this.createTravel());
  }

  addNewTravel(): void {
    this.RestService.results = this.curRec.travels.items;
    this.nav.push(FormTravelPage);
  }

  createTravel(): FormGroup {
    return this.formBuilder.group({
      recordid: new FormControl({value: null, disabled: true}),
      country: new FormControl({value: null, disabled: true}),
      arrivaldate: new FormControl({value: null, disabled: true}),
      departuredate: new  FormControl({value: null, disabled: true}),
      reason: new  FormControl({value: null, disabled: true}),
      active: new  FormControl({value: 'Y', disabled: true}),
    });
  }

  addExistingTravels() {
    this.travels = this.card_form.get('travels') as FormArray;
    if (this.curRec.travels !== undefined && this.curRec.travels.items !== undefined && this.curRec.travels.items.length > 0) {
      var exitLoop = 0;
      while (this.travels.length !== 0 || exitLoop > 9) {
        this.travels.removeAt(0);
        exitLoop = exitLoop + 1;
      }
      console.log('Exising Travels in list: ' + this.curRec.travels.items.length);
      for (var j = 0; j < this.curRec.travels.items.length; j++) {
        this.travels.push(this.addExistingTravel(j));
      }
    }
  }

  addExistingTravel(index): FormGroup {
    return this.formBuilder.group({
      recordid: new FormControl({value: this.curRec.travels.items[index].recordid, disabled: true}),
      country: new FormControl({value: this.curRec.travels.items[index].country, disabled: true}),
      arrivaldate: new FormControl({value: this.curRec.travels.items[index].arrivaldate, disabled: true}),
      departuredate: new  FormControl({value: this.curRec.travels.items[index].departuredate, disabled: true}),
      reason: new  FormControl({value: this.curRec.travels.items[index].reason, disabled: true}),
      active: new  FormControl({value: this.curRec.travels.items[index].active, disabled: true}),
    });
  }

  viewAllTravels() {
    var cat = {title: 'Int. Travel History'};
    this.nav.push(ListTravelPage, { category:  cat});
  }

  viewDetailTravel(index) {
    this.RestService.results = this.curRec.travels.items;
    if (this.curRec.travels.items[index] !== undefined) {
      this.nav.push(FormTravelPage, { recId: index});
    } else {
      this.nav.push(FormTravelPage);
    }
  }

  createLifestyleItem(): FormGroup {
    return this.formBuilder.group({
      recordid: new FormControl({value: null, disabled: true}),
      type: new FormControl({value: null, disabled: true}),
      subtype: new FormControl({value: null, disabled: true}),
      does: new  FormControl({value: null, disabled: true}),
      dateofmeasure: new  FormControl({value: null, disabled: true}),
      startdate: new  FormControl({value: null, disabled: true}),
      enddate: new  FormControl({value: null, disabled: true}),
      daysperweek: new  FormControl({value: null, disabled: true}),
      itemsperday: new  FormControl({value: null, disabled: true}),
      comment: new  FormControl({value: null, disabled: true}),
      active: new  FormControl({value: 'Y', disabled: true}),
    });
  }

  addAlcohol(): void {
    this.alcohol = this.card_form.get('alcohol') as FormArray;
    this.alcohol.push(this.createLifestyleItem());
  }

  addExistingAlcohols() {
    this.alcohol = this.card_form.get('alcohol') as FormArray;
    if (this.curRec.alcohol !== undefined && this.curRec.alcohol.recordid !== undefined) {
      var exitLoop = 0;
      while (this.alcohol.length !== 0 || exitLoop > 9) {
        this.alcohol.removeAt(0);
        exitLoop = exitLoop + 1;
      }
      this.alcohol.push(this.addExistingAlcohol());
    }
  }

  addExistingAlcohol(): FormGroup {
    return this.formBuilder.group({
      recordid: new FormControl({value: this.curRec.alcohol.recordid, disabled: true}),
      type: new FormControl({value: this.curRec.alcohol.type, disabled: true}),
      subtype: new FormControl({value: this.curRec.alcohol.subtype, disabled: true}),
      does: new  FormControl({value: this.curRec.alcohol.does, disabled: true}),
      dateofmeasure: new  FormControl({value: this.curRec.alcohol.dateofmeasure, disabled: true}),
      startdate: new  FormControl({value: this.curRec.alcohol.startdate, disabled: true}),
      enddate: new  FormControl({value: this.curRec.alcohol.enddate, disabled: true}),
      daysperweek: new  FormControl({value: this.curRec.alcohol.daysperweek, disabled: true}),
      itemsperday: new  FormControl({value: this.curRec.alcohol.itemsperday, disabled: true}),
      comments: new  FormControl({value: this.curRec.alcohol.comments, disabled: true}),
      active: new  FormControl({value: this.curRec.alcohol.active, disabled: true}),
    });
  }

  viewDetailAlcohol(index) {
    if (this.curRec.alcohol !== undefined && this.curRec.alcohol.recordid !== undefined) {
      this.RestService.results[0] = this.curRec.alcohol;
      this.nav.push(FormLifestyleItem, { recId:  index, type: 'Alcohol'});
    } else {
      this.nav.push(FormLifestyleItem, { type: 'Alcohol'});
    }
  }

  addNicotine(): void {
    this.nicotine = this.card_form.get('nicotine') as FormArray;
    this.nicotine.push(this.createLifestyleItem());
  }

  addExistingNicotines() {
    this.nicotine = this.card_form.get('nicotine') as FormArray;
    if (this.curRec.nicotine !== undefined && this.curRec.nicotine.recordid !== undefined) {
      var exitLoop = 0;
      while (this.nicotine.length !== 0 || exitLoop > 9) {
        this.nicotine.removeAt(0);
        exitLoop = exitLoop + 1;
      }
      this.nicotine.push(this.addExistingNicotine());
    }
  }

  addExistingNicotine(): FormGroup {
    return this.formBuilder.group({
      recordid: new FormControl({value: this.curRec.nicotine.recordid, disabled: true}),
      type: new FormControl({value: this.curRec.nicotine.type, disabled: true}),
      subtype: new FormControl({value: this.curRec.nicotine.subtype, disabled: true}),
      does: new  FormControl({value: this.curRec.nicotine.does, disabled: true}),
      dateofmeasure: new  FormControl({value: this.curRec.nicotine.dateofmeasure, disabled: true}),
      startdate: new  FormControl({value: this.curRec.nicotine.startdate, disabled: true}),
      enddate: new  FormControl({value: this.curRec.nicotine.enddate, disabled: true}),
      daysperweek: new  FormControl({value: this.curRec.nicotine.daysperweek, disabled: true}),
      itemsperday: new  FormControl({value: this.curRec.nicotine.itemsperday, disabled: true}),
      comments: new  FormControl({value: this.curRec.nicotine.comments, disabled: true}),
      active: new  FormControl({value: this.curRec.nicotine.active, disabled: true}),
    });
  }

  viewAllNicotines() {
    var cat = {title: 'Nicotine History'};
    this.nav.push(ListOccupationPage, { category:  cat});
  }

  viewDetailNicotine(index) {
    if (this.curRec.nicotine !== undefined && this.curRec.nicotine.recordid !== undefined) {
      this.RestService.results[0] = this.curRec.nicotine;
      this.nav.push(FormLifestyleItem, { recId:  index, type: 'Nicotine'});
    } else {
      this.nav.push(FormLifestyleItem, { type: 'Nicotine'});
    }
  }


  addMarijuana(): void {
    this.marijuana = this.card_form.get('marijuana') as FormArray;
    this.marijuana.push(this.createLifestyleItem());
  }

  addExistingMarijuanas() {
    this.marijuana = this.card_form.get('marijuana') as FormArray;
    if (this.curRec.marijuana !== undefined && this.curRec.marijuana.recordid !== undefined) {
      var exitLoop = 0;
      while (this.marijuana.length !== 0 || exitLoop > 9) {
        this.marijuana.removeAt(0);
        exitLoop = exitLoop + 1;
      }
      this.marijuana.push(this.addExistingMarijuana());
    }
  }

  addExistingMarijuana(): FormGroup {
    return this.formBuilder.group({
      recordid: new FormControl({value: this.curRec.marijuana.recordid, disabled: true}),
      type: new FormControl({value: this.curRec.marijuana.type, disabled: true}),
      subtype: new FormControl({value: this.curRec.marijuana.subtype, disabled: true}),
      does: new  FormControl({value: this.curRec.marijuana.does, disabled: true}),
      dateofmeasure: new  FormControl({value: this.curRec.marijuana.dateofmeasure, disabled: true}),
      startdate: new  FormControl({value: this.curRec.marijuana.startdate, disabled: true}),
      enddate: new  FormControl({value: this.curRec.marijuana.enddate, disabled: true}),
      daysperweek: new  FormControl({value: this.curRec.marijuana.daysperweek, disabled: true}),
      itemsperday: new  FormControl({value: this.curRec.marijuana.itemsperday, disabled: true}),
      comments: new  FormControl({value: this.curRec.marijuana.comments, disabled: true}),
      active: new  FormControl({value: this.curRec.marijuana.active, disabled: true}),
    });
  }

  viewAllMarijuanas() {
    var cat = {title: 'Marijuana History', type: 'Marijuana'};
    this.nav.push(ListOccupationPage, { category:  cat});
  }

  viewDetailMarijuana(index) {
    if (this.curRec.marijuana !== undefined && this.curRec.marijuana.recordid !== undefined) {
      this.RestService.results[0] = this.curRec.marijuana;
      this.nav.push(FormLifestyleItem, { recId:  index, type: 'Rec Marijuana'});
    } else {
      this.nav.push(FormLifestyleItem, { type: 'Rec Marijuana'});
    }
  }

  addOtherDrug(): void {
    this.otherdrug = this.card_form.get('otherdrug') as FormArray;
    this.otherdrug.push(this.createLifestyleItem());
  }

  addExistingOtherDrugs() {
    this.otherdrug = this.card_form.get('otherdrug') as FormArray;
    if (this.curRec.otherdrug !== undefined && this.curRec.otherdrug.recordid !== undefined) {
      var exitLoop = 0;
      while (this.otherdrug.length !== 0 || exitLoop > 9) {
        this.otherdrug.removeAt(0);
        exitLoop = exitLoop + 1;
      }
      this.otherdrug.push(this.addExistingOtherDrug());
    }
  }

  addExistingOtherDrug(): FormGroup {
    return this.formBuilder.group({
      recordid: new FormControl({value: this.curRec.otherdrug.recordid, disabled: true}),
      type: new FormControl({value: this.curRec.otherdrug.type, disabled: true}),
      subtype: new FormControl({value: this.curRec.otherdrug.subtype, disabled: true}),
      does: new  FormControl({value: this.curRec.otherdrug.does, disabled: true}),
      dateofmeasure: new  FormControl({value: this.curRec.otherdrug.dateofmeasure, disabled: true}),
      startdate: new  FormControl({value: this.curRec.otherdrug.startdate, disabled: true}),
      enddate: new  FormControl({value: this.curRec.otherdrug.enddate, disabled: true}),
      daysperweek: new  FormControl({value: this.curRec.otherdrug.daysperweek, disabled: true}),
      itemsperday: new  FormControl({value: this.curRec.otherdrug.itemsperday, disabled: true}),
      comments: new  FormControl({value: this.curRec.otherdrug.comments, disabled: true}),
      active: new  FormControl({value: this.curRec.otherdrug.active, disabled: true}),
    });
  }

  viewAllOtherDrugs() {
    var cat = {title: 'Other Rec Drug History', type: 'Other Rec'};
    this.nav.push(ListOccupationPage, { category:  cat});
  }

  viewDetailOtherDrug(index) {
    if (this.curRec.otherdrug !== undefined && this.curRec.otherdrug.recordid !== undefined) {
      this.RestService.results[0] = this.curRec.otherdrug;
      this.nav.push(FormLifestyleItem, { recId:  index, type: 'Other Rec Drug'});
    } else {
      this.nav.push(FormLifestyleItem, { type: 'Other Rec Drug'});
    }
  }

  addExistingLifestyleItems () {
    if (this.curRec.alcohol !== undefined) {
      //console.log('Start add Lifestyle item Alcohol!');
      this.addExistingAlcohols();
    }
    if (this.curRec.nicotine !== undefined) {
      this.addExistingNicotines();
    }
    if (this.curRec.marijuana !== undefined) {
      this.addExistingMarijuanas();
    }
    if (this.curRec.otherdrug !== undefined) {
      this.addExistingOtherDrugs();
    }
  }

  presentPopover(myEvent) {
    var self = this;
    var dataObj;
    let popover = this.popoverCtrl.create(MenuLifestyle);
    popover.onDidDismiss(data => {
      console.log('From popover onDismiss: ', data);
      if (data !==undefined && data !== null) {
        dataObj = data.choosePage;
        if (myEvent == 'new') {
          self.addNewLifestyleItem(dataObj);
        } else {
          self.viewAllLifestyleItems(dataObj);
        }
      }
    });
    popover.present({
      ev: myEvent
    });
  }

  viewAllLifestyleItems(strType) {
    console.log('viewAllLifestyleItems strType:' + strType);
    var cat = {title: strType + ' History', type: strType};
    this.nav.push(ListLifestyleItem, { category:  cat});
  }

  addNewLifestyleItem(strType) {
    console.log('addNewLifestyleItem strType:' + strType);
    this.nav.push(FormLifestyleItem, {type: strType});
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
