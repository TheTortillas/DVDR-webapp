import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
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
  isRenewed: boolean;
  certificatesRequested: boolean;
}

export interface CourseFullData {
  courseId: number;
  courseKey: string;
  courseInfo: CourseInfo;
  documents: Document[];
  createdBy: string;
  parentCourseId: number | null;
  renewalCount: number;
  expirationDate: string;
  isRenewed: boolean;
}

export interface CourseInfo {
  courseName: string;
  serviceType: string;
  category: string;
  agreement: string | null;
  totalDuration: number;
  modality: string;
  educationalOffer: string;
  educationalPlatform: string[];
  customPlatform: string | null;
  actors: Actor[];
}

export interface Actor {
  id: number;
  name: string;
  role: string;
}

export interface Document {
  documentId: number;
  name: string;
  filePath: string;
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

  getAllCourses(): Observable<CourseFullData[]> {
    const url = this.URLBase + '/api/Course/GetAllCourses';
    return this.httpClient.get<CourseFullData[]>(url);
  }

  getUserCoursesWithSessions(username: string): Observable<any> {
    const url =
      this.URLBase + '/api/Course/UserCoursesWithSessions?username=' + username;
    return this.httpClient.get(url);
  }
}
