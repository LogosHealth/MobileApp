import { String } from "aws-sdk/clients/lexruntime";

export class ListNutrition {
  recordid: number;
  food: string;
  meal:string;
  amount:string;
  calories:string;
  dateofmeasure: string;
  active: string;
  profileid: number;
  userid: number;
  timezone: string;
}
export class ListNutritionDay {
  dayofmeasure: string;
  meals: Array<ListNutrition>;
}
export class ListNutritionModel {
  items: Array<ListNutritionDay>;
}
