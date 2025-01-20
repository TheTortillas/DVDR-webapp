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

@Injectable({
  providedIn: 'root',
})
export class DataService {
  constructor(private httpClient: HttpClient) {}
  private URLBase = environment.apiUrl;

  public getCategoriasAcademicas(): Observable<any> {
    const url = this.URLBase + '/api/Data/AcademicCategories';
    return this.httpClient.get(url, HttpOptions);
  }

  public getDocumentTemplates(modality: string): Observable<any> {
    const url =
      this.URLBase + '/api/Data/DocumentTemplates?modality=' + modality;
    return this.httpClient.get(url, HttpOptions);
  }

  uploadCourseDocumentation(formData: FormData): Observable<any> {
    const url = this.URLBase + '/api/api/Files/UploadCourseDocumentation';
    return this.httpClient.post(url, formData);
  }

  public getInstructors(): Observable<any[]> {
    const url = this.URLBase + '/api/Instructor/GetInstructors';
    return this.httpClient.get<any[]>(url, HttpOptions);
  }

  public getExpertiseAreas(): Observable<string[]> {
    const url = this.URLBase + '/api/Instructor/GetExpertiseAreas';
    return this.httpClient.get<string[]>(url, HttpOptions);
  }

  public getCenters(): Observable<string[]> {
    const url = this.URLBase + '/api/Instructor/GetCenters';
    return this.httpClient.get<string[]>(url, HttpOptions);
  }
}
