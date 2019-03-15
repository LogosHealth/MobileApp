//import { String } from "aws-sdk/clients/lexruntime";

export class ListSleep {
  recordid: number;
  hoursslept: number;
  starttime:string;
  waketime:string;
  dateofmeasure: string;
  active: string;
  profileid: number;
  userid: number;
  timezone: string;
}

export class ListSleepModel {
  items: Array<ListSleep>;
}
