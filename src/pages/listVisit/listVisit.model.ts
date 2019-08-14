export class ListVisit {
  recordid: number;
  scheduleinstanceid: number;
  visitdate:string;
  contactid: number;
  accountid: number;
  physician: VisitPhysician;
  reason: string;
  importantinfo: ImportantInfos;
  visititem: VisitItems;
  notes: string;
  callnotes: CallNotes;
  todos: ToDos;
  todopost: ToDos;
  questions: Questions;
  active: string;
  profileid: number;
  firstname: string;
  photopath: string;
  visitreminder: ToDoNotify;
  userid: number;
  imageURL: string;
  timezone: string;

  diagnoses: Diagnoses;
}

export class VisitPhysician {
  recordid: number;
  title: string;
  firstname:string;
  lastname:string;
  streetaddress: string;
  city: string;
  state: string;
  zipcode: number;
  phonenumber: number;
}

export class ImportantInfo {
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
  medicaleventid: number;
}

export class ImportantInfos {
  items: Array<ImportantInfo>;
}

export class VisitItems {
  items: Array<ImportantInfo>;
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

export class CallNote {
  recordid: number;
  note: string;
}

export class CallNotes {
  items: Array<CallNote>;
}

export class Question {
  recordid: number;
  question: string;
  answer: string;
  active: string;
}

export class Questions {
  items: Array<Question>;
}

export class Diagnosis {
  recordid: number;
  medicalevent: string;
  resolved: string;
  active: string;
}

export class Diagnoses {
  items: Array<Diagnosis>;
}

export class ListVisitModel {
  items: Array<ListVisit>;
}
