import { Injectable } from "@angular/core";
import { Http } from '@angular/http';

import 'rxjs/add/operator/toPromise';

import { AboutMe } from './formAboutMe.model';

@Injectable()
export class AboutMeService {
  constructor(public http: Http) {}

  getData(): Promise<AboutMe> {
    return this.http.get('./assets/example_data/history.json')
     .toPromise()
     .then(response => response.json() as AboutMe)
     .catch(this.handleError);
  }

  private handleError(error: any): Promise<any> {
    console.error('An error occurred', error); // for demo purposes only
    return Promise.reject(error.message || error);
  }

}
