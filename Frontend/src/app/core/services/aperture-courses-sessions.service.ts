import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

interface ScheduleEntry {
  date: string;
  start: string;
  end: string;
}

interface CourseSessionRequest {
  courseKey: string; // 🔍Enviamos la clave del curso
  period: string;
  numberOfParticipants: number;
  numberOfCertificates: number;
  cost: number;
  schedule: ScheduleEntry[];
}

@Injectable({
  providedIn: 'root',
})
export class ApertureCoursesSessionsService {
  private URLBase = environment.apiUrl;

  constructor(private httpClient: HttpClient) {}

  registerCourseSession(sessionData: CourseSessionRequest): Observable<any> {
    const url = this.URLBase + '/api/Course/RegisterCourseSession';
    return this.httpClient.post(url, sessionData);
  }
}
