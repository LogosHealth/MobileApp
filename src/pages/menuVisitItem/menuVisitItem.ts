import { Component } from '@angular/core';
import {  ViewController, NavParams } from 'ionic-angular';

@Component({
  selector: 'menuMeasure-page',
  template: `
    <ion-list>
      <ion-list-header  class="list-title">Add</ion-list-header>
      <button ion-item class="list-item" (click)="close('lab')">Lab Panel/Test</button>
      <button ion-item class="list-item" (click)="close('procedure')">Procedure</button>
      <button ion-item class="list-item" (click)="close('therapy')">Therapy</button>
      <button ion-item class="list-item" (click)="close('vaccine')">Vaccine</button>
    </ion-list>
    `
})
export class MenuVisitItem {
  constructor(public viewCtrl: ViewController, public navParams: NavParams) {

  }

  close(strPage) {
    let data = { 'choosePage': strPage };
    this.viewCtrl.dismiss(data);
  }
}
