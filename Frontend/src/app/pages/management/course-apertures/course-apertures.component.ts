import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import {
  ApertureCoursesSessionsService,
  PendingAperture,
} from '../../../core/services/apertute-courses-sessions.service';
import Swal from 'sweetalert2';
import { MatTooltip } from '@angular/material/tooltip';

@Component({
  selector: 'app-course-apertures',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatTooltip,
  ],
  templateUrl: './course-apertures.component.html',
  providers: [DatePipe],
})
export class CourseAperturesComponent implements OnInit {
  displayedColumns: string[] = [
    'courseKey',
    'courseName',
    'period',
    'participants',
    'cost',
    'status', // Añadir columna de estado
    'actions',
  ];
  dataSource: PendingAperture[] = [];

  constructor(
    private apertureService: ApertureCoursesSessionsService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadPendingApertures();
    console.log('Cursos pendientes:', this.dataSource);
  }

  loadPendingApertures(): void {
    this.apertureService.getPendingApertures().subscribe({
      next: (data: PendingAperture[]) => {
        this.dataSource = data;
        // Añadir console.log para debuggear los datos
        console.log(
          'Datos de aperturas recibidos:',
          JSON.stringify(data, null, 2)
        );

        // Verificar específicamente la propiedad 'signed'
        data.forEach((aperture) => {
          console.log(
            `Apertura ${aperture.sessionId}: Path=${aperture.signedRequestLetterPath}, Signed=${aperture.signed}`
          );
        });
      },
      error: (err) => {
        console.error('Error al cargar solicitudes:', err);
        this.snackBar.open('Error al cargar las solicitudes', 'Cerrar', {
          duration: 3000,
        });
      },
    });
  }

  onApprove(sessionId: number): void {
    // Verificar primero que el documento esté firmado
    const aperture = this.dataSource.find((a) => a.sessionId === sessionId);

    // Usar solo la existencia de la ruta del documento
    if (!aperture?.signedRequestLetterPath) {
      this.snackBar.open(
        'No se puede aprobar una solicitud sin documento firmado',
        'Cerrar',
        {
          duration: 3000,
        }
      );
      return;
    }

    Swal.fire({
      title: '¿Aprobar esta solicitud?',
      text: 'Esta acción no se puede deshacer',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, aprobar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.apertureService
          .approveOrRejectSession({
            sessionId: sessionId,
            approvalStatus: 'approved',
          })
          .subscribe({
            next: () => {
              this.snackBar.open('Solicitud aprobada exitosamente', 'Cerrar', {
                duration: 3000,
              });
              this.loadPendingApertures();
            },
            error: (error) => {
              this.snackBar.open('Error al aprobar la solicitud', 'Cerrar', {
                duration: 3000,
              });
            },
          });
      }
    });
  }

  onReject(sessionId: number): void {
    Swal.fire({
      title: '¿Rechazar esta solicitud?',
      text: 'Esta acción eliminará la solicitud y no se puede deshacer',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, rechazar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#d33',
    }).then((result) => {
      if (result.isConfirmed) {
        this.apertureService
          .approveOrRejectSession({
            sessionId: sessionId,
            approvalStatus: 'rejected',
          })
          .subscribe({
            next: () => {
              this.snackBar.open('Solicitud rechazada', 'Cerrar', {
                duration: 3000,
              });
              this.loadPendingApertures();
            },
            error: (error) => {
              this.snackBar.open('Error al rechazar la solicitud', 'Cerrar', {
                duration: 3000,
              });
            },
          });
      }
    });
  }

  viewSignedDocument(aperture: PendingAperture): void {
    console.log('Intentando abrir documento:', aperture);
    console.log('Ruta del documento:', aperture.signedRequestLetterPath);

    if (!aperture.signedRequestLetterPath) {
      this.snackBar.open('No hay documento firmado disponible', 'Cerrar', {
        duration: 3000,
      });
      return;
    }

    // Construir la URL del documento
    const baseUrl = window.location.origin; // Obtiene http://localhost:4200 o la URL base de producción
    const documentUrl = `${baseUrl}/${aperture.signedRequestLetterPath}`;

    console.log('URL completa del documento:', documentUrl);

    // Abrir el documento en una nueva pestaña
    window.open(documentUrl, '_blank');
  }
}
