//import { String } from "aws-sdk/clients/lexruntime";

export class SubscriptionComm {
  recordid: number;
  readflag: string;
  subject:string;
  url:string;
  category: string;
  createddate: string;
  active: string;
  isDirty: boolean;
  profileid: number;
}

export class SubscriptionCommModel {
  items: Array<SubscriptionComm>;
}
