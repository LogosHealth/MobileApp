export class ListVaccines {
  recordid: number;
  name: string;
  startdate: string;
  physician:string;
  contactid:number;
  confirmed: string;
  active: string;
  schedules: Array<ListVaccineSchedule>;
}
export class ListVaccineSchedule {
  recordid: number;
  interval: string;
  agerangelow:number;
  agerangehigh:number;
  agerangeunit:string;
  notes:string;
  startdate:string;
  physician:string;
  contactid:number;
  visitid:number;
}
export class ListVaccinesModel {
  items: Array<ListVaccines>;
}
