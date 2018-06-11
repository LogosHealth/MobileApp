import { phoneNumber } from "aws-sdk/clients/importexport";

export class FoodPref {
  recordid: number;
  name: string;
  description: string;
  cost: number;
  calories: number;
  totalfat: number;
  saturatedfat: number;
  transfat: number;
  sodium: number;
  carbs: number;
  caloriesfromfat: number;
  protein: number;
  cholesterol: number;
  dietaryfiber: number;
  sugars: number;
  restaurantid:number;
  restaurantname: string;
  address: string;
  city: string;
  phone: phoneNumber
  image: string;
}
export class FoodPrefModel {
  items: Array<FoodPref>;
}
export class FoodPrefFilter {
  recordid: number;
  name: string;
  iscategory: string;
}
export class FoodPrefFilterModel {
  items: Array<FoodPrefFilter>;
}