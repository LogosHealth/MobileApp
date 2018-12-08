
export class CallNote {
  recordid: number;
  callnote:string;
  contactid:number;
  visitid:number;
  dateofmeasure: string;
  active: string;
  profileid: number;
  userid: number;
  timezone: string;
}

export class CallNoteModel {
  items: Array<CallNote>;
}
