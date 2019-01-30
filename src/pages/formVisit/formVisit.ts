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

  diagnoses: FormArray;
  outcomes: FormArray;

  iiBlankAdded: boolean = false;
  selectedItems: ImportantInfos = new ImportantInfos();
  importantInfos: ImportantInfos = new ImportantInfos();
  formSave: ListVisit = new ListVisit();
  category: HistoryItemModel = new HistoryItemModel();
  userTimezone: any;
  categories_checkbox_open: boolean;
  categories_checkbox_result;
  needNew: boolean = false;

  constructor(public nav: NavController, public alertCtrl: AlertController, public RestService:RestService, public modalCtrl: ModalController,
    public navParams: NavParams, public formBuilder: FormBuilder, public categoryList: FormsModule, public popoverCtrl:PopoverController,
    public loadingCtrl: LoadingController) {
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

        diagnoses: this.formBuilder.array([]),
        outcomes: this.formBuilder.array([])
      });
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

        diagnoses: this.formBuilder.array([]),
        outcomes: this.formBuilder.array([])
      });
      if (this.needNew) {
        //this.saveNew();
      }
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
      this.formSave.profileid = this.curProfile.profileid;
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
      this.formSave.profileid = this.curProfile.profileid;
      this.formSave.userid = this.RestService.userId;
      this.formSave.reason = this.card_form.get('reason').value;
      this.formSave.visitdate = this.card_form.get('visitdate').value;
      console.log('Contact from promote to visit', this.contact);
      this.formSave.contactid = this.contact.recordid;
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
      for (var j = 0; j < this.todos.length; j++) {
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
      for (var j = 0; j < this.questions.length; j++) {
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

  public today() {
    return new Date().toISOString().substring(0,10);
  }

  formatDateTime(dateString) {
    if (this.userTimezone !== undefined && this.userTimezone !=="") {
      return moment(dateString).tz(this.userTimezone).format('MM-DD-YYYY hh:mm A');
    } else {
      return moment(dateString).format('MM-DD-YYYY hh:mm a');
    }
  }

  addExistingInfos() {
    this.infos = this.card_form.get('infos') as FormArray;
    if (this.curRec.importantinfo !== undefined && this.curRec.importantinfo.items !== undefined && this.curRec.importantinfo.items.length > 0) {
      if (this.iiBlankAdded) {
        this.infos.removeAt(0);
        this.iiBlankAdded = false;
        console.log('Flipped iiBlank from AddExistingInfos');
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
      this.questions.removeAt(0);
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
      this.todos.removeAt(0);
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
    this.diagnoses = this.card_form.get('diagnoses') as FormArray;
    if (this.curRec.diagnoses !== undefined && this.curRec.diagnoses.items !== undefined && this.curRec.diagnoses.items.length > 0) {
      this.diagnoses.removeAt(0);
      for (var j = 0; j < this.curRec.diagnoses.items.length; j++) {
        this.diagnoses.push(this.addExistingDiagnosis(j));
      }
    }
  }

  addExistingDiagnosis(index): FormGroup {
    return this.formBuilder.group({
      recordid: new FormControl(this.curRec.diagnoses.items[index].recordid),
      medicalevent: new FormControl(this.curRec.diagnoses.items[index].medicalevent),
      resolved: new FormControl(this.curRec.diagnoses.items[index].resolved),
      active: new  FormControl(this.curRec.diagnoses.items[index].active),
    });
  }

  updateDiagnosis(index) {
    console.log('Index: ' + index);
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

  categoryEmpty() {
    if (this.card_form.get('importantinfo').value !== undefined &&  this.card_form.get('importantinfo').value !== null) {
      this.card_form.get('importantinfo').markAsPristine();
      return false;
    } else {
      return true;
    }
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

  presentPopover(myEvent) {
    var self = this;
    var dataObj;
    let popover = this.popoverCtrl.create(MenuVisitOutcome);
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
