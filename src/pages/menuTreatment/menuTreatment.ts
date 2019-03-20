import { Component } from '@angular/core';
import {  ViewController, NavParams } from 'ionic-angular';

@Component({
  selector: 'menuMeasure-page',
  template: `
    <ion-list>
      <ion-list-header  class="list-title">Treatment</ion-list-header>
      <button ion-item class="list-item" (click)="close('Medication')">Medication</button>
      <button ion-item class="list-item" (click)="close('Procedure')">Procedure</button>
      <button ion-item class="list-item" (click)="close('Therapy')">Therapy</button>
    </ion-list>
    `
})
export class MenuTreatment {
  constructor(public viewCtrl: ViewController, public navParams: NavParams) {

  }

  close(strPage) {
    let data = { 'choosePage': strPage };
    this.viewCtrl.dismiss(data);
  }
}
