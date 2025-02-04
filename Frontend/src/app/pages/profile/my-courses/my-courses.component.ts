import { Component, OnInit, signal } from '@angular/core';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CommonModule } from '@angular/common';
import { CoursesService } from '../../../core/services/courses.service';

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
}

@Component({
  selector: 'app-my-courses',
  standalone: true,
  imports: [MatExpansionModule, MatTableModule, CommonModule, MatTooltipModule],
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
          console.log('Datos recbidos del backend:', response);

          this.courses = response.map((course: any) => ({
            title: course.title,
            dataSource: course.sessions.map((session: any) => ({
              clave: session.clave, // Ahora usamos la clave correcta
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
          }));
        },
        error: (err) => {
          console.error('Error al obtener los cursos:', err);
        },
      });
    }
  }
}
