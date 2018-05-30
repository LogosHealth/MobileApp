import { Component } from '@angular/core';
import { Events } from 'ionic-angular';

import { ListingPage } from '../listing/listing';
import { HistoryPage } from '../history/history';
import { NotificationsPage } from '../notifications/notifications';
import { RestService } from '../../app/services/restService.service';


@Component({
  selector: 'tabs-navigation',
  templateUrl: 'tabs-navigation.html'
})
export class TabsNavigationPage {
  tab1Root: any;
  tab2Root: any;
  tab3Root: any;

  constructor(public RestService:RestService, private event: Events) {
    this.tab1Root = ListingPage;
    this.tab2Root = HistoryPage;
    this.tab3Root = NotificationsPage;
    //alert("From Main Page: Cognito ID" + this.RestService.AuthData.cognitoId);
    //alert('Expiration Date from Main: ' + this.RestService.AuthData.expiration);
    //alert('Check ProfileID from Main: ' + this.RestService.Profiles[0].profileid);
    //alert('Device id: ' + window.device.uuid);
    alert('Check Name from Main: ' + this.RestService.Profiles[0].title + " " + this.RestService.Profiles[0].image);
    
  }  

  tabSelect(root: any) {
    if (root == 'Today') {
      //alert('Start tabSelect ' + root);
      this.event.publish('TabSelectToday', 'Today');
      //alert('End tabSelect ' + root);
    } else if (root == 'History') {
      this.event.publish('TabSelectHistory', 'History');
      //alert('TabSelect: ' + root);
    }
  }

}
