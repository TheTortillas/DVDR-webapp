import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { CoursesService } from '../../../core/services/courses.service';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';

interface Course {
  id: number;
  title: string;
  clave: string;
  status: string;
  approvalStatus: string;
  totalDuration: number;
}

@Component({
  selector: 'app-request-aperture',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatButtonModule],
  templateUrl: './request-aperture.component.html',
  styleUrls: ['./request-aperture.component.scss'],
})
export class RequestApertureComponent implements OnInit {
  displayedColumns: string[] = ['no', 'title', 'clave', 'solicitar'];
  dataSource: Course[] = [];
  username: string | null = localStorage.getItem('username');

  constructor(
    private courseService: CoursesService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    if (this.username) {
      this.courseService.getCoursesByUser(this.username).subscribe({
        next: (courses: Course[]) => {
          this.dataSource = courses.filter(
            (course) => course.status !== 'draft'
          );
        },
        error: (err) => {
          console.error('Error al obtener los cursos:', err);
        },
      });
    }
  }

  solicitarApertura(course: Course) {
    console.log(`Solicitud de apertura para el curso: ${course.title}`);
    this.router.navigate(['../aperture-info'], {
      relativeTo: this.route,
      queryParams: {
        id: course.id,
        title: course.title,
        clave: course.clave,
        totalDuration: course.totalDuration,
      },
    });
  }

  isSolicitudHabilitada(course: Course): boolean {
    return course.approvalStatus === 'approved';
  }
}
