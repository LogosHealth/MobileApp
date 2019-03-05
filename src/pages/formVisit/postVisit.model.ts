export class PostVisit {
  recordid: number;
  visitsummary:string;
  diagnoses: Diagnoses;
  outcomes: Outcomes;
  payments: Payments;
  todos: ToDos;

  profileid: number;
  userid: number;
  timezone: string;
}

export class Diagnosis {
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

export class Diagnoses {
  items: Array<Diagnosis>;
}

export class Symptom {
  recordid: number;
  medicaleventid: number;
  full_symptom:string;
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
  indication: string;
  dateofmeasure: string;
  active: string;
  selected: boolean;
}

export class Treatments {
  items: Array<Treatment>;
}

export class Outcome {
  recordid: number;
  visitid: number;
  reftable: string;
  reftablefield: string;
  reftablefieldid: string;
  reftablefields: string;
  type: string;
  namevalue: string;
  dateofmeasure: string;
  active: string;
}

export class Outcomes {
  items: Array<Outcome>;
}

export class Payment {
  recordid: number;
  visitid: number;
  reftable: string;
  reftablefield: string;
  reftablefieldid: string;
  reftablefields: string;
  type: string;
  payment: string;
  paymentdescription: string;
  bucketid: number;
  active: string;
}

export class Payments {
  items: Array<Payment>;
}

export class ToDo {
  recordid: number;
  taskname: string;
  duedate: string;
  completedflag: string;
  notifyschedule: ToDoNotify;
  active: string;
}

export class ToDoNotify {
  recordid: number;
  taskid: number;
  visitid: number;
  notifyprofiles: string;
  alerttitle: string;
  alerttext: string;
  targetdate: string;
  daybefore: string;
  nightbefore: string;
  morningof: string;
  hourbefore: string;
  thirtyminute: string;
  fifteenminute: string;
  active: string;
}

export class ToDos {
  items: Array<ToDo>;
}

export class PostVisitModel {
  items: Array<PostVisit>;
}
