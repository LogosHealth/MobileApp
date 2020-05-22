
export class Academy {
  recordid: number;
  subscription_categoryid: number;
  name: string;
  description: string;
  subscribe: string;
  active: string;
  dirty: string;
}
export class AcademyModel {
  profileid: number;
  userid: number;
  items: Array<Academy>;
}
