import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { IonicApp, IonicModule } from 'ionic-angular';
import { MyApp } from './app.component';
import { Autosize } from '../components/autosize/autosize'
import { LocalNotifications } from '@ionic-native/local-notifications';
import { Device } from '@ionic-native/device';
import { ModalController } from 'ionic-angular';
import { PhotoLibrary } from '@ionic-native/photo-library';
import { Camera } from '@ionic-native/camera';
import { File } from '@ionic-native/file';
import { FileTransfer, FileUploadOptions, FileTransferObject } from '@ionic-native/file-transfer';
import { HTTP } from '@ionic-native/http';

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
import { ListSleepPage } from '../pages/listSleep/listSleep';
import { ListMeasurePage } from '../pages/listMeasure/listMeasure';
import { ListLabsPage } from '../pages/listLabs/listLabs';
import { ListNutritionPage } from '../pages/listNutrition/listNutrition';
import { ListMedicationPage } from '../pages/listMedication/listMedication';
import { ListEventPage } from '../pages/listEvent/listEvent';
import { ListContactPage } from '../pages/listContacts/listContacts';
import { ListVisitPage } from '../pages/listVisit/listVisit';
import { ListSchedulePage } from '../pages/listSchedule/listSchedule';
import { ListAlertPage } from '../pages/listAlert/listAlert';
import { ListOccupationPage } from '../pages/listOccupation/listOccupation';
import { ListTravelPage } from '../pages/listTravel/listTravel';
import { ListStresslevelPage } from '../pages/listStresslevel/listStresslevel';
import { ListLifestyleItem } from '../pages/listLifestyleItem/listLifestyleItem';
import { ListMedicalEvent } from '../pages/listMedicalEvent/listMedicalEvent';
import { ListMedicationResults } from '../pages/listMedicationResults/listMedicationResults';
import { ListTreatmentPage } from '../pages/listTreatment/listTreatment';
import { ListDoseHistory } from '../pages/listDoseHistory/listDoseHistory';

import { GridPage } from '../pages/grid/grid';
import { FormLayoutPage } from '../pages/form-layout/form-layout';
import { FormVaccinesPage } from '../pages/formVaccines/formVaccines';
import { FormOrderPage } from '../pages/formOrder/formOrder';
import { FormFoodPref } from '../pages/formFoodPref/formFoodPref';
import { FormGoalsPage } from '../pages/formGoals/formGoals';
import { FormExercisePage } from '../pages/formExercise/formExercise';
import { FormTaskPage } from '../pages/formTask/formTask';
import { FormSleepPage } from '../pages/formSleep/formSleep';
import { FormWeightPage } from '../pages/formWeight/formWeight';
import { FormMoodPage } from '../pages/formMood/formMood';
import { FormLabsPage } from '../pages/formLabs/formLabs';
import { FormNutritionPage } from '../pages/formNutrition/formNutrition';
import { FormAboutMe } from '../pages/formAboutMe/formAboutMe';
import { FormAllergyPage } from '../pages/formAllergy/formAllergy';
import { FormFindContact } from '../pages/formFindContact/formFindContact';
import { FormContactPage } from '../pages/formContact/formContact';
import { FormCallNotesPage } from '../pages/formCallNotes/formCallNotes';
import { FormVisitPage } from '../pages/formVisit/formVisit';
import { FormSchedulePage } from '../pages/formSchedule/formSchedule';
import { FormChooseProfile } from '../pages/formChooseProfile/formChooseProfile';
import { FormChooseInfo } from '../pages/formChooseInfo/formChooseInfo';
import { FormTemperaturePage } from '../pages/formTemperature/formTemperature';
import { FormSymptomPage } from '../pages/formSymptom/formSymptom';
import { FormChooseNotify } from '../pages/formChooseNotify/formChooseNotify';
import { FormNutritionAdd } from '../pages/formNutritionAdd/formNutritionAdd';
import { FormLifestyle } from '../pages/formLifestyle/formLifestyle';
import { FormOccupationPage } from '../pages/formOccupation/formOccupation';
import { FormTravelPage } from '../pages/formTravel/formTravel';
import { FormStresslevelPage } from '../pages/formStresslevel/formStresslevel';
import { FormLifestyleItem } from '../pages/formLifestyleItem/formLifestyleItem';
import { FormMedicalEvent } from '../pages/formMedicalEvent/formMedicalEvent';
import { FormMedication } from '../pages/formMedication/formMedication';
import { FormMedSchedule } from '../pages/formMedSchedule/formMedSchedule';
import { FormMedicationResults } from '../pages/formMedicationResults/formMedicationResults';
import { FormDoseHistory } from '../pages/formDoseHistory/formDoseHistory';


import { MenuMeasure } from '../pages/menuMeasure/menuMeasure';
import { MenuVisitOutcome } from '../pages/menuVisitOutcome/menuVisitOutcome';
import { MenuLifestyle } from '../pages/menuLifestyle/menuLifestyle';
import { MenuTreatment } from '../pages/menuTreatment/menuTreatment';
import { MenuVisitObjMenu } from '../pages/menuVisitObjMenu/menuVisitObjMenu';
import { MenuDynamic } from '../pages/menuDynamic/menuDynamic';
import { MenuHelp } from '../pages/menuHelp/menuHelp';

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
import { FormTaskService } from '../pages/formTask/formTask.service';
import { ListSleepService } from '../pages/listSleep/listSleep.service';
import { ListMeasureService } from '../pages/listMeasure/listMeasure.service';
import { ListLabsService } from '../pages/listLabs/listLabs.service';
import { ListNutritionService } from '../pages/listNutrition/listNutrition.service';
import { AboutMeService } from '../pages/formAboutMe/formAboutMe.service';
import { ListMedicationService } from '../pages/listMedication/listMedication.service';
import { ListEventService } from '../pages/listEvent/listEvent.service';
import { ListContactService } from '../pages/listContacts/listContacts.service';
import { FormFindContactService } from '../pages/formFindContact/formFindContact.service';
import { ListVisitService } from '../pages/listVisit/listVisit.service';
import { ListScheduleService } from '../pages/listSchedule/listSchedule.service';
import { ListAlertService } from '../pages/listAlert/listAlert.service';
import { CallNoteService } from '../pages/formCallNotes/formCallNotes.service';
import { LifestyleService } from '../pages/formLifestyle/formLifestyle.service';
import { ListOccupationService } from '../pages/listOccupation/listOccupation.service';
import { ListTravelService } from '../pages/listTravel/listTravel.service';
import { ListStresslevelService } from '../pages/listStresslevel/listStresslevel.service';
import { LifestyleItemService } from '../pages/listLifestyleItem/listLifestyleItem.service';
import { MedicalEventService } from '../pages/listMedicalEvent/listMedicalEvent.service';
import { PostVisitService } from '../pages/formVisit/postVisit.service';
import { SymptomService } from '../pages/formSymptom/formSymptom.service';
//import { DoseHistoryService } from '../pages/listDoseHistory/listDoseHistory.service';

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

import { TextMaskModule } from 'angular2-text-mask';

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
    ListSleepPage,
    ListMeasurePage,
    ListLabsPage,
    ListNutritionPage,
    ListMedicationPage,
    ListEventPage,
    ListContactPage,
    ListVisitPage,
    ListSchedulePage,
    ListAlertPage,
    ListOccupationPage,
    ListTravelPage,
    ListStresslevelPage,
    ListLifestyleItem,
    ListMedicalEvent,
    ListMedicationResults,
    ListTreatmentPage,
    ListDoseHistory,

    GridPage,
    FormLayoutPage,
    FormVaccinesPage,
    FormOrderPage,
    FormFoodPref,
    FormGoalsPage,
    FormExercisePage,
    FormTaskPage,
    FormSleepPage,
    FormWeightPage,
    FormMoodPage,
    FormLabsPage,
    FormNutritionPage,
    FormAboutMe,
    FormAllergyPage,
    FormFindContact,
    FormContactPage,
    FormCallNotesPage,
    FormVisitPage,
    FormSchedulePage,
    FormChooseProfile,
    FormChooseInfo,
    FormTemperaturePage,
    FormSymptomPage,
    FormChooseNotify,
    FormNutritionAdd,
    FormLifestyle,
    FormOccupationPage,
    FormTravelPage,
    FormStresslevelPage,
    FormLifestyleItem,
    FormMedicalEvent,
    FormMedication,
    FormMedSchedule,
    FormMedicationResults,
    FormDoseHistory,

    MenuMeasure,
    MenuVisitOutcome,
    MenuLifestyle,
    MenuTreatment,
    MenuVisitObjMenu,
    MenuDynamic,
    MenuHelp,

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
    Autosize,
    GoogleMap
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    HttpModule,
    TextMaskModule,
    IonicModule.forRoot(MyApp, {
      navExitApp: false
    })
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
    ListSleepPage,
    ListMeasurePage,
    ListLabsPage,
    ListNutritionPage,
    ListMedicationPage,
    ListEventPage,
    ListContactPage,
    ListVisitPage,
    ListSchedulePage,
    ListAlertPage,
    ListOccupationPage,
    ListTravelPage,
    ListStresslevelPage,
    ListLifestyleItem,
    ListMedicalEvent,
    ListMedicationResults,
    ListTreatmentPage,
    ListDoseHistory,

    GridPage,
    FormLayoutPage,
    FormVaccinesPage,
    FormOrderPage,
    FormFoodPref,
    FormGoalsPage,
    FormExercisePage,
    FormTaskPage,
    FormSleepPage,
    FormWeightPage,
    FormMoodPage,
    FormLabsPage,
    FormNutritionPage,
    FormAboutMe,
    FormAllergyPage,
    FormFindContact,
    FormContactPage,
    FormCallNotesPage,
    FormVisitPage,
    FormSchedulePage,
    FormChooseProfile,
    FormChooseInfo,
    FormTemperaturePage,
    FormSymptomPage,
    FormChooseNotify,
    FormNutritionAdd,
    FormLifestyle,
    FormOccupationPage,
    FormTravelPage,
    FormStresslevelPage,
    FormLifestyleItem,
    FormMedicalEvent,
    FormMedication,
    FormMedSchedule,
    FormMedicationResults,
    FormDoseHistory,

    MenuMeasure,
    MenuVisitOutcome,
    MenuLifestyle,
    MenuTreatment,
    MenuVisitObjMenu,
    MenuDynamic,
    MenuHelp,

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
    FormTaskService,
    ListSleepService,
    ListMeasureService,
    ListLabsService,
    ListNutritionService,
    AboutMeService,
    ListMedicationService,
    ListEventService,
    ListContactService,
    FormFindContactService,
    ListVisitService,
    ListScheduleService,
    ListAlertService,
    CallNoteService,
    LifestyleService,
    ListOccupationService,
    ListTravelService,
    ListStresslevelService,
    LifestyleItemService,
    MedicalEventService,
    PostVisitService,
    SymptomService,
    //DoseHistoryService,

    HTTP,
    FileTransfer,
    FileTransferObject,
    File,
    Camera,
    PhotoLibrary,
    Device,
    ModalController,
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
    RestService,
    LocalNotifications,
  ],
  schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
})
export class AppModule {}
