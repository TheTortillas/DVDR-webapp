import { Component, OnInit, signal } from '@angular/core';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { CoursesService } from '../../../core/services/courses.service';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';

interface Session {
  clave: string;
  periodo: string;
  participantes: number;
  constancias: number;
  estatus: string;
}

interface Course {
  id: number;
  title: string;
  dataSource: Session[];
  approvalStatus: string;
}

@Component({
  selector: 'app-my-courses',
  standalone: true,
  imports: [
    MatExpansionModule,
    MatTableModule,
    CommonModule,
    MatTooltipModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './my-courses.component.html',
  styleUrls: ['./my-courses.component.scss'],
})
export class MyCoursesComponent implements OnInit {
  readonly panelOpenState = signal(false);
  username: string | null = localStorage.getItem('username');
  displayedColumns: string[] = [
    'clave',
    'periodo',
    'participantes',
    'constancias',
    'estatus',
  ];
  courses: Course[] = [];

  constructor(private coursesService: CoursesService, private router: Router) {}

  ngOnInit() {
    this.loadCourses();
  }

  loadCourses() {
    if (this.username) {
      this.coursesService.getUserCoursesWithSessions(this.username).subscribe({
        next: (response) => {
          if (Array.isArray(response)) {
            this.courses = response.map((course: any) => ({
              id: course.id,
              title: course.title,
              dataSource: course.sessions.map((session: any) => ({
                clave: session.clave,
                periodo: session.periodo,
                participantes: session.participantes,
                constancias: session.constancias,
                estatus:
                  session.estatus === 'pending'
                    ? 'En espera'
                    : session.estatus === 'opened'
                    ? 'Aperturado'
                    : 'Concluido',
              })),
              approvalStatus: course.approvalStatus, // Map the property
            }));
          }
        },
        error: (err) => {
          console.error('Error al obtener los cursos:', err);
        },
      });
    }
  }

  onAttendCorrections(courseId: number, event: Event) {
    event.stopPropagation(); // Prevenir que el panel se expanda
    this.router.navigate(['/profile/course-register'], {
      queryParams: {
        courseId: courseId,
        corrections: true,
      },
    });
  }
}
