import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { environment } from "../../environments/environment";

@Injectable()
export class DataService {
  constructor(private httpClient: HttpClient) {}

  getTopSellingGames(): Observable<any> {
    return this.httpClient
      .get(environment.topSellingGames)
      .pipe(map((response: any) => response && response.games));
  }
}
