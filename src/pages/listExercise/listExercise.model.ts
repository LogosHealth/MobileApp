import { String } from "aws-sdk/clients/lexruntime";

export class ListExercise {
  recordid: number;
  exercisetype: string;
  exercisetime:string;
  caloriesburned: string;
  caloriesburnedvalue: number;
  distance: string;
  reps: number;
  goalname: string;
  goalid: number;
  dateofmeasure: string;
  active: string;
  confirmed: string;
  profileid: number;
  userid: number;
}

export class ListExerciseModel {
  items: Array<ListExercise>;
}
