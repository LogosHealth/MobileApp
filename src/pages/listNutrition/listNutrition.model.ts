export class ListNutrition {
  recordid: number;
  food: string;
  meal:string;
  mealtime: string;
  mealtimeformat: string;
  amount:string;
  calories:string;
  carbs:string;
  fat:string;
  protein:string;
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
