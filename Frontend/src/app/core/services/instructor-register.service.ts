import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

const HttpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
  }),
};

export interface Instructor {
  id: number;
  firstName: string;
  lastName: string;
  secondLastName?: string;
  email: string;
  knowledgeArea: string;
  centerName: string;
  academicHistories: AcademicHistory[];
  professionalExperiences: ProfessionalExperience[];
}

export interface AcademicHistory {
  educationLevel: string;
  period: string;
  institution: string;
  degreeAwarded: string;
  evidencePath: string;
}

export interface ProfessionalExperience {
  period: string;
  organization: string;
  position: string;
  activity: string;
  evidencePath: string;
}

@Injectable({
  providedIn: 'root',
})
export class InstructorRegisterService {
  constructor(private httpClient: HttpClient) {}
  private URLBase = environment.apiUrl;

  registerInstructorGeneralInfo(instructorData: any): Observable<any> {
    const url = this.URLBase + '/api/Instructor/RegisterGeneralInfo';
    return this.httpClient.post(url, instructorData);
  }

  registerInstructor(formData: FormData): Observable<any> {
    const url = this.URLBase + '/api/Instructor/RegisterInstructor';
    return this.httpClient.post(url, formData);
  }

  getAllInstructors(): Observable<Instructor[]> {
    return this.httpClient.get<Instructor[]>(
      `${this.URLBase}/api/Instructor/GetAllInstructors`
    );
  }
}
