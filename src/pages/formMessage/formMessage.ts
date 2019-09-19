import { Component } from '@angular/core';
import { NavController, NavParams, AlertController, LoadingController, ViewController } from 'ionic-angular';
import { RestService } from '../../app/services/restService.service';


@Component({
  selector: 'formExercise-page',
  templateUrl: 'formMessage.html'
})
export class FormMessage {
  section: string;
  formName: string = "formMessage";
  title: any;
  message: any;

  constructor(public nav: NavController,
    public alertCtrl: AlertController,
    public RestService:RestService,
    public loadingCtrl: LoadingController,
    public viewCtrl: ViewController,
    public navParams: NavParams) {
    this.title = navParams.get('title');
    this.message = navParams.get('message');

  }

  closeForm() {
    this.viewCtrl.dismiss();
  }


}
