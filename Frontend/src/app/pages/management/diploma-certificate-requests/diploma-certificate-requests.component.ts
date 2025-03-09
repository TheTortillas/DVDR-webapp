import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import Swal from 'sweetalert2';
import { DiplomasService } from '../../../core/services/diplomas.service';
import { MatDialog } from '@angular/material/dialog';
import { DocumentationDialogComponent } from '../../../shared/components/course-data-dialogs/documentation-dialog/documentation-dialog.component';
import { UploadFileDiplomaCertificateDialogComponent } from './upload-file-diploma-certificate-dialog/upload-file-diploma-certificate-dialog.component';

interface DiplomaCertificateRequest {
  diplomaId: number;
  title: string;
  period: string;
  numberOfCertificates: number;
  status: string;
  documents: {
    documentId: number;
    name: string;
    filePath: string;
  }[];
}

@Component({
  selector: 'app-diploma-certificate-requests',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatIconModule,
    MatTooltipModule,
    MatPaginatorModule,
  ],
  templateUrl: './diploma-certificate-requests.component.html',
  styleUrl: './diploma-certificate-requests.component.scss',
})
export class DiplomaCertificateRequestsComponent implements OnInit {
  displayedColumns: string[] = [
    'titulo',
    'periodo',
    'documentacion',
    'acciones',
  ];
  dataSource: MatTableDataSource<DiplomaCertificateRequest> =
    new MatTableDataSource<DiplomaCertificateRequest>([]);
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private diplomasService: DiplomasService,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.loadDiplomaRequests();
  }

  loadDiplomaRequests() {
    this.diplomasService.getRequestedDiplomaCertificates().subscribe({
      next: (requests) => {
        this.dataSource.data = requests;
        this.dataSource.paginator = this.paginator;
        console.log(requests);
      },
      error: () => {
        Swal.fire('Error', 'No se pudieron cargar las solicitudes', 'error');
      },
    });
  }

  // Mostrar documentación enviada, usando un diálogo
  openDocumentationDialog(diplomaId: number) {
    const request = this.dataSource.data.find((r) => r.diplomaId === diplomaId);
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

  approveDiplomaCertificate(diplomaId: number) {
    const request = this.dataSource.data.find((r) => r.diplomaId === diplomaId);
    if (!request) return;

    this.dialog
      .open(UploadFileDiplomaCertificateDialogComponent, {
        width: '500px',
        disableClose: true,
        data: {
          diplomaId: diplomaId,
          diplomaTitle: request.title,
          period: request.period,
          numberOfCertificates: request.numberOfCertificates,
        },
      })
      .afterClosed()
      .subscribe((result) => {
        if (result?.success) {
          Swal.fire({
            title: '¡Éxito!',
            text: 'Se subió el oficio correctamente',
            icon: 'success',
          }).then(() => {
            this.loadDiplomaRequests();
          });
        } else if (result?.error) {
          Swal.fire({
            title: 'Error',
            text: 'No se pudo subir el oficio',
            icon: 'error',
          });
        }
      });
  }
}
