import { Component } from '@angular/core';
import { ViewController, NavParams } from 'ionic-angular';
import { FormGroup, FormControl, FormArray,  FormBuilder } from '@angular/forms';

@Component({
  selector: 'menuMeasure-page',
  template: `
    <ion-list [formGroup]="card_form">
      <ion-list-header  class="list-title">Select</ion-list-header>
      <div formArrayName="itemArray" *ngFor="let item of itemArray.controls; let j = index;">
        <div [formGroupName]="j">
          <button ion-item class="list-item" (click)="close(item.value.recordid)">{{item.value.namevalue}} </button>
        </div>
      </div>
    </ion-list>
    `
})
export class MenuDynamic {
  itemList: any;
  itemArray: FormArray;
  card_form: FormGroup;

  constructor(public viewCtrl: ViewController, public navParams: NavParams, public formBuilder: FormBuilder) {
    this.itemList = navParams.get('itemList');
    console.log('Item list from menuDynamic: ', this.itemList);

    this.card_form = new FormGroup({
      itemArray: this.formBuilder.array([]),
    });

    this.addExistingItems();
  }

  addExistingItems() {
    console.log('Starting addExistingItems');
    this.itemArray = this.card_form.get('itemArray') as FormArray;

    if (this.itemList !== undefined && this.itemList.length > 0) {
      var exitLoop = 0;
      while (this.itemArray.length !== 0 || exitLoop > 9) {
        this.itemArray.removeAt(0);
        exitLoop = exitLoop + 1;
      }
      for (var j = 0; j < this.itemList.length; j++) {
        this.itemArray.push(this.addExistingItem(j));
      }
    }
  }

  addExistingItem(index): FormGroup {
    return this.formBuilder.group({
      recordid: new FormControl(this.itemList[index].recordid),
      namevalue: new FormControl(this.itemList[index].namevalue),
    });
  }

  close(strPage) {
    let data = { 'choosePage': strPage };
    this.viewCtrl.dismiss(data);
  }
}


