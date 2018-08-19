export class ListAllergies {
  recordid: number;
  name: string;
  description: string;
  startdate: string;
  severity: string;
  medicallyconfirmed: string;
  confirmed: string;
  active: string;
  profileid: number;
  userid: number;
}
export class ListAllergiesModel {
  items: Array<ListAllergies>;
}
