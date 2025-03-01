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

interface DiplomaDTO {
  diplomaId: number;
  name: string;
  approvalStatus: string;
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
  ],
  templateUrl: './diploma-register-request.component.html',
  styleUrls: ['./diploma-register-request.component.scss'],
})
export class DiplomaRegisterRequestComponent implements OnInit {
  // Se agrega la columna "acciones" para usar iconos con hover
  displayedColumns = ['name', 'approvalStatus', 'expand', 'acciones'];
  diplomasData = new MatTableDataSource<DiplomaDTO>([]);
  expandedElement: DiplomaDTO | null = null;

  constructor(private diplomasService: DiplomasService) {}

  ngOnInit(): void {
    this.loadPendingDiplomas();
  }

  loadPendingDiplomas(): void {
    this.diplomasService.getAllDiplomas().subscribe({
      next: (diplomas: DiplomaDTO[]) => {
        const pending = diplomas.filter((d) => d.approvalStatus === 'pending');
        this.diplomasData.data = pending;
      },
      error: (err) => console.error('Error al cargar diplomados:', err),
    });
  }

  approveDiploma(diplomaId: number) {
    Swal.fire({
      title: '¿Estás seguro?',
      text: '¿Quieres aprobar este diploma?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí',
      cancelButtonText: 'No',
    }).then((result) => {
      if (result.isConfirmed) {
        // tu lógica de aprobación
        console.log('Aprobar diploma:', diplomaId);
      }
    });
  }

  rejectDiploma(diplomaId: number) {
    Swal.fire({
      title: '¿Estás seguro?',
      text: '¿Quieres rechazar este diploma?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí',
      cancelButtonText: 'No',
    }).then((result) => {
      if (result.isConfirmed) {
        // tu lógica de rechazo
        console.log('Rechazar diploma:', diplomaId);
      }
    });
  }
}
