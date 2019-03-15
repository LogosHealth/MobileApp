//import { phoneNumber } from "aws-sdk/clients/importexport";

export class FoodPref {
  foodpreferenceid: number;
  maxcost: string;
  deliveryrange: string;
  deliveryoption: string;
  familyfood: string;
  dietpreferenceid: number;
  calorielimit: string;
  mealsperentreevalue: number;
  iswhitemeat: string;
  ischicken: string;
  isvegetarian: string;
  isvegetariannoegg: string;
  isvegan: string;
  ispescatarian: string;
  isavoiddairy: string;
  isglutenfree: string;
  islowcarb: string;
  ishearthealthy: string;
  islowsodium: string;
  islowglycemicindex: string;
  ishalal: string;
  iskosher: string;
  haspeanutallergy: string;
  hasnutallergy: string;
  hasfishallergy: string;
  hasshellfishallergy: string;
  familydiet: string;
  categories: FoodPrefCategoryModel;
}
export class FoodPrefModel {
  items: Array<FoodPref>;
}
export class FoodPrefCategory {
  foodcategorypreferenceid: number;
  categoryname: string;
  ismaster: string;
  master_category: string;
  answervalue: string;
}
export class FoodPrefCategoryModel {
  items: Array<FoodPrefCategory>;
}
