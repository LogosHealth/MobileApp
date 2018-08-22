export class ListLabs {
  recordid: number;
  labnametext: string;
  labname: number;
  labresult: string;
  labunittext: string;
  labunit: number;
  lowerrange:string;
  upperrange:string;
  dateofmeasure: string;
  active: string;
  confirmed: string;
  profileid: number;
  userid: number;
  timezone: string;
}

export class ListLabsModel {
  items: Array<ListLabs>;
}
