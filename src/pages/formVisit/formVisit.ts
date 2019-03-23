import { Component } from '@angular/core';
import { NavController, NavParams, AlertController, ModalController, LoadingController, PopoverController } from 'ionic-angular';
import { Validators, FormGroup, FormControl, FormArray,  FormBuilder, FormsModule } from '@angular/forms';
import { RestService } from '../../app/services/restService.service';
import { HistoryItemModel } from '../../pages/history/history.model';
import { FormChooseInfo } from '../../pages/formChooseInfo/formChooseInfo';
import { ListVisit, ImportantInfo, ImportantInfos, ToDos, Question, Questions } from '../../pages/listVisit/listVisit.model';
import { FormChooseNotify } from '../../pages/formChooseNotify/formChooseNotify';
import { ToDo } from '../../pages/listVisit/listVisit.model';
import { MenuVisitOutcome } from '../../pages/menuVisitOutcome/menuVisitOutcome';
import { MenuVisitObjMenu } from '../../pages/menuVisitObjMenu/menuVisitObjMenu';
//import { ListLabsPage } from '../../pages/listLabs/listLabs';
//mport { FormLabsPage } from '../../pages/formLabs/formLabs';
//import { ListVisitPage } from '../../pages/listVisit/listVisit';
//import { ListVaccinesPage } from '../../pages/listVaccines/listVaccines';
//import { FormVaccinesPage } from '../../pages/formVaccines/formVaccines';
import { FormMedication } from '../../pages/formMedication/formMedication';
import { FormMedicalEvent } from '../../pages/formMedicalEvent/formMedicalEvent';
import { PostVisitModel, Treatment, PostVisit } from './postVisit.model';
import { PostVisitService } from './postVisit.service';

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
  formSave: ListVisit = new ListVisit();
  postSave: PostVisit = new PostVisit();
  category: HistoryItemModel = new HistoryItemModel();
  userTimezone: any;
  categories_checkbox_open: boolean;
  categories_checkbox_result;
  needNew: boolean = false;
  pastVisit: boolean = false;

  constructor(public nav: NavController, public alertCtrl: AlertController, public RestService:RestService, public modalCtrl: ModalController,
    public navParams: NavParams, public formBuilder: FormBuilder, public categoryList: FormsModule, public popoverCtrl:PopoverController,
    public list2Service: PostVisitService, public loadingCtrl: LoadingController) {
    this.recId = navParams.get('recId');
    this.curRec = RestService.results[this.recId];
    console.log('formVisit - initial recId: ', this.recId);
    console.log('formVisit - initial curRec: ', this.curRec);
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
    this.categoryList = 'pre';
    var self = this;
    this.momentNow = moment(new Date());
    this.RestService.curProfileObj(function (error, results) {
      if (!error) {
        self.userTimezone = results.timezone;
        self.curProfile = results;
      }
    });

    if (this.recId !== undefined) {
      this.card_form = new FormGroup({
        recordid: new FormControl(this.curRec.recordid),
        visitdate: new FormControl(this.curRec.visitdate, Validators.required),
        firstname: new FormControl(this.curRec.firstname),
        physiciantitle: new FormControl(this.curRec.physician.title),
        reason: new FormControl(this.curRec.reason),
        infos: this.formBuilder.array([]),
        questions: this.formBuilder.array([]),
        todos: this.formBuilder.array([]),
        importantinfo: new FormControl(),
        profileid: new FormControl(this.curRec.profileid),
        userid: new FormControl(this.RestService.userId),
      });
      if (this.momentNow > moment(this.curRec.visitdate)) {
        this.categoryList = 'post';
        this.pastVisit = true;
        console.log('It is after the visit! - momentNow = ' + this.momentNow);
      } else {
        console.log('It is before the visit!');
      }
      this.addExistingInfos();
      this.addExistingQuestions();
      this.addExistingTodos();
    } else {
      this.newRec = true;
      var title = null;
      var firstNameVal = null;
      if (this.contact !==undefined && this.contact !==null) {
        title = this.contact.title;
        console.log('contact title from init: ' + this.contact.title);
      }
      if (this.curProfile !==undefined && this.curProfile !==null) {
        firstNameVal = this.curProfile.title;
        console.log("curProfile: ", this.curProfile);
      }
      this.card_form = new FormGroup({
        recordid: new FormControl(),
        visitdate: new FormControl(null, Validators.required),
        firstname: new FormControl(firstNameVal),
        physiciantitle: new FormControl(title),
        reason: new FormControl(),
        infos: this.formBuilder.array([]),
        questions: this.formBuilder.array([]),
        todos: this.formBuilder.array([]),
        importantinfo: new FormControl(),
        profileid: new FormControl(),
        userid: new FormControl(),
      });

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
    var additionalParams = {
        queryParams: {
            visitid: this.curRec.recordid
        }
    };
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
        console.log('formVisit todopost dirty: ', this.formSave.todopost);
      } else {
        console.log('formVisit.postsave - todopost not dirty');
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
      if (this.curRec !== undefined && this.curRec.profileid !== undefined) {
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
            recordid: this.importantInfos.items[j].recordid,
            namevalue: this.importantInfos.items[j].namevalue,
            dateofmeasure: this.importantInfos.items[j].dateofmeasure,
            reftable: this.importantInfos.items[j].reftable,
            reftablefield: this.importantInfos.items[j].reftablefield,
            reftablefieldid: this.importantInfos.items[j].reftablefieldid,
            reftablefields: this.importantInfos.items[j].reftablefields,
            type: this.importantInfos.items[j].type,
            active: 'Y',
            selected: false,
            medicaleventid: null,
          }
          impInfos.items.push(impInfo);
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
      console.log('formVisit Save - quest not dirty');
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
    if (this.curRec.profileid !== undefined) {
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

  addExistingInfos() {
    this.infos = this.card_form.get('infos') as FormArray;
    if (this.curRec.importantinfo !== undefined && this.curRec.importantinfo.items !== undefined && this.curRec.importantinfo.items.length > 0) {
      var exitLoop = 0;
      while (this.infos.length !== 0 || exitLoop > 9) {
        this.infos.removeAt(0);
        exitLoop = exitLoop + 1;
      }
/*
      if (this.iiBlankAdded) {
        this.infos.removeAt(0);
        this.iiBlankAdded = false;
        console.log('Flipped iiBlank from AddExistingInfos');
      }
*/
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

    this.nav.push(FormMedicalEvent, { recId: index, category: cat, symptomsNotChosen: symptomsNotChosen});
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
    if (dataObj == 'lab') {

    } else if (dataObj == 'visit') {

    }
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

  loadOutcome(dataObj) {
    this.checkSave = true;
    alert('Coming soon.  This button will allow you to add procedures and vaccines with occurred from this visit');
    console.log('LoadMenu dataobj: ' + dataObj);
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
    }
  }

  updateOutcome(index) {
    alert('Coming soon.  This button will allow you update the outcome information');
  }

  addNewPayment() {
    alert('Coming soon.  This button will allow you to add payment information to help manage out-of-pocket and deductable spend');
  }

  attachRecord() {
    alert('Coming soon.  This button will allow you to attach pictures and documents (e.g. PDFs) of physical medical records');
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
