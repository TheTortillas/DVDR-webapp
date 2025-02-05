import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { CoursesService } from '../../../core/services/courses.service';
import { MatDialog } from '@angular/material/dialog';
import { UploadCertificateDocsComponent } from './upload-certificate-docs/upload-certificate-docs.component';

@Component({
  selector: 'app-request-certificates',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatButtonModule],
  templateUrl: './request-certificates.component.html',
  styleUrls: ['./request-certificates.component.scss'],
})
export class RequestCertificatesComponent implements OnInit {
  username: string | null = localStorage.getItem('username');
  // Cada elemento representa una sesión completada con información del curso
  completedSessions: any[] = [];
  displayedColumns: string[] = ['title', 'clave', 'periodo', 'action'];

  constructor(
    private coursesService: CoursesService,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    if (this.username) {
      this.coursesService.getUserCoursesWithSessions(this.username).subscribe({
        next: (response: any) => {
          let sessions: any[] = [];
          response.forEach((course: any) => {
            course.sessions.forEach((session: any) => {
              if (session.estatus === 'completed') {
                sessions.push({
                  title: course.title,
                  clave: session.clave,
                  periodo: session.periodo,
                  session: session,
                  sessionId: session.id, // Agregamos el id de la sesión
                });
              }
            });
          });
          this.completedSessions = sessions;
          console.log('Sesiones completadas:', this.completedSessions); // Para debug
        },
        error: (err) => {
          console.error('Error al obtener cursos:', err);
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
        console.log('Documentos subidos:', result);
      }
    });
  }
}
