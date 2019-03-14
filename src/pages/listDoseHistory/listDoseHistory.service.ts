import { Injectable } from "@angular/core";
import { Http } from '@angular/http';

import 'rxjs/add/operator/toPromise';

import { DoseHistoryModel } from './listDoseHistory.model';

@Injectable()
export class DoseHistoryService {
  constructor(public http: Http) {}

  getData(): Promise<DoseHistoryModel> {
    return this.http.get('./assets/example_data/lists.json')
     .toPromise()
     .then(response => response.json() as DoseHistoryModel)
     .catch(this.handleError);
  }

  private handleError(error: any): Promise<any> {
    console.error('An error occurred', error); // for demo purposes only
    return Promise.reject(error.message || error);
  }

}
