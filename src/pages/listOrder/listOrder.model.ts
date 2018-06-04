export class ListOrder {
  recordid: number;
  name: string;
  startdate: string;
  physician:string;
  confirmed: string;
  active: string;
  schedules: Array<ListOrderSchedule>;
}
export class ListOrderSchedule {
  recordid: number;
  interval: string;
  agerangelow:number;
  agerangehigh:number;
  agerangeunit:string;
  notes:string;
  startdate:string;
  physician:string;
}
export class ListOrderModel {
  items: Array<ListOrder>;
}
