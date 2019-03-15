//import { String } from "aws-sdk/clients/lexruntime";

export class Dictionary {
  formname: string;
  fieldname: string;
  sortIndex: number;
  dictionary: Array<DictionaryItem>
}

export class DictionaryItem {
  recordid: number;
  fieldname: string;
  value: string;
  dictionarycode: string;
  codeddictionary: string;
  defaultSelection: string;
  dictionary: Array<DictionaryItem>
}

export class DictionaryModel {
  items: Array<Dictionary>;
}
