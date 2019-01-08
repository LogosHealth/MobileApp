import { Component } from '@angular/core';
import { NavController, NavParams, AlertController, LoadingController, ViewController } from 'ionic-angular';
import { Validators, FormGroup, FormControl } from '@angular/forms';
import { RestService } from '../../app/services/restService.service';
import { ImportantInfos, ImportantInfo } from '../../pages/listVisit/listVisit.model';
import { ListVisitService } from '../../pages/listVisit/listVisit.service';
//import { updateDate } from 'ionic-angular/umd/util/datetime-util';

var moment = require('moment-timezone');

@Component({
  selector: 'FormChooseInfo',
  templateUrl: 'formChooseInfo.html'
})
export class FormChooseInfo {
  loading: any;
  formName: string = "FormChooseInfo";
  dataType: string;
  card_form: FormGroup;
  recId: number;
  forProfileId;
  curRec: any;
  curRec2: any;
  saving: boolean = false;
  userTimezone: any;
  userUpdated: boolean = false;
  list2: ImportantInfos = new ImportantInfos();
  listSave: ImportantInfos;
  isReminder: boolean = false;

  constructor(public nav: NavController, public alertCtrl: AlertController, public RestService:RestService, public list2Service: ListVisitService,
    public navParams: NavParams, public loadingCtrl: LoadingController, public viewCtrl: ViewController) {

    this.card_form = new FormGroup({
      addNew: new FormControl(null),
    });
    this.dataType = navParams.get('dataType');
    this.recId = navParams.get('recId');
    this.forProfileId = navParams.get('forProfileId');
    console.log('FormChooseInfo - forProfileId: ' + this.forProfileId);
    this.curRec = RestService.results[this.recId];
    if (this.dataType == undefined || this.dataType == null || this.dataType == '') {
      console.log('Error in retrieving dataType for formChooseInfo');
      //Put exit form with error alert here
    }
    this.curRec2 = this.RestService.Profiles;
    console.log('Choose Profile curRec: ', this.curRec2);
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
      this.loadData(this.dataType);
    } else {
      this.presentLoadingDefault();
      this.RestService.refreshCredentials(function(err, results) {
        if (err) {
          console.log('Need to login again!!! - Credentials expired from formChooseInfo');
          self.loading.dismiss();
          self.RestService.appRestart();
        } else {
          console.log('From formChooseInfo - Credentials refreshed!');
          self.loadData(this.dataType);
        }
      });
    }
  }

  loadData(dataType) {
    var restURL: string;
    var badDataType: boolean = false;
    switch (dataType) {
      case 'condition':
        restURL="https://ap6oiuyew6.execute-api.us-east-1.amazonaws.com/dev/EventByProfile";
      break;
      case 'symptom':
        restURL="https://ap6oiuyew6.execute-api.us-east-1.amazonaws.com/dev/SymptomByProfile";
      break;
      case 'temperature':
        restURL="https://ap6oiuyew6.execute-api.us-east-1.amazonaws.com/dev/TemperatureByProfile";
      break;
      case 'mood':
        restURL="https://ap6oiuyew6.execute-api.us-east-1.amazonaws.com/dev/MoodByProfile";
      break;
      case 'reminder':
        restURL="https://ap6oiuyew6.execute-api.us-east-1.amazonaws.com/dev/ScheduleInstanceByProfile";
        this.isReminder = true;
      break;
      default:
        restURL="";
        badDataType = true;
    }
    if (!badDataType) {
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
              profileid: this.forProfileId,
              visitid: this.curRec.recordid
          }
      };
      var body = '';
      var self = this;
      var iiTransfer: ImportantInfos = new ImportantInfos();
      apigClient.invokeApi(params, pathTemplate, method, additionalParams, body)
      .then(function(result){
        if (result.data !== 'No data found') {
          iiTransfer.items = result.data;
        } else {
          iiTransfer.items = [];
        }
        self.list2Service
        .getImportantInfo()
        .then(data => {
          self.list2.items = iiTransfer.items;
          console.log('List 2 Items from formChooseInfo - Load Data: ', self.list2.items);
          for (var i = 0; i < self.list2.items.length; i++) {
            self.list2.items[i].selected = false;
          }
          if (self.loading !== undefined) {
            self.loading.dismiss();
          }
        });
      }).catch( function(result){
        self.loading.dismiss();
        console.log(body);
      });
    } else {
      console.log('Error in dataType identity for formChooseInfo');
      self.loading.dismiss();
      //Put exit form with error alert here
    }
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
          console.log('Need to login again!!! - Credentials expired from formChooseInfo.saveRecord');
          self.loading.dismiss();
          self.RestService.appRestart();
        } else {
          console.log('From formChooseInfo.saveRecord - Credentials refreshed!');
          self.saveRecordDo();
        }
      });
    }
  }

  saveRecordDo(){
    this.saving = true;
    var varIndex = 0;
    var needSave = false;
    var restURL: string;
    var saveObj;
    var saveObjs = [];
    var saveCount;
    var saveActual = 0;
    var indexes = [];
    var self = this;
    this.listSave = new ImportantInfos();
    this.listSave.items = [];

      var loopDone = false;
      for (var i = 0; i < this.list2.items.length; i++) {
        if (this.list2.items[i].selected == true) {
          //console.log('Selected list item from formChooseInfo: ', this.list2.items[i]);
          if (this.list2.items[i].reftablefieldid == undefined || this.list2.items[i].reftablefieldid == null) {
            //console.log('From formChooseInfo save - need to save new record');
            needSave = true;
            indexes[i] = varIndex;
            this.listSave.items.push(this.list2.items[i]);
            varIndex = varIndex + 1;
          } else {
            //console.log('Push Object from saveRecord list: ', this.list2.items[i]);
            this.listSave.items.push(this.list2.items[i]);
            varIndex = varIndex + 1;
          }

          if (i == this.list2.items.length - 1) {
            loopDone = true;
          }
        } else {
          if (i == this.list2.items.length - 1) {
            loopDone = true;
          }
        }
      }
      if (loopDone) {
        if (needSave) {
          var loop1Done = false;
          saveObj = {
            active: 'Y',
          };
          for (var i = 0; i < this.list2.items.length; i++) {
            if (this.list2.items[i].selected == true) {
              if (this.list2.items[i].reftablefieldid == undefined || this.list2.items[i].reftablefieldid == null) {
                switch (this.dataType) {
                  case 'condition':
                    saveObj.medicalevent = this.list2.items[i].namevalue;
                    saveObj.startdate =  this.list2.items[i].dateofmeasure;
                    saveObj.profileid = this.forProfileId;
                    saveObj.userid = this.RestService.userId;
                    saveObj.index = indexes[i];
                  break;
                  case 'symptom':
                    saveObj.symptomname = this.list2.items[i].namevalue;
                    saveObj.startdate =  this.list2.items[i].dateofmeasure;
                    saveObj.profileid = this.forProfileId;
                    saveObj.userid = this.RestService.userId;
                    saveObj.index = indexes[i];
                  break;
                  case 'temperature':
                    saveObj.temperature = this.list2.items[i].namevalue;
                    saveObj.dateofmeasure =  this.list2.items[i].dateofmeasure;
                    saveObj.profileid = this.forProfileId;
                    saveObj.userid = this.RestService.userId;
                    saveObj.index = indexes[i];
                  break;
                  case 'mood':
                    saveObj.mood = this.list2.items[i].namevalue;
                    saveObj.dateofmeasure =  this.list2.items[i].dateofmeasure;
                    saveObj.profileid = this.forProfileId;
                    saveObj.userid = this.RestService.userId;
                    saveObj.index = indexes[i];
                  break;
                }
                saveObjs.push(saveObj);
              }
            }
            if (i==this.list2.items.length-1) {
              loop1Done = true;
            }
          }
          if (loop1Done) {
            switch (this.dataType) {
              case 'condition':
                restURL="https://ap6oiuyew6.execute-api.us-east-1.amazonaws.com/dev/EventByProfile";
              break;
              case 'symptom':
                restURL="https://ap6oiuyew6.execute-api.us-east-1.amazonaws.com/dev/SymptomByProfile";
              break;
              case 'temperature':
                restURL="https://ap6oiuyew6.execute-api.us-east-1.amazonaws.com/dev/TemperatureByProfile";
              break;
              case 'mood':
                restURL="https://ap6oiuyew6.execute-api.us-east-1.amazonaws.com/dev/MoodByProfile";
              break;
              case 'reminder':
                restURL="https://ap6oiuyew6.execute-api.us-east-1.amazonaws.com/dev/ScheduleInstanceByProfile";
              break;
              default:
                restURL="";
            }
            console.log("SaveObjs from formChooseInfo - Save Objs: ", saveObjs);
            saveCount = saveObjs.length;
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
            var method = 'POST';
            var additionalParams = {
                queryParams: {
                    profileid: this.forProfileId
                }
            };
            var body = '';
            saveCount = saveObjs.length;
            for (var j = 0; j < saveObjs.length; j++) {
              body = JSON.stringify(saveObjs[j]);
              console.log('Calling Post', saveObjs[j]);
              apigClient.invokeApi(params, pathTemplate, method, additionalParams, body)
              .then(function(result){
                console.log('Result data: ', result.data);
                console.log('self list save: ', self.listSave);
                var jsonObject = JSON.parse(body);
                console.log('JSON of body: ', jsonObject);
                self.listSave.items[jsonObject.index].reftablefieldid = result.data;
                console.log('Happy Path: ', self.listSave.items[jsonObject.index]);
                saveActual = saveActual + 1;
                if (saveActual == saveCount) {
                  console.log('All new items saved from formChooseInfo save!');
                  self.loading.dismiss();
                  self.dismiss();
                }
              }).catch( function(result){
                console.log('Catch err from from formChooseInfo save: ', result);
                console.log('Catch err from from formChooseInfo save body: ', body);
                saveActual = saveActual + 1;
                if (saveActual == saveCount) {
                  console.log('All new items saved from formChooseInfo save!');
                  self.loading.dismiss();
                  self.dismiss();
                }
              });
            }
          }
        } else {
          console.log('Staged items from formChooseInfo - no save needed: ', this.listSave.items);
          this.loading.dismiss();
          this.dismiss();
        }
      }
  }

  dismiss() {
    console.log('From chooseinfo dismiss: ', this.listSave);
    let data = { 'importantItems': this.listSave };
    this.viewCtrl.dismiss(data);
  }

  formatDateTime(dateString) {
    //alert('FormatDateTime called');
    if (this.userTimezone !== undefined && this.userTimezone !=="") {
      return moment(dateString).tz(this.userTimezone).format('MM-DD-YYYY hh:mm A');
    } else {
      return moment(dateString).format('MM-DD-YYYY hh:mm a');
    }
  }

  addNew() {
    var newValue;
    var newII: ImportantInfo = new ImportantInfo();
    var curII: ImportantInfo;
    var dtNow = moment(new Date());
    var reftable;
    var reftablefield;
    var reftablefields;
    var type;

    if (this.card_form.get('addNew').value !==undefined && this.card_form.get('addNew').value !==null) {
      newValue = this.card_form.get('addNew').value;
      this.card_form.get('addNew').setValue(null);
      this.card_form.get('addNew').markAsPristine();
      if (this.list2.items !== undefined && this.list2.items.length > 0) {
        curII = this.list2.items[0];
        console.log("List2 has data: ", this.list2);
        newII = {
          'recordid': null,
          'reftable': curII.reftable,
          'reftablefield': curII.reftablefield,
          'reftablefieldid': null,
          'reftablefields': curII.reftablefields,
          'type': curII.type,
          'namevalue': newValue,
          'dateofmeasure': dtNow,
          'active': 'Y',
          'selected': true
        }
        this.list2.items.unshift(newII);
      } else {
        switch (this.dataType) {
          case 'condition':
            reftable ='medicalevent';
            reftablefield ='medicaleventid';
            reftablefields = 'medicalevent, startdate';
            type = 'condition';
          break;
          case 'symptom':
            reftable ='symptom';
            reftablefield ='symptomid';
            reftablefields = 'symptomname, startdate';
            type = 'symptom';
          break;
          case 'temperature':
            reftable ='temperature';
            reftablefield ='temperatureid';
            reftablefields = 'temperature, dateofmeasure';
            type = 'temperature';
          break;
          case 'mood':
            reftable ='mood';
            reftablefield ='moodid';
            reftablefields = 'mood, dateofmeasure';
            type = 'mood';
          break;
          case 'reminder':
            reftable ='scheduleinstance';
            reftablefield ='scheduleinstanceid';
            reftablefields = 'st.name, si.targetdate';
            type = 'reminder';
          break;
          default:
        }
        newII = {
          'recordid': null,
          'reftable': reftable,
          'reftablefield': reftablefield,
          'reftablefieldid': null,
          'reftablefields': reftablefields,
          'type': type,
          'namevalue': newValue,
          'dateofmeasure': dtNow,
          'active': 'Y',
          'selected': true
        }
        this.list2.items.push(newII);
      }
    }
  }

  noDataPresent() {
    //console.log('NoDataPresent value: ' + this.card_form.get("addNew").value);
    if (this.card_form.get("addNew").value == undefined || this.card_form.get("addNew").value == null
      || this.card_form.get("addNew").value == "") {
      //console.log('No data present');
      return true;
    } else {
      //console.log('Data present: ' + this.card_form.get("addNew").value);
      return false;
    }
  }

  isEmpty() {
    var blnEmpty = true;
    if (this.list2 !== undefined && this.list2.items !== undefined){
      for (var i = 0; i < this.list2.items.length; i++) {
        if (this.list2.items[i].selected == true) {
          blnEmpty = false;
          return blnEmpty;
        }
      }
      if (blnEmpty) {
        return blnEmpty;
      }
    } else {
      return true;
    }
  }

  cancel() {
    this.nav.pop();
  }

  selectRecord(index) {
    if (this.list2.items[index].selected) {
      this.list2.items[index].selected = false;
    } else {
      this.list2.items[index].selected = true;
    }
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
