import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { DocumentationDialogComponent } from '../../../shared/components/course-data-dialogs/documentation-dialog/documentation-dialog.component';
import { GeneralInfoDialogComponent } from '../../../shared/components/course-data-dialogs/general-info-dialog/general-info-dialog.component';
import { ActorsDialogComponent } from '../../../shared/components/course-data-dialogs/actors-dialog/actors-dialog.component';
import {
  CoursesService,
  CourseFullData,
} from '../../../core/services/courses.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-course-register-verification',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatIconModule,
    MatTooltipModule,
    MatPaginatorModule,
  ],
  templateUrl: './course-register-verification.component.html',
  styleUrl: './course-register-verification.component.scss',
})
export class CourseRegisterVerificationComponent implements OnInit {
  displayedColumns: string[] = [
    'nombreCurso',
    'claveCurso',
    'estadoAprobacion',
    'datosGenerales',
    'instructores',
    'documentacion',
    'acciones',
  ];

  dataSource: MatTableDataSource<CourseFullData> =
    new MatTableDataSource<CourseFullData>([]);
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private coursesService: CoursesService,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.loadPendingCourses();
  }

  loadPendingCourses() {
    this.coursesService.getAllCourses().subscribe({
      next: (response: any) => {
        // Handle undefined or null response
        if (!response) {
          this.dataSource = new MatTableDataSource<CourseFullData>([]);
          this.dataSource.paginator = this.paginator;
          return;
        }

        // Handle both array and object with data property
        const courses = Array.isArray(response)
          ? response
          : response.data || [];

        // Filter courses
        const filteredCourses = courses.filter(
          (course: CourseFullData) =>
            course.approvalStatus !== 'approved' ||
            course.verificationStatus !== 'approved'
        );

        this.dataSource = new MatTableDataSource<CourseFullData>(
          filteredCourses
        );
        this.dataSource.paginator = this.paginator;
      },
      error: (error) => {
        console.error('Error al cargar los cursos:', error);
        this.dataSource = new MatTableDataSource<CourseFullData>([]);
        this.dataSource.paginator = this.paginator;
      },
    });
  }

  // Mantener los métodos de diálogo existentes
  openGeneralDataDialog(courseId: number) {
    const course = this.dataSource.data.find((c) => c.courseId === courseId);
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
    const course = this.dataSource.data.find((c) => c.courseId === courseId);
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
    const course = this.dataSource.data.find((c) => c.courseId === courseId);
    if (course) {
      this.dialog.open(DocumentationDialogComponent, {
        width: '40%',
        height: '65%',
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

  // Nuevos métodos para verificar y rechazar cursos
  verifyCourse(courseId: number) {
    Swal.fire({
      title: '¿Estás seguro?',
      text: '¿Deseas verificar este curso?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, verificar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.coursesService
          .verifyOrRejectCourse(courseId, 'approved')
          .subscribe({
            next: (response) => {
              Swal.fire(
                '¡Verificado!',
                'Curso verificado y listo para aprobación final',
                'success'
              );
              this.loadPendingCourses();
            },
            error: (error) => console.error(error),
          });
      }
    });
  }

  rejectCourse(courseId: number) {
    Swal.fire({
      title: 'Rechazar curso',
      text: 'Por favor, ingresa las notas para la corrección del curso:',
      input: 'textarea',
      showCancelButton: true,
      confirmButtonText: 'Rechazar',
      cancelButtonText: 'Cancelar',
      inputValidator: (value) => {
        if (!value) {
          return 'Debes escribir un mensaje de retroalimentación';
        }
        return null;
      },
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        const rejectionMessage: string = result.value;

        this.coursesService
          .verifyOrRejectCourse(courseId, 'rejected', rejectionMessage)
          .subscribe({
            next: (response) => {
              Swal.fire(
                'Rechazado',
                'El curso ha sido rechazado y se ha enviado la retroalimentación',
                'info'
              );
              this.loadPendingCourses();
            },
            error: (error) => console.error(error),
          });
      }
    });
  }
}
