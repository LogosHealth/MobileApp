import { Injectable } from "@angular/core";
import { Http } from '@angular/http';

import 'rxjs/add/operator/toPromise';

import { HistoryModel } from './history.model';

@Injectable()
export class HistoryService {
  constructor(public http: Http) {}

  getData(): Promise<HistoryModel> {
    return this.http.get('./assets/example_data/history.json')
     .toPromise()
     .then(response => response.json() as HistoryModel)
     .catch(this.handleError);
  }

  private handleError(error: any): Promise<any> {
    console.error('An error occurred', error); // for demo purposes only
    return Promise.reject(error.message || error);
  }

}
