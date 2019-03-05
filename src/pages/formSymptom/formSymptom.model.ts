export class Symptom {
  recordid: number;
  medicaleventid: number;
  symptomname:string;
  symptomdescription: string;
  startdate: string;
  enddate: string;
  medicalevent: string;
  treatments: Treatments;
  active: string;
  profileid: number;
  userid: number;
}

export class SymptomModel {
  items: Array<Symptom>;
}

export class Treatment {
  recordid: number;
  reftable: string;
  reftablefield: string;
  reftablefieldid: number;
  reftablefields: string;
  type: string;
  namevalue: string;
  dateofmeasure: string;
  active: string;
  selected: boolean;
}

export class Treatments {
  items: Array<Treatment>;
}
