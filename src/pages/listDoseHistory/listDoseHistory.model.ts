
export class ListDoseHistory {
  recordid: number;
  treatmentid: number;
  dosedate:string;
  amount:string;
  unit: string;
  type: string;
  active: string;
  profileid: number;
  userid: number;
  timezone: string;
}

export class DoseHistoryModel {
  items: Array<ListDoseHistory>;
}
