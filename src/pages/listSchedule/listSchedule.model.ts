export class ListSchedule {
  recordid: number;
  name: string;
  type:string;
  description:string;
  interval: number;
  criteriatext: string;
  criteriatable: string;
  criteriavalues: string;
  criteriafilters: string;
  physiciantypes: string;
  activatedschedules: ActivatedSchedules;
  eligibles: Eligibles;
  accountid: number;
  userid: number;
}

export class ActivatedSchedule {
  recordid: number;
  scheduletemplateid: number;
  profileid:number;
  firstname:number;
  photopath:string;
  contactid:number;
  interval: number;
  nextdate: number;
  notifyprofiles: string;
  day90alert: string;
  day30alert: string;
  day7alert: string;
  active: string;
  userid: number;
}

export class ActivatedSchedules {
  items: Array<ActivatedSchedule>;
}

export class Eligible {
  profileid:number;
  firstname:number;
  photopath:string;
  selected:boolean;
}

export class Eligibles {
  items: Array<Eligible>;
}


export class ListScheduleModel {
  items: Array<ListSchedule>;
}
