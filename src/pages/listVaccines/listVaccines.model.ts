export class ListVaccines {
  recordid: number;
  name: string;
  startdate: string;
  physician:string;
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
}
export class ListVaccinesModel {
  items: Array<ListVaccines>;
}
