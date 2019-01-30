
export class ListTravel {
  recordid: number;
  country: string;
  arrivaldate: string;
  departuredate: string;
  reason: string;
  active: string;
  profileid: number;
  userid: number;
}

export class ListTravelModel {
  items: Array<ListTravel>;
}
