import { Injectable } from "@angular/core";
import { Http } from '@angular/http';

import 'rxjs/add/operator/toPromise';

import { SymptomModel } from './formSymptom.model';

@Injectable()
export class SymptomService {
  constructor(public http: Http) {}

  getData(): Promise<SymptomModel> {
    return this.http.get('./assets/example_data/lists.json')
     .toPromise()
     .then(response => response.json() as SymptomModel)
     .catch(this.handleError);
  }

  private handleError(error: any): Promise<any> {
    console.error('An error occurred', error); // for demo purposes only
    return Promise.reject(error.message || error);
  }

}
