export class Procedure {
  recordid: number;
  medicaleventid: number;
  treatmentid: number;
  visitid: number;
  procedurename: string;
  description:string;
  result:string;
  dateofmeasure: string;
  proceduretiming: string;
  active: string;
  confirmed: string;
  profileid: number;
  userid: number;
  timezone: string;
}

export class ProcedureModel {
  items: Array<Procedure>;
}

