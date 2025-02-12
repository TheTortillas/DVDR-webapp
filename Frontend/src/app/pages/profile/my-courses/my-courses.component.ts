import { Component, OnInit, signal } from '@angular/core';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { CoursesService } from '../../../core/services/courses.service';
import { MatIconModule } from '@angular/material/icon';

interface Session {
  clave: string;
  periodo: string;
  participantes: number;
  constancias: number;
  estatus: string;
}

interface Course {
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

  constructor(private coursesService: CoursesService) {}

  ngOnInit() {
    this.loadCourses();
  }

  loadCourses() {
    if (this.username) {
      this.coursesService.getUserCoursesWithSessions(this.username).subscribe({
        next: (response) => {
          if (Array.isArray(response)) {
            this.courses = response.map((course: any) => ({
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
}
