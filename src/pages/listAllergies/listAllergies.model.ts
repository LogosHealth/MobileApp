export class ListAllergies {
  recordid: number;
  name: string;
  description: string;
  startdate: string;
  severity: string;
  medicallyconfirmed: string;
  confirmed: string;
}
export class ListAllergiesModel {
  items: Array<ListAllergies>;
}
