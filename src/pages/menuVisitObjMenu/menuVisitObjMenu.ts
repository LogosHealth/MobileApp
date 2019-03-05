import { Component } from '@angular/core';
import { ViewController, NavParams } from 'ionic-angular';

@Component({
  selector: 'menuMeasure-page',
  template: `
    <ion-list>
      <ion-list-header  class="list-title">View/Add</ion-list-header>
      <button ion-item class="list-item" (click)="close('lab')">Lab/Test</button>
      <button ion-item class="list-item" (click)="close('visit')">Follow-up Visit</button>
    </ion-list>
    `
})
export class MenuVisitObjMenu {
  constructor(public viewCtrl: ViewController, public navParams: NavParams) {

  }

  close(strPage) {
    let data = { 'choosePage': strPage };
    this.viewCtrl.dismiss(data);
  }
}
