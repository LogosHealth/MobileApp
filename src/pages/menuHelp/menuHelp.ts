import { Component } from '@angular/core';
import { ViewController, NavParams } from 'ionic-angular';
import { FormControl, FormBuilder } from '@angular/forms';

@Component({
  selector: 'menuMeasure-page',
  template: `
  <div class="form-section" [innerHtml]="helptext"></div>
    `
})
export class MenuHelp {
  title: any;
  helptext: any;
  helptextfield: FormControl = new FormControl();

  constructor(public viewCtrl: ViewController, public navParams: NavParams, public formBuilder: FormBuilder) {
    this.title = navParams.get('title');
    this.helptext = navParams.get('helptext');
    //console.log('Item list from menuDynamic: ', this.itemList);
    this.helptextfield = new FormControl({value: this.helptext, disabled: true});

  }

  close(strPage) {
    let data = { 'choosePage': strPage };
    this.viewCtrl.dismiss(data);
  }
}


