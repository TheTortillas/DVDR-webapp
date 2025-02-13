import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { ApertureStateService } from '../../../core/services/aperture-state.service';
import { StorageService } from '../../../core/services/storage.service';
import { CoursesService } from '../../../core/services/courses.service';

interface Course {
  id: number;
  title: string;
  clave: string;
  status: string;
  approvalStatus: string;
  totalDuration: number;
  expirationDate: string;
  isRenewed: boolean;
}

@Component({
  selector: 'app-request-aperture',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatButtonModule],
  templateUrl: './request-aperture.component.html',
  styleUrls: ['./request-aperture.component.scss'],
})
export class RequestApertureComponent implements OnInit {
  displayedColumns: string[] = ['no', 'title', 'clave', 'accion'];
  dataSource: Course[] = [];
  username: string | null = null;

  constructor(
    private courseService: CoursesService,
    private router: Router,
    private route: ActivatedRoute,
    private apertureState: ApertureStateService,
    private storageService: StorageService
  ) {}

  ngOnInit() {
    const token = this.storageService.getItem('token');

    if (token) {
      const claims = this.storageService.getTokenClaims(token);
      if (claims) {
        this.username = claims.username;
        this.loadCourses();
      } else {
        console.error('No se pudieron obtener los claims del token');
        this.router.navigate(['/auth/login']);
      }
    } else {
      console.error('No hay token disponible');
      this.router.navigate(['/auth/login']);
    }
  }

  loadCourses() {
    if (this.username) {
      this.courseService.getCoursesByUser(this.username).subscribe({
        next: (courses: Course[]) => {
          this.dataSource = courses.filter((course) => {
            if (course.status === 'draft') return false;
            const isExpired = this.isCursoExpirado(course);
            if (isExpired && course.isRenewed) return false;
            return true;
          });
        },
        error: (err) => {
          console.error('Error al obtener los cursos:', err);
        },
      });
    }
  }

  solicitarApertura(course: Course) {
    this.apertureState.setApertureInfo({
      id: course.id,
      title: course.title,
      clave: course.clave,
      totalDuration: course.totalDuration,
    });
    this.router.navigate(['../aperture-info'], {
      relativeTo: this.route,
    });
  }

  isSolicitudHabilitada(course: Course): boolean {
    const today = new Date();
    const expirationDate = new Date(course.expirationDate);
    return expirationDate > today;
  }

  isCursoExpirado(course: Course): boolean {
    const today = new Date();
    const expirationDate = new Date(course.expirationDate);
    return expirationDate <= today;
  }

  isCursoAprobado(course: Course): boolean {
    return course.approvalStatus === 'approved';
  }

  renovarCurso(course: Course) {
    localStorage.setItem('renewalCourse', JSON.stringify(course));

    this.router.navigate(['/profile/course-register'], {
      queryParams: { renewal: true, parentCourseId: course.id },
    });
  }
}
