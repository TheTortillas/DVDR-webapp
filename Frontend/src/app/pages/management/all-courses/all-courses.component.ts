import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

import { DocumentationDialogComponent } from '../../../shared/components/course-data-dialogs/documentation-dialog/documentation-dialog.component';
import { GeneralInfoDialogComponent } from '../../../shared/components/course-data-dialogs/general-info-dialog/general-info-dialog.component';
import { ActorsDialogComponent } from '../../../shared/components/course-data-dialogs/actors-dialog/actors-dialog.component';
import { SessionsDialogComponent } from '../../../shared/components/course-data-dialogs/sessions-dialog/sessions-dialog.component';
import {
  CoursesService,
  CourseFullData,
} from '../../../core/services/courses.service';
import { DataService } from '../../../core/services/data.service';
import Swal from 'sweetalert2';
import { ReportsService } from '../../../core/services/reports.service';

@Component({
  selector: 'app-all-courses',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatIconModule,
    MatTooltipModule,
    MatPaginatorModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
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

  // Variables para los filtros
  searchText: string = '';
  selectedCategories: string[] = [];
  categories: string[] = [];
  selectedCenter: string = '';
  centers: string[] = [];

  // Cambia el tipo de dataSource a MatTableDataSource
  dataSource: MatTableDataSource<CourseFullData> =
    new MatTableDataSource<CourseFullData>([]);

  // Variable para asignar el tamaño de página
  pageSize = 2;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private coursesService: CoursesService,
    private dialog: MatDialog,
    private dataService: DataService,
    private reportsService: ReportsService
  ) {}

  ngOnInit() {
    this.loadAllCourses();
    this.loadCategories();
    this.loadCenters();
  }

  loadAllCourses() {
    this.coursesService.getAllCourses().subscribe({
      next: (response: any) => {
        if (!response) {
          this.dataSource = new MatTableDataSource<CourseFullData>([]);
          this.dataSource.paginator = this.paginator;
          return;
        }

        const courses = Array.isArray(response)
          ? response
          : response.data || [];

        // Added type annotation to the filter callback parameter
        const filteredCourses = courses.filter(
          (course: CourseFullData) =>
            course.status === 'submitted' &&
            course.approvalStatus === 'approved'
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

  loadCategories() {
    this.dataService.getCategoriasAcademicas().subscribe({
      next: (categories) => {
        this.categories = categories;
      },
      error: (error) => {
        console.error('Error al cargar categorías:', error);
      },
    });
  }

  loadCenters() {
    this.dataService.getCentersList().subscribe({
      next: (centers) => {
        this.centers = [...new Set(centers.map((center) => center.name))];
      },
      error: (error) => {
        console.error('Error al cargar centros:', error);
      },
    });
  }

  applyFilters() {
    this.dataSource.filterPredicate = (
      data: CourseFullData,
      filter: string
    ) => {
      const searchStr = JSON.parse(filter);

      // Filtro por nombre
      const matchesName =
        !searchStr.name ||
        data.courseInfo.courseName
          .toLowerCase()
          .includes(searchStr.name.toLowerCase());

      // Filtro por categorías
      const matchesCategory =
        searchStr.categories.length === 0 ||
        searchStr.categories.includes(data.courseInfo.category);

      // Filtro por centro
      const matchesCenter =
        !searchStr.center ||
        data.center.toLowerCase() === searchStr.center.toLowerCase();

      return matchesName && matchesCategory && matchesCenter;
    };

    const filterValue = JSON.stringify({
      name: this.searchText,
      categories: this.selectedCategories,
      center: this.selectedCenter,
    });

    this.dataSource.filter = filterValue;

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  // Métodos para los filtros
  applySearchFilter(event: Event) {
    this.searchText = (event.target as HTMLInputElement).value;
    this.applyFilters();
  }

  applyCategoryFilter() {
    this.applyFilters();
  }

  applyCenterFilter() {
    this.applyFilters();
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
          // console.error('Error al cargar sesiones:', error);
          Swal.fire({
            icon: 'info',
            title: 'Sin aperturas',
            text: 'Este curso no ha solicitado aperturas.',
            confirmButtonText: 'Aceptar',
          });
        },
      });
    }
  }

  generateCurrentCoursesReport() {
    Swal.fire({
      title: 'Descargando reporte...',
      text: 'Se iniciará la descarga del reporte de cursos vigentes.',
      icon: 'info',
      showConfirmButton: false,
      timer: 2000,
    });
    this.reportsService.downloadCurrentVigentCoursesReport();
  }

  generateCertificatesDeliveredReport() {
    Swal.fire({
      title: 'Descargando reporte...',
      text: 'Se iniciará la descarga del reporte de constancias entregadas.',
      icon: 'info',
      showConfirmButton: false,
      timer: 2000,
    });
    this.reportsService.downloadCertificatesDeliveredSessionsReport();
  }
}
