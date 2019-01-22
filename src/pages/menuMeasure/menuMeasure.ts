import { Component } from '@angular/core';
import {  ViewController, NavParams } from 'ionic-angular';

@Component({
  selector: 'menuMeasure-page',
  template: `
    <ion-list>
      <ion-list-header  class="list-title">Measure</ion-list-header>
      <button ion-item class="list-item" (click)="close('weight')">Weight</button>
      <button ion-item class="list-item" (click)="close('symptom')">Symptom</button>
      <button ion-item class="list-item" (click)="close('mood')">Mood</button>
      <button ion-item class="list-item" (click)="close('temperature')">Temperature</button>
      <button ion-item class="list-item" (click)="close('bloodGlucose')">Blood Glucose</button>
    </ion-list>
    `
})
export class MenuMeasure {
  constructor(public viewCtrl: ViewController, public navParams: NavParams) {

  }

  close(strPage) {
    let data = { 'choosePage': strPage };
    this.viewCtrl.dismiss(data);
  }
}
