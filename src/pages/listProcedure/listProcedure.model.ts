export class Procedure {
  recordid: number;
  medicaleventid: number;
  visitid: number;
  procedurename: string;
  description:string;
  result:string;
  dateofmeasure: string;
  active: string;
  profileid: number;
  userid: number;
  timezone: string;
}

export class ProcedureModel {
  items: Array<Procedure>;
}

