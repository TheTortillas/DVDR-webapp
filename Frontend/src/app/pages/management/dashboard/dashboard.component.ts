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
import { CourseFullData } from '../../../core/services/courses.service';
import { MatBadgeModule } from '@angular/material/badge';
import { RouterLink } from '@angular/router';
import { StorageService } from '../../../core/services/storage.service';

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

  constructor(
    private router: Router,
    private coursesService: CoursesService,
    private storageService: StorageService
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
  }

  loadPendingCoursesCount(): void {
    this.coursesService.getAllCourses().subscribe({
      next: (courses: CourseFullData[]) => {
        // Filtrar los cursos que tienen status = 'submitted' y approvalStatus != 'approved'
        const filteredCourses = courses.filter(
          (course) =>
            course.status === 'submitted' &&
            course.approvalStatus !== 'approved'
        );
        this.pendingCoursesCount = filteredCourses.length;
      },
      error: (err) => {
        console.error('Error al obtener cursos:', err);
      },
    });
  }

  loadPendingCertificatesCount(): void {
    this.coursesService.GetRequestedCertificatesSessions().subscribe({
      next: (sessions) => {
        this.pendingCertificatesCount = sessions.length;
      },
      error: (err) => {
        console.error('Error al obtener solicitudes de constancias:', err);
      },
    });
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }
}
