import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ApertureCoursesSessionsService {
  private URLBase = environment.apiUrl;

  constructor(private httpClient: HttpClient) {}
}
