import { Component, ViewChild } from '@angular/core';
import { NavController, LoadingController, Platform, ModalController, Events, PopoverController, Content } from 'ionic-angular';
import { FeedPage } from '../feed/feed';
import 'rxjs/Rx';
import { ListingModel } from './listing.model';
import { ListingService } from './listing.service';
import { RestService } from '../../app/services/restService.service';
import { ListOrderPage } from '../listOrder/listOrder';
import { ListGoalProgressPage } from '../listGoalProgress/listGoalProgress';
import { ListExercisePage } from '../listExercise/listExercise';
import { ListSleepPage } from '../listSleep/listSleep';
import { ListMeasurePage } from '../listMeasure/listMeasure';
import { ListNutritionPage } from '../listNutrition/listNutrition';
import { ListVisitPage } from '../listVisit/listVisit';
import { ListMedicationPage } from '../listMedication/listMedication';
import { ListAlertPage } from '../listAlert/listAlert';
import { LocalNotifications } from '@ionic-native/local-notifications';
import { Chart } from 'chart.js';
import { PhotoLibrary } from '@ionic-native/photo-library';
import { Camera, CameraOptions } from '@ionic-native/camera';
import { HttpClient} from '@angular/common/http';
import { File } from '@ionic-native/file';
import { MenuDynamic } from '../../pages/menuDynamic/menuDynamic';
import { ListGoalsModel } from '../../pages/listGoals/listGoals.model';
import { ListGoalsService } from '../../pages/listGoals/listGoals.service';
import { FormMessage } from '../../pages/formMessage/formMessage';
import * as ChartAnnotation from 'chartjs-plugin-annotation';

var moment = require('moment-timezone');

@Component({
  selector: 'listing-page',
  templateUrl: 'listing.html',
})
export class ListingPage {
  @ViewChild('lineCanvas') lineCanvas;
  @ViewChild(Content) content: Content;
  listing: ListingModel = new ListingModel();
  loading: any;
  formName: string = "today";
  curUser: any;
  lineChart: any;
  myphoto:any;
  blnShowFeed: boolean = false;
  hasNotifications: boolean = false;
  hasSubscriptions: boolean = true;
  notifyCount: number = 0;
  subscriptionCount: number = 1;
  loadDataDone: boolean = false;
  curChart: string = "Metric";
  curUnit: string = "Unit";
  showGraph: boolean = true;
  list2: ListGoalsModel = new ListGoalsModel();
  className: string = '';
  chartData: any;
  chartLabel: any;
  offsetStr: any;
  timezone: any;
  listingUserId: any;
  firstTimeLoaded: boolean = false;
  loadChartObj: any;
  saveChartData: boolean = false;
  backgroundColor: any = ["rgba(255, 99, 132, 0.2)","rgba(255, 159, 64, 0.2)","rgba(255, 205, 86, 0.2)",
                          "rgba(138, 199, 166, 0.2)","rgba(54, 162, 235, 0.2)","rgba(153, 102, 255, 0.2)","rgba(59, 3, 25, 0.2)"];
  borderColor: any = ["rgb(255, 99, 132)","rgb(255, 159, 64)","rgb(255, 205, 86)","rgb(138, 199, 166)",
                          "rgb(54, 162, 235)","rgb(153, 102, 255)","rgb(59, 3, 25)"];

  constructor(
    public nav: NavController,
    public listingService: ListingService,
    public list2Service: ListGoalsService,
    public loadingCtrl: LoadingController,
    public RestService:RestService,
    private platform: Platform,
    private localNotifications: LocalNotifications,
    public events: Events,
    private photoLibrary: PhotoLibrary,
    private camera: Camera,
    private http: HttpClient,
    private file: File,
    public popoverCtrl:PopoverController,
    public modalCtrl: ModalController
  ) {
    var self = this;
    this.platform.ready().then((rdy) => {
      self.localNotifications.on('click').subscribe((notification)  => {
        //console.log("notification id from click event " + notification.id);
        if (notification.data.secret == 'scheduleinstance') {
          //console.log('Click Notification - state of nav: ', self.nav);
          alert("Please go to the Visit tile and schedule this appointment");
        }
      });
    });

    this.photoLibrary.requestAuthorization().then(() => {
      this.photoLibrary.getLibrary().subscribe({
        next: library => {
          library.forEach(function(libraryItem) {
            console.log(libraryItem.id);          // ID of the photo
            console.log(libraryItem.photoURL);    // Cross-platform access to photo
            console.log(libraryItem.thumbnailURL);// Cross-platform access to thumbnail
            console.log(libraryItem.fileName);
            console.log(libraryItem.width);
            console.log(libraryItem.height);
            console.log(libraryItem.creationDate);
            console.log(libraryItem.latitude);
            console.log(libraryItem.longitude);
            console.log(libraryItem.albumIds);    // array of ids of appropriate AlbumItem, only of includeAlbumsData was used
          });
        },
        error: err => { console.log('could not get photos' + err); },
        complete: () => { console.log('done getting photos'); }
      });
    })
    .catch(err => console.log('permissions weren\'t granted ' + err));
  }

  ionViewWillEnter() {
    var dtNow = moment(new Date());
    var dtExpiration = moment(this.RestService.AuthData.expiration);
    var self = this;

    if (this.listing.categories !== undefined && this.listing.categories.length > 0) {
      //Resetting Medicine tile title
      this.listing.categories[6].title = 'Medicine';
      this.listing.categories[1].title = 'Achieve';
    }

    //Baseline notification counts based on RestService.notifyCount which is set in the listAlert page loaded at app start
    if (self.RestService.notifyCount > 0) {
      self.notifyCount =  self.RestService.notifyCount;
      self.hasNotifications = true;
    } else {
      self.notifyCount = 0;
      self.hasNotifications = false;
    }

    //if expired - refresh token
    if (dtNow > dtExpiration) {
      this.presentLoadingDefault();
      this.RestService.refreshCredentials(function(err, results) {
        if (err) {
          console.log('Need to login again!!! - Credentials expired from history');
          self.loading.dismiss();
          self.RestService.appRestart();
        } else {
          console.log('From history - Credentials refreshed!');
          self.loading.dismiss();
        }
      });
    } else if (self.listingUserId !== self.RestService.userId) {
      self.ionViewDidLoad();
    }
  }

  ionViewDidLoad() {
    //this.presentLoadingDefault();
    this.listingService
      .getData()
      .then(data => {
        this.listing.banner_image = data.banner_image;
        this.listing.banner_title = data.banner_title;
        this.listing.categories = data.categories;
        var self = this;

        let namedChartAnnotation = ChartAnnotation;
        namedChartAnnotation["id"]="annotation";
        Chart.pluginService.register( namedChartAnnotation);

        //*************ADD CODE TO GET TIMEZONE FROM DEVICE ************************************** */
        this.RestService.curUserObj(function (error, results) {
          if (!error) {
            self.curUser = results;
            console.log('Initial curUser', self.curUser);
            self.listingUserId = self.RestService.userId;
            if (!self.firstTimeLoaded) {
              self.RestService.currentProfile = self.RestService.userId;
            }
            if (self.curUser.timezone !== undefined && self.curUser.timezone !== null) {
              self.offsetStr = moment().tz(self.curUser.timezone).format('Z');
              self.timezone = self.curUser.timezone;
              console.log ('listing.ionLoad offsetStr: ', self.offsetStr);
            } else {
              self.timezone = "UTC";
              self.offsetStr = "+00:00";
            }
            console.log ('listing.ionLoad background color: ', self.backgroundColor);
            self.firstTimeLoaded = true;
            if (self.curUser.chart !== undefined && self.curUser.chart !== null) {
              self.loadChartObj = {
                chart: self.curUser.chart,
                chartunit: self.curUser.chartunit,
                offset: self.offsetStr
              }
              self.loadData();
            } else {
              self.loadChartObj = {
                chart: 'sleep',
                chartunit: 'week',
                offset: self.timezone
              }
              self.saveChartData = true;
              self.loadData();
              /*
              self.lineChart = new Chart(self.lineCanvas.nativeElement, {
                type: 'bar',
                data: {
                    labels: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
                    toollabels: ["Sep 8", "Sep 9", "Sep 10", "Sep 11", "Sep 12", "Sep 13", "Sep 14"],
                    datasets: [
                        {
                          label: "Default Chart",
                          backgroundColor: ["rgba(255, 99, 132, 0.2)","rgba(255, 159, 64, 0.2)","rgba(255, 205, 86, 0.2)",
                          "rgba(138, 199, 166, 0.2)","rgba(54, 162, 235, 0.2)","rgba(153, 102, 255, 0.2)","rgba(59, 3, 25, 0.2)"],
                          borderColor: ["rgb(255, 99, 132)","rgb(255, 159, 64)","rgb(255, 205, 86)","rgb(138, 199, 166)",
                          "rgb(54, 162, 235)","rgb(153, 102, 255)","rgb(59, 3, 25)"],
                          borderWidth: 1,
                          data: [7, 7, 7, 7, 7, 7, 7, 7],
                        }
                    ]
                  },
                  options: {
                    legend: { display: false },
                    title: {
                      display: true,
                      text: 'Default data'
                    },
                    responsive: true,
                    scales: {
                        yAxes: [{
                            ticks: {
                                beginAtZero: true
                            }
                        }]
                    },
                    tooltips: {
                      callbacks: {
                          title: function(tooltipItem, data) {
                              var label = data.toollabels[tooltipItem[0].index];
                              return label;
                          },
                          label: function(tooltipItem, data) {
                            //console.log('tipItem label: ', tooltipItem);
                            var label = 'Hours of sleep: ' + tooltipItem.yLabel;
                            return label;
                          }
                      }
                    }
                  }
              });
              */
              //self.loadData();
            }

            //Initial setting of checked field
            for (var i = 0; i < self.RestService.Profiles.length; i++) {
              if (self.RestService.Profiles[i].profileid == self.RestService.currentProfile) {
                self.RestService.Profiles[i].checked = "checked";
                console.log('Initial User Set - i = ' + i);
              }
            }
            self.nav.push(ListAlertPage, { autoload: true });
            //console.log('Results from listing curUser usertitle: ', self.curUser);
          } else {
            console.log('Error from get curUserObj: ', error);
            self.nav.push(ListAlertPage, { autoload: true });
            self.loadData();
          }
        });
      });
  }

  public getCurrentUserName() {
    if (this.curUser !== undefined) {
      return this.curUser.title;
    } else {
      return 'Nobody';
    }
  }

  loadData() {
    this.presentLoadingDefault();

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
            profileid: this.RestService.currentProfile
        }
    };
    var body = '';
    var self = this;
    apigClient.invokeApi(params, pathTemplate, method, additionalParams, body)
    .then(function(result){
      self.list2.items = result.data;
      console.log('listing.loadData items: ', self.list2.items);
      if (self.curUser.chart !== undefined && self.curUser.chart !== null) {
        self.loadDataDone = true;
        self.loadChartData();
      } else {
        self.loadDataDone = true;
        self.loading.dismiss();
      }
    }).catch( function(result){
      if (self.curUser.chart !== undefined && self.curUser.chart !== null) {
        self.loadDataDone = true;
        self.loadChartData();
      } else {
        console.log(result);
        self.loadDataDone = true;
        self.loading.dismiss();
      }
    });
  }

  changePicture(index) {
    const s3 = new this.RestService.AWS.S3({
      signatureVersion: 'v4',
    });
    console.log('ChangePicture index: ' + index + ', name: ' + this.RestService.Profiles[index].title);
    //alert('ChangePicture called!');
    const options: CameraOptions = {
      quality: 70,
      destinationType: this.camera.DestinationType.FILE_URI,
      sourceType: this.camera.PictureSourceType.PHOTOLIBRARY,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE,
      saveToPhotoAlbum:false,
      allowEdit:true,
      targetWidth:300,
      targetHeight:300
    }

    var self = this;
    this.camera.getPicture(options).then((imageData) => {
      // imageData is either a base64 encoded string or a file URI
      // If it's base64:
      this.myphoto = 'data:image/jpeg;base64,' + imageData;
      this.presentLoadingDefault();

      var strKey = this.RestService.Profiles[0].accountid + "/" + this.RestService.Profiles[index].profileid + "/profilepic.jpeg";
      var params = {Bucket: 'logoshealthuserdata', Key: strKey, Expires: 3600, ContentType: 'image/jpeg'};
      s3.getSignedUrl('putObject', params, function (err, url) {
        if (err) {
          console.log('Err in getSignedUrl from getUserPics: ' + err);
          alert('Err in getSignedUrl from getUserPics for: ' + strKey + ', ' + err);
        } else {
          self.file.resolveLocalFilesystemUrl(imageData).then(oneFile => {
            var directory = self.file.tempDirectory;
            if (directory == null) {
              //for Android
              directory = oneFile.nativeURL;
              var n = directory.lastIndexOf("/");
              directory = directory.substring(0, n);
              //directory = "file:///storage/emulated/0/Android/data/healthcare.logos.visual/cache/";
            }

            self.file.readAsArrayBuffer(directory, oneFile.name).then(realFile => {
              self.http.put(url, realFile)
              .subscribe((data) => {
                self.loading.dismiss();
                  alert("Profile image upload successfully!");
                  self.savePicRecord(index);
                }, (err) => {
                  self.loading.dismiss();
                  alert("Upload error: " + JSON.stringify(err, Object.getOwnPropertyNames(err)));
              });
            }, (err) => {
              self.loading.dismiss();
              alert('read as array buffer err: ' + JSON.stringify(err));
            });
          }, (err) => {
            self.loading.dismiss();
            alert('resolve local filesystem err: ' + JSON.stringify(err));
          });
        }
      });
      //alert('Photo data: ' + imageData);
    }, (err) => {
      self.loading.dismiss();
      alert('Photo data err: ' + err);
      // Handle error
    });

  }

  savePicRecord(index) {
    var dtNow = moment(new Date());
    var dtExpiration = moment(this.RestService.AuthData.expiration);
    var self = this;

    if (dtNow < dtExpiration) {
      this.savePicRecordDo(index);
    } else {
      this.presentLoadingDefault();
      this.RestService.refreshCredentials(function(err, results) {
        if (err) {
          console.log('Need to login again!!! - Credentials expired from listing.savePicRecord');
          self.loading.dismiss();
          self.RestService.appRestart();
        } else {
          console.log('From listing.savePicRecord - Credentials refreshed!');
          this.savePicRecordDo(index);
        }
      });
    }
  }

  savePicRecordDo(index) {
      var restURL="https://ap6oiuyew6.execute-api.us-east-1.amazonaws.com/dev/SavePicURL";
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
              profileid: this.RestService.Profiles[index].profileid,
              userid: this.RestService.userId
          }
      };
      var body = "";
      var self = this;
     apigClient.invokeApi(params, pathTemplate, method, additionalParams, body)
      .then(function(result){
        console.log('Happy Path: ' + result.data);
        //alert('Image Profile Record Saved');
        const s3 = new self.RestService.AWS.S3({
          signatureVersion: 'v4',
        });
        var strKey = self.RestService.Profiles[index].accountid + "/" + self.RestService.Profiles[index].profileid + "/profilepic.jpeg";
        console.log('get s3 key: ' + strKey);
        var params = {Bucket: 'logoshealthuserdata', Key: strKey, Expires: 3600};
        s3.getSignedUrl('getObject', params, function (err, url) {
          if (err) {
            console.log('Err in getSignedUrl from getUserPics: ' + err);
            alert('Updated ImageURL error: ' + JSON.stringify(err) + ', key - ' + strKey);
            self.loading.dismiss();
          } else {
            self.RestService.Profiles[index].imageURL = url;
            alert('Updated ImageURL: ' + url);
            self.loading.dismiss();
          }
        });
      }).catch( function(result){
        console.log('Result for Save error: ',result);
        self.loading.dismiss();
      });
  }

  triggerAlert() {
    alert('Press event fired');
  }

  goToFeed(category: any) {
    console.log("Clicked goToFeed", category);
    if (category.title == 'Order a Meal') {
      this.nav.push(ListOrderPage, { category: category });
    } else if (category.title == 'Achieve' || category.title == 'My Tasks') {
      this.nav.push(ListGoalProgressPage, { category: category });
    } else if (category.title == 'Fitness') {
      this.nav.push(ListExercisePage, { category: category });
    } else if (category.title == 'Sleep') {
      this.nav.push(ListSleepPage, { category: category });
    } else if (category.title == 'Measure') {
      this.nav.push(ListMeasurePage, { category: category });
    } else if (category.title == 'Nutrition') {
      this.nav.push(ListNutritionPage, { category: category });
    } else if (category.title == 'Visit') {
      this.nav.push(ListVisitPage, { category: category });
    } else if (category.title == 'Medicine' || category.title == 'Current Medicine' || category.title == 'Medicine Cabinet') {
      this.nav.push(ListMedicationPage, { category: category });
    } else {
      console.log('Invalid category from listing.gotoFeed: ', category);
      if (this.blnShowFeed) {
        this.nav.push(FeedPage, { category: category });
      }
    }
  }

  showNotifications() {
    alert('Coming soon');
  }

  showSubscriptions() {
    alert('Coming soon');
  }

  setProfileID(profileID, index) {
    this.RestService.currentProfile = profileID;
    for (var i = 0; i < this.RestService.Profiles.length; i++) {
      if (i == index) {
        this.RestService.Profiles[i].checked = "checked";
      } else {
        this.RestService.Profiles[i].checked = "";
      }
    }
  }

  changeChart(myEvent) {
    var self = this;
    var range = [{recordid: 0, namevalue: 'nutrition'}, {recordid: 1, namevalue: 'sleep'}, {recordid: 2, namevalue: 'weight'}];

    var objItem;
    var title = 'Progress';
    var recCount = 4;
    var namevalue;
    var chartMenuVal;

    if (this.list2 !== undefined && this.list2.items !== undefined && this.list2.items !== null && this.list2.items.length > 0) {
      console.log('listing.changeChart list2', this.list2);
      for (var i = 0; i < this.list2.items.length; i++) {
        namevalue = this.list2.items[i].goalname;
        //namevalue = namevalue.charAt(0).toUpperCase() + namevalue.slice(1);
        objItem = {recordid: recCount, namevalue: namevalue, goalid: this.list2.items[i].recordid};
        range.unshift(objItem);
        recCount = recCount + 1;
      }
    }

    let popover = this.popoverCtrl.create(MenuDynamic, {itemList: range, title: title});
    popover.onDidDismiss(data => {
      console.log('From popover onDismiss: ', data);
      if (data !==undefined && data !== null) {
        console.log('listing.changeChart: ', data);
        console.log('listing.changeChart range: ', range);
        for (var i = 0; i < range.length; i++) {
          if (range[i].recordid == data.choosePage) {
            chartMenuVal = range[i].namevalue;
          }
        }
          console.log('listing.changeChart chartMenuVal: ', chartMenuVal);
        if (data !== undefined && data !== null) {
          if (data.choosePage > 2) {
            for (var j = 0; j < self.list2.items.length; j++) {
              if (self.list2.items[j].goalname == chartMenuVal) {
                self.loadChartObj.chart = 'goal:' + self.list2.items[j].recordid;
                self.saveChartData = true;
                self.chartLabel = chartMenuVal;
              }
            }
            console.log('Chart from Goal: ', self.loadChartObj.chart);
            self.loadChartData();
          } else {
            console.log('LoadChartObj: ', self.loadChartObj);
            if (chartMenuVal !== self.loadChartObj.chart) {
              self.loadChartObj.chart = chartMenuVal;
              self.saveChartData = true;
              self.loadChartData();
            }

          }
        }
      }
    });
    popover.present({
      ev: myEvent
    });
  }

  changeRange(myEvent) {
    var self = this;
    var range = [{recordid: 0, namevalue: 'Last Week', unit: 'week'}, {recordid: 1, namevalue: 'Last Month', unit: 'month'},
    {recordid: 2, namevalue: 'Last Quarter', unit: 'quarter'}, {recordid: 3, namevalue: 'Last Year', unit: 'year'}];
    var title = 'Range';
    var chartMenuVal;


    let popover = this.popoverCtrl.create(MenuDynamic, {itemList: range, title: title});
    popover.onDidDismiss(data => {
      console.log('From popover onDismiss: ', data);
      if (data !==undefined && data !== null) {
        console.log('listing.changeChart: ', data);
        console.log('listing.changeChart range: ', range);
        for (var i = 0; i < range.length; i++) {
          if (range[i].recordid == data.choosePage) {
            chartMenuVal = range[i].unit;
          }
        }
          console.log('listing.changeChart chartMenuVal: ', chartMenuVal);
        if (data !== undefined && data !== null) {
          if (chartMenuVal !== self.loadChartObj.chartunit) {
            self.loadChartObj.chartunit = chartMenuVal;
            self.saveChartData = true;
            self.loadChartData();
          }
        }
      }
    });
    popover.present({
      ev: myEvent
    });
  }

  loadChartData() {
    this.presentLoadingDefault();

    var restURL: string;
    restURL="https://ap6oiuyew6.execute-api.us-east-1.amazonaws.com/dev/StatsByProfile";
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
            chart: this.loadChartObj.chart,
            chartunit: this.loadChartObj.chartunit,
            offset: this.timezone,
            saveChartData: this.saveChartData,
        }
    };
    var body = '';
    var self = this;
    apigClient.invokeApi(params, pathTemplate, method, additionalParams, body)
    .then(function(result){
      self.chartData = result.data;
      self.saveChartData = false;
      self.populateGraph();
    }).catch( function(result){
      console.log(result);
      self.saveChartData = false;
      if (self.loading !== undefined && self.loading !== null) {
        self.loading.dismiss();
      }
    });
  }

  populateGraph() {
    var self = this;
    var chartType;
    var dataLabel;
    var chartTitle;
    var ttLabel;
    var chartFrags;
    var recordid;
    var curGoal;
    var goalNumber;
    var blnGoalMatch = false;
    var blnIsGoal = false;
    var bgColor = [];
    var bColor = [];

    var daysperweek;
    var goalPercent;
    var beyondWeek = false;
    var ttSplit;
    var daysDone;
    var daysTotal;
    var donePercent;
    var finalPecent;
    var finalValue;
    var goalAdjusted = [];
    var goalAdjusted2 = [];

    beyondWeek = false;
    this.curChart = this.loadChartObj.chart;
    this.curUnit = this.loadChartObj.chartunit;
    console.log('populateGraph - CharData: ', self.chartData);
    if (this.curChart.substring(0, 4) == 'goal') {
      console.log('curChart as a goal before: ' + this.curChart);
      blnIsGoal = true;
      chartFrags = this.curChart.split(':');
      recordid = chartFrags[1];
      for (var j = 0; j < this.list2.items.length; j++) {
        if (this.list2.items[j].recordid == recordid) {
          curGoal = this.list2.items[j];
          console.log('populateGraph - curGoal ', curGoal);
          daysperweek = curGoal.daysperweekvalue;
          blnGoalMatch = true;
          this.curChart = curGoal.goalname;
          goalNumber = curGoal.goalnumber;
          chartType = 'bar';
          dataLabel = curGoal.goalunitvalue + ' per Day';
          chartTitle = curGoal.goalname.charAt(0).toUpperCase() + curGoal.goalname.slice(1) + ' (' + curGoal.goalnumber + ' ' +
            ((curGoal.goalunitvalue=='Number') ? 'Reps' : curGoal.goalunitvalue) + ' - ' + curGoal.daysperweekvalue + ' days a week)';
          ttLabel =  curGoal.goalunitvalue + ': ';
        }
      }
      if (!blnGoalMatch) {
        console.log('Err - Goal not found! for ' + recordid, this.list2.items);
        this.curChart = 'Error Goal not Found!';
        chartType = 'bar';
        dataLabel = '';
        chartTitle = 'Error Goal not Found!';
        ttLabel =  '';
      } else if (self.curUnit !== undefined && self.curUnit !== undefined && self.curUnit !== 'week') {
        console.log('Has Goal and beyond week - unit = ' + self.curUnit);
        beyondWeek = true;
      }
      console.log('curChart label update after: ' + this.curChart);

    }

    if (this.loadChartObj.chart == 'sleep') {
      chartType = 'bar';
      dataLabel = 'Hours per Day';
      chartTitle = 'Hours of Sleep/Day';
      ttLabel =  'Hours of sleep: ';
    } else if (this.loadChartObj.chart == 'weight') {
      chartType = 'line';
      dataLabel = 'lbs';
      chartTitle = 'Weight (lbs)';
      ttLabel =  'Weight (lbs): ';
    } else if (this.loadChartObj.chart == 'nutrition') {
      chartType = 'bar';
      dataLabel = 'calories';
      chartTitle = 'Calories/Day';
      ttLabel =  'Calories: ';
    }

    for (var i = 0; i < self.chartData.x_labels.length; i++) {
      bgColor.push(self.backgroundColor[i % 7]);
      bColor.push(self.borderColor[i % 7]);
      if (beyondWeek) {
        console.log('Beyond Week called!');
        goalPercent = daysperweek/7;
        ttSplit = self.chartData.x_tt_labels[i].split(' ');
        daysDone = ttSplit[0];
        daysTotal = ttSplit[2];
        if (!isNaN(daysDone) && !isNaN(daysTotal)) {
          donePercent = daysDone/daysTotal;
          if (donePercent > goalPercent) {
            finalPecent = 1;
          } else {
            finalPecent = donePercent/goalPercent;
          }
          finalValue = finalPecent * self.chartData.data_values[i];
          goalAdjusted.push(finalValue);
          finalValue = self.chartData.data_values[i] - finalValue;
          goalAdjusted2.push(finalValue);
        } else {
          alert('Danger Will Robinson - daysDone = ' + daysDone + ', daysTotal = ' + daysTotal);
          console.log('Error in parsing days');
          donePercent = 0;
        }
      }
    }
    if (self.lineChart !== undefined && self.lineChart !== null) {
      self.lineChart.destroy();
    }

    if (blnIsGoal && beyondWeek) {
      console.log('Calling goal chart!');
      self.lineChart = new Chart(self.lineCanvas.nativeElement, {
        type: chartType,
        data: {
            labels: self.chartData.x_labels,
            toollabels: self.chartData.x_tt_labels,
            datasets: [
                {
                  label: dataLabel,
                  backgroundColor: bColor,
                  borderColor: bColor,
                  borderWidth: 1,
                  data: goalAdjusted,
                  stack: "S1",
                },
                {
                  label: dataLabel,
                  backgroundColor: bgColor,
                  borderColor: bColor,
                  borderWidth: 1,
                  data: goalAdjusted2,
                  stack: "S1",
                },
            ]
          },
          options: {
            legend: { display: false },
            title: {
              display: true,
              text: chartTitle
            },
            responsive: true,
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true
                    }
                }],
            },
            tooltips: {
              callbacks: {
                  title: function(tooltipItem, data) {
                    var label;
                    var percentDone;
                    //console.log('Should not be zero ' +data.datasets[0].data[tooltipItem[0].index]);
                    if (data.datasets[0].data[tooltipItem[0].index] > 0) {
                      percentDone = data.datasets[0].data[tooltipItem[0].index]/(data.datasets[0].data[tooltipItem[0].index] +
                        data.datasets[1].data[tooltipItem[0].index]);
                      percentDone = Math.round(percentDone * 100);
                    } else {
                      percentDone = 0;
                    }

                    label = data.toollabels[tooltipItem[0].index] + ' (' + percentDone + '%)';
                    return label;
                  },
                  label: function(tooltipItem, data) {
                    //console.log('tipItem label: ', tooltipItem);
                    var label;
                    var total;

                    total = data.datasets[0].data[tooltipItem.index] + data.datasets[1].data[tooltipItem.index];
                    label = ttLabel + Math.round(total);
                    return label;
                  }
              }
            },
            annotation: {
              annotations: [{
                drawTime: 'afterDraw',
                type: 'line',
                mode: 'horizontal',
                scaleID: 'y-axis-0',
                value: goalNumber,
                borderColor: 'rgb(138,199,166)',
                borderWidth: 2,
                borderDash: [2, 2],
                label: {
                  enabled: false,
                  content: goalNumber + ' ' + curGoal.goalunitvalue
                }
              }]
            }
        }
      });
    } else if (blnIsGoal) {
      console.log('Calling goal chart!');
      self.lineChart = new Chart(self.lineCanvas.nativeElement, {
        type: chartType,
        data: {
            labels: self.chartData.x_labels,
            toollabels: self.chartData.x_tt_labels,
            datasets: [
                {
                  label: dataLabel,
                  backgroundColor: bgColor,
                  borderColor: bColor,
                  borderWidth: 1,
                  data: self.chartData.data_values,
                }
            ]
          },
          options: {
            legend: { display: false },
            title: {
              display: true,
              text: chartTitle
            },
            responsive: true,
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true
                    }
                }]
            },
            tooltips: {
              callbacks: {
                  title: function(tooltipItem, data) {
                      var label = data.toollabels[tooltipItem[0].index];
                      return label;
                  },
                  label: function(tooltipItem, data) {
                    //console.log('tipItem label: ', tooltipItem);
                    var label = ttLabel + tooltipItem.yLabel;
                    return label;
                  }
              }
            },
            annotation: {
              annotations: [{
                drawTime: 'afterDraw',
                type: 'line',
                mode: 'horizontal',
                scaleID: 'y-axis-0',
                value: goalNumber,
                borderColor: 'rgb(138,199,166)',
                borderWidth: 2,
                borderDash: [2, 2],
                label: {
                  enabled: false,
                  content: goalNumber + ' ' + curGoal.goalunitvalue
                }
              }]
            }
        }
      });
    } else {
      console.log('Calling normal chart!');
      self.lineChart = new Chart(self.lineCanvas.nativeElement, {
        type: chartType,
        data: {
            labels: self.chartData.x_labels,
            toollabels: self.chartData.x_tt_labels,
            datasets: [
                {
                  label: dataLabel,
                  backgroundColor: bgColor,
                  borderColor: bColor,
                  borderWidth: 1,
                  data: self.chartData.data_values,
                }
            ]
          },
          options: {
            legend: { display: false },
            title: {
              display: true,
              text: chartTitle
            },
            responsive: true,
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true
                    }
                }]
            },
            tooltips: {
              callbacks: {
                  title: function(tooltipItem, data) {
                      var label = data.toollabels[tooltipItem[0].index];
                      return label;
                  },
                  label: function(tooltipItem, data) {
                    //console.log('tipItem label: ', tooltipItem);
                    var label = ttLabel + tooltipItem.yLabel;
                    return label;
                  }
              }
            }
          }
      });
    }
    if (self.loading !== undefined && self.loading !== null) {
      self.loading.dismiss();
    }
  }

  flipGraph() {
    var message;
    var title;

    if (this.showGraph) {
      this.showGraph = false;
      this.className = 'invisible';

      title = 'Change Chart Visibility';
      message = 'The Chart is now hidden';
      let profileModal = this.modalCtrl.create(FormMessage, { title: title, message: message });
      profileModal.onDidDismiss(data => {
        console.log('Returned from flipGraph');
      });
      profileModal.present();
    } else {
      this.showGraph = true;
      this.className = '';

      title = 'Change Chart Visibility';
      message = 'Enjoy tracking your progress!';
      let profileModal = this.modalCtrl.create(FormMessage, { title: title, message: message });
      profileModal.onDidDismiss(data => {
        console.log('Returned from flipGraph');
      });
      profileModal.present();
    }
  }

  presentLoadingDefault() {
    var self = this;
    console.log('presentLoadingDefault: ', this.loading);
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

        this.loading.onDidDismiss(() => {
          console.log('Dismissed loading');
          this.loading = null;
        });
        this.loading.present();

        setTimeout(() => {
          self.loading.dismiss();
        }, 15000);
    }
  }

}
