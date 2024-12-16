import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

const HttpOptions = {headers: new HttpHeaders({'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'})};

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private httpClient: HttpClient) {  }

  public clima() : Observable<any> {
    return this.httpClient.get('http://localhost:5299/WeatherForecast');
  }

  public postClima(newClima : any) : Observable<any> {
    return this.httpClient.post('http://localhost:5299/WeatherForecast', JSON.stringify(newClima), HttpOptions);
  }
}
