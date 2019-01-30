
export class LifestyleItem {
  recordid: number;
  type: string;
  subtype: string;
  does: string;
  dateofmeasure: string;
  startdate: string;
  enddate: string;
  daysperweek: number;
  itemsperday: string;
  comments: string;
  active: string;
  profileid: number;
  userid: number;
}

export class LifestyleItemModel {
  items: Array<LifestyleItem>;
}
