export class ListVisit {
  recordid: number;
  visitdate:string;
  contactid: number;
  physician: VisitPhysician;
  reason: string;
  notes: string;
  callnotes: CallNotes;
  todos: ToDos;
  active: string;
  profileid: number;
  firstname: string;
  photopath: string;
  userid: number;
  timezone: string;
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

export class ToDo {
  recordid: number;
  taskname: string;
  duedate: string;
  completedflag: string;
  confirmedflag: string;
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

export class ListVisitModel {
  items: Array<ListVisit>;
}
