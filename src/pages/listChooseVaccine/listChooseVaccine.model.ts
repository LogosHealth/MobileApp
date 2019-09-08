export class ChooseVaccine {
  recordid: number;
  vaccinescheduleid: number;
  vaccinename: string;
  vaccinenameid: number;
  description:string;
  takeasadult: string;
  numberofdoses: number;
  maxage: number;
  maxageunit: string;
  vaccineid: number;
  profileid: number;
  lastdose: number;
  protectfrom: string;
  visitid: number;
  visitdate: string;
  contactid: number;
  userid: number;
}

export class ChooseVaccineModel {
  items: Array<ChooseVaccine>;
}

