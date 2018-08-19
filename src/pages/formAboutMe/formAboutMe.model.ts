import { phoneNumber } from "aws-sdk/clients/importexport";

export class AboutMe {
  profileid: number;
  accountid: number;
  physicalprofileid: number;
  firstname: string;
  lastname: string;
  ssn: string;
  primaryflag: number;
  streetaddress: string;
  city: string;
  state: number;
  zipcode: number;
  timezone: string;
  latitude: number;
  longitude: number;
  phonenumber: string;
  email: string;
  emergencycontact: string;
  emergencycontactphone: string;
  emergencycontactrelation: string;
  insurancename:string;
  insurancenumber: string;
  primaryuser: PrimaryUser;
  relationtoprimary: number;
  biologicalparent: string;
  medicalconsent: string;
  birthdate: string;
  age: number;
  bloodtype: number;
  rhfactor: number;
  gender: number;
  races: Array<RaceCode>;
  ethnicity: number;
  ispet: string;
  species: number;
  breed: number;
  latestweight: LatestWeight;
  latestheight: LatestHeight;
  userid: number;
  confirmed: string;
  active: string;  
}

export class PrimaryUser {
  profileid: number;
  firstname: string;
  streetaddress: string;
  city: string;
  state: string;
  zipcode: number;
  timezone: string;
  latitude: number;
  longitude: number;
  insurancename:string;
  insurancenumber: string;
}

export class LatestHeight {
  heightid: number;
  height: string;
  feet: number;
  inches: number;
  confirmed: string;
  active: string;  
  //dictionarycode: string;
}

export class LatestWeight {
  weightid: number;
  weight: string;
  unitofmeasure: string;
  confirmed: string;
  active: string;  
  //dictionarycode: string;
}

export class RaceCode {
  raceid: number;
  racecode: number;
  confirmed: string;
  active: string;  
  //dictionarycode: string;
}

