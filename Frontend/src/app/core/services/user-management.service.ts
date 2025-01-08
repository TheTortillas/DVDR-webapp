import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { StorageService } from './storage.service';

const HttpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
  }),
};

export interface UserSignIn {
  username: string;
  password: string;
}

@Injectable({
  providedIn: 'root',
})
export class UserManagementService {
  constructor(
    private httpClient: HttpClient,
    private storageService: StorageService
  ) {}
  private URLBase = environment.apiUrl;

  public clima(): Observable<any> {
    return this.httpClient.get('http://localhost:5299/WeatherForecast');
  }

  public postClima(newClima: any): Observable<any> {
    return this.httpClient.post(
      'http://localhost:5299/WeatherForecast',
      JSON.stringify(newClima),
      HttpOptions
    );
  }

  public signIn(
    userData: UserSignIn
  ): Observable<{ token: string; username: string; center: string }> {
    const url = this.URLBase + '/api/UserManagement/SignIn';
    return this.httpClient.post<{
      token: string;
      username: string;
      center: string;
    }>(url, userData, HttpOptions);
  }

  public refreshToken(): Observable<{ token: string }> {
    const url = this.URLBase + '/api/UserManagement/RefreshToken';
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    });
    return this.httpClient.post<{ token: string }>(url, {}, { headers });
  }
}
