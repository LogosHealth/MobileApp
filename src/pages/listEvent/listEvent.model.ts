export class ListEvent {
  recordid: number;
  medicalevent: string;
  eventdescription: string;
  parenteventid: number;
  startdate:string;
  enddate:string;
  duration:string;
  continuing:string;
  recurring:string;
  medicallyconfirmed:string;
  visitid:number;
  physicianid:number;
  active: string;
  profileid: number;
  userid: number;
  timezone: string;
}

export class ListEventModel {
  items: Array<ListEvent>;
}
