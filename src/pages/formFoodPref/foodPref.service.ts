import { Injectable } from "@angular/core";
import { Http } from '@angular/http';

import 'rxjs/add/operator/toPromise';

import { FoodPrefModel } from './foodPref.model';

@Injectable()
export class FoodPrefService {
  constructor(public http: Http) {}

  getData(): Promise<FoodPrefModel> {
    return this.http.get('./assets/example_data/history.json')
     .toPromise()
     .then(response => response.json() as FoodPrefModel)
     .catch(this.handleError);
  }

  private handleError(error: any): Promise<any> {
    console.error('An error occurred', error); // for demo purposes only
    return Promise.reject(error.message || error);
  }

}
