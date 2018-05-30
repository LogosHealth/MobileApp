export class ListModel {
  recordid: number;
  name: string;
  description: string;
  startdate: string;
  severity: string;
  medicallyconfirmed: string;
  confirmed: string;
}
export class List2Model {
  items: Array<ListModel>;
}
