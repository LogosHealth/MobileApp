import { Component } from '@angular/core';
import { NavController, NavParams, AlertController, LoadingController, PopoverController } from 'ionic-angular';
import { FormGroup, FormControl, FormArray, FormsModule } from '@angular/forms';
import { RestService } from '../../app/services/restService.service';
import { FoodPrefModel, FoodPrefCategoryModel, FoodPref, FoodPrefCategory } from '../../pages/formFoodPref/foodPref.model';
import { FoodPrefService } from '../../pages/formFoodPref/foodPref.service';
import { HistoryItemModel } from '../../pages/history/history.model';
import { MenuHelp } from '../../pages/menuHelp/menuHelp';

var moment = require('moment-timezone');

@Component({
  selector: 'formFoodPref-page',
  templateUrl: 'formFoodPref.html'
})
export class FormFoodPref {
  formName: string = "formFoodPref";
  section: string;
  recId: number;
  card_form: FormGroup;
  form_array: FormArray;
  form_group: FormGroup;
  curRec: any;
  foodcategories: FoodPrefCategoryModel  = new FoodPrefCategoryModel();
  FoodPrefModel: FoodPrefModel = new FoodPrefModel();
  category: HistoryItemModel = new HistoryItemModel();
  loading: any;
  saving: boolean = false;
  categoryKey = [];
  controlKey = [];
  control2Category = [];
  savePref: FoodPref = new FoodPref();
  savePrefModel: FoodPrefModel = new FoodPrefModel();
  categories_checkbox_open: boolean;
  categories_checkbox_result;

  constructor(public nav: NavController, public alertCtrl: AlertController, public RestService:RestService, public FoodPrefService: FoodPrefService,
    public navParams: NavParams, public categoryList: FormsModule, public popoverCtrl:PopoverController, public loadingCtrl: LoadingController) {
    this.recId = navParams.get('recId');
    this.categoryList = "food";

    this.card_form = new FormGroup({
      categoryList: new FormControl(),
      foodpreferenceid: new FormControl(),
      maxcost: new FormControl(),
      deliveryrange: new FormControl(),
      deliveryoption: new FormControl(),
      familyfood: new FormControl(),
      dietpreferenceid: new FormControl(),
      calorielimit: new FormControl(),
      mealsperentreevalue: new FormControl(),
      iswhitemeat: new FormControl(),
      ischicken: new FormControl(),
      isvegetarian: new FormControl(),
      isvegetariannoegg: new FormControl(),
      isvegan: new FormControl(),
      ispescatarian: new FormControl(),
      isavoiddairy: new FormControl(),
      isglutenfree: new FormControl(),
      islowcarb: new FormControl(),
      ishearthealthy: new FormControl(),
      islowsodium: new FormControl(),
      islowglycemicindex: new FormControl(),
      ishalal: new FormControl(),
      iskosher: new FormControl(),
      haspeanutallergy: new FormControl(),
      hasnutallergy: new FormControl(),
      hasfishallergy: new FormControl(),
      hasshellfishallergy: new FormControl(),
      familydiet: new FormControl(),
      American: new FormControl(),
      Bakeries: new FormControl(),
      Barfood: new FormControl(),
      Barbeque: new FormControl(),
      Breakfast: new FormControl(),
      Burgers: new FormControl(),
      Cajun: new FormControl(),
      Chickenhouse: new FormControl(),
      Delis: new FormControl(),
      Diners: new FormControl(),
      Hawaiian: new FormControl(),
      Pizza: new FormControl(),
      Seafood: new FormControl(),
      Southwest: new FormControl(),
      Steakhouse: new FormControl(),
      Asian: new FormControl(),
      Chinese: new FormControl(),
      Japanese: new FormControl(),
      Korean: new FormControl(),
      OtherAsian: new FormControl(),
      Thai: new FormControl(),
      Vietnamese: new FormControl(),
      LatinAmerican: new FormControl(),
      Argentinian: new FormControl(),
      Brazilian: new FormControl(),
      Caribbean: new FormControl(),
      Cuban: new FormControl(),
      Jamaican: new FormControl(),
      Mexican: new FormControl(),
      OtherLatin: new FormControl(),
      Mediterranean: new FormControl(),
      French: new FormControl(),
      German: new FormControl(),
      Greek: new FormControl(),
      Italian: new FormControl(),
      Russian: new FormControl(),
      Scandanavian: new FormControl(),
      Spanish: new FormControl(),
      UK: new FormControl(),
      African: new FormControl(),
      Indian: new FormControl(),
      MiddleEastern: new FormControl(),
    });
  }

  ionViewWillEnter() {
    var dtNow = moment(new Date());
    var dtExpiration = moment(this.RestService.AuthData.expiration);
    var self = this;

    if (dtNow < dtExpiration) {
      this.presentLoadingDefault();
      this.loadData();
    } else {
      this.presentLoadingDefault();
      this.RestService.refreshCredentials(function(err, results) {
        if (err) {
          console.log('Need to login again!!! - Credentials expired from ' + self.formName);
          self.loading.dismiss();
          self.RestService.appRestart();
        } else {
          console.log('From '+ self.formName + ' - Credentials refreshed!');
          self.loadData();
        }
      });
    }
  }

  loadData() {
    var restURL: string;
    if (this.RestService.currentProfile == undefined || this.RestService.currentProfile <= 0) {
      this.loading.dismiss();
      return;
    } else {
      console.log('currentProfile: ' + this.RestService.currentProfile);
    }
    this.controlKey["foodpreferenceid"] = "food";
    this.controlKey["maxcost"] = "food";
    this.controlKey["deliveryrange"] = "food";
    this.controlKey["deliveryoption"] = "food";
    this.controlKey["familyfood"] = "food";
    this.controlKey["dietpreferenceid"] = "diet";
    this.controlKey["calorielimit"] = "diet";
    this.controlKey["mealsperentreevalue"] = "diet";
    this.controlKey["iswhitemeat"] = "diet";
    this.controlKey["ischicken"] = "diet";
    this.controlKey["isvegetarian"] = "diet";
    this.controlKey["isvegetariannoegg"] = "diet";
    this.controlKey["isvegan"] = "diet";
    this.controlKey["ispescatarian"] = "diet";
    this.controlKey["isavoiddairy"] = "diet";
    this.controlKey["isglutenfree"] = "diet";
    this.controlKey["islowcarb"] = "diet";
    this.controlKey["ishearthealthy"] = "diet";
    this.controlKey["islowsodium"] = "diet";
    this.controlKey["islowglycemicindex"] = "diet";
    this.controlKey["ishalal"] = "diet";
    this.controlKey["iskosher"] = "diet";
    this.controlKey["familydiet"] = "diet";
    this.controlKey["American"] = "category";
    this.control2Category["American"] = "American";
    this.controlKey["Bakeries"] = "category";
    this.control2Category["Bakeries"] = "Bakeries";
    this.controlKey["Barfood"] = "category";
    this.control2Category["Barfood"] = "Bar Food";
    this.controlKey["Barbeque"] = "category";
    this.control2Category["Barbeque"] = "Barbeque";
    this.controlKey["Breakfast"] = "category";
    this.control2Category["Breakfast"] = "Breakfast";
    this.controlKey["Burgers"] = "category";
    this.control2Category["Burgers"] = "Burgers";
    this.controlKey["Cajun"] = "category";
    this.control2Category["Cajun"] = "Cajun and Creole";
    this.controlKey["Chickenhouse"] = "category";
    this.control2Category["Chickenhouse"] = "Chickenhouse";
    this.controlKey["Delis"] = "category";
    this.control2Category["Delis"] = "Delis and Sandwiches";
    this.controlKey["Diners"] = "category";
    this.control2Category["Diners"] = "Diners";
    this.controlKey["Pizza"] = "category";
    this.control2Category["Pizza"] = "Pizza";
    this.controlKey["Seafood"] = "category";
    this.control2Category["Seafood"] = "Seafood";
    this.controlKey["Southwest"] = "category";
    this.control2Category["Southwest"] = "Southwestern and Tex-Mex";
    this.controlKey["Steakhouse"] = "category";
    this.control2Category["Steakhouse"] = "Steakhouse";
    this.controlKey["Asian"] = "category";
    this.control2Category["Asian"] = "Asian";
    this.controlKey["Chinese"] = "category";
    this.control2Category["Chinese"] = "Chinese";
    this.controlKey["Japanese"] = "category";
    this.control2Category["Japanese"] = "Japanese";
    this.controlKey["Korean"] = "category";
    this.control2Category["Korean"] = "Korean";
    this.controlKey["OtherAsian"] = "category";
    this.control2Category["OtherAsian"] = "Other East Asian";
    this.controlKey["Thai"] = "category";
    this.control2Category["Thai"] = "Thai";
    this.controlKey["Vietnamese"] = "category";
    this.control2Category["Vietnamese"] = "Vietnamese";
    this.controlKey["LatinAmerican"] = "category";
    this.control2Category["LatinAmerican"] = "Latin American";
    this.controlKey["Argentinian"] = "category";
    this.control2Category["Argentinian"] = "Argentinian";
    this.controlKey["Brazilian"] = "category";
    this.control2Category["Brazilian"] = "Brazilian";
    this.controlKey["Caribbean"] = "category";
    this.control2Category["Caribbean"] = "Caribbean";
    this.controlKey["Cuban"] = "category";
    this.control2Category["Cuban"] = "Cuban";
    this.controlKey["Mexican"] = "category";
    this.control2Category["Mexican"] = "Mexican";
    this.controlKey["OtherLatin"] = "category";
    this.control2Category["OtherLatin"] = "Other Latin American";
    this.controlKey["Mediterranean"] = "category";
    this.control2Category["Mediterranean"] = "Mediterranean and European";
    this.controlKey["French"] = "category";
    this.control2Category["French"] = "French";
    this.controlKey["German"] = "category";
    this.control2Category["German"] = "German";
    this.controlKey["Greek"] = "category";
    this.control2Category["Greek"] = "Greek";
    this.controlKey["Italian"] = "category";
    this.control2Category["Italian"] = "Italian";
    this.controlKey["Russian"] = "category";
    this.control2Category["Russian"] = "Russian and other Eastern European";
    this.controlKey["Scandanavian"] = "category";
    this.control2Category["Scandanavian"] = "Scandanavian";
    this.controlKey["Spanish"] = "category";
    this.control2Category["Spanish"] = "Spanish and Tapas";
    this.controlKey["UK"] = "category";
    this.control2Category["UK"] = "United Kingdom";
    this.controlKey["African"] = "category";
    this.control2Category["African"] = "African";
    this.controlKey["Indian"] = "category";
    this.control2Category["Indian"] = "Indian";
    this.controlKey["MiddleEastern"] = "category";
    this.control2Category["MiddleEastern"] = "Middle Eastern";

    restURL="https://ap6oiuyew6.execute-api.us-east-1.amazonaws.com/dev/GetFoodPreferences";
    var config = {
      invokeUrl: restURL,
      accessKey: this.RestService.AuthData.accessKeyId,
      secretKey: this.RestService.AuthData.secretKey,
      sessionToken: this.RestService.AuthData.sessionToken,
      region:'us-east-1'
    };
    var apigClient = this.RestService.AWSRestFactory.newClient(config);
    var params = {
      //email: accountInfo.getEmail()
    };
    var pathTemplate = '';
    var method = 'GET';
    var additionalParams = {
        queryParams: {
            profileid: this.RestService.currentProfile
        }
    };
    var body = '';
    var self = this;
    var indexFPM;
    apigClient.invokeApi(params, pathTemplate, method, additionalParams, body)
    .then(function(result){
      self.RestService.results = result.data;
      self.FoodPrefService
      .getData()
      .then(data => {
        self.FoodPrefModel = self.RestService.results;
        console.log('FoodPrefModel 0: ', self.FoodPrefModel[0]);
        console.log('FoodPrefModel 1: ', self.FoodPrefModel[1]);
        if (self.FoodPrefModel[0].foodpreferenceid !== undefined) {
          indexFPM = 0;
          self.foodcategories.items = self.FoodPrefModel[1];
          //console.log('self.foodcategories.length: ' + self.foodcategories.items.length);
          for (var i = 0; i < self.foodcategories.items.length; i++) {
            self.categoryKey[self.foodcategories.items[i].categoryname] = i;
          }
        } else if (self.FoodPrefModel[1].foodpreferenceid !== undefined) {
          indexFPM = 1;
          self.foodcategories.items = self.FoodPrefModel[0];
          //console.log('self.foodcategories.length: ' + self.foodcategories.items.length);
          for (i = 0; i < self.foodcategories.items.length; i++) {
            self.categoryKey[self.foodcategories.items[i].categoryname] = i;
          }
        }
        self.card_form.controls["foodpreferenceid"].setValue(self.FoodPrefModel[indexFPM].foodpreferenceid);
        self.card_form.controls["maxcost"].setValue(self.FoodPrefModel[indexFPM].maxcost);
        self.card_form.controls["deliveryrange"].setValue(self.FoodPrefModel[indexFPM].deliveryrange);
        self.card_form.controls["deliveryoption"].setValue(self.FoodPrefModel[indexFPM].deliveryoption);
        self.card_form.controls["familyfood"].setValue(self.FoodPrefModel[indexFPM].familyfood);
        self.card_form.controls["dietpreferenceid"].setValue(self.FoodPrefModel[indexFPM].dietpreferenceid);
        self.card_form.controls["calorielimit"].setValue(self.FoodPrefModel[indexFPM].calorielimit);
        self.card_form.controls["mealsperentreevalue"].setValue(self.FoodPrefModel[indexFPM].mealsperentreevalue);
        self.card_form.controls["familydiet"].setValue(self.FoodPrefModel[indexFPM].familydiet);

        var blnWM;
        if (self.FoodPrefModel[indexFPM].iswhitemeat == 'Y') {
          blnWM = true;} else {blnWM = false;}
        self.card_form.controls["iswhitemeat"].setValue(blnWM);
        var blnChicken;
        if (self.FoodPrefModel[indexFPM].ischicken == 'Y') {
          blnChicken = true;} else {blnChicken = false;}
        self.card_form.controls["ischicken"].setValue(blnChicken);
        var blnVege;
        if (self.FoodPrefModel[indexFPM].isvegetarian == 'Y') {
          blnVege = true;} else {blnVege = false;}
        self.card_form.controls["isvegetarian"].setValue(blnVege);
        var blnVegeNE;
        if (self.FoodPrefModel[indexFPM].isvegetariannoegg == 'Y') {
          blnVegeNE = true;} else {blnVegeNE = false;}
        self.card_form.controls["isvegetariannoegg"].setValue(blnVegeNE);
        var blnVegan;
        if (self.FoodPrefModel[indexFPM].isvegan == 'Y') {
          blnVegan = true;} else {blnVegan = false;}
        self.card_form.controls["isvegan"].setValue(blnVegan);
        var blnPesc;
        if (self.FoodPrefModel[indexFPM].ispescatarian == 'Y') {
          blnPesc = true;} else {blnPesc = false;}
        self.card_form.controls["ispescatarian"].setValue(blnPesc);
        var blnDairy;
        if (self.FoodPrefModel[indexFPM].isavoiddairy == 'Y') {
          blnDairy = true;} else {blnDairy = false;}
        self.card_form.controls["isavoiddairy"].setValue(blnDairy);
        var blnGF;
        if (self.FoodPrefModel[indexFPM].isglutenfree == 'Y') {
          blnGF = true;} else {blnGF = false;}
        self.card_form.controls["isglutenfree"].setValue(blnGF);
        var blnLC;
        if (self.FoodPrefModel[indexFPM].islowcarb == 'Y') {
          blnLC = true;} else {blnLC = false;}
        self.card_form.controls["islowcarb"].setValue(blnLC);
        var blnHH;
        if (self.FoodPrefModel[indexFPM].ishearthealthy == 'Y') {
          blnHH = true;} else {blnHH = false;}
        self.card_form.controls["ishearthealthy"].setValue(blnHH);
        var blnLS;
        if (self.FoodPrefModel[indexFPM].islowsodium == 'Y') {
          blnLS = true;} else {blnLS = false;}
        self.card_form.controls["islowsodium"].setValue(blnLS);
        var blnGI;
        if (self.FoodPrefModel[indexFPM].islowglycemicindex == 'Y') {
          blnGI = true;} else {blnGI = false;}
        self.card_form.controls["islowglycemicindex"].setValue(blnGI);
        var blnHalal;
        if (self.FoodPrefModel[indexFPM].ishalal == 'Y') {
          blnHalal = true;} else {blnHalal = false;}
        self.card_form.controls["ishalal"].setValue(blnHalal);
        var blnKosher;
        if (self.FoodPrefModel[indexFPM].iskosher == 'Y') {
          blnKosher = true;} else {blnKosher = false;}
        self.card_form.controls["iskosher"].setValue(blnKosher);
        var blnPeanut;
        if (self.FoodPrefModel[indexFPM].haspeanutallergy == 'Y') {
          blnPeanut = true;} else {blnPeanut = false;}
        self.card_form.controls["haspeanutallergy"].setValue(blnPeanut);
        self.card_form.controls["haspeanutallergy"].disable();
        var blnNut;
        if (self.FoodPrefModel[indexFPM].hasnutallergy == 'Y') {
          blnNut = true;} else {blnNut = false;}
        self.card_form.controls["hasnutallergy"].setValue(blnNut);
        self.card_form.controls["hasnutallergy"].disable();
        var blnFish;
        if (self.FoodPrefModel[indexFPM].hasfishallergy == 'Y') {
          blnFish = true;} else {blnFish = false;}
        self.card_form.controls["hasfishallergy"].setValue(blnFish);
        self.card_form.controls["hasfishallergy"].disable();
        var blnShellFish;
        if (self.FoodPrefModel[indexFPM].hasshellfishallergy == 'Y') {
          blnShellFish = true;} else {blnShellFish = false;}
        self.card_form.controls["hasshellfishallergy"].setValue(blnShellFish);
        self.card_form.controls["hasshellfishallergy"].disable();

        var blnAmerican;
        if (self.foodcategories.items[self.categoryKey["American"]].answervalue == 'Y') {
          blnAmerican = true;} else {blnAmerican = false;}
          self.card_form.controls["American"].setValue(blnAmerican);
        var blnBakery;
        if (self.foodcategories.items[self.categoryKey["Bakeries"]].answervalue == 'Y') {
          blnBakery = true;} else {blnBakery = false;}
          self.card_form.controls["Bakeries"].setValue(blnBakery);
        var blnBarfood;
        if (self.foodcategories.items[self.categoryKey["Bar Food"]].answervalue == 'Y') {
          blnBarfood = true;} else {blnBarfood = false;}
          self.card_form.controls["Barfood"].setValue(blnBarfood);
        var blnBarbeque;
        if (self.foodcategories.items[self.categoryKey["Barbeque"]].answervalue == 'Y') {
          blnBarbeque = true;} else {blnBarbeque = false;}
          self.card_form.controls["Barbeque"].setValue(blnBarbeque);
        var blnBreakfast;
        if (self.foodcategories.items[self.categoryKey["Breakfast"]].answervalue == 'Y') {
          blnBreakfast = true;} else {blnBreakfast = false;}
          self.card_form.controls["Breakfast"].setValue(blnBreakfast);
        var blnBurgers;
        if (self.foodcategories.items[self.categoryKey["Burgers"]].answervalue == 'Y') {
          blnBurgers = true;} else {blnBurgers = false;}
          self.card_form.controls["Burgers"].setValue(blnBurgers);
        var blnCajun;
        if (self.foodcategories.items[self.categoryKey["Cajun and Creole"]].answervalue == 'Y') {
          blnCajun = true;} else {blnCajun = false;}
          self.card_form.controls["Cajun"].setValue(blnCajun);
        //var blnChicken;
        if (self.foodcategories.items[self.categoryKey["Chickenhouse"]].answervalue == 'Y') {
          blnChicken = true;} else {blnChicken = false;}
          self.card_form.controls["Chickenhouse"].setValue(blnChicken);
        var blnDelis;
        if (self.foodcategories.items[self.categoryKey["Delis and Sandwiches"]].answervalue == 'Y') {
          blnDelis = true;} else {blnDelis = false;}
          self.card_form.controls["Delis"].setValue(blnDelis);
        var blnDiners;
        if (self.foodcategories.items[self.categoryKey["Diners"]].answervalue == 'Y') {
          blnDiners = true;} else {blnDiners = false;}
          self.card_form.controls["Diners"].setValue(blnDiners);
        var blnHawaiian;
        if (self.foodcategories.items[self.categoryKey["Hawaiian"]].answervalue == 'Y') {
          blnHawaiian = true;} else {blnHawaiian = false;}
          self.card_form.controls["Hawaiian"].setValue(blnHawaiian)
        var blnPizza;
        if (self.foodcategories.items[self.categoryKey["Pizza"]].answervalue == 'Y') {
          blnPizza = true;} else {blnPizza = false;}
          self.card_form.controls["Pizza"].setValue(blnPizza);
        var blnSeafood;
        if (self.foodcategories.items[self.categoryKey["Seafood"]].answervalue == 'Y') {
          blnSeafood = true;} else {blnSeafood = false;}
          self.card_form.controls["Seafood"].setValue(blnSeafood);
        var blnSouthwest;
        if (self.foodcategories.items[self.categoryKey["Southwestern and Tex-Mex"]].answervalue == 'Y') {
          blnSouthwest = true;} else {blnSouthwest = false;}
          self.card_form.controls["Southwest"].setValue(blnSouthwest);
        var blnSteakhouse;
        if (self.foodcategories.items[self.categoryKey["Steakhouse"]].answervalue == 'Y') {
          blnSteakhouse = true;} else {blnSteakhouse = false;}
          self.card_form.controls["Steakhouse"].setValue(blnSteakhouse);
        var blnAsian;
        if (self.foodcategories.items[self.categoryKey["Asian"]].answervalue == 'Y') {
          blnAsian = true;} else {blnAsian = false;}
          self.card_form.controls["Asian"].setValue(blnAsian);
        var blnChinese;
        if (self.foodcategories.items[self.categoryKey["Chinese"]].answervalue == 'Y') {
          blnChinese = true;} else {blnChinese = false;}
          self.card_form.controls["Chinese"].setValue(blnChinese);
        var blnJapanese;
        if (self.foodcategories.items[self.categoryKey["Japanese"]].answervalue == 'Y') {
          blnJapanese = true;} else {blnJapanese = false;}
          self.card_form.controls["Japanese"].setValue(blnJapanese);
        var blnKorean;
        if (self.foodcategories.items[self.categoryKey["Korean"]].answervalue == 'Y') {
          blnKorean = true;} else {blnKorean = false;}
          self.card_form.controls["Korean"].setValue(blnKorean);
        var blnOtherAsian;
        if (self.foodcategories.items[self.categoryKey["Other East Asian"]].answervalue == 'Y') {
          blnOtherAsian = true;} else {blnOtherAsian = false;}
          self.card_form.controls["OtherAsian"].setValue(blnOtherAsian);
        var blnThai;
        if (self.foodcategories.items[self.categoryKey["Thai"]].answervalue == 'Y') {
          blnThai = true;} else {blnThai = false;}
          self.card_form.controls["Thai"].setValue(blnThai);
        var blnVietnamese;
        if (self.foodcategories.items[self.categoryKey["Vietnamese"]].answervalue == 'Y') {
          blnVietnamese = true;} else {blnVietnamese = false;}
          self.card_form.controls["Vietnamese"].setValue(blnVietnamese);
        var blnLatinAmerican;
        if (self.foodcategories.items[self.categoryKey["Latin American"]].answervalue == 'Y') {
          blnLatinAmerican = true;} else {blnLatinAmerican = false;}
          self.card_form.controls["LatinAmerican"].setValue(blnLatinAmerican);
        var blnArgentinian;
        if (self.foodcategories.items[self.categoryKey["Argentinian"]].answervalue == 'Y') {
          blnArgentinian = true;} else {blnArgentinian = false;}
          self.card_form.controls["Argentinian"].setValue(blnArgentinian);
        var blnBrazilian;
        if (self.foodcategories.items[self.categoryKey["Brazilian"]].answervalue == 'Y') {
          blnBrazilian = true;} else {blnBrazilian = false;}
          self.card_form.controls["Brazilian"].setValue(blnBrazilian);
        var blnCaribbean;
        if (self.foodcategories.items[self.categoryKey["Caribbean"]].answervalue == 'Y') {
          blnCaribbean = true;} else {blnCaribbean = false;}
          self.card_form.controls["Caribbean"].setValue(blnCaribbean);
        var blnCuban;
        if (self.foodcategories.items[self.categoryKey["Cuban"]].answervalue == 'Y') {
          blnCuban = true;} else {blnCuban = false;}
          self.card_form.controls["Cuban"].setValue(blnCuban);
        var blnJamaican;
        if (self.foodcategories.items[self.categoryKey["Jamaican"]].answervalue == 'Y') {
          blnJamaican = true;} else {blnJamaican = false;}
          self.card_form.controls["Jamaican"].setValue(blnJamaican);
        var blnMexican;
        if (self.foodcategories.items[self.categoryKey["Mexican"]].answervalue == 'Y') {
          blnMexican = true;} else {blnMexican = false;}
          self.card_form.controls["Mexican"].setValue(blnMexican);
        var blnOtherLatin;
        if (self.foodcategories.items[self.categoryKey["Other Latin American"]].answervalue == 'Y') {
          blnOtherLatin = true;} else {blnOtherLatin = false;}
          self.card_form.controls["OtherLatin"].setValue(blnOtherLatin);

        var blnMediterranean;
        if (self.foodcategories.items[self.categoryKey["Mediterranean and European"]].answervalue == 'Y') {
          blnMediterranean = true;} else {blnMediterranean = false;}
          self.card_form.controls["Mediterranean"].setValue(blnMediterranean);
        var blnFrench;
        if (self.foodcategories.items[self.categoryKey["French"]].answervalue == 'Y') {
          blnFrench = true;} else {blnFrench = false;}
          self.card_form.controls["French"].setValue(blnFrench);
        var blnGerman;
        if (self.foodcategories.items[self.categoryKey["German"]].answervalue == 'Y') {
          blnGerman = true;} else {blnGerman = false;}
          self.card_form.controls["German"].setValue(blnGerman);
        var blnGreek;
        if (self.foodcategories.items[self.categoryKey["Greek"]].answervalue == 'Y') {
          blnGreek = true;} else {blnGreek = false;}
          self.card_form.controls["Greek"].setValue(blnGreek);
        var blnItalian;
        if (self.foodcategories.items[self.categoryKey["Italian"]].answervalue == 'Y') {
          blnItalian = true;} else {blnItalian = false;}
          self.card_form.controls["Italian"].setValue(blnItalian);
        var blnRussian;
        if (self.foodcategories.items[self.categoryKey["Russian and other Eastern European"]].answervalue == 'Y') {
          blnRussian = true;} else {blnRussian = false;}
          self.card_form.controls["Russian"].setValue(blnRussian);
        var blnScandanavian;
        if (self.foodcategories.items[self.categoryKey["Scandanavian"]].answervalue == 'Y') {
          blnScandanavian = true;} else {blnScandanavian = false;}
          self.card_form.controls["Scandanavian"].setValue(blnScandanavian);
        var blnSpanish;
        if (self.foodcategories.items[self.categoryKey["Spanish and Tapas"]].answervalue == 'Y') {
          blnSpanish = true;} else {blnSpanish = false;}
          self.card_form.controls["Spanish"].setValue(blnSpanish);
        var blnUK;
        if (self.foodcategories.items[self.categoryKey["United Kingdom"]].answervalue == 'Y') {
          blnUK = true;} else {blnUK = false;}
          self.card_form.controls["UK"].setValue(blnUK);

        var blnAfrican;
        if (self.foodcategories.items[self.categoryKey["African"]].answervalue == 'Y') {
          blnAfrican = true;} else {blnAfrican = false;}
          self.card_form.controls["African"].setValue(blnAfrican);
        var blnIndian;
        if (self.foodcategories.items[self.categoryKey["Indian"]].answervalue == 'Y') {
          blnIndian = true;} else {blnIndian = false;}
          self.card_form.controls["Indian"].setValue(blnIndian);
        var blnMiddleEastern;
        if (self.foodcategories.items[self.categoryKey["Middle Eastern"]].answervalue == 'Y') {
          blnMiddleEastern = true;} else {blnMiddleEastern = false;}
          self.card_form.controls["MiddleEastern"].setValue(blnMiddleEastern);
        self.loading.dismiss();
      });
    }).catch( function(result){
        console.log('Error Result from foodPref.loadData: ', result);
        self.loading.dismiss();
        alert('There was an error retrieving this data.  Please try again later');
    });
  }

  public today() {
    return new Date().toISOString().substring(0,10);
  }

  changeMaster(master) {
    if (this.card_form.controls[master].value == true) {
     if (master == 'American') {
      if (this.card_form.controls["Bakeries"].value == false) {
        this.card_form.controls["Bakeries"].setValue(true);
        this.card_form.controls["Bakeries"].markAsDirty();
      }
      if (this.card_form.controls["Barfood"].value == false) {
        this.card_form.controls["Barfood"].setValue(true);
        this.card_form.controls["Barfood"].markAsDirty();
      }
      if (this.card_form.controls["Barbeque"].value == false) {
        this.card_form.controls["Barbeque"].setValue(true);
        this.card_form.controls["Barbeque"].markAsDirty();
      }
      if (this.card_form.controls["Breakfast"].value == false) {
        this.card_form.controls["Breakfast"].setValue(true);
        this.card_form.controls["Breakfast"].markAsDirty();
      }
      if (this.card_form.controls["Burgers"].value == false) {
        this.card_form.controls["Burgers"].setValue(true);
        this.card_form.controls["Burgers"].markAsDirty();
      }
      if (this.card_form.controls["Cajun"].value == false) {
        this.card_form.controls["Cajun"].setValue(true);
        this.card_form.controls["Cajun"].markAsDirty();
      }
      if (this.card_form.controls["Chickenhouse"].value == false) {
        this.card_form.controls["Chickenhouse"].setValue(true);
        this.card_form.controls["Chickenhouse"].markAsDirty();
      }
      if (this.card_form.controls["Delis"].value == false) {
        this.card_form.controls["Delis"].setValue(true);
        this.card_form.controls["Delis"].markAsDirty();
      }
      if (this.card_form.controls["Diners"].value == false) {
        this.card_form.controls["Diners"].setValue(true);
        this.card_form.controls["Diners"].markAsDirty();
      }
      if (this.card_form.controls["Hawaiian"].value == false) {
        this.card_form.controls["Hawaiian"].setValue(true);
        this.card_form.controls["Hawaiian"].markAsDirty();
      }
      if (this.card_form.controls["Pizza"].value == false) {
        this.card_form.controls["Pizza"].setValue(true);
        this.card_form.controls["Pizza"].markAsDirty();
      }
      if (this.card_form.controls["Seafood"].value == false) {
        this.card_form.controls["Seafood"].setValue(true);
        this.card_form.controls["Seafood"].markAsDirty();
      }
      if (this.card_form.controls["Southwest"].value == false) {
        this.card_form.controls["Southwest"].setValue(true);
        this.card_form.controls["Southwest"].markAsDirty();
      }
      if (this.card_form.controls["Steakhouse"].value == false) {
        this.card_form.controls["Steakhouse"].setValue(true);
        this.card_form.controls["Steakhouse"].markAsDirty();
      }
     } else if (master == 'Asian') {
      if (this.card_form.controls["Chinese"].value == false) {
        this.card_form.controls["Chinese"].setValue(true);
        this.card_form.controls["Chinese"].markAsDirty();
      }
      if (this.card_form.controls["Japanese"].value == false) {
        this.card_form.controls["Japanese"].setValue(true);
        this.card_form.controls["Japanese"].markAsDirty();
      }
      if (this.card_form.controls["Korean"].value == false) {
        this.card_form.controls["Korean"].setValue(true);
        this.card_form.controls["Korean"].markAsDirty();
      }
      if (this.card_form.controls["OtherAsian"].value == false) {
        this.card_form.controls["OtherAsian"].setValue(true);
        this.card_form.controls["OtherAsian"].markAsDirty();
      }
      if (this.card_form.controls["Thai"].value == false) {
        this.card_form.controls["Thai"].setValue(true);
        this.card_form.controls["Thai"].markAsDirty();
      }
      if (this.card_form.controls["Vietnamese"].value == false) {
        this.card_form.controls["Vietnamese"].setValue(true);
        this.card_form.controls["Vietnamese"].markAsDirty();
      }
     } else if (master == 'LatinAmerican') {
      if (this.card_form.controls["Argentinian"].value == false) {
        this.card_form.controls["Argentinian"].setValue(true);
        this.card_form.controls["Argentinian"].markAsDirty();
      }
      if (this.card_form.controls["Brazilian"].value == false) {
        this.card_form.controls["Brazilian"].setValue(true);
        this.card_form.controls["Brazilian"].markAsDirty();
      }
      if (this.card_form.controls["Caribbean"].value == false) {
        this.card_form.controls["Caribbean"].setValue(true);
        this.card_form.controls["Caribbean"].markAsDirty();
      }
      if (this.card_form.controls["Cuban"].value == false) {
        this.card_form.controls["Cuban"].setValue(true);
        this.card_form.controls["Cuban"].markAsDirty();
      }
      if (this.card_form.controls["Jamaican"].value == false) {
        this.card_form.controls["Jamaican"].setValue(true);
        this.card_form.controls["Jamaican"].markAsDirty();
      }
      if (this.card_form.controls["Mexican"].value == false) {
        this.card_form.controls["Mexican"].setValue(true);
        this.card_form.controls["Mexican"].markAsDirty();
      }
      if (this.card_form.controls["OtherLatin"].value == false) {
        this.card_form.controls["OtherLatin"].setValue(true);
        this.card_form.controls["OtherLatin"].markAsDirty();
      }
    } else if (master == 'Mediterranean') {
      if (this.card_form.controls["French"].value == false) {
        this.card_form.controls["French"].setValue(true);
        this.card_form.controls["French"].markAsDirty();
      }
      if (this.card_form.controls["German"].value == false) {
        this.card_form.controls["German"].setValue(true);
        this.card_form.controls["German"].markAsDirty();
      }
      if (this.card_form.controls["Greek"].value == false) {
        this.card_form.controls["Greek"].setValue(true);
        this.card_form.controls["Greek"].markAsDirty();
      }
      if (this.card_form.controls["Italian"].value == false) {
        this.card_form.controls["Italian"].setValue(true);
        this.card_form.controls["Italian"].markAsDirty();
      }
      if (this.card_form.controls["Russian"].value == false) {
        this.card_form.controls["Russian"].setValue(true);
        this.card_form.controls["Russian"].markAsDirty();
      }
      if (this.card_form.controls["Scandanavian"].value == false) {
        this.card_form.controls["Scandanavian"].setValue(true);
        this.card_form.controls["Scandanavian"].markAsDirty();
      }
      if (this.card_form.controls["Spanish"].value == false) {
        this.card_form.controls["Spanish"].setValue(true);
        this.card_form.controls["Spanish"].markAsDirty();
      }
      if (this.card_form.controls["UK"].value == false) {
        this.card_form.controls["UK"].setValue(true);
        this.card_form.controls["UK"].markAsDirty();
      }
     }
    } else {
      if (master == 'American') {
        if (this.card_form.controls["Bakeries"].value == true) {
          this.card_form.controls["Bakeries"].setValue(false);
          this.card_form.controls["Bakeries"].markAsDirty();
        }
        if (this.card_form.controls["Barfood"].value == true) {
          this.card_form.controls["Barfood"].setValue(false);
          this.card_form.controls["Barfood"].markAsDirty();
        }
        if (this.card_form.controls["Barbeque"].value == true) {
          this.card_form.controls["Barbeque"].setValue(false);
          this.card_form.controls["Barbeque"].markAsDirty();
        }
        if (this.card_form.controls["Breakfast"].value == true) {
          this.card_form.controls["Breakfast"].setValue(false);
          this.card_form.controls["Breakfast"].markAsDirty();
        }
        if (this.card_form.controls["Burgers"].value == true) {
          this.card_form.controls["Burgers"].setValue(false);
          this.card_form.controls["Burgers"].markAsDirty();
        }
        if (this.card_form.controls["Cajun"].value == true) {
          this.card_form.controls["Cajun"].setValue(false);
          this.card_form.controls["Cajun"].markAsDirty();
        }
        if (this.card_form.controls["Chickenhouse"].value == true) {
          this.card_form.controls["Chickenhouse"].setValue(false);
          this.card_form.controls["Chickenhouse"].markAsDirty();
        }
        if (this.card_form.controls["Delis"].value == true) {
          this.card_form.controls["Delis"].setValue(false);
          this.card_form.controls["Delis"].markAsDirty();
        }
        if (this.card_form.controls["Diners"].value == true) {
          this.card_form.controls["Diners"].setValue(false);
          this.card_form.controls["Diners"].markAsDirty();
        }
        if (this.card_form.controls["Hawaiian"].value == true) {
          this.card_form.controls["Hawaiian"].setValue(false);
          this.card_form.controls["Hawaiian"].markAsDirty();
        }
        if (this.card_form.controls["Pizza"].value == true) {
          this.card_form.controls["Pizza"].setValue(false);
          this.card_form.controls["Pizza"].markAsDirty();
        }
        if (this.card_form.controls["Seafood"].value == true) {
          this.card_form.controls["Seafood"].setValue(false);
          this.card_form.controls["Seafood"].markAsDirty();
        }
        if (this.card_form.controls["Southwest"].value == true) {
          this.card_form.controls["Southwest"].setValue(false);
          this.card_form.controls["Southwest"].markAsDirty();
        }
        if (this.card_form.controls["Steakhouse"].value == true) {
          this.card_form.controls["Steakhouse"].setValue(false);
          this.card_form.controls["Steakhouse"].markAsDirty();
        }
      } else if (master == 'Asian') {
        if (this.card_form.controls["Chinese"].value == true) {
          this.card_form.controls["Chinese"].setValue(false);
          this.card_form.controls["Chinese"].markAsDirty();
        }
        if (this.card_form.controls["Japanese"].value == true) {
          this.card_form.controls["Japanese"].setValue(false);
          this.card_form.controls["Japanese"].markAsDirty();
        }
        if (this.card_form.controls["Korean"].value == true) {
          this.card_form.controls["Korean"].setValue(false);
          this.card_form.controls["Korean"].markAsDirty();
        }
        if (this.card_form.controls["OtherAsian"].value == true) {
          this.card_form.controls["OtherAsian"].setValue(false);
          this.card_form.controls["OtherAsian"].markAsDirty();
        }
        if (this.card_form.controls["Thai"].value == true) {
          this.card_form.controls["Thai"].setValue(false);
          this.card_form.controls["Thai"].markAsDirty();
        }
        if (this.card_form.controls["Vietnamese"].value == true) {
          this.card_form.controls["Vietnamese"].setValue(false);
          this.card_form.controls["Vietnamese"].markAsDirty();
        }
       } else if (master == 'LatinAmerican') {
        if (this.card_form.controls["Argentinian"].value == true) {
          this.card_form.controls["Argentinian"].setValue(false);
          this.card_form.controls["Argentinian"].markAsDirty();
        }
        if (this.card_form.controls["Brazilian"].value == true) {
          this.card_form.controls["Brazilian"].setValue(false);
          this.card_form.controls["Brazilian"].markAsDirty();
        }
        if (this.card_form.controls["Caribbean"].value == true) {
          this.card_form.controls["Caribbean"].setValue(false);
          this.card_form.controls["Caribbean"].markAsDirty();
        }
        if (this.card_form.controls["Cuban"].value == true) {
          this.card_form.controls["Cuban"].setValue(false);
          this.card_form.controls["Cuban"].markAsDirty();
        }
        if (this.card_form.controls["Jamaican"].value == true) {
          this.card_form.controls["Jamaican"].setValue(false);
          this.card_form.controls["Jamaican"].markAsDirty();
        }
        if (this.card_form.controls["Mexican"].value == true) {
          this.card_form.controls["Mexican"].setValue(false);
          this.card_form.controls["Mexican"].markAsDirty();
        }
        if (this.card_form.controls["OtherLatin"].value == true) {
          this.card_form.controls["OtherLatin"].setValue(false);
          this.card_form.controls["OtherLatin"].markAsDirty();
        }
      } else if (master == 'Mediterranean') {
        if (this.card_form.controls["French"].value == true) {
          this.card_form.controls["French"].setValue(false);
          this.card_form.controls["French"].markAsDirty();
        }
        if (this.card_form.controls["German"].value == true) {
          this.card_form.controls["German"].setValue(false);
          this.card_form.controls["German"].markAsDirty();
        }
        if (this.card_form.controls["Greek"].value == true) {
          this.card_form.controls["Greek"].setValue(false);
          this.card_form.controls["Greek"].markAsDirty();
        }
        if (this.card_form.controls["Italian"].value == true) {
          this.card_form.controls["Italian"].setValue(false);
          this.card_form.controls["Italian"].markAsDirty();
        }
        if (this.card_form.controls["Russian"].value == true) {
          this.card_form.controls["Russian"].setValue(false);
          this.card_form.controls["Russian"].markAsDirty();
        }
        if (this.card_form.controls["Scandanavian"].value == true) {
          this.card_form.controls["Scandanavian"].setValue(false);
          this.card_form.controls["Scandanavian"].markAsDirty();
        }
        if (this.card_form.controls["Spanish"].value == true) {
          this.card_form.controls["Spanish"].setValue(false);
          this.card_form.controls["Spanish"].markAsDirty();
        }
        if (this.card_form.controls["UK"].value == true) {
          this.card_form.controls["UK"].setValue(false);
          this.card_form.controls["UK"].markAsDirty();
        }
       }
    }
  }

  changeCategory(category, master) {
    if (this.card_form.controls[category].value == false) {
      if (this.card_form.controls[master].value == true) {
        this.card_form.controls[master].setValue(false);
      }
    } else {
      if (master == 'American') {
        if (this.card_form.controls["Bakeries"].value == true && this.card_form.controls["Barfood"].value == true && this.card_form.controls["Barbeque"].value == true &&
          this.card_form.controls["Breakfast"].value == true && this.card_form.controls["Burgers"].value == true && this.card_form.controls["Cajun"].value == true &&
          this.card_form.controls["Chickenhouse"].value == true && this.card_form.controls["Delis"].value == true && this.card_form.controls["Diners"].value == true &&
          this.card_form.controls["Hawaiian"].value == true && this.card_form.controls["Pizza"].value == true && this.card_form.controls["Seafood"].value == true &&
          this.card_form.controls["Southwest"].value == true && this.card_form.controls["Steakhouse"].value == true) {
            this.card_form.controls[master].setValue(true);
            this.card_form.controls[master].markAsDirty();
        }
      } else if (master == 'Asian') {
        if (this.card_form.controls["Chinese"].value == true && this.card_form.controls["Japanese"].value == true && this.card_form.controls["Korean"].value == true &&
          this.card_form.controls["OtherAsian"].value == true && this.card_form.controls["Thai"].value == true && this.card_form.controls["Vietnamese"].value == true) {
            this.card_form.controls[master].setValue(true);
            this.card_form.controls[master].markAsDirty();
        }
      } else if (master == 'LatinAmerican') {
        if (this.card_form.controls["Argentinian"].value == true && this.card_form.controls["Brazilian"].value == true && this.card_form.controls["Caribbean"].value == true &&
          this.card_form.controls["Cuban"].value == true && this.card_form.controls["Jamaican"].value == true && this.card_form.controls["Mexican"].value == true &&
          this.card_form.controls["OtherLatin"].value == true) {
            this.card_form.controls[master].setValue(true);
            this.card_form.controls[master].markAsDirty();
        }
      } else if (master == 'Mediterranean') {
            if (this.card_form.controls["French"].value == true && this.card_form.controls["German"].value == true && this.card_form.controls["Greek"].value == true &&
              this.card_form.controls["Italian"].value == true && this.card_form.controls["Russian"].value == true && this.card_form.controls["Scandanavian"].value == true &&
              this.card_form.controls["Spanish"].value == true && this.card_form.controls["UK"].value == true) {
                this.card_form.controls[master].setValue(true);
                this.card_form.controls[master].markAsDirty();
            }
      }
    }
  }

  saveData(){
    var dtNow = moment(new Date());
    var dtExpiration = moment(this.RestService.AuthData.expiration);
    var self = this;

    if (dtNow < dtExpiration) {
      this.presentLoadingDefault();
      this.saveDataDo();
    } else {
      this.presentLoadingDefault();
      this.RestService.refreshCredentials(function(err, results) {
        if (err) {
          console.log('Need to login again!!! - Credentials expired from ' + self.formName + '.saveRecord');
          self.loading.dismiss();
          self.RestService.appRestart();
        } else {
          console.log('From ' + self.formName + '.saveRecord - Credentials refreshed!');
          self.saveDataDo();
        }
      });
    }
  }

  saveDataDo() {
    var self = this;
    var indexFPM
    var blnDietChanged = false;
    var blnFoodChanged = false;
    var changeObject;
    var saveCategory: FoodPrefCategory;
    var saveCategoryModel: FoodPrefCategoryModel;
    this.saving = true;
    saveCategoryModel = new FoodPrefCategoryModel();
    saveCategoryModel.items = new Array<FoodPrefCategory>();
    this.savePref = new FoodPref();
    this.savePref.categories = new FoodPrefCategoryModel();
    this.savePref.categories.items = new Array<FoodPrefCategory>();

    console.log('foodPref.save foodprefmodel: ', this.FoodPrefModel);
    if (this.FoodPrefModel[0].foodpreferenceid !== undefined) {
      indexFPM = 0;
    } else if (this.FoodPrefModel[1].foodpreferenceid !== undefined) {
      indexFPM = 1;
    }
    Object.keys(this.card_form.controls).forEach(key => {
      if (this.card_form.get(key).dirty) {
        changeObject = this.controlKey[key];
        if (changeObject == 'food') {
          if (!blnFoodChanged) {
            this.savePref.foodpreferenceid = this.FoodPrefModel[indexFPM].foodpreferenceid;
            blnFoodChanged = true;
          }
          this.savePref[key] = this.card_form.get(key).value;
          console.log("SavePref: " , this.savePref);
        } else if (changeObject == 'diet') {
          if (!blnDietChanged) {
            this.savePref.dietpreferenceid = this.FoodPrefModel[indexFPM].dietpreferenceid;
            blnDietChanged = true;
          }
          this.savePref[key] = this.card_form.get(key).value;
          console.log("SavePref: " , this.savePref);
        } else if (changeObject == 'category') {
          saveCategory = new FoodPrefCategory();
          //console.log("saveCategory key: ", key);
          saveCategory.foodcategorypreferenceid = this.foodcategories.items[this.categoryKey[this.control2Category[key]]].foodcategorypreferenceid;
          saveCategory.ismaster = this.foodcategories.items[this.categoryKey[this.control2Category[key]]].ismaster;
          saveCategory.master_category = this.foodcategories.items[this.categoryKey[this.control2Category[key]]].master_category;
          if (this.card_form.get(key).value == true) {
            saveCategory.answervalue = 'Y';
          } else {
            saveCategory.answervalue = 'N';
          }
          //console.log("saveCategory: ", saveCategory);
          saveCategoryModel.items.push(saveCategory);
          console.log("saveCategoryModel: ", saveCategoryModel.items);
        } else {
          if (self.loading !== undefined && self.loading !== null) {
            self.loading.dismiss();
          }
          alert("Check Data");
        }
      }
    });
    if(saveCategoryModel.items.length > 0) {
      this.savePref.categories.items = saveCategoryModel.items;
    }
    console.log("savePref Final: ", this.savePref);
      var restURL="https://ap6oiuyew6.execute-api.us-east-1.amazonaws.com/dev/GetFoodPreferences";
      var config = {
        invokeUrl: restURL,
        accessKey: this.RestService.AuthData.accessKeyId,
        secretKey: this.RestService.AuthData.secretKey,
        sessionToken: this.RestService.AuthData.sessionToken,
        region:'us-east-1'
      };
      var apigClient = this.RestService.AWSRestFactory.newClient(config);
      var params = {
            //pathParameters: this.vaccineSave
          };
      var pathTemplate = '';
      var method = 'POST';
      var additionalParams = {
        queryParams: {
          profileid: this.RestService.currentProfile
        }
      };
      var body = JSON.stringify(this.savePref);
      console.log('Calling Post', this.savePref);
      apigClient.invokeApi(params, pathTemplate, method, additionalParams, body)
        .then(function(result){
          self.RestService.results = result.data;
          console.log('Happy Path: ' + self.RestService.results);
          self.loadData();
          Object.keys(self.card_form.controls).forEach(control => {
            self.card_form.controls[control].markAsPristine();
          });
        }).catch( function(result){
          console.log('Result: ',result);
          self.loading.dismiss();
          alert('There was an error saving this data.  Please try again later');
        });
  }

  presentHelp(myEvent) {
    var title = 'From Allegry Section';
    var helptext = "For your convenience, Logos Health automatically flags the major food allergies listed below from records maintained in the allergy section.  " +
    "While Logos Health excludes dishes with stated allergens, please always verify with the restaurant concerning any major food allergies.";

    let popover = this.popoverCtrl.create(MenuHelp, {title: title, helptext: helptext});
    popover.onDidDismiss(data => {
      console.log('From popover onDismiss: ', data);
    });
    popover.present({
      ev: myEvent
    });
  }

  async ionViewCanLeave() {
      if (!this.saving && this.card_form.dirty) {
        const shouldLeave = await this.confirmLeave();
        return shouldLeave;
      }
  }

  confirmLeave(): Promise<Boolean> {
      let resolveLeaving;
      const canLeave = new Promise<Boolean>(resolve => resolveLeaving = resolve);
      const alert = this.alertCtrl.create({
        title: 'Exit without Saving',
        message: 'Do you want to exit without saving?',
        buttons: [
          {
            text: 'No',
            role: 'cancel',
            handler: () => resolveLeaving(false)
          },
          {
            text: 'Yes',
            handler: () => resolveLeaving(true)
          }
        ]
      });
      alert.present();
      return canLeave
  }

  presentLoadingDefault() {
    if (this.loading == undefined || this.loading == null) {
      this.loading = this.loadingCtrl.create({
        spinner: 'hide',
        content: `
          <div class="custom-spinner-container">
            <div class="custom-spinner-box">
               <img src="assets/images/stickManCursor3.gif" width="50" height="50" />
               Loading...
            </div>
          </div>`,
        });

        this.loading.present();

        setTimeout(() => {
          this.loading.dismiss();
          //console.log('Timeout for spinner called ' + this.formName);
        }, 15000);
    }
  }

}
