import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
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

export interface User {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  secondLastName?: string;
  centerName?: string;
  role: string;
  createdAt: string;
}

export interface UserSignUp {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  secondLastName?: string;
  centerName?: string;
  role: string;
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

  public signIn(userData: UserSignIn): Observable<{
    token: string;
    username: string;
    center: string;
    role: string;
  }> {
    const url = this.URLBase + '/api/UserManagement/SignIn';
    return this.httpClient.post<{
      token: string;
      username: string;
      center: string;
      role: string;
    }>(url, userData, HttpOptions);
  }

  getAllUsers(): Observable<User[]> {
    return this.httpClient.get<User[]>(
      `${this.URLBase}/api/UserManagement/GetAllUsers`
    );
  }

  createUser(user: UserSignUp): Observable<any> {
    return this.httpClient.post(
      `${this.URLBase}/api/UserManagement/SignUp`,
      user
    );
  }

  updatePassword(username: string, newPassword: string): Observable<any> {
    return this.httpClient.post(
      `${this.URLBase}/api/UserManagement/UpdatePassword`,
      { username, newPassword },
      HttpOptions
    );
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
