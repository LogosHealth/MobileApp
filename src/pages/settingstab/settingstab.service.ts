import { Injectable } from "@angular/core";
import { Http } from '@angular/http';

import 'rxjs/add/operator/toPromise';

import { SettingsModel } from './settingstab.model';

@Injectable()
export class SettingsService {
  constructor(public http: Http) {}

  getData(): Promise<SettingsModel> {
    return this.http.get('./assets/example_data/settings.json')
     .toPromise()
     .then(response => response.json() as SettingsModel)
     .catch(this.handleError);
  }

  private handleError(error: any): Promise<any> {
    console.error('An error occurred', error); // for demo purposes only
    return Promise.reject(error.message || error);
  }

}
