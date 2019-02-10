export class ListMedication {
  recordid: number;
  medicaleventid: number;
  medicationname:string;
  packagename: string;
  verbatimindication:string;
  dosage: string;
  doseunits: string;
  dosefrequency: string;
  startdate: string;
  duration: string;
  enddate: string;
  sideeffects: string;
  active: string;
  profileid: number;
  userid: number;
  timezone: string;
}

export class ListMedicationModel {
  items: Array<ListMedication>;
}
