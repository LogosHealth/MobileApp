export class Procedure {
  recordid: number;
  medicaleventid: number;
  symptomid: number;
  verbatimindication: string;
  treatmentid: number;
  visitid: number;
  physicianid: number;
  title: string;
  firstname: string;
  lastname:string;
  procedurename: string;
  therapyname: string;
  description:string;
  result:string;
  dateofmeasure: string;
  status: string;
  proceduretiming: string;
  active: string;
  confirmed: string;
  profileid: number;
  userid: number;
  namevalue: string;
  type: string;
  timezone: string;
}

export class ProcedureModel {
  items: Array<Procedure>;
}

