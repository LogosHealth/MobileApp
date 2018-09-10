export class FormFindContactItem {
  contactid: number;
  name: string;
  facilitytype: string;
  formatted_address:string;
  place_id:string;
  rating: string;
  doctortype: number;
  covered: string;
  firstname: string;
  lastname: string;
  city: string;
  state: number;
  statecode: string;
  zipcode: string;
  googlesearch: string;
  profileid: number;
  userid: number;
}

export class FormFindContactModel {
  items: Array<FormFindContactItem>;
}
