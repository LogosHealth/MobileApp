import { Injectable } from "@angular/core";
import { Http } from '@angular/http';

import 'rxjs/add/operator/toPromise';

import { ListOrderModel, ListFilterModel } from './listOrder.model';

@Injectable()
export class ListOrderService {
  constructor(public http: Http) {}

  getData(): Promise<ListOrderModel> {
    return this.http.get('./assets/example_data/lists.json')
     .toPromise()
     .then(response => response.json() as ListOrderModel)
     .catch(this.handleError);
  }

  getFilter(): Promise<ListFilterModel> {
    return this.http.get('./assets/example_data/lists.json')
     .toPromise()
     .then(response => response.json() as ListFilterModel)
     .catch(this.handleError);
  }

  private handleError(error: any): Promise<any> {
    console.error('An error occurred', error); // for demo purposes only
    return Promise.reject(error.message || error);
  }

}
