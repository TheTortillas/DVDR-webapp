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
  createdAt: string;
  status: string;
  approvalStatus: string;
  center: string;
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

export interface CourseSession {
  sessionId: number;
  period: string;
  numberOfParticipants: number;
  numberOfCertificates: number;
  cost: number;
  status: string;
  certificatesRequested: boolean;
  createdAt: string;
  schedule: ScheduleEntry[];
}

export interface ScheduleEntry {
  date: string;
  start: string;
  end: string;
}

// Interface para los cursos con sus sesiones
export interface CourseWithSessionsResponse {
  id: number; // Id del curso
  title: string; // Nombre del curso
  courseKeys: string[]; // Claves de los cursos (incluyendo renovaciones)
  sessions: SessionResponse[]; // Lista de sesiones del curso y sus renovaciones
  courseStatus: string; // Estatus del curso
  approvalStatus: string; // Estatus de aprobación del curso
}

export interface SessionResponse {
  id: number; // Id de la sesión
  clave: string; // Clave del curso al que pertenece la sesión
  periodo: string; // Periodo de la sesión (Ene 2025 - Mar 2025)
  participantes: number; // Número de participantes en la sesión
  constancias: number; // Número de constancias entregadas
  estatus: string; // Estatus de la sesión (waiting, opened, concluded)
  certificatesRequested: boolean; // Estatus de la solicitud de certificados (waiting, opened, concluded)
  certificatesDelivered: boolean; // Estatus de la entrega de certificados (waiting, opened, concluded)
}

export interface DocumentResponse {
  documentId: number;
  name: string;
  filePath: string;
}

export interface SessionCertificateRequestResponse {
  sessionId: number;
  courseId: number;
  courseName: string;
  courseKey: string;
  period: string;
  numberOfParticipants: number;
  numberOfCertificates: number;
  cost: number;
  status: string;
  certificatesRequested: boolean;
  createdAt: Date;
  documents: DocumentResponse[];
}

export interface UploadCertificateOfficialLetter {
  sessionId: number;
  certificatesCount: number;
  file: File;
}

export interface CertificateOfficialLetterResponse {
  id: number;
  sessionId: number;
  filePath: string;
  uploadedAt: string;
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

  getUserCoursesWithSessions(
    username: string
  ): Observable<CourseWithSessionsResponse[]> {
    const url =
      this.URLBase + '/api/Course/UserCoursesWithSessions?username=' + username;
    return this.httpClient.get<CourseWithSessionsResponse[]>(url);
  }

  getCourseSessions(courseId: number): Observable<CourseSession[]> {
    const url = this.URLBase + `/api/Course/GetCourseSessions/${courseId}`;
    return this.httpClient.get<CourseSession[]>(url);
  }

  approveOrRejectCourse(
    courseId: number,
    approvalStatus: 'approved' | 'rejected',
    adminNotes?: string
  ): Observable<any> {
    const url = this.URLBase + '/api/Course/ApproveOrRejectCourse';
    const body = {
      courseId,
      approvalStatus,
      adminNotes,
    };
    return this.httpClient.patch(url, body);
  }

  GetRequestedCertificatesSessions(): Observable<
    SessionCertificateRequestResponse[]
  > {
    const url = this.URLBase + '/api/Course/GetRequestedCertificatesSessions';
    return this.httpClient.get<SessionCertificateRequestResponse[]>(url);
  }

  UploadCertificateOfficialLetter(
    formData: FormData
  ): Observable<UploadCertificateOfficialLetter> {
    const url = this.URLBase + '/api/Course/UploadCertificateOfficialLetter';
    return this.httpClient.post<UploadCertificateOfficialLetter>(url, formData);
  }

  getCertificateOfficialLetter(
    sessionId: number
  ): Observable<CertificateOfficialLetterResponse> {
    const url =
      this.URLBase + `/api/Course/GetCertificateOfficialLetter/${sessionId}`;
    return this.httpClient.get<CertificateOfficialLetterResponse>(url);
  }
}
