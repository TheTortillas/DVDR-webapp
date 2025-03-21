import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface PendingAperture {
  sessionId: number;
  courseKey: string;
  courseName: string;
  period: string;
  numberOfParticipants: number;
  numberOfCertificates: number;
  cost: number;
  centerName: string;
  directorName: string;
  directorTitle: string;
  directorGender: string;
  modality: string;
  totalDuration: number;
  startDate: string;
  endDate: string;
  totalDays: number;
  instructors: string;
  schedule: ScheduleEntry[];
  signed: boolean;
  approvalStatus: string;
  signedRequestLetterPath: string | null;
}

export interface SessionApprovalRequest {
  sessionId: number;
  approvalStatus: 'approved' | 'rejected';
  officialLetter?: File;
}

export interface SessionOfficialLetter {
  sessionId: number;
  filePath: string;
  documentationFolder: string;
}

interface ScheduleEntry {
  date: string;
  start: string;
  end: string;
}

interface CourseSessionRequest {
  courseKey: string; // Enviamos la clave del curso
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

  getPendingApertures(): Observable<PendingAperture[]> {
    return this.httpClient.get<PendingAperture[]>(
      `${this.URLBase}/api/Course/GetPendingApertures`
    );
  }

  approveOrRejectSession(data: SessionApprovalRequest): Observable<any> {
    const formData = new FormData();
    formData.append('sessionId', data.sessionId.toString());
    formData.append('approvalStatus', data.approvalStatus);

    return this.httpClient.post(
      `${this.URLBase}/api/Course/ApproveOrRejectSession`,
      formData
    );
  }

  getPendingAperturesCount(): Observable<number> {
    return this.getPendingApertures().pipe(
      map((apertures) => apertures.length)
    );
  }

  getSessionOfficialLetter(
    sessionId: number
  ): Observable<SessionOfficialLetter> {
    return this.httpClient.get<SessionOfficialLetter>(
      `${this.URLBase}/api/Course/GetSessionOfficialLetter/${sessionId}`
    );
  }

  getUserPendingApertures(username: string): Observable<PendingAperture[]> {
    return this.httpClient.get<PendingAperture[]>(
      `${this.URLBase}/api/Course/GetUserPendingApertures?username=${username}`
    );
  }

  // Método para subir la carta firmada por el usuario
  uploadSignedRequestLetter(sessionId: number, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('sessionId', sessionId.toString());
    formData.append('file', file);

    return this.httpClient.post(
      `${this.URLBase}/api/Course/UploadSignedRequestLetter`,
      formData
    );
  }

  registerCourseSession(sessionData: CourseSessionRequest): Observable<any> {
    const url = this.URLBase + '/api/Course/RegisterCourseSession';
    return this.httpClient.post(url, sessionData);
  }
}
