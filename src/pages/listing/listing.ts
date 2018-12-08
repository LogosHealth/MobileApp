import { Component, ViewChild } from '@angular/core';
import { NavController, LoadingController, Platform, ModalController, Events } from 'ionic-angular';
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
import { FormChooseProfile } from '../formChooseProfile/formChooseProfile'
import { ListAlertPage } from '../listAlert/listAlert';
import { LocalNotifications } from '@ionic-native/local-notifications';
import { Chart } from 'chart.js';
import { PhotoLibrary } from '@ionic-native/photo-library';
import { Camera, CameraOptions } from '@ionic-native/camera';
import { HttpClient} from '@angular/common/http';
import { File } from '@ionic-native/file';

var moment = require('moment-timezone');

@Component({
  selector: 'listing-page',
  templateUrl: 'listing.html',
})
export class ListingPage {
  @ViewChild('lineCanvas') lineCanvas;
  listing: ListingModel = new ListingModel();
  loading: any;
  curUser: any;
  userCount: number = 0;
  lineChart: any;
  myphoto:any;

  constructor(
    public nav: NavController,
    public listingService: ListingService,
    public loadingCtrl: LoadingController,
    public RestService:RestService,
    private platform: Platform,
    private localNotifications: LocalNotifications,
    public events: Events,
    private photoLibrary: PhotoLibrary,
    private camera: Camera,
    private http: HttpClient,
    private file: File,
    public modalCtrl: ModalController
  ) {
    var self = this;
    this.platform.ready().then((rdy) => {
      this.loading = this.loadingCtrl.create();
      self.localNotifications.on('click').subscribe((notification)  => {
        console.log("notification id from click event " + notification.id);
        if (notification.data.secret == 'scheduleinstance') {
          console.log('Click Notification - state of nav: ', self.nav);
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

    if (dtNow < dtExpiration) {
      if (this.loading !== undefined) {
        this.loading.dismiss();
      }
    } else {
      this.loading = this.loadingCtrl.create();
      this.loading.present();
      this.RestService.refreshCredentials(function(err, results) {
        if (err) {
          console.log('Need to login again!!! - Credentials expired from listing');
          self.loading.dismiss();
          self.RestService.appRestart();
        } else {
          console.log('From listing - Credentials refreshed!');
          if (this.loading !== undefined) {
            this.loading.dismiss();
          }
        }
      });
    }
  }

  ionViewDidLoad() {
    this.loading.present();
    this.userCount = this.RestService.Profiles.length;
    this.listingService
      .getData()
      .then(data => {
        this.listing.banner_image = data.banner_image;
        this.listing.banner_title = data.banner_title;
        this.listing.categories = data.categories;
        var self = this;
        this.RestService.curUserObj(function (error, results) {
          if (!error) {
            self.curUser = results;
            console.log('Initial curUser', self.curUser);
            self.RestService.currentProfile = self.RestService.userId;
            self.lineChart = new Chart(self.lineCanvas.nativeElement, {
              type: 'line',
              data: {
                  labels: ["Jun", "Jul", "Aug", "Sep"],
                  datasets: [
                      {
                          label: "Cal Burned/Week (Target 2500/week)",
                          fill: false,
                          lineTension: 0.1,
                          backgroundColor: "rgba(0,0,0,1)",
                          borderColor: "rgba(0,0,0,1)",
                          borderCapStyle: 'butt',
                          borderDash: [],
                          borderDashOffset: 0.0,
                          borderJoinStyle: 'miter',
                          pointBorderColor: "rgba(0,0,0,1)",
                          pointBackgroundColor: "#fff",
                          pointBorderWidth: 1,
                          pointHoverRadius: 5,
                          pointHoverBackgroundColor: "rgba(0,0,0,1)",
                          pointHoverBorderColor: "rgba(220,220,220,1)",
                          pointHoverBorderWidth: 2,
                          pointRadius: 1,
                          pointHitRadius: 10,
                          data: [.95, 1.05, .70, 1.20],
                          spanGaps: false,
                      }, {
                        label: "Cal Intake/Week (Target 21000/week)",
                        fill: false,
                        lineTension: 0.1,
                        backgroundColor: "rgba(115, 18, 18, 1)",
                        borderColor: "rgba(115, 18, 18, 1)",
                        borderCapStyle: 'butt',
                        borderDash: [],
                        borderDashOffset: 0.0,
                        borderJoinStyle: 'miter',
                        pointBorderColor: "rgba(115, 18, 18, 1)",
                        pointBackgroundColor: "#fff",
                        pointBorderWidth: 1,
                        pointHoverRadius: 5,
                        pointHoverBackgroundColor: "rgba(115, 18, 18, 1)",
                        pointHoverBorderColor: "rgba(220,220,220,1)",
                        pointHoverBorderWidth: 2,
                        pointRadius: 1,
                        pointHitRadius: 10,
                        data: [.99, 1.05, 1.10, .87],
                        spanGaps: false,
                    }, {
                      label: "Weight (Target 225)",
                      fill: false,
                      lineTension: 0.1,
                      backgroundColor: "rgba(199, 56, 224, 1)",
                      borderColor: "rgba(199, 56, 224, 1)",
                      borderCapStyle: 'butt',
                      borderDash: [],
                      borderDashOffset: 0.0,
                      borderJoinStyle: 'miter',
                      pointBorderColor: "rgba(199, 56, 224, 1)",
                      pointBackgroundColor: "#fff",
                      pointBorderWidth: 1,
                      pointHoverRadius: 5,
                      pointHoverBackgroundColor: "rgba(199, 56, 224, 1)",
                      pointHoverBorderColor: "rgba(220,220,220,1)",
                      pointHoverBorderWidth: 2,
                      pointRadius: 1,
                      pointHitRadius: 10,
                      data: [1.01, 1.00, .99, .96],
                      spanGaps: false,
                  },
                  ]
                }
            });

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

  changeUser() {
    let profileModal = this.modalCtrl.create(FormChooseProfile, { action: 'changeUser' });
    profileModal.onDidDismiss(data => {
      console.log('Data from getDefaultUser: ', data);
      if (data !== undefined) {
        //console.log('Data from getDefaultUser: ', data);
        if (data.userUpdated) {
          this.ionViewDidLoad();
        }
      }
    });
    profileModal.present();
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
      this.loading = this.loadingCtrl.create();
      this.loading.present();

      var strKey = this.RestService.Profiles[0].accountid + "/" + this.RestService.Profiles[index].profileid + "/profilepic.jpeg";
      var params = {Bucket: 'logoshealthuserdata', Key: strKey, Expires: 3600, ContentType: 'image/jpeg'};
      s3.getSignedUrl('putObject', params, function (err, url) {
        if (err) {
          console.log('Err in getSignedUrl from getUserPics: ' + err);
          alert('Err in getSignedUrl from getUserPics: ' + err);
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
              //loading.dismiss();
            });
          }, (err) => {
            self.loading.dismiss();
            alert('resolve local filesystem err: ' + JSON.stringify(err));
            // Handle error
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
      this.loading = this.loadingCtrl.create();
      this.loading.present();
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
        var params = {Bucket: 'logoshealthuserdata', Key: strKey, Expires: 3600};
        s3.getSignedUrl('getObject', params, function (err, url) {
          if (err) {
            console.log('Err in getSignedUrl from getUserPics: ' + err);
            alert('Updated ImageURL error: ' + JSON.stringify(err));
          } else {
            self.RestService.Profiles[index].imageURL = url;
            alert('Updated ImageURL: ' + url);
          }
        });
      }).catch( function(result){
        console.log('Result for Save error: ',result);
      });
  }

  triggerAlert() {
    alert('Press event fired');
  }

  getButtonLabel() {
    if (this.curUser !== undefined) {
      return "Not " + this.curUser.title + "?";
    } else {
      return "";
    }
  }

  goToFeed(category: any) {
    console.log("Clicked goToFeed", category);
    if (category.title == 'Order a Meal') {
      this.nav.push(ListOrderPage, { category: category });
    } else if (category.title == 'Achieve') {
      this.nav.push(ListGoalProgressPage, { category: category });
    } else if (category.title == 'Invest in You') {
      this.nav.push(ListExercisePage, { category: category });
    } else if (category.title == 'Sleep') {
      this.nav.push(ListSleepPage, { category: category });
    } else if (category.title == 'Measure') {
      this.nav.push(ListMeasurePage, { category: category });
    } else if (category.title == 'Nutrition') {
      this.nav.push(ListNutritionPage, { category: category });
    } else if (category.title == 'Visit') {
      this.nav.push(ListVisitPage, { category: category });
    } else {
      this.nav.push(FeedPage, { category: category });
    }
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

}
