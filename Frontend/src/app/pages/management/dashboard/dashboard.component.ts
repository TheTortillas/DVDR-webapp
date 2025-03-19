import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CoursesService } from '../../../core/services/courses.service';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatBadgeModule } from '@angular/material/badge';
import { RouterLink } from '@angular/router';
import { StorageService } from '../../../core/services/storage.service';
import { DiplomasService } from '../../../core/services/diplomas.service';
import { ApertureCoursesSessionsService } from '../../../core/services/apertute-courses-sessions.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule,
    MatSidenavModule,
    MatListModule,
    MatDividerModule,
    MatToolbarModule,
    MatExpansionModule,
    RouterLink,
    MatBadgeModule,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class ManagementDashboardComponent implements OnInit {
  username: string | null = '';
  pendingCoursesCount = 0;
  pendingCertificatesCount = 0;
  pendingDiplomasCount = 0;
  pendingDiplomaCertificatesCount: number = 0;
  pendingAperturesCount = 0;

  constructor(
    private router: Router,
    private coursesService: CoursesService,
    private storageService: StorageService,
    private diplomasService: DiplomasService,
    private apertureService: ApertureCoursesSessionsService
  ) {}

  ngOnInit(): void {
    const token = this.storageService.getItem('token');

    if (token) {
      const claims = this.storageService.getTokenClaims(token);
      if (claims) {
        this.username = claims.username;
      }
    } else {
      // Manejar el caso cuando no hay token
      console.error('No hay token disponible');
      this.router.navigate(['/auth/login']);
    }

    this.loadPendingCoursesCount();
    this.loadPendingCertificatesCount();
    this.loadPendingDiplomasCount();
    this.loadPendingAperturesCount();
    this.loadPendingDiplomaCertificatesCount();
  }

  loadPendingCoursesCount(): void {
    this.coursesService.getAllCourses().subscribe({
      next: (response: any) => {
        // Verificar primero si la respuesta es undefined
        if (response === undefined || response === null) {
          console.warn('La respuesta es undefined o null');
          this.pendingCoursesCount = 0;
          return;
        }

        if (Array.isArray(response)) {
          // Es un array de cursos
          const filteredCourses = response.filter(
            (course) =>
              course.status === 'submitted' &&
              course.approvalStatus === 'pending'
          );
          this.pendingCoursesCount = filteredCourses.length;
        } else if (response.data) {
          // Es un objeto con array data vacío
          this.pendingCoursesCount = 0;
        } else {
          console.warn('Formato de respuesta inesperado:', response);
          this.pendingCoursesCount = 0;
        }
      },
      error: (err) => {
        console.error('Error al obtener cursos:', err);
        this.pendingCoursesCount = 0;
      },
    });
  }

  loadPendingCertificatesCount(): void {
    this.coursesService.GetRequestedCertificatesSessions().subscribe({
      next: (response: any) => {
        if (response === undefined || response === null) {
          console.warn('La respuesta es undefined o null');
          this.pendingCertificatesCount = 0;
          return;
        }

        if (Array.isArray(response)) {
          this.pendingCertificatesCount = response.length;
        } else if (response.data) {
          this.pendingCertificatesCount = 0;
        } else {
          console.warn('Formato de respuesta inesperado:', response);
          this.pendingCertificatesCount = 0;
        }
      },
      error: (err) => {
        console.error('Error al obtener solicitudes de constancias:', err);
        this.pendingCertificatesCount = 0;
      },
    });
  }

  loadPendingDiplomasCount(): void {
    this.diplomasService.getAllDiplomas().subscribe({
      next: (response: any) => {
        if (response === undefined || response === null) {
          console.warn('La respuesta es undefined o null');
          this.pendingDiplomasCount = 0;
          return;
        }

        if (Array.isArray(response)) {
          const pending = response.filter(
            (d) => d.approvalStatus === 'pending'
          );
          this.pendingDiplomasCount = pending.length;
        } else if (response.data) {
          this.pendingDiplomasCount = 0;
        } else {
          console.warn('Formato de respuesta inesperado:', response);
          this.pendingDiplomasCount = 0;
        }
      },
      error: (err) => {
        console.error('Error al obtener diplomados:', err);
        this.pendingDiplomasCount = 0;
      },
    });
  }

  loadPendingDiplomaCertificatesCount(): void {
    this.diplomasService.getRequestedDiplomaCertificates().subscribe({
      next: (response: any) => {
        if (response === undefined || response === null) {
          console.warn('La respuesta es undefined o null');
          this.pendingDiplomaCertificatesCount = 0;
          return;
        }

        if (Array.isArray(response)) {
          this.pendingDiplomaCertificatesCount = response.length;
        } else if (response.data) {
          this.pendingDiplomaCertificatesCount = 0;
        } else {
          console.warn('Formato de respuesta inesperado:', response);
          this.pendingDiplomaCertificatesCount = 0;
        }
      },
      error: (err) => {
        console.error('Error al obtener solicitudes de constancias:', err);
        this.pendingDiplomaCertificatesCount = 0;
      },
    });
  }

  loadPendingAperturesCount(): void {
    this.apertureService.getPendingAperturesCount().subscribe({
      next: (response: any) => {
        if (response === undefined || response === null) {
          console.warn('La respuesta es undefined o null');
          this.pendingAperturesCount = 0;
          return;
        }

        if (typeof response === 'number') {
          this.pendingAperturesCount = response;
        } else if (response.data !== undefined) {
          this.pendingAperturesCount = Array.isArray(response.data)
            ? response.data.length
            : 0;
        } else {
          console.warn('Formato de respuesta inesperado:', response);
          this.pendingAperturesCount = 0;
        }
      },
      error: (err) => {
        console.error('Error al obtener conteo de aperturas:', err);
        this.pendingAperturesCount = 0;
      },
    });
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }
}
