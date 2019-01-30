import { Component } from '@angular/core';
import {  ViewController, NavParams } from 'ionic-angular';

@Component({
  selector: 'menuMeasure-page',
  template: `
    <ion-list>
      <ion-list-header  class="list-title">Lifestyle</ion-list-header>
      <button ion-item class="list-item" (click)="close('Alcohol')">Alcohol</button>
      <button ion-item class="list-item" (click)="close('Nicotine')">Nicotine</button>
      <button ion-item class="list-item" (click)="close('Rec Marijuana')">Marijuana</button>
      <button ion-item class="list-item" (click)="close('Other Rec Drug')">Other</button>
    </ion-list>
    `
})
export class MenuLifestyle {
  constructor(public viewCtrl: ViewController, public navParams: NavParams) {

  }

  close(strPage) {
    let data = { 'choosePage': strPage };
    this.viewCtrl.dismiss(data);
  }
}
