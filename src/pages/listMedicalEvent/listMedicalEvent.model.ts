export class MedicalEvent {
  recordid: number;
  parentrecordid: number;
  medicalevent:string;
  dateofdiagnosis: string;
  onsetdate: string;
  enddate: string;
  eventdescription:string;
  chronicoracute:string;
  isallergy:string;
  allergyseverity:string;
  symptoms:SymptomModel;


  active: string;
  profileid: number;
  userid: number;
  timezone: string;
}

export class MedicalEventModel {
  items: Array<MedicalEvent>;
}

export class Symptom {
  recordid: number;
  symptom:string;
  description: string;
  onsetdate: string;
  enddate: string;
  active: string;
  profileid: number;
  userid: number;
}

export class SymptomModel {
  items: Array<Symptom>;
}
