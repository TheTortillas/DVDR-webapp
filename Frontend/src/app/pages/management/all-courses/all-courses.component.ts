import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { DocumentationDialogComponent } from './documentation-dialog/documentation-dialog.component';
import { GeneralInfoDialogComponent } from './general-info-dialog/general-info-dialog.component';
import { ActorsDialogComponent } from './actors-dialog/actors-dialog.component';
import { SessionsDialogComponent } from './sessions-dialog/sessions-dialog.component';
import {
  CoursesService,
  CourseFullData,
} from '../../../core/services/courses.service';

@Component({
  selector: 'app-all-courses',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatIconModule,
    MatTooltipModule,
    MatPaginatorModule,
  ],
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
    'sesiones',
  ];
  // Cambia el tipo de dataSource a MatTableDataSource
  dataSource: MatTableDataSource<CourseFullData> =
    new MatTableDataSource<CourseFullData>([]);

  // Variable para asignar el tamaño de página
  pageSize = 2;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

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
        // Cargar dataSource con MatTableDataSource
        this.dataSource = new MatTableDataSource<CourseFullData>(response);
        // Asignar paginador
        this.dataSource.paginator = this.paginator;
        // Asignar tamaño de página
        // this.paginator.pageSize = this.pageSize;
        console.log('Cursos cargados:', response);
      },
      error: (error) => {
        console.error('Error al cargar los cursos:', error);
      },
    });
  }

  openGeneralDataDialog(courseId: number) {
    const course = this.dataSource.data.find(
      (c: CourseFullData) => c.courseId === courseId
    );
    if (course) {
      this.dialog.open(GeneralInfoDialogComponent, {
        width: '50%',
        height: '90%',
        maxWidth: '100vw',
        maxHeight: '100vh',
        autoFocus: false,
        data: course,
      });
    }
  }

  openInstructorsDialog(courseId: number) {
    const course = this.dataSource.data.find(
      (c: CourseFullData) => c.courseId === courseId
    );
    if (course) {
      this.dialog.open(ActorsDialogComponent, {
        width: '40%',
        height: '50%',
        maxWidth: '100vw',
        maxHeight: '100vh',
        autoFocus: false,
        data: {
          courseKey: course.courseKey,
          actors: course.courseInfo.actors,
        },
      });
    }
  }

  openDocumentationDialog(courseId: number) {
    const course = this.dataSource.data.find(
      (c: CourseFullData) => c.courseId === courseId
    );
    if (course) {
      this.dialog.open(DocumentationDialogComponent, {
        width: '40%',
        height: '50%',
        maxWidth: '100vw',
        maxHeight: '100vh',
        autoFocus: false,
        data: {
          courseKey: course.courseKey,
          documents: course.documents,
        },
      });
    }
  }

  openSessionsDialog(courseId: number) {
    const course = this.dataSource.data.find(
      (c: CourseFullData) => c.courseId === courseId
    );
    if (course) {
      this.coursesService.getCourseSessions(courseId).subscribe({
        next: (sessions) => {
          this.dialog.open(SessionsDialogComponent, {
            width: '70%',
            height: '90%',
            maxWidth: '100vw',
            maxHeight: '100vh',
            autoFocus: false,
            data: {
              courseKey: course.courseKey,
              sessions: sessions,
            },
          });
        },
        error: (error) => {
          console.error('Error al cargar sesiones:', error);
        },
      });
    }
  }
}
