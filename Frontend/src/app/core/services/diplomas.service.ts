import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface DiplomaRegistrationRequest {
  Username: string;
  Documents: {
    DocumentId: number;
    File: File;
  }[];
  FolderName: string;
}

@Injectable({
  providedIn: 'root',
})
export class DiplomasService {
  private URLBase = environment.apiUrl;

  constructor(private httpClient: HttpClient) {}

  requestDiplomaRegistration(formData: FormData): Observable<any> {
    const url = this.URLBase + '/api/Diploma/RequestDiplomaRegistration';
    return this.httpClient.post(url, formData);
  }

  getAllDiplomas(): Observable<any> {
    const url = this.URLBase + '/api/Diploma/GetAllDiplomas';
    return this.httpClient.get(url);
  }

  approveDiplomaRequest(data: any): Observable<any> {
    return this.httpClient.post(
      `${this.URLBase}/api/Diploma/ApproveDiplomaRequest`,
      data
    );
  }
}
