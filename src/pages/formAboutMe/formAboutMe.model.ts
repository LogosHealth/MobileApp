import { phoneNumber } from "aws-sdk/clients/importexport";

export class AboutMe {
  profileid: number;
  physicalprofileid: number;
  firstname: string;
  lastname: string;
  ssn: string;
  primaryflag: number;
  streetaddress: string;
  city: string;
  state: string;
  zipcode: number;
  timezone: string;
  phonenumber: string;
  emergencycontactname: string;
  emergencycontactnumber: string;
  emergencycontactrelation: string;
  insurancename:string;
  insurancenumber: string;
  primaryuser: PrimaryUser;
  relationtoprimary: string;
  biologicalparent: string;
  medicalconsent: string;
  birthdate: string;
  age: number;
  bloodtype: number;
  rhfactor: number;
  gender: string;
  racecodes: Array<RaceCode>;
  ethnicity: string;
  ispet: string;
  species: number;
  breed: number;
  confirmed: string;
  active: string;  
}

export class PrimaryUser {
  profileid: number;
  firstname: string;

}

export class RaceCode {
  raceid: number;
  racecode: string;
}

