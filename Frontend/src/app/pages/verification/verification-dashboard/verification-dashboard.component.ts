import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { StorageService } from '../../../core/services/storage.service';
import { CoursesService } from '../../../core/services/courses.service';
import { DiplomasService } from '../../../core/services/diplomas.service';

@Component({
  selector: 'app-verification-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    RouterModule,
  ],
  templateUrl: './verification-dashboard.component.html',
  styleUrl: './verification-dashboard.component.scss',
})
export class VerificationDashboardComponent implements OnInit {
  username: string = '';
  pendingCoursesCount: number = 0;
  pendingDiplomasCount: number = 0;

  constructor(
    private storageService: StorageService,
    private coursesService: CoursesService,
    private diplomasService: DiplomasService
  ) {}

  ngOnInit() {
    // Obtener nombre de usuario desde el token
    const token = this.storageService.getItem('token');
    if (token) {
      const claims = this.storageService.getTokenClaims(token);
      if (claims) {
        this.username = claims.username;
      }
    }

    // Cargar datos para el dashboard
    this.loadDashboardData();
  }

  loadDashboardData() {
    // Contar cursos pendientes de verificación
    this.coursesService.getAllCourses().subscribe({
      next: (response: any) => {
        if (!response) {
          this.pendingCoursesCount = 0;
          return;
        }

        const courses = Array.isArray(response)
          ? response
          : response.data || [];

        this.pendingCoursesCount = courses.filter(
          (course: { status: string; verificationStatus: string }) =>
            course.status === 'submitted' &&
            course.verificationStatus === 'pending'
        ).length;
      },
      error: (err) => {
        console.error('Error al cargar datos del dashboard:', err);
        this.pendingCoursesCount = 0;
      },
    });

    // Contar diplomados pendientes de verificación
    this.diplomasService.getAllDiplomas().subscribe({
      next: (response: any) => {
        if (!response) {
          this.pendingDiplomasCount = 0;
          return;
        }

        const diplomas = Array.isArray(response)
          ? response
          : response.data || [];

        this.pendingDiplomasCount = diplomas.filter(
          (diploma: { status: string; verificationStatus: string }) =>
            diploma.status !== 'submitted' &&
            diploma.verificationStatus === 'pending'
        ).length;
      },
      error: (err) => {
        console.error('Error al cargar datos del dashboard (diplomas):', err);
        this.pendingDiplomasCount = 0;
      },
    });
  }
}
