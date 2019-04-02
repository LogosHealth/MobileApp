//import { String } from "aws-sdk/clients/lexruntime";

export class ListTask {
  recordid: number;
  taskname: string;
  tasktime:string;
  reps: number;
  goalname: string;
  shortdescription: string;
  description: string;
  goalid: number;
  duedate: string;
  dateofmeasure: string;
  active: string;
  confirmed: string;
  completed: string;
  profileid: number;
  userid: number;
  timezone: string;
}

export class ListTaskModel {
  items: Array<ListTask>;
}
