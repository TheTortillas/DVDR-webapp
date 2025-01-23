import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class CoursesService {
  private URLBase = environment.apiUrl;

  constructor(private httpClient: HttpClient) {}

  // Método para registrar un curso
  registerCourse(formData: FormData): Observable<any> {
    const url = this.URLBase + '/api/Course/RegisterCourse';
    return this.httpClient.post(url, formData);
  }

  getCoursesByUser(username: string): Observable<any> {
    const url =
      this.URLBase + `/api/Course/GetCoursesByUser?username=${username}`;
    return this.httpClient.get(url);
  }
}
