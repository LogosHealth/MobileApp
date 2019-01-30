
export class Occupation {
  recordid: number;
  name: string;
  description: string;
  startdate: string;
  enddate: string;
  knownhazards: string;
  active: string;
  profileid: number;
  userid: number;
}

export class ListOccupationModel {
  items: Array<Occupation>;
}
