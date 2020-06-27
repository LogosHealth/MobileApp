export class ListContact {
  recordid: number;
  title: string;
  firstname:string;
  firstnamelock:string;
  lastname:string;
  lastnamelock:string;
  suffix: string;
  streetaddress: string;
  city: string;
  state: string;
  statecode: string;
  zipcode: number;
  phonenumber: number;
  email: string;
  website: string;
  latitude: number;
  longitude: number;
  badaddress: string;
  fromgoogle: string;
  googleurl: string;
  facilitytype: string;
  profile2contactid: number;
  relationship: string;
  doctortype: number;
  covered: string;
  profileid: number;
  userid: number;
  timezone: string;
  active: string;
}

export class ListContactModel {
  items: Array<ListContact>;
}
