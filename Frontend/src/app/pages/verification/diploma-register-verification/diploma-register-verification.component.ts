import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';
import { DiplomasService } from '../../../core/services/diplomas.service';
import { MatDialog } from '@angular/material/dialog';
import Swal from 'sweetalert2';

interface DiplomaDTO {
  diplomaId: number;
  name: string;
  approvalStatus: string;
  verificationStatus: string;
  center: string;
  registeredBy: string;
  documentation: {
    documentId: number;
    name: string;
    filePath: string;
  }[];
}

@Component({
  selector: 'app-diploma-register-verification',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatIconModule,
    MatTooltipModule,
    MatButtonModule,
  ],

  templateUrl: './diploma-register-verification.component.html',
  styleUrl: './diploma-register-verification.component.scss',
})
export class DiplomaRegisterVerificationComponent implements OnInit {
  // Se agrega la columna para estado de aprobación
  displayedColumns = ['name', 'approvalStatus', 'acciones', 'expand'];
  diplomasData = new MatTableDataSource<DiplomaDTO>([]);
  expandedElement: DiplomaDTO | null = null;

  constructor(
    private diplomasService: DiplomasService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadPendingDiplomas();
    console.log('Diplomas:', this.diplomasData);
  }

  loadPendingDiplomas(): void {
    this.diplomasService.getAllDiplomas().subscribe({
      next: (diplomas: DiplomaDTO[]) => {
        // Filtramos diplomas que necesitan verificación o fueron recientemente verificados
        const filteredDiplomas = diplomas.filter(
          (d) =>
            d.verificationStatus !== 'approved' ||
            d.approvalStatus !== 'approved'
        );
        this.diplomasData.data = filteredDiplomas;
      },
      error: (err) => console.error('Error al cargar diplomados:', err),
    });
  }

  verifyDiploma(diplomaId: number) {
    Swal.fire({
      title: '¿Estás seguro?',
      text: '¿Deseas verificar este diplomado?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, verificar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.diplomasService
          .updateDiplomaVerificationStatus({
            diplomaId: diplomaId,
            verificationStatus: 'approved',
            verificationNotes: '',
          })
          .subscribe({
            next: (response) => {
              Swal.fire(
                '¡Verificado!',
                'El diplomado ha sido verificado correctamente',
                'success'
              );
              this.loadPendingDiplomas();
            },
            error: (error) =>
              console.error('Error al verificar diplomado:', error),
          });
      }
    });
  }

  rejectDiploma(diplomaId: number) {
    Swal.fire({
      title: 'Rechazar diplomado',
      text: 'Por favor, ingresa las notas para la corrección del diplomado:',
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

        this.diplomasService
          .updateDiplomaVerificationStatus({
            diplomaId: diplomaId,
            verificationStatus: 'rejected',
            verificationNotes: rejectionMessage,
          })
          .subscribe({
            next: (response) => {
              Swal.fire(
                'Rechazado',
                'El diplomado ha sido rechazado y se ha enviado la retroalimentación',
                'info'
              );
              this.loadPendingDiplomas();
            },
            error: (error) =>
              console.error('Error al rechazar diplomado:', error),
          });
      }
    });
  }
  downloadDocument(filePath: string): void {
    if (!filePath) {
      Swal.fire('Error', 'No hay archivo disponible', 'error');
      return;
    }

    // Abrir el documento en una nueva pestaña
    window.open(filePath, '_blank');
  }
}
