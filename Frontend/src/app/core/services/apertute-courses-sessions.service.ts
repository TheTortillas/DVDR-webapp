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
  // Nuevos campos del director
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
}

export interface ScheduleEntry {
  date: string;
  start: string; // Cambiamos de startTime a start para que coincida con el DTO
  end: string; // Cambiamos de endTime a end para que coincida con el DTO
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
    if (data.officialLetter) {
      formData.append('officialLetter', data.officialLetter);
    }

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
}
