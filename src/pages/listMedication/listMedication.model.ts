export class ListMedication {
  recordid: number;
  accountid: number;
  drugid: number;
  medicaleventid: number;
  medicationname:string;
  formulation: string;
  manufacturer: string;
  mode: string;
  type: string;
  purchasedate: string;
  expiration: string;
  startinginventory: number;
  inventory: number;
  inventoryunit: string;
  serialnumber: string;
  cost: string;
  specialinstruction: string;
  treatmentresults: TreatmentResults;
  confirmed: string;
  completeflag: string;
  startdate: string;
  active: string;
  profileid: number;
  userid: number;
  timezone: string;
}

export class TreatmentResult {
  recordid: number;
  profileid: number;
  firstname: string;
  symptomid:number;
  medicaleventid:number;
  reftable:string;
  reftablefield:string;
  reftablefieldid:number;
  reftablefields:string;
  type: string;
  namevalue: string;
  startdate: string;
  enddate: string;
  verbatimindication: string;
  dosage: string;
  doseunits: string;
  dosefrequency: string;
  dosetrackingtype: string;
  dosetrackingstate: string;
  isnotify: string;
  notifyoffset: number;
  notifyprofiles: string;
  effectiveflag: string;
  allergyflag: string;
  sideeffects: SideEffects;
  scheduletimes: ScheduleTimes;
  backCalculate: string;
  backCalculateFrom: number;
  comments: string;
  active: string;
  userid: number;
  timezone: string;
}

export class SideEffect {
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
  symptoms:Symptoms;
  treatments: Treatments;
  active: string;
  profileid: number;
  userid: number;
  timezone: string;
}

export class ScheduleTime {
  recordid: number;
  treatmentid: number;
  profileid: number;
  startdate: string;
  dosenumber: number;
  dosetime: string;
  active: string;
}

export class ScheduleTimes {
  items: Array<ScheduleTime>;
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

export class SideEffects {
  items: Array<SideEffect>;
}

export class TreatmentResults {
  items: Array<TreatmentResult>;
}

export class ListMedicationModel {
  items: Array<ListMedication>;
}
