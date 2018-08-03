import { String } from "aws-sdk/clients/lexruntime";

export class FormTask {
  recordid: number;
  taskname: string;
  tasktime:string;
  reps: number;
  goalname: string;
  goalid: number;
  dateofmeasure: string;
  active: string;
  confirmed: string;
  profileid: number;
  userid: number;
  timezone: string;
}

export class FormTaskModel {
  items: Array<FormTask>;
}
