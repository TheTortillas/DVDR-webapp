import { Component, OnInit, signal } from '@angular/core';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { CoursesService } from '../../../core/services/courses.service';
import { StorageService } from '../../../core/services/storage.service';
import { DiplomasService } from '../../../core/services/diplomas.service';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

interface Session {
  clave: string;
  periodo: string;
  participantes: number;
  constancias: number;
  SessionStatus: string;
  SessionApprovalStatus: string;
}

interface Course {
  id: number;
  title: string;
  dataSource: Session[];
  approvalStatus: string;
}

interface DiplomaActor {
  actorId: number;
  name: string;
  role: string;
}

interface DiplomaDocument {
  documentId: number;
  name: string;
  filePath: string | null;
  uploadedAt: Date;
}

interface Diploma {
  diplomaId: number;
  name: string;
  totalDuration: number;
  diplomaKey: string;
  serviceType: string;
  modality: string;
  educationalOffer: string;
  status: string;
  approvalStatus: string;
  verificationStatus: string;
  cost: number;
  participants: number;
  startDate: Date;
  endDate: Date;
  expirationDate: Date;
  center: string;
  createdAt: Date;
  updatedAt: Date;
  registeredBy: string;
  actors: DiplomaActor[];
  documentation: DiplomaDocument[];
  documentation_folder: string;
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
  username: string | null = null;
  center: string | null = null;
  displayedColumns: string[] = [
    'clave',
    'periodo',
    'participantes',
    'constancias',
    'estatus',
  ];
  courses: Course[] = [];
  diplomas: Diploma[] = [];

  constructor(
    private coursesService: CoursesService,
    private storageService: StorageService,
    private diplomasService: DiplomasService,
    private router: Router
  ) {}

  ngOnInit() {
    const token = this.storageService.getItem('token');

    if (token) {
      const claims = this.storageService.getTokenClaims(token);
      if (claims) {
        this.username = claims.username;
        this.center = claims.center;
        this.loadCourses();
      } else {
        console.error('No se pudieron obtener los claims del token');
        this.router.navigate(['/auth/login']);
      }
    } else {
      console.error('No hay token disponible');
      this.router.navigate(['/auth/login']);
    }
    {
      this.loadCourses();
      this.loadDiplomas();
    }
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
                certificatesDelivered: session.certificatesDelivered,
                estatus: this.getSessionStatus(
                  session.sessionStatus,
                  session.sessionApprovalStatus,
                  session.certificatesDelivered
                ),
              })),
              approvalStatus: course.approvalStatus,
            }));
          }
          console.log('Cursos cargados:', this.courses);
        },
        error: (err) => {
          console.error('Error al obtener los cursos:', err);
        },
      });
    }
  }

  getSessionStatus(
    sessionStatus: string,
    approvalStatus: string,
    certificatesDelivered: string
  ): string {
    // Si certificatesDelivered es true, mostrar "Constancias Entregadas"
    if (certificatesDelivered) {
      return 'Constancias Entregadas';
    }

    // Show "En revisión" if either status is pending
    if (sessionStatus === 'pending' || approvalStatus === 'pending') {
      return 'En revisión';
    }

    // Show "Aperturado" if both statuses are approved and opened respectively
    if (approvalStatus === 'approved' && sessionStatus === 'opened') {
      return 'Aperturado';
    }

    // Show "Completado" if session status is completed
    if (sessionStatus === 'completed') {
      return 'Completado';
    }

    // Default fallback (though this shouldn't happen with proper data)
    return 'Estado desconocido';
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

  loadDiplomas(): void {
    if (this.center) {
      this.diplomasService.getDiplomasByCenter(this.center).subscribe({
        next: (response) => {
          if (Array.isArray(response)) {
            this.diplomas = response.map((diploma) => ({
              diplomaId: diploma.diplomaId,
              name: diploma.name || 'Sin nombre',
              totalDuration: diploma.totalDuration,
              diplomaKey: diploma.diplomaKey,
              serviceType: diploma.serviceType,
              modality: diploma.modality,
              educationalOffer: diploma.educationalOffer,
              status: diploma.status,
              approvalStatus: diploma.approvalStatus,
              verificationStatus: diploma.verificationStatus,
              cost: diploma.cost,
              participants: diploma.participants,
              startDate: new Date(diploma.startDate),
              endDate: new Date(diploma.endDate),
              expirationDate: new Date(diploma.expirationDate),
              center: diploma.center,
              createdAt: new Date(diploma.createdAt),
              updatedAt: new Date(diploma.updatedAt),
              registeredBy: diploma.registeredBy,
              documentation_folder: diploma.folderName,
              actors: diploma.actors.map(
                (actor: { actorId: any; name: any; role: any }) => ({
                  actorId: actor.actorId,
                  name: actor.name,
                  role: actor.role,
                })
              ),
              documentation: diploma.documentation.map(
                (doc: {
                  documentId: any;
                  name: any;
                  filePath: any;
                  uploadedAt: string | number | Date;
                }) => ({
                  documentId: doc.documentId,
                  name: doc.name,
                  filePath: doc.filePath,
                  uploadedAt: new Date(doc.uploadedAt),
                })
              ),
            }));
          }
          console.log('Diplomados cargados:', this.diplomas);
        },
        error: (err) => {
          console.error('Error al obtener diplomados:', err);
        },
      });
    }
  }

  onDocFileSelected(diploma: Diploma, doc: DiplomaDocument, event: any): void {
    const file = event.target.files[0];
    if (!file) return;

    const fileURL = URL.createObjectURL(file);
    Swal.fire({
      title: '¿Confirmar archivo?',
      html: `<embed src="${fileURL}" type="application/pdf" width="100%" height="300px">`,
      showCancelButton: true,
      confirmButtonText: 'Aceptar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        const formData = new FormData();
        formData.append('DiplomaId', diploma.diplomaId.toString());
        formData.append('DocumentId', doc.documentId.toString());
        formData.append('File', file);
        formData.append('FolderName', diploma.documentation_folder);

        this.diplomasService.uploadSingleDiplomaDocument(formData).subscribe({
          next: () => {
            Swal.fire('Archivo subido', '', 'success');
            this.loadCourses();
            this.loadDiplomas();
          },
          error: () => {
            Swal.fire('Error', 'No se pudo subir el archivo', 'error');
          },
        });
      }
    });
  }
}
