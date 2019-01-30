
export class ListStresslevel {
  recordid: number;
  level: number;
  dateofmeasure: string;
  factors: string;
  howmanage: string;
  active: string;
  profileid: number;
  userid: number;
}

export class ListStresslevelModel {
  items: Array<ListStresslevel>;
}
