export class ListMeasure {
  recordid: number;
  weight: number;
  mood: string;
  labname: number;
  labresult: string;
  labnametext: string;
  labunittext: string;
  labunit: number;
  lowerrange:string;
  upperrange:string;
  unitofmeasure:string;
  temperature: number;
  symptomname: string;
  full_symptom: string;
  symptomdescription: string;
  enddate: string;
  dateofmeasure: string;
  active: string;
  confirmed: string;
  profileid: number;
  userid: number;
  timezone: string;
}

export class ListMeasureModel {
  items: Array<ListMeasure>;
}
