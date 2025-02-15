import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { DocumentationDialogComponent } from '../../../shared/components/course-data-dialogs/documentation-dialog/documentation-dialog.component';
import {
  CoursesService,
  SessionCertificateRequestResponse,
} from '../../../core/services/courses.service';
import { UploadFileCertificateDialogComponent } from './upload-file-certificate-dialog/upload-file-certificate-dialog.component';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-certificate-requests',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatIconModule,
    MatTooltipModule,
    MatPaginatorModule,
  ],
  templateUrl: './certificate-requests.component.html',
  styleUrl: './certificate-requests.component.scss',
})
export class CertificateRequestsComponent implements OnInit {
  displayedColumns: string[] = [
    'nombreCurso',
    'claveCurso',
    'periodo',
    'documentacion',
    'acciones',
  ];

  dataSource: MatTableDataSource<SessionCertificateRequestResponse> =
    new MatTableDataSource<SessionCertificateRequestResponse>([]);
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private coursesService: CoursesService,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.loadCertificateRequests();
  }

  loadCertificateRequests() {
    this.coursesService.GetRequestedCertificatesSessions().subscribe({
      next: (requests) => {
        this.dataSource.data = requests;
        this.dataSource.paginator = this.paginator;
      },
      error: (error) => {
        console.error('Error al cargar las solicitudes:', error);
        Swal.fire({
          title: 'Error',
          text: 'No se pudieron cargar las solicitudes',
          icon: 'error',
        });
      },
    });
  }

  openDocumentationDialog(sessionId: number) {
    const request = this.dataSource.data.find((r) => r.sessionId === sessionId);
    if (request) {
      this.dialog.open(DocumentationDialogComponent, {
        width: '40%',
        height: '65%',
        maxWidth: '100vw',
        maxHeight: '100vh',
        autoFocus: false,
        data: {
          documents: request.documents,
        },
      });
    }
  }

  approveCertificate(sessionId: number) {
    const request = this.dataSource.data.find((r) => r.sessionId === sessionId);
    if (!request) return;

    this.dialog
      .open(UploadFileCertificateDialogComponent, {
        width: '500px',
        disableClose: true,
        data: {
          sessionId: sessionId,
          courseName: request.courseName,
          period: request.period,
        },
      })
      .afterClosed()
      .subscribe((result) => {
        if (result?.success) {
          Swal.fire({
            title: '¡Éxito!',
            text: 'Las constancias se han subido correctamente',
            icon: 'success',
            // showConfirmButton: false,
            // timer: 1500,
          }).then(() => {
            // Recargar los datos después de mostrar el mensaje
            this.loadCertificateRequests();
          });
        } else if (result?.error) {
          Swal.fire({
            title: 'Error',
            text: 'No se pudieron subir las constancias',
            icon: 'error',
          });
        }
      });
  }

  rejectCertificate(sessionId: number) {
    // TODO: Implementar rechazo
    console.log('Rechazar certificado:', sessionId);
  }
}
