export class Lifestyle {
  recordid: number;
  profileid: number;
  accountid: number;
  occupations: OccupationModel;
  stresslevel: StressLevel;
  alcohol: LifestyleItem;
  nicotine: LifestyleItem;
  marijuana: LifestyleItem;
  otherdrug: LifestyleItem;
  hobbies: string;
  travels: TravelModel;
  active: string;
  userid: number;
}

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
}

export class LifestyleItemModel {
  items: Array<LifestyleItem>;
}

export class Occupation {
  recordid: number;
  name: string;
  description: string;
  startdate: string;
  enddate: string;
  knownhazards: string;
  active: string;
}

export class OccupationModel {
  items: Array<Occupation>;
}

export class StressLevel {
  recordid: number;
  level: string;
  dateofmeasure: string;
  factors: string;
  howmanage: string;
  active: string;
}

export class StressLevelModel {
  items: Array<StressLevel>;
}

export class Travel {
  recordid: number;
  country: string;
  arrivaldate: string;
  departuredate: string;
  reason: string;
  active: string;
}

export class TravelModel {
  items: Array<Travel>;
}
