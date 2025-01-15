import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
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
export class FilesService {
  constructor(private http: HttpClient) {}

  private URLBase = environment.apiUrl;

  uploadFiles(formData: FormData): Observable<any> {
    const url = this.URLBase + '/api/Files/FileUpload';
    return this.http.post(url, formData);
  }
}
