import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { DocumentationDialogComponent } from './documentation-dialog/documentation-dialog.component';
import {
  CoursesService,
  CourseFullData,
} from '../../../core/services/courses.service';

@Component({
  selector: 'app-all-courses',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatIconModule, MatTooltipModule],
  templateUrl: './all-courses.component.html',
  styleUrl: './all-courses.component.scss',
})
export class AllCoursesComponent implements OnInit {
  displayedColumns: string[] = [
    'nombreCurso',
    'claveCurso',
    'datosGenerales',
    'instructores',
    'documentacion',
  ];
  dataSource: CourseFullData[] = [];

  constructor(
    private coursesService: CoursesService,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.loadAllCourses();
  }

  loadAllCourses() {
    this.coursesService.getAllCourses().subscribe({
      next: (response) => {
        this.dataSource = response;
        console.log('Cursos cargados:', response);
      },
      error: (error) => {
        console.error('Error al cargar los cursos:', error);
      },
    });
  }

  openGeneralDataDialog(courseId: number) {}

  openInstructorsDialog(courseId: number) {}

  openDocumentationDialog(courseId: number) {
    const course = this.dataSource.find((c) => c.courseId === courseId);
    if (course) {
      this.dialog.open(DocumentationDialogComponent, {
        width: '600px',
        data: {
          courseKey: course.courseKey,
          documents: course.documents,
        },
      });
    }
  }
}
