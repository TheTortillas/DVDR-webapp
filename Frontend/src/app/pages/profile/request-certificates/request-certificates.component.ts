import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { CoursesService } from '../../../core/services/courses.service';
import { MatDialog } from '@angular/material/dialog';
import { UploadCertificateDocsComponent } from './upload-certificate-docs/upload-certificate-docs.component';
import { Router } from '@angular/router';
import { StorageService } from '../../../core/services/storage.service';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-request-certificates',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatButtonModule, MatIcon],
  templateUrl: './request-certificates.component.html',
  styleUrls: ['./request-certificates.component.scss'],
})
export class RequestCertificatesComponent implements OnInit {
  username: string | null = null;
  // Cada elemento representa una sesión completada con información del curso
  completedSessions: any[] = [];
  displayedColumns: string[] = ['title', 'clave', 'periodo', 'action'];

  constructor(
    private coursesService: CoursesService,
    private dialog: MatDialog,
    private storageService: StorageService,
    private router: Router
  ) {}

  ngOnInit() {
    const token = this.storageService.getItem('token');

    if (token) {
      const claims = this.storageService.getTokenClaims(token);
      if (claims) {
        this.username = claims.username;
        this.loadCompletedSessions();
      } else {
        console.error('No se pudieron obtener los claims del token');
        this.router.navigate(['/auth/login']);
      }
    } else {
      console.error('No hay token disponible');
      this.router.navigate(['/auth/login']);
    }
  }

  loadCompletedSessions() {
    if (this.username) {
      this.coursesService.getUserCoursesWithSessions(this.username).subscribe({
        next: (response: any) => {
          // Handle undefined or null response
          if (!response) {
            this.completedSessions = [];
            return;
          }

          // Handle both array and object with data property
          const courses = Array.isArray(response)
            ? response
            : response.data || [];

          let sessions: any[] = [];
          courses.forEach((course: any) => {
            if (course.sessions && Array.isArray(course.sessions)) {
              course.sessions.forEach((session: any) => {
                if (session.sessionStatus === 'completed') {
                  sessions.push({
                    title: course.title,
                    clave: session.clave,
                    periodo: session.periodo,
                    session: session,
                    sessionId: session.id,
                    certificatesRequested: session.certificatesRequested,
                    certificatesDelivered: session.certificatesDelivered,
                  });
                }
              });
            }
          });

          this.completedSessions = sessions;
        },
        error: (error) => {
          console.error('Error al obtener cursos:', error);
          this.completedSessions = [];
        },
      });
    }
  }

  requestCertificate(item: any) {
    const dialogRef = this.dialog.open(UploadCertificateDocsComponent, {
      maxWidth: '100vh',
      maxHeight: '100vh',
      width: '45%',
      height: '65%h',
      autoFocus: false,
      data: {
        sessionId: item.sessionId,
        courseTitle: item.title,
        periodo: item.periodo,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        // Actualizar el estado local del elemento
        const index = this.completedSessions.findIndex(
          (session) => session.sessionId === item.sessionId
        );
        if (index !== -1) {
          this.completedSessions[index].certificatesRequested = true;
          // Forzar actualización de la tabla
          this.completedSessions = [...this.completedSessions];
        }
        console.log('Documentos subidos:', result);
      }
    });
  }

  viewCertificateLetter(sessionId: number) {
    this.coursesService.getCertificateOfficialLetter(sessionId).subscribe({
      next: (response) => {
        // Asumiendo que filePath es una URL al documento
        if (response.filePath) {
          window.open(response.filePath, '_blank');
        }
      },
      error: (error) => {
        console.error('Error al obtener el oficio de constancias:', error);
        // Aquí podrías mostrar un mensaje de error al usuario
      },
    });
  }
}
