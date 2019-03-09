export class MedicalEvent {
  recordid: number;
  parenteventid: number;
  visitid: number;
  physicianid: number;
  medicalevent:string;
  dateofdiagnosis: string;
  onsetdate: string;
  enddate: string;
  eventdescription:string;
  chronicflag:string;
  isallergy:string;
  allergyseverity:string;
  medicallyconfirmed: string;
  processsymptom: boolean;
  treatmentid: number;
  symptoms:Symptoms;
  treatments: Treatments;
  active: string;
  profileid: number;
  userid: number;
  timezone: string;
}

export class MedicalEventModel {
  items: Array<MedicalEvent>;
}

export class Symptom {
  recordid: number;
  symptom:string;
  description: string;
  onsetdate: string;
  enddate: string;
  treatments: Treatments;
  active: string;
  profileid: number;
  userid: number;
}

export class Symptoms {
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
