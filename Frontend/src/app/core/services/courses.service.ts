import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Course {
  id: number;
  title: string;
  clave: string;
  status: string;
  approvalStatus: string;
  totalDuration: number;
  expirationDate: string;
}

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

  getCoursesByUser(username: string): Observable<Course[]> {
    const url =
      this.URLBase + `/api/Course/GetCoursesByUser?username=${username}`;
    return this.httpClient.get<Course[]>(url);
  }

  getCourseById(courseId: number): Observable<any> {
    const url = this.URLBase + `/api/Course/GetCourse/${courseId}`;
    return this.httpClient.get(url);
  }
}
