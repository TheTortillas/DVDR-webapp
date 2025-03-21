import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { DiplomasService } from '../../../core/services/diplomas.service';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatIcon } from '@angular/material/icon';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import Swal from 'sweetalert2';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

import { DiplomaRegisterDialogComponent } from '../../../shared/dialogs/diploma-register-dialog/diploma-register-dialog.component';

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
  selector: 'app-diploma-register-request',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTableModule,
    MatIcon,
    MatIconModule,
    MatTooltipModule,
    MatButtonModule,
    MatDialogModule,
  ],
  templateUrl: './diploma-register-request.component.html',
  styleUrls: ['./diploma-register-request.component.scss'],
})
export class DiplomaRegisterRequestComponent implements OnInit {
  // Se agrega la columna "acciones" para usar iconos con hover
  displayedColumns = ['name', 'verificationStatus', 'acciones', 'expand'];
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
      next: (response: any) => {
        // Handle undefined or null response
        if (!response) {
          this.diplomasData.data = [];
          return;
        }

        // Handle both array and object with data property
        const diplomas = Array.isArray(response)
          ? response
          : response.data || [];

        // Filter pending diplomas
        const pending = diplomas.filter(
          (d: DiplomaDTO) => d.approvalStatus === 'pending'
        );
        this.diplomasData.data = pending;
      },
      error: (err) => {
        console.error('Error al cargar diplomados:', err);
        this.diplomasData.data = [];
      },
    });
  }

  approveDiploma(diploma: DiplomaDTO) {
    console.log('Diploma:', diploma);
    const dialogRef = this.dialog.open(DiplomaRegisterDialogComponent, {
      width: '50%',
      height: '90%',
      maxWidth: '100vw',
      maxHeight: '100vh',
      data: {
        diplomaId: diploma.diplomaId,
        center: diploma.center,
        registeredBy: diploma.registeredBy,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      // Solo recargar los diplomados si el diálogo retornó éxito
      if (result?.success) {
        this.loadPendingDiplomas();
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
        const diploma = this.diplomasData.data.find(
          (d) => d.diplomaId === diplomaId
        );

        // Usar PascalCase para las propiedades (primera letra en mayúscula)
        const request = {
          DiplomaId: diplomaId, // ¡Cambiado a PascalCase!
          ApprovalStatus: 'rejected', // ¡Cambiado a PascalCase!
          AdminNotes: rejectionMessage, // ¡Cambiado a PascalCase!
          Username: diploma?.registeredBy || '', // ¡Cambiado a PascalCase!

          // Campos adicionales también en PascalCase
          Name: '',
          TotalDuration: 0,
          DiplomaKey: '',
          ServiceType: 'Diplomado',
          Modality: '',
          EducationalOffer: '',
          Cost: 0,
          Participants: 0,
          StartDate: new Date(),
          EndDate: new Date(),
          ExpirationDate: new Date(),
          ActorRoles: [],
        };

        console.log(
          'Enviando solicitud de rechazo:',
          JSON.stringify(request, null, 2)
        );

        // Llamar al servicio para rechazar el diplomado
        this.diplomasService.approveDiplomaRequest(request).subscribe({
          next: (response) => {
            Swal.fire(
              'Rechazado',
              'El diplomado ha sido rechazado y se ha enviado la retroalimentación',
              'info'
            );
            this.loadPendingDiplomas();
          },
          error: (error) => {
            console.error('Error al rechazar diplomado:', error);
            Swal.fire(
              'Error',
              'No se pudo rechazar el diplomado. Por favor, intenta de nuevo más tarde.',
              'error'
            );
          },
        });
      }
    });
  }
}
