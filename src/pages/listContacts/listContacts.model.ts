export class ListContact {
  recordid: number;
  title: string;
  firstname:string;
  lastname:string;
  suffix: string;
  streetaddress: string;
  city: string;
  state: string;
  zipcode: number;
  phonenumber: number;
  email: string;
  active: string;
  latitude: number;
  longitude: number;
  badaddress: string;
  fromgoogle: string;
  profileid: number;
  userid: number;
  timezone: string;
}

export class ListContactModel {
  items: Array<ListContact>;
}
