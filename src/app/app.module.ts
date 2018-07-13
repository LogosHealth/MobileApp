import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { IonicApp, IonicModule } from 'ionic-angular';
import { MyApp } from './app.component';

import { ListingPage } from '../pages/listing/listing';
import { HistoryPage } from '../pages/history/history';
import { SettingsTabPage } from '../pages/settingstab/settingstab';
import { FeedPage } from '../pages/feed/feed';
import { FollowersPage } from '../pages/followers/followers';
import { LayoutsPage } from '../pages/layouts/layouts';
import { FormsPage } from '../pages/forms/forms';
import { LoginPage } from '../pages/login/login';
import { NotificationsPage } from '../pages/notifications/notifications';
import { ProfilePage } from '../pages/profile/profile';
import { TabsNavigationPage } from '../pages/tabs-navigation/tabs-navigation';
import { WalkthroughPage } from '../pages/walkthrough/walkthrough';
import { SettingsPage } from '../pages/settings/settings';
import { SignupPage } from '../pages/signup/signup';
import { ForgotPasswordPage } from '../pages/forgot-password/forgot-password';
import { SchedulePage } from '../pages/schedule/schedule';
import { List1Page } from '../pages/list-1/list-1';
import { List2Page } from '../pages/list-2/list-2';
import { ListAllergiesPage } from '../pages/listAllergies/listAllergies';
import { ListVaccinesPage } from '../pages/listVaccines/listVaccines';
import { ListOrderPage } from '../pages/listOrder/listOrder';
import { ListGoalsPage } from '../pages/listGoals/listGoals';
import { ListGoalProgressPage } from '../pages/listGoalProgress/listGoalProgress';
import { ListGoalProgressDetailPage } from '../pages/listGoalProgressDetail/listGoalProgressDetail';
import { ListExercisePage } from '../pages/listExercise/listExercise';

import { GridPage } from '../pages/grid/grid';
import { FormLayoutPage } from '../pages/form-layout/form-layout';
import { FormVaccinesPage } from '../pages/formVaccines/formVaccines';
import { FormOrderPage } from '../pages/formOrder/formOrder';
import { FormFoodPref } from '../pages/formFoodPref/formFoodPref';
import { FormGoalsPage } from '../pages/formGoals/formGoals';
import { FormExercisePage } from '../pages/formExercise/formExercise';

import { FiltersPage } from '../pages/filters/filters';
import { TermsOfServicePage } from '../pages/terms-of-service/terms-of-service';
import { PrivacyPolicyPage } from '../pages/privacy-policy/privacy-policy';
import { PreloadImage } from '../components/preload-image/preload-image';
import { BackgroundImage } from '../components/background-image/background-image';
import { ShowHideContainer } from '../components/show-hide-password/show-hide-container';
import { ShowHideInput } from '../components/show-hide-password/show-hide-input';
import { ColorRadio } from '../components/color-radio/color-radio';
import { CounterInput } from '../components/counter-input/counter-input';
import { Rating } from '../components/rating/rating';
import { GoogleMap } from '../components/google-map/google-map';
import { FeedService } from '../pages/feed/feed.service';
import { ListingService } from '../pages/listing/listing.service';
import { HistoryService } from '../pages/history/history.service';
import { ProfileService } from '../pages/profile/profile.service';
import { NotificationsService } from '../pages/notifications/notifications.service';
import { List1Service } from '../pages/list-1/list-1.service';
import { List2Service } from '../pages/list-2/list-2.service';
import { ListAllergiesService } from '../pages/listAllergies/listAllergies.service';
import { ListVaccinesService } from '../pages/listVaccines/listVaccines.service';
import { ListOrderService } from '../pages/listOrder/listOrder.service';
import { SettingsService } from '../pages/settingstab/settingstab.service';
import { FoodPrefService } from '../pages/formFoodPref/foodPref.service';
import { ListGoalsService } from '../pages/listGoals/listGoals.service';
import { DictionaryService } from '../pages/models/dictionary.service';
import { ListExerciseService } from '../pages/listExercise/listExercise.service';

import { ScheduleService } from '../pages/schedule/schedule.service';
import { BrowserModule } from '@angular/platform-browser';
import { HttpModule } from '@angular/http';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { SocialSharing } from '@ionic-native/social-sharing';
import { NativeStorage } from '@ionic-native/native-storage';
import { InAppBrowser } from '@ionic-native/in-app-browser';
import { CallNumber } from '@ionic-native/call-number';
import { Facebook } from '@ionic-native/facebook';
import { GooglePlus } from '@ionic-native/google-plus';
import { Keyboard } from '@ionic-native/keyboard';
import { Geolocation } from '@ionic-native/geolocation';
import { EmailComposer } from '@ionic-native/email-composer';
import { HttpClientModule } from '@angular/common/http';

//MM 3-29-18 Adding new Global Imports here:
import { RestService } from '../app/services/restService.service';

// Functionalities
import { FunctionalitiesPage } from '../pages/functionalities/functionalities';
import { MapsPage } from '../pages/maps/maps';
import { FacebookLoginPage } from '../pages/facebook-login/facebook-login';
import { GoogleLoginPage } from '../pages/google-login/google-login';
import { ContactCardPage } from '../pages/contact-card/contact-card';
import { FacebookLoginService } from '../pages/facebook-login/facebook-login.service';
import { GoogleLoginService } from '../pages/google-login/google-login.service';
import { GoogleMapsService } from '../pages/maps/maps.service';

@NgModule({
  declarations: [
    MyApp,
    ListingPage,
    HistoryPage,
    SettingsTabPage,
    FeedPage,
    FollowersPage,
    LayoutsPage,
    FormsPage,
    LoginPage,
    NotificationsPage,
    ProfilePage,
    TabsNavigationPage,
    WalkthroughPage,
    SettingsPage,
    SignupPage,
    ForgotPasswordPage,
    SchedulePage,
    List1Page,
    List2Page,
    ListAllergiesPage,
    ListVaccinesPage,
    ListOrderPage,
    ListGoalsPage,
    ListGoalProgressPage,
    ListGoalProgressDetailPage,
    ListExercisePage,

    GridPage,
    FormLayoutPage,
    FormVaccinesPage,
    FormOrderPage,
    FormFoodPref,
    FormGoalsPage,
    FormExercisePage,

    FiltersPage,
    TermsOfServicePage,
    PrivacyPolicyPage,
    MapsPage,
    FunctionalitiesPage,
    FacebookLoginPage,
    GoogleLoginPage,
    ContactCardPage,
    PreloadImage,
    BackgroundImage,
    ShowHideContainer,
    ShowHideInput,
    ColorRadio,
    CounterInput,
    Rating,
    GoogleMap
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    HttpModule,
    IonicModule.forRoot(MyApp)
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    ListingPage,
    HistoryPage,
    SettingsTabPage,
    FeedPage,
    FollowersPage,
    LayoutsPage,
    FormsPage,
    LoginPage,
    NotificationsPage,
    ProfilePage,
    TabsNavigationPage,
    WalkthroughPage,
    SettingsPage,
    ForgotPasswordPage,
    SignupPage,
    SchedulePage,
    List1Page,
    List2Page,
    ListAllergiesPage,
    ListVaccinesPage,
    ListOrderPage,
    ListGoalsPage,
    ListGoalProgressPage,
    ListGoalProgressDetailPage,
    ListExercisePage,

    GridPage,
    FormLayoutPage,
    FormVaccinesPage,
    FormOrderPage,
    FormFoodPref,
    FormGoalsPage,
    FormExercisePage,
    
    FiltersPage,
    TermsOfServicePage,
    PrivacyPolicyPage,
    MapsPage,
    FunctionalitiesPage,
    FacebookLoginPage,
    GoogleLoginPage,
    ContactCardPage
  ],
  providers: [
    FeedService,
    ListingService,
    HistoryService,
    SettingsService,
    ProfileService,
    NotificationsService,
    List1Service,
    List2Service,
    ListAllergiesService,
    ListVaccinesService,
    ListOrderService,
    FoodPrefService,
    ListGoalsService,
    DictionaryService,
    ListExerciseService,

    ScheduleService,
    FacebookLoginService,
    GoogleLoginService,
    GoogleMapsService,
	  SplashScreen,
	  StatusBar,
    SocialSharing,
    NativeStorage,
    InAppBrowser,
    CallNumber,
    Facebook,
    GooglePlus,
    Keyboard,
    Geolocation,
    EmailComposer,
    //MM 3-29-18 Implementing as global Provider 
    RestService
  ],
  schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
})
export class AppModule {}
