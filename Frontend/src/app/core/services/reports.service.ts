import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ReportsService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // Método para descargar reporte de cursos vigentes directamente como Excel
  downloadCurrentVigentCoursesReport(): void {
    window.open(
      `${this.baseUrl}/api/Report/ExportCurrentVigentCourses`,
      '_blank'
    );
  }

  // Método para descargar reporte de diplomados vigentes directamente como Excel
  downloadCurrentVigentDiplomasReport(): void {
    window.open(
      `${this.baseUrl}/api/Report/ExportCurrentVigentDiplomas`,
      '_blank'
    );
  }

  // Método para descargar reporte de constancias entregadas directamente como Excel
  downloadCertificatesDeliveredSessionsReport(): void {
    window.open(
      `${this.baseUrl}/api/Report/ExportCertificatesDeliveredSessions`,
      '_blank'
    );
  }

  // Método para descargar reporte de constancias entregadas de diplomados directamente como Excel
  downloadCertificatesDeliveredDiplomasReport(): void {
    window.open(
      `${this.baseUrl}/api/Report/ExportCertificatesDeliveredDiplomas`,
      '_blank'
    );
  }

  // Métodos para obtener datos (pueden ser útiles para otros propósitos)
  getCurrentVigentCourses(): Observable<any> {
    return this.http.get(`${this.baseUrl}/api/Report/CurrentVigentCourses`);
  }

  getCurrentVigentDiplomas(): Observable<any> {
    return this.http.get(`${this.baseUrl}/api/Report/CurrentVigentDiplomas`);
  }

  getCertificatesDeliveredSessions(): Observable<any> {
    return this.http.get(
      `${this.baseUrl}/api/Report/CertificatesDeliveredSessions`
    );
  }

  getCertificatesDeliveredDiplomas(): Observable<any> {
    return this.http.get(
      `${this.baseUrl}/api/Report/CertificatesDeliveredDiplomas`
    );
  }
}
