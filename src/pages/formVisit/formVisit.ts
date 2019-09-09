import { Component } from '@angular/core';
import { NavController, NavParams, AlertController, ModalController, LoadingController, PopoverController } from 'ionic-angular';
import { Validators, FormGroup, FormControl, FormArray,  FormBuilder, FormsModule } from '@angular/forms';
import { RestService } from '../../app/services/restService.service';
import { HistoryItemModel } from '../../pages/history/history.model';
import { FormChooseInfo } from '../../pages/formChooseInfo/formChooseInfo';
import { ListVisit, ImportantInfo, ImportantInfos, ToDos, Question, Questions, VisitItems } from '../../pages/listVisit/listVisit.model';
import { FormChooseNotify } from '../../pages/formChooseNotify/formChooseNotify';
import { ToDo } from '../../pages/listVisit/listVisit.model';
import { MenuVisitOutcome } from '../../pages/menuVisitOutcome/menuVisitOutcome';
import { MenuVisitItem } from '../../pages/menuVisitItem/menuVisitItem';
import { MenuVisitObjMenu } from '../../pages/menuVisitObjMenu/menuVisitObjMenu';
//import { ListLabsPage } from '../../pages/listLabs/listLabs';
//mport { FormLabsPage } from '../../pages/formLabs/formLabs';
//import { ListVisitPage } from '../../pages/listVisit/listVisit';
import { FormMedication } from '../../pages/formMedication/formMedication';
import { FormMedicalEvent } from '../../pages/formMedicalEvent/formMedicalEvent';
import { PostVisitModel, Treatment, PostVisit, Outcome, Outcomes } from './postVisit.model';
import { PostVisitService } from './postVisit.service';
import { FormProcedure } from '../formProcedure/formProcedure';
import { FormTherapy } from '../formTherapy/formTherapy';
import { ListChooseVaccine } from '../listChooseVaccine/listChooseVaccine';
import { FormVaccinesPage } from '../formVaccines/formVaccines';
import { ListContactPage } from '../../pages/listContacts/listContacts';

var moment = require('moment-timezone');
@Component({
  selector: 'formVisit1-page',
  templateUrl: 'formVisit.html'
})
export class FormVisitPage {
  section: string;
  formName: string = "formVisit";
  recId: number;
  card_form: FormGroup;
  card_formPost: FormGroup;
  curRec: any;
  contact: any;
  curProfile: any;
  loading: any;
  newRec: boolean = false;
  saving: boolean = false;
  showTips: boolean = true;
  infos: FormArray;
  visititems: FormArray;
  questions: FormArray;
  todos: FormArray;
  symptomCheck: boolean = false;
  momentNow: any;
  checkSave: boolean = false;
  diagnoses: FormArray;
  outcomes: FormArray;
  payments: FormArray;
  todopost: FormArray;
  postVisit: PostVisitModel = new PostVisitModel();

  iiBlankAdded: boolean = false;
  selectedItems: ImportantInfos = new ImportantInfos();
  importantInfos: ImportantInfos = new ImportantInfos();
  visitItemArray: VisitItems = new VisitItems();

  formSave: ListVisit = new ListVisit();
  postSave: PostVisit = new PostVisit();
  category: HistoryItemModel = new HistoryItemModel();
  userTimezone: any;
  categories_checkbox_open: boolean;
  categories_checkbox_result;
  needNew: boolean = false;
  pastVisit: boolean = false;
  loadFromId: any;
  createNewParams: any;
  hasParent: boolean = false;
  hasDate: boolean = false;
  transfer2Post: boolean = false;


  constructor(public nav: NavController, public alertCtrl: AlertController, public RestService:RestService, public modalCtrl: ModalController,
    public navParams: NavParams, public formBuilder: FormBuilder, public categoryList: FormsModule, public popoverCtrl:PopoverController,
    public list2Service: PostVisitService, public loadingCtrl: LoadingController) {
    this.recId = navParams.get('recId');
    this.createNewParams = navParams.get('createNewParams');
    this.curRec = RestService.results[this.recId];
    console.log('formVisit - initial recId: ', this.recId);
    console.log('formVisit - initial curRec: ', this.curRec);
    console.log('formVisit - initial createNewParams: ', this.createNewParams);

    if (this.curRec == undefined) {
      this.curRec = {
        recordid: null
      }
      console.log('formVisit: curRec blanked - no data coming from parent form.  The recid is: ' + this.recId);
      //needNew - If this variable is set, that means the visit is being generated from the medical contacts form and the Visit record needs to be created up front
      //for the page to fully function properly
      this.needNew = true;
    }
    this.contact = navParams.get('contact');
    this.selectedItems.items = [];
    this.importantInfos.items = [];
    this.visitItemArray.items = [];
    this.categoryList = 'pre';
    var self = this;
    this.momentNow = moment(new Date());

    this.RestService.curProfileObj(function (error, results) {
      if (!error) {
        self.userTimezone = results.timezone;
        self.curProfile = results;
      }
    });
    this.loadFromId = navParams.get('loadFromId');
    if (this.loadFromId !== undefined && this.loadFromId !== null && this.loadFromId > 0) {
      this.categoryList = 'post';
    }

    var preason = null;

    if (this.recId !== undefined) {
      if (this.curRec.parentvisitid !== undefined && this.curRec.parentvisitid !==null) {
        this.hasParent = true;
        preason = this.curRec.parentreason + " " + this.formatRealDate(this.curRec.parentdate);
      }
      if (this.curRec.visitdate !== undefined && this.curRec.visitdate !== null) {
        this.hasDate = true;
      } else {
        this.hasDate = false;
      }

      this.card_form = new FormGroup({
        recordid: new FormControl(this.curRec.recordid),
        parentvisitid: new FormControl(this.curRec.parentvisitid),
        parentreason: new FormControl(preason),
        parentdate: new FormControl(this.curRec.parentdate),
        visitdate: new FormControl(this.curRec.visitdate, Validators.required),
        firstname: new FormControl(this.curRec.firstname),
        physiciantitle: new FormControl(this.curRec.physician.title),
        reason: new FormControl(this.curRec.reason),
        infos: this.formBuilder.array([]),
        visititems: this.formBuilder.array([]),
        questions: this.formBuilder.array([]),
        todos: this.formBuilder.array([]),
        importantinfo: new FormControl(),
        profileid: new FormControl(this.curRec.profileid),
        userid: new FormControl(this.RestService.userId),
      });
      //console.log('MomentNow = ' + this.momentNow.format('MMM-DD-YYYY hh:mm a'));
      //console.log('VisitDate = ' + moment(this.curRec.visitdate).format('MMM-DD-YYYY hh:mm a'));
      console.log('VisitDateReal = ' + this.getRealDateTime(this.curRec.visitdate).format('MMM-DD-YYYY hh:mm a'));
      if (this.momentNow > this.getRealDateTime(this.curRec.visitdate)) {
        this.categoryList = 'post';
        this.pastVisit = true;
        console.log('It is after the visit! - momentNow = ' + this.momentNow);
        if (this.curRec.happened !== undefined && this.curRec.happened !== null && this.curRec.happened == 'N') {
          //console.log('Setting transfer2Post to true - happened: ' + this.curRec.happened);
          this.transfer2Post = true;
        }
      } else {
        console.log('It is before the visit!');
      }
      this.addExistingInfos();
      this.addExistingQuestions();
      this.addExistingTodos();
      this.addExistingVisitInfos();
    } else {
      this.newRec = true;
      var title = null;
      var firstNameVal = null;
      var objUser;
      if (this.contact !==undefined && this.contact !==null) {
        title = this.contact.title;
        console.log('contact title from init: ' + this.contact.title);
      } else if (this.createNewParams !==undefined && this.createNewParams !==null) {
        title = this.createNewParams.title;
      }
      if (this.createNewParams !==undefined && this.createNewParams !==null) {
        objUser = this.RestService.getUserById(this.createNewParams.profileid);
        firstNameVal = objUser.title;
        if (this.createNewParams.parentreason !== undefined && this.createNewParams.parentreason !== null) {
          this.hasParent = true;
          if (this.createNewParams.parentdate !== undefined && this.createNewParams.parentdate !== null) {
            preason = this.createNewParams.parentreason + " " + this.formatRealDate(this.createNewParams.parentdate);
          } else {
            preason = this.createNewParams.parentreason;
          }
        }
      } else if (this.curProfile !==undefined && this.curProfile !==null) {
        firstNameVal = this.curProfile.title;
        console.log("curProfile: ", this.curProfile);
      }

      this.card_form = new FormGroup({
        recordid: new FormControl(),
        parentvisitid: new FormControl(),
        parentreason: new FormControl(preason),
        parentdate: new FormControl(),
        visitdate: new FormControl(null, Validators.required),
        firstname: new FormControl(firstNameVal),
        physiciantitle: new FormControl(title),
        reason: new FormControl(),
        infos: this.formBuilder.array([]),
        visititems: this.formBuilder.array([]),
        questions: this.formBuilder.array([]),
        todos: this.formBuilder.array([]),
        importantinfo: new FormControl(),
        profileid: new FormControl(),
        userid: new FormControl(),
      });

      if (this.createNewParams !==undefined && this.createNewParams !==null) {
        this.loadPreObjects();
      }

      if (this.needNew) {
        //this.saveNew();
      }
    }
    this.card_formPost = new FormGroup({
      visitsummary: new FormControl(),
      diagnoses: this.formBuilder.array([]),
      outcomes: this.formBuilder.array([]),
      payments: this.formBuilder.array([]),
      todopost: this.formBuilder.array([])
    });
  }

  ionViewWillEnter() {
    this.checkSave = false;
    if (this.categoryList == 'post') {
      this.loadPost();
    }
  }

  loadPreObjects() {
    this.infos = this.card_form.get('infos') as FormArray;
    this.visititems = this.card_form.get('visititems') as FormArray;
    var objPre;

    console.log('Start loadPreObjects');
    if (this.createNewParams.procedureid !== undefined && this.createNewParams.procedureid > 0) {
      objPre = this.formBuilder.group({
        recordid: new FormControl(),
        namevalue: new FormControl(this.createNewParams.procedurename),
        dateofmeasure: new FormControl(),
        reftable: new FormControl('procedure'),
        reftablefield: new FormControl('procedureid'),
        reftablefieldid: new FormControl(this.createNewParams.procedureid),
        reftablefields: new FormControl('procedurename, dateofmeasure'),
        type: new FormControl('procedure'),
        active: new  FormControl('Y'),
      });
      this.visititems.push(objPre);
      this.visititems.markAsDirty();
      this.visititems.at(0).markAsDirty();
      console.log('loadPreObjects - Procedure visititems: ', this.visititems);
    }
    if (this.createNewParams.therapyid !== undefined && this.createNewParams.therapyid > 0) {
      objPre = this.formBuilder.group({
        recordid: new FormControl(),
        namevalue: new FormControl(this.createNewParams.therapyname),
        dateofmeasure: new FormControl(),
        reftable: new FormControl('therapy'),
        reftablefield: new FormControl('therapyid'),
        reftablefieldid: new FormControl(this.createNewParams.therapyid),
        reftablefields: new FormControl('therapyname, dateofmeasure'),
        type: new FormControl('therapy'),
        active: new  FormControl('Y'),
      });
      this.visititems.push(objPre);
      this.visititems.markAsDirty();
      this.visititems.at(0).markAsDirty();
      console.log('loadPreObjects - Therapy visititems: ', this.visititems);
    }
    if (this.createNewParams.medicaleventid !== undefined && this.createNewParams.medicaleventid > 0) {
      objPre = this.formBuilder.group({
        recordid: new FormControl(),
        namevalue: new FormControl(this.createNewParams.medicalevent),
        dateofmeasure: new FormControl(this.createNewParams.eventstart),
        reftable: new FormControl('medicalevent'),
        reftablefield: new FormControl('medicaleventid'),
        reftablefieldid: new FormControl(this.createNewParams.medicaleventid),
        reftablefields: new FormControl('medicalevent, startdate'),
        type: new FormControl('medicalevent'),
        active: new  FormControl('Y'),
      });
      this.infos.push(objPre);
      this.infos.markAsDirty();
      this.infos.at(0).markAsDirty();
    }
  }


  loadPost() {
    var dtNow = moment(new Date());
    var dtExpiration = moment(this.RestService.AuthData.expiration);
    var self = this;

    if (dtNow < dtExpiration) {
      this.presentLoadingDefault();
      this.loadPostDo();
    } else {
      this.presentLoadingDefault();
      this.RestService.refreshCredentials(function(err, results) {
        if (err) {
          console.log('Need to login again!!! - Credentials expired from ' + self.formName + '.loadPost');
          self.loading.dismiss();
          self.RestService.appRestart();
        } else {
          console.log('From ' + self.formName + '.loadPost - Credentials refreshed!');
          self.loadPostDo();
        }
      });
    }
  }

  loadPostDo() {
    var restURL: string;

    restURL="https://ap6oiuyew6.execute-api.us-east-1.amazonaws.com/dev/VisitPostByVisit";

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

    if (this.loadFromId !== undefined && this.loadFromId !== null && this.loadFromId > 0) {
      additionalParams = {
        queryParams: {
            visitid: this.loadFromId
        }
      };
    } else {
      additionalParams = {
        queryParams: {
            visitid: this.curRec.recordid
        }
      };
    }
    var body = '';
    var self = this;

    apigClient.invokeApi(params, pathTemplate, method, additionalParams, body)
    .then(function(result){
      self.postVisit = result.data;
      self.list2Service
      .getData()
      .then(data => {
        //self.list2.items = self.RestService.results;
        console.log("Results Data for getPostVisit: ", self.postVisit);
        if (self.postVisit !== undefined && self.postVisit[0] !== undefined && self.postVisit[0].recordid !== undefined &&
        self.postVisit[0].recordid > 0) {
         self.loadPostForm();
        } else {
          console.log('Check post form length = 0');
        }
        self.loading.dismiss();
      });
    }).catch( function(result){
        console.log(result);
        self.loading.dismiss();
        alert('There was an error retrieving this data.  Please try again later');
    });
  }

  loadPostForm() {
    if (this.postVisit[0].visitsummary !== undefined && this.postVisit[0].visitsummary !== "") {
      this.card_formPost.get("visitsummary").setValue(this.postVisit[0].visitsummary);
    }
    if (this.postVisit[0] !== undefined) {
      this.addExistingDiagnoses();
      this.addExistingOutcomes();
      this.addExistingPayments();
      this.addExistingTodoPosts();
    }
  }

  checkPre() {
    if (this.loadFromId !== undefined && this.loadFromId !== null && this.loadFromId > 0 && (this.curRec == undefined || this.curRec.recordid == null)) {
      ///alert('pre check worked');
      this.loadPre();
    }
  }

  loadPre() {
    var dtNow = moment(new Date());
    var dtExpiration = moment(this.RestService.AuthData.expiration);
    var self = this;

    if (dtNow < dtExpiration) {
      this.presentLoadingDefault();
      this.loadPreDo();
    } else {
      this.presentLoadingDefault();
      this.RestService.refreshCredentials(function(err, results) {
        if (err) {
          console.log('Need to login again!!! - Credentials expired from ' + self.formName + '.loadPre');
          self.loading.dismiss();
          self.RestService.appRestart();
        } else {
          console.log('From ' + self.formName + '.loadPre - Credentials refreshed!');
          self.loadPreDo();
        }
      });
    }
  }

  loadPreDo() {
    var restURL: string;

    restURL="https://ap6oiuyew6.execute-api.us-east-1.amazonaws.com/dev/VisitByProfile";

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

    if (this.loadFromId !== undefined && this.loadFromId !== null && this.loadFromId > 0) {
      additionalParams = {
        queryParams: {
            visitid: this.loadFromId
        }
      };
    } else {
      additionalParams = {
        queryParams: {
            visitid: this.curRec.recordid
        }
      };
    }
    var body = '';
    var self = this;

    apigClient.invokeApi(params, pathTemplate, method, additionalParams, body)
    .then(function(result){
      self.curRec = result.data[0];
      self.list2Service
      .getData()
      .then(data => {
        //self.list2.items = self.RestService.results;
        console.log("Results Data for getPreVisit: ", self.curRec);
        if (self.curRec !== undefined && self.curRec.recordid !== undefined && self.curRec.recordid > 0) {
         self.loadPreForm();
        } else {
          console.log('Check pre form length = 0');
        }
        self.loading.dismiss();
      });
    }).catch( function(result){
        console.log(result);
        self.loading.dismiss();
        alert('There was an error retrieving this data.  Please try again later');
    });
  }

  loadPreForm() {
    var preason;
    console.log('formVisit - loadPreForm: ', this.curRec);
    if (this.curRec.parentvisitid !== undefined && this.curRec.parentvisitid !==null) {
      this.hasParent = true;
      preason = this.curRec.parentreason + " " + this.formatRealDate(this.curRec.parentdate);
    }
    if (this.curRec.visitdate !== undefined && this.curRec.visitdate !== null) {
      this.hasDate = true;
    } else {
      this.hasDate = false;
    }

    this.card_form.get('recordid').setValue(this.curRec.recordid);
    this.card_form.get('parentvisitid').setValue(this.curRec.parentvisitid);
    this.card_form.get('parentreason').setValue(preason);
    this.card_form.get('parentdate').setValue(this.curRec.parentdate);
    this.card_form.get('visitdate').setValue(this.curRec.visitdate);
    this.card_form.get('firstname').setValue(this.curRec.firstname);
    this.card_form.get('physiciantitle').setValue(this.curRec.physician.title);
    this.card_form.get('reason').setValue(this.curRec.reason);
    this.card_form.get('profileid').setValue(this.curRec.profileid);
    this.card_form.get('userid').setValue(this.RestService.userId);

    this.addExistingInfos();
    this.addExistingQuestions();
    this.addExistingTodos();
    this.addExistingVisitInfos();
  }

  deleteRecord(){
    var dtNow = moment(new Date());
    var dtExpiration = moment(this.RestService.AuthData.expiration);
    var self = this;

    if (dtNow < dtExpiration) {
      this.presentLoadingDefault();
      this.deleteRecordDo();
    } else {
      this.presentLoadingDefault();
      this.RestService.refreshCredentials(function(err, results) {
        if (err) {
          console.log('Need to login again!!! - Credentials expired from ' + self.formName + '.deleteRecord');
          self.loading.dismiss();
          self.RestService.appRestart();
        } else {
          console.log('From ' + self.formName + '.deleteRecord - Credentials refreshed!');
          self.deleteRecordDo();
        }
      });
    }
  }

  deleteRecordDo(){
    let alert = this.alertCtrl.create({
      title: 'Confirm Delete',
      message: 'Are you certain you want to cancel this visit record (please ensure you have informed the physician)?',
      buttons: [
        {
          text: 'No',
          role: 'cancel',
          handler: () => {
            this.loading.dismiss();
            console.log('Cancel clicked');
          }
        },
        {
          text: 'Yes',
          handler: () => {
            console.log('Delete clicked');
              this.saving = true;
              if (this.card_form.get('recordid').value !== undefined && this.card_form.get('recordid').value !== null) {
                this.formSave.recordid = this.card_form.get('recordid').value;
              }
              if (this.curRec.scheduleinstanceid !== undefined && this.curRec.scheduleinstanceid !== null) {
                this.formSave.scheduleinstanceid = this.curRec.scheduleinstanceid;
              }
              this.formSave.active = 'N';
              this.formSave.profileid = this.curRec.profileid;
              this.formSave.userid = this.RestService.userId;
              var restURL="https://ap6oiuyew6.execute-api.us-east-1.amazonaws.com/dev/VisitByProfile";
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
              var body = JSON.stringify(this.formSave);
              var self = this;
              console.log('Calling Post', this.formSave);
              apigClient.invokeApi(params, pathTemplate, method, additionalParams, body)
              .then(function(result){
                self.RestService.results = result.data;
                console.log('Happy Path: ' + self.RestService.results);
                self.category.title = "Visit";
                self.loading.dismiss();
                self.nav.pop();
              }).catch( function(result){
                console.log('error in formVisit.delete: ',result);
                self.loading.dismiss();
              });
          }
        }
      ]
    });
    alert.present();
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
    this.saving = true;
    console.log('Save record in formVisit called!');
    if (this.card_form.get('recordid').value !==undefined && this.card_form.get('recordid').value !==null) {
      this.formSave.recordid = this.card_form.get('recordid').value;
      this.formSave.active = 'Y';
      console.log('Cur Profile: ', this.curProfile);
      if (this.curRec !== undefined && this.curRec.profileid !== undefined) {
        this.formSave.profileid = this.curRec.profileid;
      } else {
        this.formSave.profileid = this.curProfile.profileid;
      }
      this.formSave.userid = this.RestService.userId;
      if (this.card_form.get('reason').dirty) {
        this.formSave.reason = this.card_form.get('reason').value;
      }
      if (this.card_form.get('visitdate').dirty) {
        this.formSave.visitdate = this.card_form.get('visitdate').value;
      }
    } else {
      this.formSave.active = 'Y';
      console.log('Cur Profile: ', this.curProfile);

      if (this.createNewParams !==undefined && this.createNewParams !==null) {
        this.formSave.profileid = this.createNewParams.profileid;
      } else if (this.curRec !== undefined && this.curRec.profileid !== undefined) {
        this.formSave.profileid = this.curRec.profileid;
      } else {
        this.formSave.profileid = this.curProfile.profileid;
      }

      this.formSave.userid = this.RestService.userId;
      this.formSave.reason = this.card_form.get('reason').value;
      this.formSave.visitdate = this.card_form.get('visitdate').value;

      //This is the only field within the post visit section:
      console.log('Contact from promote to visit', this.contact);
      if (this.curRec !== undefined  && this.curRec.physician !== undefined) {
        this.formSave.contactid = this.curRec.physician.recordid;
      } else if (this.contact !== undefined) {
        this.formSave.contactid = this.contact.recordid;
      } else if (this.createNewParams !==undefined && this.createNewParams !==null) {
        this.formSave.contactid = this.createNewParams.contactid;
      }
      if (this.createNewParams !==undefined && this.createNewParams !==null && this.createNewParams.parentvisitid !== undefined
        && this.createNewParams.parentvisitid > 0) {
          this.formSave.parentvisitid = this.createNewParams.parentvisitid;
      }
      this.formSave.accountid = this.RestService.Profiles[0].accountid;
      if (this.curRec.scheduleinstanceid !== undefined && this.curRec.scheduleinstanceid !== null) {
        this.formSave.scheduleinstanceid = this.curRec.scheduleinstanceid;
      }
    }
    this.infos = this.card_form.get('infos') as FormArray;
    if (this.infos.dirty) {
      var impInfos: ImportantInfos = new ImportantInfos();
      var impInfo: ImportantInfo;
      var infoForm;
      console.log('formVisit Save - infos dirty', this.selectedItems);
      impInfos.items = [];
      for (var j = 0; j < this.infos.length; j++) {
        infoForm = this.infos.at(j) as FormGroup;
        if (infoForm.dirty) {
          impInfo = {
            recordid: infoForm.get("recordid").value,
            namevalue: infoForm.get("namevalue").value,
            dateofmeasure: infoForm.get("dateofmeasure").value,
            reftable: infoForm.get("reftable").value,
            reftablefield: infoForm.get("reftablefield").value,
            reftablefieldid: infoForm.get("reftablefieldid").value,
            reftablefields: infoForm.get("reftablefields").value,
            type: infoForm.get("type").value,
            active: 'Y',
            selected: false,
            medicaleventid: null,
          }
          impInfos.items.push(impInfo);
          console.log('formVisit - impInfo, ', impInfo);
        } else {
          console.log('InfoForm not dirty')
        }
      }
      this.formSave.importantinfo = impInfos;
    } else {
      console.log('formVisit Save - infos not dirty');
    }
    this.todos = this.card_form.get('todos') as FormArray;
    if (this.todos.dirty) {
      var impTodos: ToDos = new ToDos();
      var impTodo: ToDo;
      var todoForm;
      console.log('formVisit Save - todos dirty');
      impTodos.items = [];
      for (j = 0; j < this.todos.length; j++) {
        todoForm = this.todos.at(j) as FormGroup;
        if (todoForm.dirty) {
          impTodo = new ToDo();
          impTodo.recordid = todoForm.get("recordid").value;
          if (todoForm.get("taskname").dirty) {
            impTodo.taskname = todoForm.get("taskname").value;
          }
          if (todoForm.get("duedate").dirty) {
            impTodo.duedate = todoForm.get("duedate").value;
          }
          if (todoForm.get("completedflag").dirty) {
            if (todoForm.get("completedflag").value == true) {
              impTodo.completedflag = 'Y';
            } else {
              impTodo.completedflag = 'N';
            }
          }
          if (todoForm.get("active").dirty) {
            impTodo.active = todoForm.get("active").value;
          }
          impTodos.items.push(impTodo);
        }
      }
      this.formSave.todos = impTodos;
    } else {
      console.log('formVisit Save - todos not dirty');
    }
    this.questions = this.card_form.get('questions') as FormArray;
    if (this.questions.dirty) {
      var impQuestions: Questions = new Questions();
      var impQuestion: Question;
      var questionForm;
      console.log('formVisit Save - quest dirty');
      impQuestions.items = [];
      for (j = 0; j < this.questions.length; j++) {
        questionForm = this.questions.at(j) as FormGroup;
        if (questionForm.dirty) {
          impQuestion = new Question();
          impQuestion.recordid = questionForm.get("recordid").value;
          if (questionForm.get("question").dirty) {
            impQuestion.question = questionForm.get("question").value;
          }
          if (questionForm.get("answer").dirty) {
            impQuestion.answer = questionForm.get("answer").value;
          }
          if (questionForm.get("active").dirty) {
            impQuestion.active = questionForm.get("active").value;
          }
          impQuestions.items.push(impQuestion);
        }
      }
      this.formSave.questions = impQuestions;
    } else {
      console.log('formVisit Save - todos not dirty');
    }
  //Add visitinfos
      this.visititems = this.card_form.get('visititems') as FormArray;
      if (this.visititems.dirty) {
        var visititems: VisitItems = new VisitItems();
        var visitInfo: ImportantInfo;
        var visitForm;
        console.log('formVisit Save - infos dirty', this.selectedItems);
        visititems.items = [];
        for (j = 0; j < this.infos.length; j++) {
          visitForm = this.visititems.at(j) as FormGroup;
          if (visitForm.dirty) {
            visitInfo = {
              recordid: visitForm.get("recordid").value,
              namevalue: visitForm.get("namevalue").value,
              dateofmeasure: visitForm.get("dateofmeasure").value,
              reftable: visitForm.get("reftable").value,
              reftablefield: visitForm.get("reftablefield").value,
              reftablefieldid: visitForm.get("reftablefieldid").value,
              reftablefields: visitForm.get("reftablefields").value,
              type: visitForm.get("type").value,
              active: 'Y',
              selected: false,
              medicaleventid: null,
            }
            visititems.items.push(visitInfo);
            console.log('formVisit - visitInfo, ', visitInfo);
          } else {
            console.log('Visit Form not dirty');
          }
        }
        this.formSave.visititem = visititems;
      } else {
          console.log('formVisit Save - visitinfo not dirty');
      }
      var restURL="https://ap6oiuyew6.execute-api.us-east-1.amazonaws.com/dev/VisitByProfile";
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
      self.RestService.results = result.data;
      console.log('Happy Path: ' + self.RestService.results);
      self.category.title = "Visit";
      self.curRec = self.formSave
      self.curRec.recordid = result.data;
      self.loading.dismiss();
      callback(null, result.data);
    }).catch( function(result){
      console.log('Error in formVisit.save: ',result);
      self.loading.dismiss();
      callback(result, null);
    });
  }

  navSavePostRecord(callback){
    var dtNow = moment(new Date());
    var dtExpiration = moment(this.RestService.AuthData.expiration);
    var self = this;

    if (dtNow < dtExpiration) {
      this.presentLoadingDefault();
      this.navSavePostRecordDo(function (err, results) {
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
          self.navSavePostRecordDo(function (err, results) {
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

  navSavePostRecordDo(callback){
    this.saving = true;

    //console.log('Save record in formVisit called!');
    if (this.card_form.get('recordid').value !==undefined && this.card_form.get('recordid').value !==null) {
      this.postSave.recordid = this.card_form.get('recordid').value;
      this.postSave.active = 'Y';
      //console.log('Cur Profile: ', this.curProfile);
      this.postSave.profileid = this.curProfile.profileid;
      this.postSave.userid = this.RestService.userId;
      if (this.card_formPost.get('visitsummary').dirty) {
        this.postSave.visitsummary = this.card_formPost.get('visitsummary').value;
      }
      this.todopost = this.card_formPost.get('todopost') as FormArray;

      if (this.todopost.dirty) {
        var impTodos: ToDos = new ToDos();
        var impTodo: ToDo;
        var todoForm;
        impTodos.items = [];
        for (var j = 0; j < this.todopost.length; j++) {
          todoForm = this.todopost.at(j) as FormGroup;
          if (todoForm.dirty) {
            impTodo = new ToDo();
            impTodo.recordid = todoForm.get("recordid").value;
            if (todoForm.get("taskname").dirty) {
              impTodo.taskname = todoForm.get("taskname").value;
            }
            if (todoForm.get("duedate").dirty) {
              impTodo.duedate = todoForm.get("duedate").value;
            }
            if (todoForm.get("completedflag").dirty) {
              if (todoForm.get("completedflag").value == true) {
                impTodo.completedflag = 'Y';
              } else {
                impTodo.completedflag = 'N';
              }
            }
            if (todoForm.get("active").dirty) {
              impTodo.active = todoForm.get("active").value;
            }
            console.log('formVisit todopost impTodo: ', impTodo);
            impTodos.items.push(impTodo);
          }
        }
        this.postSave.todopost = impTodos;
        console.log('formVisit todopost dirty: ', this.postSave.todopost);
      } else {
        console.log('formVisit.postsave - todopost not dirty');
      }

      this.outcomes = this.card_formPost.get('outcomes') as FormArray;
      if (this.outcomes.dirty) {
        var impOutcomes: Outcomes = new Outcomes();
        var impOutcome: Outcome;
        var outcomeForm;
        impOutcomes.items = [];
        for (j = 0; j < this.outcomes.length; j++) {
          outcomeForm = this.outcomes.at(j) as FormGroup;
          console.log('OutcomeForm for j: ' + j, outcomeForm);
          if (outcomeForm.dirty) {
            impOutcome = new Outcome();
            if (outcomeForm.get("recordid") !== undefined && outcomeForm.get("recordid") !== null && outcomeForm.get("recordid").value !== undefined) {
              impOutcome.recordid = outcomeForm.get("recordid").value;
            }
            impOutcome.visitid = outcomeForm.get("visitid").value;
            if (outcomeForm.get("reftable").dirty) {
              impOutcome.reftable = outcomeForm.get("reftable").value;
            }
            if (outcomeForm.get("reftablefield").dirty) {
              impOutcome.reftablefield = outcomeForm.get("reftablefield").value;
            }
            if (outcomeForm.get("reftablefieldid").dirty) {
              impOutcome.reftablefieldid = outcomeForm.get("reftablefieldid").value;
            }
            if (outcomeForm.get("reftablefields").dirty) {
              impOutcome.reftablefields = outcomeForm.get("reftablefields").value;
            }
            if (outcomeForm.get("type").dirty) {
              impOutcome.type = outcomeForm.get("type").value;
            }
            if (outcomeForm.get("active").dirty) {
              impOutcome.active = outcomeForm.get("active").value;
            }
            console.log('formVisit todopost impOutcome: ', impOutcome);
            impOutcomes.items.push(impOutcome);
          }
        }
        this.postSave.outcomes = impOutcomes;
        console.log('formVisit outcomes dirty: ', this.postSave.outcomes);
      } else {
        console.log('formVisit.postsave - outcomes not dirty');
      }

    }

    var restURL="https://ap6oiuyew6.execute-api.us-east-1.amazonaws.com/dev/VisitPostByVisit";
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
        visitid: this.curRec.recordid,
      }
    };
    var body = JSON.stringify(this.postSave);
    var self = this;
    console.log('Calling Post', this.postSave);
    apigClient.invokeApi(params, pathTemplate, method, additionalParams, body)
    .then(function(result){
      self.RestService.results = result.data;
      console.log('Happy Path: ' + self.RestService.results);
      self.category.title = "Visit";
      self.loading.dismiss();
      callback(null, result.data);
    }).catch( function(result){
      console.log('Error in formVisit.save: ',result);
      self.loading.dismiss();
      callback(result, null);
    });
  }

  savePostRecord(){
    var dtNow = moment(new Date());
    var dtExpiration = moment(this.RestService.AuthData.expiration);
    var self = this;

    if (dtNow < dtExpiration) {
      this.presentLoadingDefault();
      this.savePostRecordDo();
    } else {
      this.presentLoadingDefault();
      this.RestService.refreshCredentials(function(err, results) {
        if (err) {
          console.log('Need to login again!!! - Credentials expired from ' + self.formName + '.saveRecord');
          self.loading.dismiss();
          self.RestService.appRestart();
        } else {
          console.log('From ' + self.formName + '.saveRecord - Credentials refreshed!');
          self.savePostRecordDo();
        }
      });
    }
  }

  savePostRecordDo(){
    this.saving = true;
    //console.log('Save record in formVisit called!');
    if (this.card_form.get('recordid').value !==undefined && this.card_form.get('recordid').value !==null) {
      this.postSave.recordid = this.card_form.get('recordid').value;
      this.postSave.active = 'Y';
      //console.log('Cur Profile: ', this.curProfile);
      this.postSave.profileid = this.curProfile.profileid;
      this.postSave.userid = this.RestService.userId;
      if (this.card_formPost.get('visitsummary').dirty) {
        this.postSave.visitsummary = this.card_formPost.get('visitsummary').value;
      }
      this.todopost = this.card_formPost.get('todopost') as FormArray;

      if (this.todopost.dirty) {
        var impTodos: ToDos = new ToDos();
        var impTodo: ToDo;
        var todoForm;
        impTodos.items = [];
        for (var j = 0; j < this.todopost.length; j++) {
          todoForm = this.todopost.at(j) as FormGroup;
          if (todoForm.dirty) {
            impTodo = new ToDo();
            impTodo.recordid = todoForm.get("recordid").value;
            if (todoForm.get("taskname").dirty) {
              impTodo.taskname = todoForm.get("taskname").value;
            }
            if (todoForm.get("duedate").dirty) {
              impTodo.duedate = todoForm.get("duedate").value;
            }
            if (todoForm.get("completedflag").dirty) {
              if (todoForm.get("completedflag").value == true) {
                impTodo.completedflag = 'Y';
              } else {
                impTodo.completedflag = 'N';
              }
            }
            if (todoForm.get("active").dirty) {
              impTodo.active = todoForm.get("active").value;
            }
            console.log('formVisit todopost impTodo: ', impTodo);
            impTodos.items.push(impTodo);
          }
        }
        this.postSave.todopost = impTodos;
        console.log('formVisit todopost dirty: ', this.formSave.todopost);
      } else {
        console.log('formVisit.postsave - todopost not dirty');
      }

      this.outcomes = this.card_formPost.get('outcomes') as FormArray;
      if (this.outcomes.dirty) {
        var impOutcomes: Outcomes = new Outcomes();
        var impOutcome: Outcome;
        var outcomeForm;
        impOutcomes.items = [];
        for (j = 0; j < this.outcomes.length; j++) {
          outcomeForm = this.outcomes.at(j) as FormGroup;
          if (outcomeForm.dirty) {
            impOutcome = new Outcome();
            if (outcomeForm.get("recordid").value !== undefined && outcomeForm.get("recordid").value !== null) {
              impOutcome.recordid = outcomeForm.get("recordid").value;
            }
            impOutcome.visitid = outcomeForm.get("visitid").value;
            if (outcomeForm.get("reftable").dirty) {
              impOutcome.reftable = outcomeForm.get("reftable").value;
            }
            if (outcomeForm.get("reftablefield").dirty) {
              impOutcome.reftablefield = outcomeForm.get("reftablefield").value;
            }
            if (outcomeForm.get("reftablefieldid").dirty) {
              impOutcome.reftablefieldid = outcomeForm.get("reftablefieldid").value;
            }
            if (outcomeForm.get("reftablefields").dirty) {
              impOutcome.reftablefields = outcomeForm.get("reftablefields").value;
            }
            if (outcomeForm.get("type").dirty) {
              impOutcome.type = outcomeForm.get("type").value;
            }
            if (outcomeForm.get("active").dirty) {
              impOutcome.active = outcomeForm.get("active").value;
            }
            console.log('formVisit todopost impOutcome: ', impOutcome);
            impOutcomes.items.push(impOutcome);
          }
        }
        this.postSave.outcomes = impOutcomes;
        console.log('formVisit outcomes dirty: ', this.postSave.outcomes);
      } else {
        console.log('formVisit.postsave - outcomes not dirty');
      }

    }

    var restURL="https://ap6oiuyew6.execute-api.us-east-1.amazonaws.com/dev/VisitPostByVisit";
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
        visitid: this.curRec.recordid,
      }
    };
    var body = JSON.stringify(this.postSave);
    var self = this;
    console.log('Calling Post', this.postSave);
    apigClient.invokeApi(params, pathTemplate, method, additionalParams, body)
    .then(function(result){
      self.RestService.results = result.data;
      console.log('Happy Path: ' + self.RestService.results);
      self.category.title = "Visit";
      self.loading.dismiss();
      self.nav.pop();
    }).catch( function(result){
      console.log('Error in formVisit.save: ',result);
      self.loading.dismiss();
      alert('There was an error saving this data.  Please try again later');
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
    this.saving = true;
    console.log('Save record in formVisit called!');
    if (this.card_form.get('recordid').value !==undefined && this.card_form.get('recordid').value !==null) {
      this.formSave.recordid = this.card_form.get('recordid').value;
      this.formSave.active = 'Y';
      console.log('Cur Profile: ', this.curProfile);
      if (this.curRec !== undefined && this.curRec.profileid !== undefined) {
        this.formSave.profileid = this.curRec.profileid;
      } else {
        this.formSave.profileid = this.curProfile.profileid;
      }
      this.formSave.userid = this.RestService.userId;
      if (this.card_form.get('reason').dirty) {
        this.formSave.reason = this.card_form.get('reason').value;
      }
      if (this.card_form.get('visitdate').dirty) {
        this.formSave.visitdate = this.card_form.get('visitdate').value;
      }
    } else {
      this.formSave.active = 'Y';
      console.log('Cur Profile: ', this.curProfile);

      if (this.createNewParams !==undefined && this.createNewParams !==null) {
        this.formSave.profileid = this.createNewParams.profileid;
      } else if (this.curRec !== undefined && this.curRec.profileid !== undefined) {
        this.formSave.profileid = this.curRec.profileid;
      } else {
        this.formSave.profileid = this.curProfile.profileid;
      }

      this.formSave.userid = this.RestService.userId;
      this.formSave.reason = this.card_form.get('reason').value;
      this.formSave.visitdate = this.card_form.get('visitdate').value;

      //This is the only field within the post visit section:
      console.log('Contact from promote to visit', this.contact);
      if (this.curRec !== undefined  && this.curRec.physician !== undefined) {
        this.formSave.contactid = this.curRec.physician.recordid;
      } else if (this.contact !== undefined) {
        this.formSave.contactid = this.contact.recordid;
      } else if (this.createNewParams !==undefined && this.createNewParams !==null) {
        this.formSave.contactid = this.createNewParams.contactid;
      }
      if (this.createNewParams !==undefined && this.createNewParams !==null && this.createNewParams.parentvisitid !== undefined
        && this.createNewParams.parentvisitid > 0) {
          this.formSave.parentvisitid = this.createNewParams.parentvisitid;
      }
      this.formSave.accountid = this.RestService.Profiles[0].accountid;
      if (this.curRec.scheduleinstanceid !== undefined && this.curRec.scheduleinstanceid !== null) {
        this.formSave.scheduleinstanceid = this.curRec.scheduleinstanceid;
      }
    }
    this.infos = this.card_form.get('infos') as FormArray;
    if (this.infos.dirty) {
      var impInfos: ImportantInfos = new ImportantInfos();
      var impInfo: ImportantInfo;
      var infoForm;
      console.log('formVisit Save - infos dirty', this.selectedItems);
      impInfos.items = [];
      for (var j = 0; j < this.infos.length; j++) {
        infoForm = this.infos.at(j) as FormGroup;
        if (infoForm.dirty) {
          impInfo = {
            recordid: infoForm.get("recordid").value,
            namevalue: infoForm.get("namevalue").value,
            dateofmeasure: infoForm.get("dateofmeasure").value,
            reftable: infoForm.get("reftable").value,
            reftablefield: infoForm.get("reftablefield").value,
            reftablefieldid: infoForm.get("reftablefieldid").value,
            reftablefields: infoForm.get("reftablefields").value,
            type: infoForm.get("type").value,
            active: 'Y',
            selected: false,
            medicaleventid: null,
          }
          impInfos.items.push(impInfo);
          console.log('formVisit - impInfo, ', impInfo);
        } else {
          console.log('InfoForm not dirty')
        }
      }
      this.formSave.importantinfo = impInfos;
    } else {
      console.log('formVisit Save - infos not dirty');
    }
    this.todos = this.card_form.get('todos') as FormArray;
    if (this.todos.dirty) {
      var impTodos: ToDos = new ToDos();
      var impTodo: ToDo;
      var todoForm;
      console.log('formVisit Save - todos dirty');
      impTodos.items = [];
      for (j = 0; j < this.todos.length; j++) {
        todoForm = this.todos.at(j) as FormGroup;
        if (todoForm.dirty) {
          impTodo = new ToDo();
          impTodo.recordid = todoForm.get("recordid").value;
          if (todoForm.get("taskname").dirty) {
            impTodo.taskname = todoForm.get("taskname").value;
          }
          if (todoForm.get("duedate").dirty) {
            impTodo.duedate = todoForm.get("duedate").value;
          }
          if (todoForm.get("completedflag").dirty) {
            if (todoForm.get("completedflag").value == true) {
              impTodo.completedflag = 'Y';
            } else {
              impTodo.completedflag = 'N';
            }
          }
          if (todoForm.get("active").dirty) {
            impTodo.active = todoForm.get("active").value;
          }
          impTodos.items.push(impTodo);
        }
      }
      this.formSave.todos = impTodos;
    } else {
      console.log('formVisit Save - todos not dirty');
    }
    this.questions = this.card_form.get('questions') as FormArray;
    if (this.questions.dirty) {
      var impQuestions: Questions = new Questions();
      var impQuestion: Question;
      var questionForm;
      console.log('formVisit Save - quest dirty');
      impQuestions.items = [];
      for (j = 0; j < this.questions.length; j++) {
        questionForm = this.questions.at(j) as FormGroup;
        if (questionForm.dirty) {
          impQuestion = new Question();
          impQuestion.recordid = questionForm.get("recordid").value;
          if (questionForm.get("question").dirty) {
            impQuestion.question = questionForm.get("question").value;
          }
          if (questionForm.get("answer").dirty) {
            impQuestion.answer = questionForm.get("answer").value;
          }
          if (questionForm.get("active").dirty) {
            impQuestion.active = questionForm.get("active").value;
          }
          impQuestions.items.push(impQuestion);
        }
      }
      this.formSave.questions = impQuestions;
    } else {
      console.log('formVisit Save - todos not dirty');
    }
      //Add visitinfos
      this.visititems = this.card_form.get('visititems') as FormArray;
      if (this.visititems.dirty) {
        var visititems: VisitItems = new VisitItems();
        var visitInfo: ImportantInfo;
        var visitForm;
        console.log('formVisit Save - infos dirty', this.selectedItems);
        visititems.items = [];
        for (j = 0; j < this.infos.length; j++) {
          visitForm = this.visititems.at(j) as FormGroup;
          if (visitForm.dirty) {
            visitInfo = {
              recordid: visitForm.get("recordid").value,
              namevalue: visitForm.get("namevalue").value,
              dateofmeasure: visitForm.get("dateofmeasure").value,
              reftable: visitForm.get("reftable").value,
              reftablefield: visitForm.get("reftablefield").value,
              reftablefieldid: visitForm.get("reftablefieldid").value,
              reftablefields: visitForm.get("reftablefields").value,
              type: visitForm.get("type").value,
              active: 'Y',
              selected: false,
              medicaleventid: null,
            }
            visititems.items.push(visitInfo);
            console.log('formVisit - visitInfo, ', visitInfo);
          } else {
            console.log('Visit Form not dirty');
          }
        }
        this.formSave.visititem = visititems;
      } else {
          console.log('formVisit Save - visitinfo not dirty');
      }
      var restURL="https://ap6oiuyew6.execute-api.us-east-1.amazonaws.com/dev/VisitByProfile";
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
        self.RestService.results = result.data;
        console.log('Happy Path: ' + self.RestService.results);
        self.category.title = "Visit";
        self.loading.dismiss();
        self.nav.pop();
      }).catch( function(result){
        console.log('Error in formVisit.save: ',result);
        self.loading.dismiss();
        alert('There was an error saving this data.  Please try again later');
      });
  }

  saveNew(){
    var dtNow = moment(new Date());
    var dtExpiration = moment(this.RestService.AuthData.expiration);
    var self = this;

    if (dtNow < dtExpiration) {
      this.presentLoadingDefault();
      this.saveNewDo();
    } else {
      this.presentLoadingDefault();
      this.RestService.refreshCredentials(function(err, results) {
        if (err) {
          console.log('Need to login again!!! - Credentials expired from ' + self.formName + '.saveNew');
          self.loading.dismiss();
          self.RestService.appRestart();
        } else {
          console.log('From ' + self.formName + '.saveNew - Credentials refreshed!');
          self.saveNewDo();
        }
      });
    }
  }

  saveNewDo(){
    this.saving = true;
    console.log('Saving new visit record on entry!');
    this.formSave.active = 'Y';
    console.log('Cur Profile: ', this.curProfile);
    this.formSave.profileid = this.curProfile.profileid;
    this.formSave.userid = this.RestService.userId;
    this.formSave.visitdate = Date();
    console.log('Contact from promote to visit', this.contact);
    this.formSave.contactid = this.contact.recordid;
    this.formSave.accountid = this.RestService.Profiles[0].accountid;

    var restURL="https://ap6oiuyew6.execute-api.us-east-1.amazonaws.com/dev/VisitByProfile";
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
      console.log('Happy Path for saveNewDo: ' + result.data);
      if (!isNaN(result.data)) {
        self.formSave.recordid = result.data;
        self.card_form.get('recordid').setValue(result.data);
        self.curRec = self.formSave;
        self.loading.dismiss();
      } else {
        console.log('***ALERT**** formVisit - SaveNewDo: not valid recordid.  Initial Save not successful');
        self.loading.dismiss();
      }
    }).catch( function(result){
      console.log('Error in formVisit.save: ',result);
      self.loading.dismiss();
      alert('There was an error saving this data.  Please try again later');
    });
  }

  addInfo() {
    var dt =  this.card_form.get('importantinfo').value;
    var self = this;
    var profileid;

    if (this.createNewParams !== undefined && this.createNewParams !== null &&  this.createNewParams.profileid > 0) {
      profileid = this.createNewParams.profileid;
    } else if (this.curRec.profileid !== undefined) {
      profileid = this.curRec.profileid;
      console.log('form visit Profile id from curRec: ' + profileid);
    } else {
      profileid =  this.curProfile.profileid;
      console.log('form visit Profile id from curProfile: ' + profileid);
    }

    let profileModal = this.modalCtrl.create(FormChooseInfo, { dataType: dt, recId: this.recId, forProfileId: profileid });
    profileModal.onDidDismiss(data => {
      if (data !==undefined && data !== null) {
        self.selectedItems = data.importantItems;
        console.log('Data from getImportantInfo data: ', data);
        console.log('Data from getImportantInfo: ', self.selectedItems);
        self.addSelectedInfos();
      }
    });
    profileModal.present();
  }

  checkReminder(index) {
    var newTask = false;
    this.syncDueDate(index);
    this.syncTaskName(index);
    var self = this;
    console.log('Item from check reminder: ', this.curRec.todos.items[index]);
    if (this.curRec.todos.items[index].recordid == undefined && this.curRec.todos.items[index].recordid == null) {
      newTask = true;
    }
    console.log('Check reminder data: recid = ' + this.recId + ", index = " + index);
    let profileModal = this.modalCtrl.create(FormChooseNotify, { recId: this.recId, todoIndex: index, object: "todo for visit" });
    profileModal.onDidDismiss(data => {
      if (data !==undefined && data !== null) {
        console.log('Data from checkReminder: ', data);
        console.log('Data index from checkReminder: ', index);
        self.curRec.todos.items[index].notifyschedule = data;
        if (newTask) {
          self.curRec.todos.items[index].recordid = self.curRec.todos.items[index].notifyschedule.taskid;
          self.todos = this.card_form.get('todos') as FormArray;
          self.todos.at(index).markAsPristine();
        }
      }
      console.log('Data from checkReminder data: ', self.curRec.todos.items[index].notifyschedule);
    });
    profileModal.present();
  }

  checkReminderPost(index) {
    var newTask = false;
    this.syncDueDatePost(index);
    this.syncTaskNamePost(index);
    var self = this;

    this.checkSave = true;
    console.log('Item from check reminder Post: ', this.postVisit[0].todopost.items[index]);
    this.curRec.todopost = this.postVisit[0].todopost;
    if (this.curRec.todopost.items[index].recordid == undefined && this.curRec.todopost.items[index].recordid == null) {
      newTask = true;
    }
    this.RestService.results[0] = this.curRec;
    index = 0;
    console.log('Check reminder data Post: recid = ' + this.recId + ", index = " + index);
    let profileModal = this.modalCtrl.create(FormChooseNotify, { recId: this.recId, todoIndex: index, object: "todo for visit post" });
    profileModal.onDidDismiss(data => {
      if (data !==undefined && data !== null) {
        console.log('Data from checkReminder: ', data);
        console.log('Data index from checkReminder: ', index);
        self.postVisit[0].todopost.items[index].notifyschedule = data;
        if (newTask) {
          self.postVisit[0].todopost.items[index].recordid = self.postVisit[0].todopost.items[index].notifyschedule.taskid;
          self.todopost = this.card_formPost.get('todopost') as FormArray;
          self.todopost.at(index).markAsPristine();
        }
      }
      console.log('Data from checkReminder data: ', self.postVisit[0].todopost.items[index].notifyschedule);
    });
    profileModal.present();
  }

  public today() {
    return new Date().toISOString().substring(0,10);
  }

  formatDateTime(dateString) {
    return moment.utc(dateString).format('MMM DD YYYY hh:mm a');
  }

  formatRealDate(dateString) {
    //alert('FormatDateTime called');
    //Date time is captured in local time for this date - must be local time display
    if (this.userTimezone !== undefined && this.userTimezone !== null && this.userTimezone !=="") {
      var offsetDate = new Date(moment(dateString).toISOString());
      var offset = offsetDate.getTimezoneOffset() / 60;
      return moment(dateString).add(offset, 'hours').format('MMM DD YYYY');
    } else {
      return moment(dateString).format('MMM DD YYYY');
    }
  }

  getRealDateTime(dateString) {
    //alert('FormatDateTime called');
    //Date time is captured in local time for this date - must be local time display
    if (this.userTimezone !== undefined && this.userTimezone !== null && this.userTimezone !=="") {
      var offsetDate = new Date(moment(dateString).toISOString());
      var offset = offsetDate.getTimezoneOffset() / 60;
      return moment(dateString).add(offset, 'hours');
    } else {
      return moment(dateString);
    }
  }

  setToPost() {
    //this.presentLoadingDefault();
    this.formSave.userid = this.RestService.currentProfile;
    var restURL="https://ap6oiuyew6.execute-api.us-east-1.amazonaws.com/dev/VisitByProfile";
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
        set2post: this.curRec.recordid
      }
    };
    var body = JSON.stringify(this.formSave);
    var self = this;
    console.log('Calling Post', this.formSave);
    apigClient.invokeApi(params, pathTemplate, method, additionalParams, body)
    .then(function(result){
      console.log('Happy Path for setToPost: ' + result.data);
      //self.loading.dismiss();
      self.push2Outcomes();
    }).catch( function(result){
      console.log('Error in setToPost: ',result);
      //self.loading.dismiss();
      alert('There was an error saving this data.  Please try again later');
      self.push2Outcomes();
    });
  }

  push2Outcomes() {
    var outcome;
    var addCount = 0;
    //var self = this;

    this.outcomes = this.card_formPost.get('outcomes') as FormArray;
    if (this.curRec.visititem !== undefined && this.curRec.visititem.items !== undefined && this.curRec.visititem.items.length > 0) {
      for (var j = 0; j < this.curRec.visititem.items.length; j++) {
        if (this.curRec.visititem.items[j].type == "procedure" || this.curRec.visititem.items[j].type == "therapy" ||
        this.curRec.visititem.items[j].type == "vaccine") {
          this.outcomes.push(this.addNewOutcomeFromVisitInfo(this.curRec.visititem.items[j]));
          outcome = this.outcomes.at(addCount) as FormGroup;
          outcome.get('reftable').markAsDirty();
          outcome.get('reftablefield').markAsDirty();
          outcome.get('reftablefieldid').markAsDirty();
          outcome.get('reftablefields').markAsDirty();
          outcome.get('type').markAsDirty();
          addCount = addCount + 1;
        }
      }
      if (addCount > 0) {
        this.navSavePostRecord(function(err, results) {
          if (err) {
            console.log('Push 2 outcome err: ', err);
            //self.loading.dismiss();
          } else {
            console.log('Push 2 outcome success: ', results);
            //self.loading.dismiss();
          }
        });
      }
    }
  }

  addNewOutcomeFromVisitInfo(objVI): FormGroup {
    return this.formBuilder.group({
      reftable: new FormControl(objVI.reftable),
      reftablefield: new FormControl(objVI.reftablefield),
      reftablefieldid: new FormControl(objVI.reftablefieldid),
      reftablefields: new FormControl(objVI.reftablefields),
      type: new FormControl(objVI.type),
      visitid: new FormControl(this.curRec.recordid),
      active: new FormControl('Y'),
      namevalue: new FormControl(objVI.namevalue),
      dateofmeasure: new FormControl(objVI.dateofmeasure),
    });
  }

  addExistingVisitInfos() {
    console.log('Start addExistingVisitInfos - visititems: ', this.curRec.visititem);
    this.visititems = this.card_form.get('visititems') as FormArray;
    if (this.curRec.visititem !== undefined && this.curRec.visititem.items !== undefined && this.curRec.visititem.items.length > 0) {
      var exitLoop = 0;
      while (this.visititems.length !== 0 || exitLoop > 9) {
        this.visititems.removeAt(0);
        exitLoop = exitLoop + 1;
      }
      for (var j = 0; j < this.curRec.visititem.items.length; j++) {
        console.log('In addExistingVisitInfos loop ' + j);
        this.visitItemArray.items.push(this.curRec.visititem.items[j]);
        this.visititems.push(this.addExistingVisitInfo(j));
      }
      if (this.transfer2Post) {
        console.log('transfer2post - true1.  Calling setToPost' );
        this.setToPost();
      } else {
        console.log('transfer2post - false 1.' );
      }
    } else if (this.transfer2Post) {
      console.log('transfer2post - true2.  Calling setToPost' );
      this.setToPost();
    } else {
      console.log('transfer2post - false 2.' );
    }
  }

  addExistingVisitInfo(index): FormGroup {
    return this.formBuilder.group({
      recordid: new FormControl(this.curRec.visititem.items[index].recordid),
      namevalue: new FormControl(this.curRec.visititem.items[index].namevalue),
      dateofmeasure: new FormControl(this.formatDateTime(this.curRec.visititem.items[index].dateofmeasure)),
      reftable: new FormControl(this.curRec.visititem.items[index].reftable),
      reftablefield: new FormControl(this.curRec.visititem.items[index].reftablefield),
      reftablefieldid: new FormControl(this.curRec.visititem.items[index].reftablefieldid),
      reftablefields: new FormControl(this.curRec.visititem.items[index].reftablefields),
      type: new FormControl(this.curRec.visititem.items[index].type),
      active: new FormControl(this.curRec.visititem.items[index].active),
    });
  }

  addExistingInfos() {
    this.infos = this.card_form.get('infos') as FormArray;
    if (this.curRec.importantinfo !== undefined && this.curRec.importantinfo.items !== undefined && this.curRec.importantinfo.items.length > 0) {
      var exitLoop = 0;
      while (this.infos.length !== 0 || exitLoop > 9) {
        this.infos.removeAt(0);
        exitLoop = exitLoop + 1;
      }
      for (var j = 0; j < this.curRec.importantinfo.items.length; j++) {
        this.importantInfos.items.push(this.curRec.importantinfo.items[j]);
        this.infos.push(this.addExistingInfo(j));
      }
    }
  }

  addExistingInfo(index): FormGroup {
    return this.formBuilder.group({
      recordid: new FormControl(this.curRec.importantinfo.items[index].recordid),
      namevalue: new FormControl(this.curRec.importantinfo.items[index].namevalue),
      dateofmeasure: new FormControl(this.formatDateTime(this.curRec.importantinfo.items[index].dateofmeasure)),
      reftable: new FormControl(this.curRec.importantinfo.items[index].reftable),
      reftablefield: new FormControl(this.curRec.importantinfo.items[index].reftablefield),
      reftablefieldid: new FormControl(this.curRec.importantinfo.items[index].reftablefieldid),
      reftablefields: new FormControl(this.curRec.importantinfo.items[index].reftablefields),
      type: new FormControl(this.curRec.importantinfo.items[index].type),
      active: new  FormControl(this.curRec.importantinfo.items[index].active),
    });
  }

  addSelectedInfos() {
    var startCount = 0;
    var rowCount;
    this.infos = this.card_form.get('infos') as FormArray;
    console.log('Entered addSelectedInfos', this.selectedItems.items);
    if (this.selectedItems.items !== undefined  && this.selectedItems.items.length > 0) {
      console.log('Entered addSelectedInfos - has data');
      if (this.iiBlankAdded) {
        this.infos.removeAt(0);
        this.iiBlankAdded = false;
      }
      if (this.infos.length > 0) {
        startCount = this.infos.length;
      }
      console.log(this.infos.length);
      for (var j = 0; j < this.selectedItems.items.length; j++) {
        this.importantInfos.items.push(this.selectedItems.items[j]);
        this.infos.push(this.addSelectedInfo(j));
        rowCount = startCount + j;
        this.infos.at(rowCount).markAsDirty();
      }
    } else {
      console.log ('No data in selected items - addSelected Infos');
    }
  }

  addSelectedInfo(index): FormGroup {
    return this.formBuilder.group({
      recordid: new FormControl(this.selectedItems.items[index].recordid),
      namevalue: new FormControl(this.selectedItems.items[index].namevalue),
      dateofmeasure: new FormControl(this.formatDateTime(this.selectedItems.items[index].dateofmeasure)),
      reftable: new FormControl(this.selectedItems.items[index].reftable),
      reftablefield: new FormControl(this.selectedItems.items[index].reftablefield),
      reftablefieldid: new FormControl(this.selectedItems.items[index].reftablefieldid),
      reftablefields: new FormControl(this.selectedItems.items[index].reftablefields),
      type: new FormControl(this.selectedItems.items[index].type),
      active: new FormControl(this.selectedItems.items[index].active),
    });
  }

  createItem(): FormGroup {
    this.iiBlankAdded = true;
    return this.formBuilder.group({
      recordid: new FormControl(),
      namevalue: new FormControl(),
      dateofmeasure: new FormControl(),
      reftable: new FormControl(),
      reftablefield: new FormControl(),
      reftablefieldid: new FormControl(),
      reftablefields: new FormControl(),
      type: new FormControl(),
      active: new  FormControl('Y'),
    });
  }

  addItem(): void {
    this.infos = this.card_form.get('infos') as FormArray;
    this.infos.push(this.createItem());
    this.iiBlankAdded = true;
  }

  addQuestion(): void {
    this.questions = this.card_form.get('questions') as FormArray;
    this.questions.push(this.createQuestion());
  }

  createQuestion(): FormGroup {
    return this.formBuilder.group({
      recordid: new FormControl(),
      question: new FormControl(),
      answer: new FormControl(),
      active: new  FormControl('Y'),
    });
  }

  addExistingQuestions() {
    this.questions = this.card_form.get('questions') as FormArray;
    if (this.curRec.questions !== undefined && this.curRec.questions.items !== undefined && this.curRec.questions.items.length > 0) {
      var exitLoop = 0;
      while (this.questions.length !== 0 || exitLoop > 9) {
        this.questions.removeAt(0);
        exitLoop = exitLoop + 1;
      }
      for (var j = 0; j < this.curRec.questions.items.length; j++) {
        this.questions.push(this.addExistingQuestion(j));
      }
    }
  }

  addExistingQuestion(index): FormGroup {
    return this.formBuilder.group({
      recordid: new FormControl(this.curRec.questions.items[index].recordid),
      question: new FormControl(this.curRec.questions.items[index].question),
      answer: new FormControl(this.curRec.questions.items[index].answer),
      active: new  FormControl(this.curRec.questions.items[index].active),
    });
  }

  addTodo(): void {
    this.todos = this.card_form.get('todos') as FormArray;
    this.todos.push(this.createTodo());
  }

  createTodo(): FormGroup {
    var dtNow = new Date();
    return this.formBuilder.group({
      recordid: new FormControl(),
      taskname: new FormControl(),
      duedate: new FormControl(dtNow.toISOString()),
      completedflag: new FormControl(),
      active: new  FormControl('Y'),
    });
  }

  addExistingTodos() {
    this.todos = this.card_form.get('todos') as FormArray;
    if (this.curRec.todos !== undefined && this.curRec.todos.items !== undefined && this.curRec.todos.items.length > 0) {
      var exitLoop = 0;
      while (this.todos.length !== 0 || exitLoop > 9) {
        this.todos.removeAt(0);
        exitLoop = exitLoop + 1;
      }
      for (var j = 0; j < this.curRec.todos.items.length; j++) {
        this.todos.push(this.addExistingTodo(j));
      }
    }
  }

  addExistingTodo(index): FormGroup {
    var selected = false;
    if (this.curRec.todos.items[index].completedflag == 'Y') {
      selected = true;
    }
    return this.formBuilder.group({
      recordid: new FormControl(this.curRec.todos.items[index].recordid),
      taskname: new FormControl(this.curRec.todos.items[index].taskname),
      duedate: new FormControl(this.curRec.todos.items[index].duedate),
      completedflag: new FormControl(selected),
      active: new  FormControl(this.curRec.todos.items[index].active),
    });
  }

  addDiagnosis(): void {
    this.diagnoses = this.card_form.get('diagnoses') as FormArray;
    this.diagnoses.push(this.createDiagnosis());
  }

  createDiagnosis(): FormGroup {
    return this.formBuilder.group({
      recordid: new FormControl(),
      medicalevent: new FormControl(),
      resolved: new FormControl(),
      active: new  FormControl('Y'),
    });
  }

  addExistingDiagnoses() {
    var hasTreat = false;
    var hasSympTreat = false;
    var sympTreatCount = 0;
    var varTreat = new Treatment();
    var treatments = [];
    var exitLoop = 0;

    this.diagnoses = this.card_formPost.get('diagnoses') as FormArray;
    if (this.postVisit !== undefined && this.postVisit[0] !== undefined && this.postVisit[0].diagnoses !== undefined
      && this.postVisit[0].diagnoses.length > 0) {
      exitLoop = 0;
      while (this.diagnoses.length !== 0 || exitLoop > 9) {
        this.diagnoses.removeAt(0);
        exitLoop = exitLoop + 1;
      }
      for (var j = 0; j < this.postVisit[0].diagnoses.length; j++) {
        hasTreat = false;
        hasSympTreat = false;
        sympTreatCount = 0;
        treatments = [];
        this.diagnoses.push(this.addExistingDiagnosis(j));
        if (this.postVisit[0].diagnoses[j].treatments !== undefined && this.postVisit[0].diagnoses[j].treatments.items.length > 0) {
          hasTreat = true;
          console.log('Has Treat: ' + hasTreat + ' for diagnosis ' + j +', treatment count: ' + this.postVisit[0].diagnoses[j].treatments.items.length);
          for (var k = 0; k < this.postVisit[0].diagnoses[j].treatments.items.length; k++) {
            varTreat = new Treatment();
            varTreat = this.postVisit[0].diagnoses[j].treatments.items[k];
            varTreat.indication = this.postVisit[0].diagnoses[j].medicalevent;
            treatments.push(varTreat);
          }

        }
        if (this.postVisit[0].diagnoses[j].symptoms !== undefined && this.postVisit[0].diagnoses[j].symptoms.items.length > 0) {
          for (k = 0; k < this.postVisit[0].diagnoses[j].symptoms.items.length; k++) {
            if (this.postVisit[0].diagnoses[j].symptoms.items[k].treatments !== undefined && this.postVisit[0].diagnoses[j].symptoms.items[k].treatments.items.length > 0) {
              hasSympTreat = true;
              for (var l = 0; l < this.postVisit[0].diagnoses[j].symptoms.items[k].treatments.items.length; l++) {
                varTreat = new Treatment();
                varTreat = this.postVisit[0].diagnoses[j].symptoms.items[k].treatments.items[l];
                varTreat.indication = this.postVisit[0].diagnoses[j].symptoms.items[k].full_symptom;
                console.log('Symptom with treatment: ', this.postVisit[0].diagnoses[j].symptoms.items[k]);
                treatments.push(varTreat);
                sympTreatCount = sympTreatCount + 1;
              }
            }
          }
          if (hasSympTreat) {
            console.log('Has Symp Treat: ' + hasSympTreat + ', treatment count: ' + sympTreatCount);
          }
        }
        if (hasTreat || hasSympTreat) {
          console.log('Treatments generated for : ' + this.postVisit[0].diagnoses[j].medicalevent + ': ', treatments);
          this.addTreatments4Diagnosis(j, treatments);
        }
      }
    } else if (this.diagnoses.length > 0) {
      exitLoop = 0;
      while (this.diagnoses.length !== 0 || exitLoop > 9) {
        this.diagnoses.removeAt(0);
        exitLoop = exitLoop + 1;
      }
    }
  }

  addExistingDiagnosis(index): FormGroup {
    return this.formBuilder.group({
      recordid: new FormControl({value: this.postVisit[0].diagnoses[index].recordid, disabled: true}),
      parenteventid: new FormControl({value: this.postVisit[0].diagnoses[index].parenteventid, disabled: true}),
      medicalevent: new FormControl({value: this.postVisit[0].diagnoses[index].medicalevent, disabled: true}),
      onsetdate: new FormControl({value: this.postVisit[0].diagnoses[index].onsetdate, disabled: true}),
      active: new  FormControl({value: this.postVisit[0].diagnoses[index].active, disabled: true}),
      treatments: this.formBuilder.array([]),
    });
  }

  addTreatments4Diagnosis(index, objTreat) {
    var diagnoses = this.card_formPost.get('diagnoses') as FormArray;
    var diagnosis  = diagnoses.at(index) as FormGroup;
    var treatments = diagnosis.get('treatments') as FormArray;

    for (var j = 0; j < objTreat.length; j++) {
      treatments.push(this.addTreatment4Diagnosis(objTreat[j]));
    }
  }

  addTreatment4Diagnosis(objTreat): FormGroup {
    return this.formBuilder.group({
      recordid: new FormControl({value: objTreat.recordid, disabled: true}),
      reftable: new FormControl({value: objTreat.reftable, disabled: true}),
      reftablefield: new FormControl({value: objTreat.reftablefield, disabled: true}),
      reftablefieldid: new FormControl({value: objTreat.reftablefieldid, disabled: true}),
      reftablefields: new FormControl({value: objTreat.reftablefields, disabled: true}),
      type: new FormControl({value: objTreat.type, disabled: true}),
      namevalue: new FormControl({value: objTreat.namevalue, disabled: true}),
      indication: new FormControl({value: objTreat.indication, disabled: true}),
      dateofmeasure: new FormControl({value: objTreat.dateofmeasure, disabled: true}),
    });
  }

  updateDiagnosis(index) {
    var cat = {title: 'Diagnosis'};
    this.RestService.results = this.postVisit[0].diagnoses;
    var symptomsNotChosen = [];
    var symptomNotChosen;

    this.checkSave = true;
    if (!this.symptomCheck) {
      this.alignSymptoms();
    }

    console.log('UpdateDiagnosis - curRec', this.curRec);
    if (this.curRec !== undefined && this.curRec.importantinfo !== undefined && this.curRec.importantinfo.items !== undefined) {
      console.log('UpdateDiagnosis - importantInfo', this.curRec.importantinfo.items);
      for (var j = 0; j < this.curRec.importantinfo.items.length; j++) {
        if (this.curRec.importantinfo.items[j].type == 'symptom' && (this.curRec.importantinfo.items[j].medicaleventid == undefined ||
          this.curRec.importantinfo.items[j].medicaleventid == null )) {
            symptomNotChosen = {
              recordid: this.curRec.importantinfo.items[j].reftablefieldid,  //translating from importantinfo paradigm to actual symptom record
              namevalue: this.curRec.importantinfo.items[j].namevalue,
              dateofmeasure: this.formatDateTime(this.curRec.importantinfo.items[j].dateofmeasure),
            }
            symptomsNotChosen.push(symptomNotChosen);
          }
      }
    }

    this.nav.push(FormMedicalEvent, { recId: index, category: cat, symptomsNotChosen: symptomsNotChosen, visit: this.curRec});
    //console.log('Index: ' + index);
  }

  addExistingOutcomes() {
    var exitLoop = 0;

    this.outcomes = this.card_formPost.get('outcomes') as FormArray;
    if (this.postVisit !== undefined && this.postVisit[0] !== undefined && this.postVisit[0].outcomes !== undefined
      && this.postVisit[0].outcomes.items !== undefined && this.postVisit[0].outcomes.items.length > 0) {
        exitLoop = 0;
        while (this.outcomes.length !== 0 || exitLoop > 9) {
          this.outcomes.removeAt(0);
          exitLoop = exitLoop + 1;
        }
        for (var j = 0; j < this.postVisit[0].outcomes.items.length; j++) {
          this.outcomes.push(this.addExistingOutcome(j));
        }
    } else if (this.outcomes.length > 0) {
      exitLoop = 0;
      while (this.outcomes.length !== 0 || exitLoop > 9) {
        this.outcomes.removeAt(0);
        exitLoop = exitLoop + 1;
      }
    }
  }

  addExistingOutcome(index): FormGroup {
    return this.formBuilder.group({
      recordid: new FormControl({value: this.postVisit[0].outcomes.items[index].recordid, disabled: true}),
      visitid: new FormControl({value: this.postVisit[0].outcomes.items[index].visitid, disabled: true}),
      reftable: new FormControl({value: this.postVisit[0].outcomes.items[index].reftable, disabled: true}),
      reftablefield: new  FormControl({value: this.postVisit[0].outcomes.items[index].reftablefield, disabled: true}),
      reftablefieldid: new FormControl({value: this.postVisit[0].outcomes.items[index].reftablefieldid, disabled: true}),
      reftablefields: new FormControl({value: this.postVisit[0].outcomes.items[index].reftablefields, disabled: true}),
      type: new FormControl({value: this.postVisit[0].outcomes.items[index].type, disabled: true}),
      namevalue: new FormControl({value: this.postVisit[0].outcomes.items[index].namevalue, disabled: true}),
      dateofmeasure: new FormControl({value: this.postVisit[0].outcomes.items[index].dateofmeasure, disabled: true}),
      active: new FormControl({value: this.postVisit[0].outcomes.items[index].active, disabled: true}),
    });
  }

  addExistingPayments() {
    this.payments = this.card_formPost.get('payments') as FormArray;
    if (this.postVisit !== undefined && this.postVisit[0] !== undefined && this.postVisit[0].payments !== undefined
      && this.postVisit[0].payments.items !== undefined && this.postVisit[0].payments.items.length > 0) {
        var exitLoop = 0;
        while (this.payments.length !== 0 || exitLoop > 9) {
          this.payments.removeAt(0);
          exitLoop = exitLoop + 1;
        }
      for (var j = 0; j < this.postVisit[0].payments.items.length; j++) {
        this.payments.push(this.addExistingPayment(j));
      }
    }
  }

  addExistingPayment(index): FormGroup {
    return this.formBuilder.group({
      recordid: new FormControl({value: this.postVisit[0].payments.items[index].recordid, disabled: true}),
      visitid: new FormControl({value: this.postVisit[0].payments.items[index].visitid, disabled: true}),
      reftable: new FormControl({value: this.postVisit[0].payments.items[index].reftable, disabled: true}),
      reftablefield: new  FormControl({value: this.postVisit[0].payments.items[index].reftablefield, disabled: true}),
      reftablefieldid: new FormControl({value: this.postVisit[0].payments.items[index].reftablefieldid, disabled: true}),
      reftablefields: new FormControl({value: this.postVisit[0].payments.items[index].reftablefields, disabled: true}),
      type: new FormControl({value: this.postVisit[0].payments.items[index].type, disabled: true}),
      payment: new FormControl({value: this.postVisit[0].payments.items[index].payment, disabled: true}),
      paymentdescription: new FormControl({value: this.postVisit[0].payments.items[index].paymentdescription, disabled: true}),
      bucketid: new FormControl({value: this.postVisit[0].payments.items[index].bucketid, disabled: true}),
      active: new FormControl({value: this.postVisit[0].payments.items[index].active, disabled: true}),
    });
  }

  addExistingTodoPosts() {
    this.todopost = this.card_formPost.get('todopost') as FormArray;
    if (this.postVisit[0].todopost !== undefined && this.postVisit[0].todopost.items !== undefined && this.postVisit[0].todopost.items.length > 0) {
      var exitLoop = 0;
      while (this.todopost.length !== 0 || exitLoop > 9) {
        this.todopost.removeAt(0);
        exitLoop = exitLoop + 1;
      }
      for (var j = 0; j < this.postVisit[0].todopost.items.length; j++) {
        this.todopost.push(this.addExistingTodoPost(j));
      }
    }
  }

  addExistingTodoPost(index): FormGroup {
    var selected = false;
    if (this.postVisit[0].todopost.items[index].completedflag == 'Y') {
      selected = true;
    }
    return this.formBuilder.group({
      recordid: new FormControl(this.postVisit[0].todopost.items[index].recordid),
      taskname: new FormControl(this.postVisit[0].todopost.items[index].taskname),
      duedate: new FormControl(this.postVisit[0].todopost.items[index].duedate),
      completedflag: new FormControl(selected),
      active: new  FormControl(this.postVisit[0].todopost.items[index].active),
    });
  }

  addTodoPost(): void {
    this.todopost = this.card_formPost.get('todopost') as FormArray;
    this.todopost.push(this.createTodoPost());
  }

  createTodoPost(): FormGroup {
    var dtNow = new Date();
    return this.formBuilder.group({
      recordid: new FormControl(),
      taskname: new FormControl(),
      duedate: new FormControl(dtNow.toISOString()),
      completedflag: new FormControl(),
      active: new  FormControl('Y'),
    });
  }

  setChecked(index) {
    var todoArray: FormArray;
    var todo: FormGroup;

    todoArray = this.card_form.get('todos') as FormArray;
    todo = todoArray.at(index) as FormGroup;
    if (todo.get("completedflag").value) {
      this.curRec.todos.items[index].completedflag = 'Y';
    } else {
      this.curRec.todos.items[index].completedflag = 'N';
    }
  }

  isComplete(index) {
    if (this.curRec.todos !== undefined) {
      if (this.curRec.todos.items[index] !== undefined) {
        if (this.curRec.todos.items[index].completedflag == 'Y') {
          return true;
        } else {
          return false;
        }
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  pastDue(index) {
    var dtNow = new Date();
    var dtTarget;
    if (this.curRec.todos !== undefined) {
      if (this.curRec.todos.items[index] !== undefined) {
        dtTarget = new Date(this.curRec.todos.items[index].duedate);
        var timedifference = new Date().getTimezoneOffset();
        timedifference = timedifference/60;
        dtNow.setHours(dtNow.getHours() - timedifference);
        if (dtNow > dtTarget) {
          return true;
        } else {
          return false;
        }
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  notReady(index) {
    if (this.curRec.todos !== undefined) {
      if (this.curRec.todos.items[index] !== undefined) {
        if (this.curRec.todos.items[index].taskname !== undefined && this.curRec.todos.items[index].taskname !== null && this.curRec.todos.items[index].taskname !== "" &&
          this.curRec.todos.items[index].duedate !== undefined && this.curRec.todos.items[index].duedate !== null && this.curRec.todos.items[index].duedate !== "") {
          return false;
        } else {
          return true;
        }
      } else {
        return true;
      }
    } else {
      return true;
    }
  }

  syncTaskName(index) {
    var todoArray = this.card_form.get('todos') as FormArray;
    var todo = todoArray.at(index) as FormGroup;
    var todoObj: ToDo  = new ToDo;
    if (todo.get("taskname").value !==null && todo.get("taskname").value !=="") {
      if (this.curRec.todos !== undefined) {
        console.log('todos: ', this.curRec.todos);
        if (this.curRec.todos.items[index] !== undefined) {
          if (todo.get("taskname").value !== this.curRec.todos.items[index].taskname) {
            this.curRec.todos.items[index].taskname = todo.get("taskname").value;
          }
        } else {
          todoObj.taskname = todo.get("taskname").value;
          this.curRec.todos.items.push(todoObj);
        }
      } else {
        todoObj.taskname = todo.get("taskname").value;
        this.curRec.todos = new ToDos();
        this.curRec.todos.items = [];
        this.curRec.todos.items.push(todoObj);
      }
    }
  }

  syncDueDate(index) {
    var todoArray = this.card_form.get('todos') as FormArray;
    var todo = todoArray.at(index) as FormGroup;
    var todoObj: ToDo  = new ToDo;
    if (todo.get("duedate").value !==null && todo.get("duedate").value !=="") {
      if (this.curRec.todos !== undefined) {
        console.log('todos: ', this.curRec.todos);
        if (this.curRec.todos.items[index] !== undefined) {
          if (todo.get("duedate").value !== this.curRec.todos.items[index].duedate) {
            this.curRec.todos.items[index].duedate = todo.get("duedate").value;
          }
        } else {
          todoObj.duedate = todo.get("duedate").value;
          this.curRec.todos.items.push(todoObj);
        }
      } else {
        todoObj.duedate = todo.get("duedate").value;
        this.curRec.todos = new ToDos();
        this.curRec.todos.items = [];
        this.curRec.todos.items.push(todoObj);
      }
    }
  }

  setCheckedPost(index) {
    var todoArray: FormArray;
    var todo: FormGroup;

    todoArray = this.card_formPost.get('todopost') as FormArray;
    todo = todoArray.at(index) as FormGroup;
    if (todo.get("completedflag").value) {
      this.postVisit[0].todopost.items[index].completedflag = 'Y';
    } else {
      this.postVisit[0].todopost.items[index].completedflag = 'N';
    }
  }

  isCompletePost(index) {
    if (this.postVisit !== undefined && this.postVisit[0] !== undefined && this.postVisit[0].todos !== undefined) {
      if (this.postVisit[0].todopost.items[index] !== undefined) {
        if (this.postVisit[0].todopost.items[index].completedflag == 'Y') {
          return true;
        } else {
          return false;
        }
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  pastDuePost(index) {
    var dtNow = new Date();
    var dtTarget;
    if (this.postVisit !== undefined && this.postVisit[0] !== undefined && this.postVisit[0].todopost !== undefined) {
      if (this.postVisit[0].todopost.items[index] !== undefined) {
        dtTarget = new Date(this.postVisit[0].todopost.items[index].duedate);
        var timedifference = new Date().getTimezoneOffset();
        timedifference = timedifference/60;
        dtNow.setHours(dtNow.getHours() - timedifference);
        if (dtNow > dtTarget) {
          return true;
        } else {
          return false;
        }
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  notReadyPost(index) {
    if (this.postVisit !== undefined && this.postVisit[0] !== undefined && this.postVisit[0].todopost !== undefined) {
      if (this.postVisit[0].todopost.items[index] !== undefined) {
        if (this.postVisit[0].todopost.items[index].taskname !== undefined && this.postVisit[0].todopost.items[index].taskname !== null && this.postVisit[0].todopost.items[index].taskname !== "" &&
        this.postVisit[0].todopost.items[index].duedate !== undefined && this.postVisit[0].todopost.items[index].duedate !== null && this.postVisit[0].todopost.items[index].duedate !== "") {
          return false;
        } else {
          return true;
        }
      } else {
        return true;
      }
    } else {
      return true;
    }
  }

  syncTaskNamePost(index) {
    var todoArray = this.card_formPost.get('todopost') as FormArray;
    var todo = todoArray.at(index) as FormGroup;
    var todoObj: ToDo  = new ToDo;
    if (todo.get("taskname").value !==null && todo.get("taskname").value !=="") {
      if (this.postVisit !== undefined && this.postVisit[0] !== undefined && this.postVisit[0].todopost !== undefined) {
        console.log('todos: ', this.postVisit[0].todopost);
        if (this.postVisit[0].todopost.items[index] !== undefined) {
          if (todo.get("taskname").value !== this.postVisit[0].todopost.items[index].taskname) {
            this.postVisit[0].todopost.items[index].taskname = todo.get("taskname").value;
          }
        } else {
          todoObj.taskname = todo.get("taskname").value;
          this.postVisit[0].todopost.items.push(todoObj);
        }
      } else {
        todoObj.taskname = todo.get("taskname").value;
        this.postVisit[0].todopost = new ToDos();
        this.postVisit[0].todopost.items = [];
        this.postVisit[0].todopost.items.push(todoObj);
      }
    }
  }

  syncDueDatePost(index) {
    var todoArray = this.card_formPost.get('todopost') as FormArray;
    var todo = todoArray.at(index) as FormGroup;
    var todoObj: ToDo  = new ToDo;
    if (todo.get("duedate").value !==null && todo.get("duedate").value !=="") {
      if (this.postVisit !== undefined && this.postVisit[0] !== undefined && this.postVisit[0].todopost !== undefined) {
        console.log('todopost: ', this.postVisit[0].todopost);
        if (this.postVisit[0].todopost.items[index] !== undefined) {
          if (todo.get("duedate").value !== this.postVisit[0].todopost.items[index].duedate) {
            this.postVisit[0].todopost.items[index].duedate = todo.get("duedate").value;
          }
        } else {
          todoObj.duedate = todo.get("duedate").value;
          this.postVisit[0].todopost.items.push(todoObj);
        }
      } else {
        todoObj.duedate = todo.get("duedate").value;
        this.postVisit[0].todopost = new ToDos();
        this.postVisit[0].todopost.items = [];
        this.postVisit[0].todopost.items.push(todoObj);
      }
    }
  }

  categoryEmpty() {
    if (this.card_form.get('importantinfo').value !== undefined &&  this.card_form.get('importantinfo').value !== null) {
      this.card_form.get('importantinfo').markAsPristine();
      return false;
    } else {
      return true;
    }
  }

  yetToHappen() {
    var dtNow = moment(new Date());
    var dtVisit;

    if (this.curRec !== undefined && this.curRec.visitdate !== undefined) {
      dtVisit = moment(this.curRec.visitdate);
      if (dtNow > dtVisit) {
        return false;
      } else {
        return true;
      }
    } else {
      return true;
    }
  }

  async ionViewCanLeave() {
    if (!this.saving && this.card_formPost.dirty && this.checkSave ) {
      const shouldLeave = await this.confirmSave();
      return shouldLeave;
    } else if (!this.saving && (this.card_form.dirty || this.card_formPost.dirty)) {
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

  confirmSave(): Promise<Boolean> {
    let resolveLeaving;
    const canLeave = new Promise<Boolean>(resolve => resolveLeaving = resolve);
    const alert = this.alertCtrl.create({
      title: 'Save to Continue',
      message: 'This navigation will auto-save the current record.  Continue?',
      buttons: [
        {
          text: 'No',
          role: 'cancel',
          handler: () => {
            this.checkSave = false;
            resolveLeaving(false);
          }
        },
        {
          text: 'Yes',
          handler: () => {
            console.log('Confirm Save - Yes handle start');
            this.checkSave = false;
            //var self = this;
            this.navSavePostRecord(function(err, results) {
              if (err) {
                console.log('Err from navSavePostRecord: ', err);
                resolveLeaving(true);
              } else {
                console.log('Results from navSavePostRecord: ', results);
                resolveLeaving(true);
              }
            });
          }
        }
      ]
    });
    alert.present();
    return canLeave
  }

  presentPopover(myEvent) {
    var self = this;
    var dataObj;
    let popover = this.popoverCtrl.create(MenuVisitObjMenu);
    popover.onDidDismiss(data => {
      console.log('From popover onDismiss: ', data);
      if (data !==undefined && data !== null) {
        dataObj = data.choosePage;
        self.loadMenu(dataObj);
      }
    });
    popover.present({
      ev: myEvent
    });
  }

  loadMenu(dataObj) {
    console.log('LoadMenu dataobj: ' + dataObj);
    var createNewParams;
    var parentvisitid;
    var parentreason;
    var self = this;
    var cat;
    var profileid;

    this.confirmSaveDirect(function(err, result) {
      if (err) {
        console.log('Error in newContact.confirmSaveDirect' + err);
        alert('There is an error in saving the record from newContact');
      } else {
        if (result) {
          if (dataObj == 'lab') {
            alert('Coming soon.  This will allow you to add and view labs/lab panels performed at this visit.');
          } else if (dataObj == 'visit') {
            cat = {title: 'Select Heathcare Provider'};

            if (self.curRec.parentvisitid !== undefined && self.curRec.parentvisitid !== null) {
              parentvisitid = self.curRec.parentvisitid;
              parentreason = self.curRec.parentreason + " " + self.formatDateTime(self.curRec.parentdate);
            } else {
              parentvisitid = self.curRec.recordid;
              parentreason = self.curRec.reason + " " + self.formatDateTime(self.curRec.visitdate);
            }

            profileid = self.curRec.profileid;
            createNewParams = {
              'profileid':profileid,
              'parentvisitid': parentvisitid,
              'parentreason':parentreason
            }

            let profileModal = self.modalCtrl.create(ListContactPage, { category: cat, aboutProfile: profileid });
            profileModal.onDidDismiss(data => {
              if (data !==undefined && data !== null) {
                console.log('newContact - response: ', data);
                createNewParams.contactid = data.recordid;
                createNewParams.title = data.title;
                createNewParams.firstname = data.firstname;
                createNewParams.lastname = data.lastname;

                self.nav.push(FormVisitPage, {createNewParams: createNewParams});
              } else {
                console.log('User cancelled select physician for follow-up visit');
              }
            });
            profileModal.present();
          }
        }
      }
    });
  }

  presentOutcome(myEvent) {
    var self = this;
    var dataObj;
    let popover = this.popoverCtrl.create(MenuVisitOutcome);
    popover.onDidDismiss(data => {
      console.log('From popover onDismiss: ', data);
      if (data !==undefined && data !== null) {
        dataObj = data.choosePage;
        self.loadOutcome(dataObj);
      }
    });
    popover.present({
      ev: myEvent
    });
  }

  confirmSaveDirect(callback) {
    const alert = this.alertCtrl.create({
      title: 'Save to Continue',
      message: 'This navigation will auto-save the current record.  Continue?',
      buttons: [
        {
          text: 'No',
          role: 'cancel',
          handler: () => {
            this.checkSave = false;
            callback(null, false);
          }
        },
        {
          text: 'Yes',
          handler: () => {
            console.log('Confirm Save - Yes handle start');
            this.checkSave = false;
            var self = this;
            this.navSavePostRecord(function(err, results) {
              if (err) {
                console.log('Err from navSavePostRecord: ', err);
                callback(err, false);
              } else {
                console.log('Results from navSavePostRecord: ', results);
                if (self.newRec) {
                  //var medicalevent = self.eventTerm;
                  self.curRec = {recordid: results};
                  self.loadFromId = results;
                  //console.log('new Medical Condition record: ', self.curRec);
                } else {
                  self.loadFromId = self.curRec.recordid;
                }
                callback(null, true);
              }
            });
          }
        }
      ]
    });
    if (!this.saving && this.card_form.dirty && this.checkSave) {
      alert.present();
    } else {
      this.loadFromId = this.curRec.recordid;
      callback(null, true);
    }
  }

  confirmSaveDirectPre(callback) {
    const alert = this.alertCtrl.create({
      title: 'Save to Continue',
      message: 'This navigation will auto-save the current record.  Continue?',
      buttons: [
        {
          text: 'No',
          role: 'cancel',
          handler: () => {
            this.checkSave = false;
            callback(null, false);
          }
        },
        {
          text: 'Yes',
          handler: () => {
            console.log('Confirm Save - Yes handle start');
            this.checkSave = false;
            var self = this;
            this.navSaveRecord(function(err, results) {
              if (err) {
                console.log('Err from navSaveRecord: ', err);
                callback(err, false);
              } else {
                console.log('Results from navSaveRecord: ', results);
                self.loadFromId = self.curRec.recordid;
                callback(null, true);
              }
            });
          }
        }
      ]
    });
    if (!this.saving && this.card_form.dirty && this.checkSave) {
      alert.present();
    } else {
      this.loadFromId = this.curRec.recordid;
      callback(null, true);
    }
  }

  loadOutcome(dataObj) {
    this.checkSave = true;
    var self = this;
    var cat;

    this.confirmSaveDirect(function(err, result) {
      if (err) {
        console.log('Error in addSymptom.confirmSaveDirect' + err);
        alert('There is an error in saving the medication record from addSymptom');
      } else {
        if (result) {
          console.log('Result from formVisit.confirmSaveDirect: ', result);
          if (dataObj == 'procedure') {
            cat = {title: 'Procedure'};
            self.curRec.mode = 'outcome';
            self.nav.push(FormProcedure, {category: cat, fromVisit: self.curRec});
          } else if (dataObj == 'therapy') {
            cat = {title: 'Therapy'};
            self.curRec.mode = 'outcome';
            self.nav.push(FormTherapy, {category: cat, fromVisit: self.curRec});
          }
        } else if (!result) {
          console.log('formVisit.ConfirmSaveDirect - User cancelled');
        }
      }
    });

    //alert('Coming soon.  This button will allow you to add procedures and vaccines with occurred from this visit');
    console.log('LoadMenu dataobj: ' + dataObj);
  }

  presentVisitItem(myEvent) {
    var self = this;
    var dataObj;
    let popover = this.popoverCtrl.create(MenuVisitItem);
    popover.onDidDismiss(data => {
      console.log('From popover onDismiss: ', data);
      if (data !==undefined && data !== null) {
        dataObj = data.choosePage;
        self.loadVisitItem(dataObj);
      }
    });
    popover.present({
      ev: myEvent
    });
  }

  loadVisitItem(dataObj) {
    //console.log('LoadVisitItem dataobj: ' + dataObj);
    this.checkSave = true;
    var cat;
    var self = this;

    this.confirmSaveDirectPre(function(err, result) {
      if (err) {
        console.log('Error in addSymptom.confirmSaveDirect' + err);
        alert('There is an error in saving the visit record from loadVisitItem');
      } else {
        if (result) {
          console.log('Result from loadVisitItem: ', result);
          if (dataObj == 'procedure') {
            cat = {title: 'Procedure'};
            self.curRec.mode = 'visitinfo';
            let profileModal = self.modalCtrl.create(FormProcedure, { category: cat,fromVisit: self.curRec });
            profileModal.onDidDismiss(data => {
              if (data !==undefined && data !== null) {
                console.log('Data from loadVisitItem - procedure: ', data);
                self.visititems = self.card_form.get('visititems') as FormArray;
                self.visititems.push(self.addNewVisitInfo(data));
              }
            });
            profileModal.present();
          } else if (dataObj == 'vaccine') {
            //alert('Add new vaccine');
            cat = {title: 'Select Vaccine'};
            self.curRec.mode = 'visitinfo';
            let profileModal = self.modalCtrl.create(ListChooseVaccine, { category: cat, fromVisit: self.curRec });
            profileModal.onDidDismiss(data => {
              if (data !==undefined && data !== null) {
                console.log('Data from loadVisitItem - vaccine: ', data);
                self.visititems = self.card_form.get('visititems') as FormArray;
                var vaccineinfo = {
                  namevalue: data.vaccinename,
                  type: 'vaccine',
                  dateofmeasure: data.visitdate
                }
                self.visititems.push(self.addNewVisitInfo(vaccineinfo));
              }
            });
            profileModal.present();
          } else if (dataObj == 'lab') {
            alert('Coming Soon!  This will allow you to choose the lab/lab panel which will be performed at this visit.');
          } else if (dataObj == 'therapy') {
            cat = {title: 'Therapy'};
            self.curRec.mode = 'visitinfo';
            let profileModal = self.modalCtrl.create(FormTherapy, { category: cat,fromVisit: self.curRec });
            profileModal.onDidDismiss(data => {
              if (data !==undefined && data !== null) {
                console.log('Data from loadVisitItem - therapy: ', data);
                self.visititems = self.card_form.get('visititems') as FormArray;
                self.visititems.push(self.addNewVisitInfo(data));
              }
            });
            profileModal.present();
          }
        } else if (!result) {
          console.log('formVisit.ConfirmSaveDirect - User cancelled');
        }
      }
    });
  }

  addNewVisitInfo(data): FormGroup {
    return this.formBuilder.group({
      namevalue: new FormControl(data.namevalue),
      type: new FormControl(data.type),
      dateofmeasure: new FormControl(this.formatDateTime(data.dateofmeasure)),
    });
  }

  addNewDiagnosis(): void {
    //this.RestService.results = this.curRec.occupations.items;
    //console.log('Opening form Medical Event from addNewDiagnosis');
    if (!this.symptomCheck) {
      this.alignSymptoms();
    }
    this.checkSave = true;

    var cat = {title: 'Diagnosis'};
    this.nav.push(FormMedicalEvent, { visit: this.curRec, category: cat});
  }

  //MM 2-18-19 This function will add the medical event id from any symptom which has been already assigned to a medicalevent within the post visit object
  //to the visitInfo object which gets passed in the FormMedicalEvent.  Any symptoms not already assigned will appear by default onto the new MedicalEvent form.
  alignSymptoms() {
    if (this.postVisit !== undefined && this.postVisit[0].diagnoses !== undefined && this.postVisit[0].diagnoses.length > 0 && this.curRec !== undefined
      && this.curRec.importantinfo !== undefined && this.curRec.importantinfo.items.length > 0) {
      for (var j = 0; j < this.postVisit[0].diagnoses.length; j++) {
        if (this.postVisit[0].diagnoses[j].symptoms !== undefined && this.postVisit[0].diagnoses[j].symptoms.items.length > 0) {
          //console.log('Symptoms for index ' + j + ' = ' + this.postVisit[0].diagnoses[j].symptoms.items.length);
          for (var k = 0; k < this.postVisit[0].diagnoses[j].symptoms.items.length; k++) {
            //console.log('k loop: ' + k, this.postVisit[0].diagnoses[j].symptoms.items[k]);
            for (var l = 0; l < this.curRec.importantinfo.items.length; l++) {
              //console.log('For l: ' + l + ', type = ' + this.curRec.importantinfo.items[l].type);
              //console.log('For l: ' + l + ', fieldid = ' + this.curRec.importantinfo.items[l].reftablefieldid);
              //console.log('For j: ' + j + ', k = ' + k + ', recordid = ' + this.postVisit[0].diagnoses[j].symptoms.items[k].recordid);

              if (this.curRec.importantinfo.items[l].type == 'symptom' && this.curRec.importantinfo.items[l].reftablefieldid == this.postVisit[0].diagnoses[j].symptoms.items[k].recordid){
                //console.log('Found symptom l = ' + l + ', k = ' + k);
                //console.log('Medicaleventid: = ' + this.postVisit[0].diagnoses[j].symptoms.items[k].medicaleventid + 'index l = ' + l + ', k = ' + k);
                if (this.postVisit[0].diagnoses[j].symptoms.items[k].medicaleventid !== undefined && this.postVisit[0].diagnoses[j].symptoms.items[k].medicaleventid !== null) {
                  this.curRec.importantinfo.items[l].medicaleventid = this.postVisit[0].diagnoses[j].symptoms.items[k].medicaleventid;
                  //console.log('Added medicaleventid');
                }
              }
            }
          }
        } else {
          //console.log('No symptoms for index ' + j);
        }
      }
    } else {
      this.symptomCheck = true;
      //console.log('Align Symptoms fall through');
    }
  }

  updateTreatment(parentIndex, index) {
    console.log('updateTreatment parentIndex: ' + parentIndex + ', index: ' + index);
    console.log('updateTreatment treatment obj: ', this.postVisit[0].diagnoses[parentIndex].treatments.items);
    //var objType = this.postVisit[0].diagnoses[parentIndex].treatments.items[index].type;
    //var objRecordid = this.postVisit[0].diagnoses[parentIndex].treatments.items[index].reftablefieldid;
    var cat;
    var diagnoses = this.card_formPost.get('diagnoses') as FormArray;
    var treatments =  diagnoses.at(parentIndex).get('treatments') as FormArray;

    var objType = treatments.at(index).get('type').value;
    var objRecordid = treatments.at(index).get('reftablefieldid').value;
    //console.log('treatment Obj: ', this.postVisit[0].diagnoses[parentIndex].treatments.items[index]);
    //console.log('objType from updateTreatment: ' + objType + ', Comparison: ' + objType2);
    //console.log('objType from updateTreatment: ' + objRecordid + ', Comparison: ' + objRecordid2);
    this.checkSave = true;
    if (objType == 'medication') {
      cat = {title: 'Medication'};
      this.nav.push(FormMedication, { loadFromId: objRecordid, category: cat, fromEvent: true });
    } else if  (objType == 'procedure') {
      cat = {title: 'Procedure'};
      this.nav.push(FormProcedure, { loadFromId: objRecordid, category: cat, fromVisit: this.curRec });
    } else if  (objType == 'therapy') {
      cat = {title: 'Therapy'};
      this.nav.push(FormTherapy, { loadFromId: objRecordid, category: cat, fromVisit: this.curRec });
    }
  }

  checkDate() {
    if (this.card_form.get("visitdate").value !== undefined && this.card_form.get("visitdate").value !== null) {
      this.hasDate = true;
      console.log('has date: true');
    } else {
      this.hasDate = false;
      console.log('has date: false');
    }
  }

  updateOutcome(index) {
    var cat;

    var outcomes = this.card_formPost.get('outcomes') as FormArray;
    var objType = outcomes.at(index).get('type').value;
    var objRecordid = outcomes.at(index).get('reftablefieldid').value;

    if (objType == 'procedure') {
      cat = {title: 'Procedure'};
      this.nav.push(FormProcedure, { loadFromId: objRecordid, category: cat, fromVisit: this.curRec });
    } else if (objType == 'therapy') {
      cat = {title: 'Therapy'};
      this.nav.push(FormTherapy, { loadFromId: objRecordid, category: cat, fromVisit: this.curRec });
    } else if (objType == 'vaccine') {
      cat = {title: 'Vaccine'};
      this.nav.push(FormVaccinesPage, { loadFromId: objRecordid, category: cat, fromVisit: this.curRec });
    }
  }

  addNewPayment() {
    alert('Coming soon.  This button will allow you to add payment information to help manage out-of-pocket and deductable spend');
  }

  attachRecord() {
    alert('Coming soon.  This button will allow you to attach pictures and documents (e.g. PDFs) of physical medical records');
  }

  presentLoadingDefault() {
    if (this.loading == undefined || this.loading == null) {
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
    } else {
      console.log('loading existing', this.loading);
    }
  }

}
