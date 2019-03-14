
export class ListAlert {
  recordid: number;
  reftable: string;
  alerttitle: string;
  alerttext:string;
  triggerdate:string;
  triggered: string;
  profiletoid: number;
  profileforid: number;
  confirmed: string;
  active: string;
  inactivereason: string;
  timezone: string;
  userid: number;
}

export class ListAlertModel {
  items: Array<ListAlert>;
}
