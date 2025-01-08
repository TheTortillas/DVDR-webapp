import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

const HttpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
  }),
};

@Injectable({
  providedIn: 'root',
})
export class DataService {
  constructor(private httpClient: HttpClient) {}
  private URLBase = environment.apiUrl;

  public getCategoriasAcademicas(): Observable<any> {
    const url = this.URLBase + '/api/Data/AcademicCategories';
    return this.httpClient.get(url, HttpOptions);
  }
}
