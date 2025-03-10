import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface TemplateBase {
  id: number;
  name: string;
  filePath: string | null;
  type: 'file' | 'url';
  required: boolean;
}

export interface CourseTemplate extends TemplateBase {
  modalities: string[];
}

export interface DiplomaTemplate extends TemplateBase {}

export interface CertificateTemplate extends TemplateBase {}

export interface TemplatesResponse {
  courseTemplates: CourseTemplate[];
  diplomaTemplates: DiplomaTemplate[];
  certificateTemplates: CertificateTemplate[];
}

@Injectable({
  providedIn: 'root',
})
export class TemplatesService {
  private baseUrl = `${environment.apiUrl}/api/Templates`;

  constructor(private http: HttpClient) {}

  getAllTemplates(): Observable<TemplatesResponse> {
    return this.http.get<TemplatesResponse>(`${this.baseUrl}/GetAll`);
  }

  manageTemplate(formData: FormData): Observable<any> {
    return this.http.post(`${this.baseUrl}/Manage`, formData);
  }
}
