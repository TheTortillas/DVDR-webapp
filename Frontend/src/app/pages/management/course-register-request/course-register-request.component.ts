import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatIcon, MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { DocumentationDialogComponent } from '../../../shared/components/course-data-dialogs/documentation-dialog/documentation-dialog.component';
import { GeneralInfoDialogComponent } from '../../../shared/components/course-data-dialogs/general-info-dialog/general-info-dialog.component';
import { ActorsDialogComponent } from '../../../shared/components/course-data-dialogs/actors-dialog/actors-dialog.component';
import { SessionsDialogComponent } from '../../../shared/components/course-data-dialogs/sessions-dialog/sessions-dialog.component';
import {
  CoursesService,
  CourseFullData,
} from '../../../core/services/courses.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-course-register-request',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatIconModule,
    MatTooltipModule,
    MatPaginatorModule,
    MatIcon,
  ],
  templateUrl: './course-register-request.component.html',
  styleUrl: './course-register-request.component.scss',
})
export class CourseRegisterRequestComponent implements OnInit {
  displayedColumns: string[] = [
    'nombreCurso',
    'claveCurso',
    'estadoVerificacion',
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
        // Verificar si la respuesta es undefined o null
        if (!response) {
          this.dataSource = new MatTableDataSource<CourseFullData>([]);
          this.dataSource.paginator = this.paginator;
          return;
        }

        // Manejar tanto arrays como objetos con propiedad data
        let courses = Array.isArray(response) ? response : response.data || [];

        // Filtra cursos con status 'submitted' y que no tengan 'approved' ni 'rejected'
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
        // En caso de error, inicializar con array vacío
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

  openSessionsDialog(courseId: number) {
    const course = this.dataSource.data.find((c) => c.courseId === courseId);
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

  // Nuevos métodos para aprobar y rechazar cursos
  approveCourse(courseId: number) {
    Swal.fire({
      title: '¿Estás seguro?',
      text: '¿Deseas aprobar este curso?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, aprobar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.coursesService
          .approveOrRejectCourse(courseId, 'approved')
          .subscribe({
            next: (response) => {
              Swal.fire(
                '¡Aprobado!',
                'Curso aprobado y listo para solicitar aperturas',
                'success'
              );
              this.loadPendingCourses();
            },
            error: (error) => console.error(error),
          });
        this.loadPendingCourses(); // Recargar la lista
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
        console.log('Mensaje de rechazo:', rejectionMessage);
        console.log('ID del curso rechazado:', courseId);

        this.coursesService
          .approveOrRejectCourse(courseId, 'rejected', rejectionMessage)
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

        this.loadPendingCourses();
      }
    });
  }
}
