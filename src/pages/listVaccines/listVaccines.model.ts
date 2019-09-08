export class ListVaccines {
  recordid: number;
  vaccineinfoid: number;
  name: string;
  description: string;
  protectfrom: string;
  profileid: number;
  confirmed: string;
  active: string;
  userid: number;
  schedules: Array<ListVaccineSchedule>;
}
export class ListVaccineSchedule {
  recordid: number;
  vaccine_templateid: number;
  interval: string;
  agerangelow:number;
  agerangehigh:number;
  agerangeunit:string;
  notes:string;
  datereceived:string;
  contactid:number;
  visitid:number;
  title:string;
  firstname:string;
  lastname:string;
}
export class ListVaccinesModel {
  items: Array<ListVaccines>;
}
