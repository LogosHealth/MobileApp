import { String } from "aws-sdk/clients/lexruntime";

export class Dictionary {
  formname: string;
  fieldname: string;
  sortIndex: number;
  dictionary: Array<DictionaryItem>
}

export class DictionaryItem {
  recordid: number;
  fieldname: string;
  dictionarycode: string;
}

export class DictionaryModel {
  items: Array<Dictionary>;
}
