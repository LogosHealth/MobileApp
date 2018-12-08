import { Component, ViewChild, NgZone } from '@angular/core';
import { NavController, Tabs, Events } from 'ionic-angular';
import { ListingPage } from '../listing/listing';
import { HistoryPage } from '../history/history';
import { SettingsTabPage } from '../settingstab/settingstab';
import { RestService } from '../../app/services/restService.service';

@Component({
  selector: 'tabs-navigation',
  templateUrl: 'tabs-navigation.html'
})
export class TabsNavigationPage {
  @ViewChild("myTabs") myTabs: Tabs;
  tab1Root: any;
  tab2Root: any;
  tab3Root: any;
  tabCount: number;

  constructor(public nav: NavController,
    public RestService:RestService,
    public events: Events,
    private zone: NgZone)
  {
      this.tab1Root = ListingPage;
      this.tab2Root = HistoryPage;
      this.tab3Root = SettingsTabPage;
      this.tabCount = 0;
      this.events.subscribe('updateScreen', () => {
        this.zone.run(() => {
          console.log('force update the screen');
        });
      });
  }

  tabSelect(root: String) {
    this.tabCount = this.tabCount + 1;
    console.log ('Times through tabSelect code: ' + this.tabCount);
    if (root == 'Today') {
      //alert('From Click Listing Selected Index is: ' + this.myTabs.getSelected().tabTitle);
      this.events.publish('updateScreen');
      //alert('TabSelect ' + root);
    } else if (root == 'History') {
      //alert('From Click History Selected Index is: ' + this.myTabs.getSelected().tabTitle);
      this.events.publish('updateScreen');
      //alert('TabSelect: ' + root);
    } else if (root == 'Settings') {
      //alert('From Click Settings Selected Index is: ' + this.myTabs.getSelected().tabTitle);
      this.events.publish('updateScreen');
      //alert('TabSelect: ' + root);
    }
  }

}
