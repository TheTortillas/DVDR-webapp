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

  // Método para aprobar/rechazar diplomado (administrador)
  approveDiplomaRequest(data: any): Observable<any> {
    const url = this.URLBase + '/api/Diploma/ApproveDiplomaRequest';
    return this.httpClient.post(url, data);
  }

  getDiplomasByCenter(center: string): Observable<any> {
    const url = this.URLBase + '/api/Diploma/GetDiplomasByCenter/' + center;
    return this.httpClient.get(url);
  }

  getCompletedDiplomas(username: string): Observable<any> {
    const url = `${this.URLBase}/api/Diploma/GetCompletedDiplomas?username=${username}`;
    return this.httpClient.get(url);
  }

  requestDiplomaCertificates(formData: FormData): Observable<any> {
    const url = `${this.URLBase}/api/Diploma/RequestDiplomaCertificates`;
    return this.httpClient.post(url, formData);
  }

  getCertificateOfficialLetter(diplomaId: number): Observable<any> {
    const url = `${this.URLBase}/api/Diploma/GetCertificateOfficialLetter/${diplomaId}`;
    return this.httpClient.get(url);
  }

  uploadSingleDiplomaDocument(formData: FormData): Observable<any> {
    const url = `${this.URLBase}/api/Diploma/UploadDiplomaDocument`;
    return this.httpClient.post(url, formData);
  }

  getRequestedDiplomaCertificates(): Observable<any> {
    return this.httpClient.get(
      `${this.URLBase}/api/Diploma/GetRequestedDiplomaCertificates`
    );
  }

  // Método para verificar/rechazar diplomado (verificador)
  updateDiplomaVerificationStatus(data: any): Observable<any> {
    const url = this.URLBase + '/api/Diploma/UpdateDiplomaVerificationStatus';
    return this.httpClient.post(url, data);
  }

  uploadDiplomaOfficialLetter(formData: FormData): Observable<any> {
    return this.httpClient.post(
      `${this.URLBase}/api/Diploma/UploadDiplomaOfficialLetter`,
      formData
    );
  }
}
