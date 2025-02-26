import { Component, OnInit } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CommonModule } from '@angular/common';
import { MatError, MatFormFieldModule } from '@angular/material/form-field';
import { MatButton } from '@angular/material/button';
import { Router } from '@angular/router';
import { DataService } from '../../../core/services/data.service';
import Swal from 'sweetalert2';

interface DiplomaDocumentRow {
  id: number;
  name: string;
  filePath: string;
  uploadedFile?: File;
  type: string;
  required: boolean;
}

@Component({
  selector: 'app-diploema-register',
  standalone: true,
  imports: [
    MatIcon,
    MatTooltipModule,
    MatTableModule,
    CommonModule,
    MatFormFieldModule,
    MatError,
    MatButton,
  ],
  templateUrl: './diploema-register.component.html',
  styleUrl: './diploema-register.component.scss',
})
export class DiploemaRegisterComponent implements OnInit {
  dataSource = new MatTableDataSource<DiplomaDocumentRow>([]);
  displayedColumns: string[] = ['icon', 'name', 'files', 'actions'];
  // Variable para mostrar/ocultar el error
  missingRequiredDocs = false;

  constructor(private dataService: DataService, private router: Router) {}

  ngOnInit(): void {
    // Cargar plantillas al iniciar
    this.loadDiplomaeDocumentTemplates();
  }

  loadDiplomaeDocumentTemplates(): void {
    this.dataService.getDiplomaeDocumentTemplates().subscribe({
      next: (data: DiplomaDocumentRow[]) => {
        this.dataSource.data = data.map((item) => ({
          id: item.id,
          name: item.name,
          filePath: item.filePath,
          type: item.type,
          required: item.required,
        }));
      },
      error: (err) => {
        console.error('Error loading diploma templates:', err);
      },
    });
  }

  onInputChange(event: any, fileIndex: number): void {
    const file = event.target.files[0];
    if (file) {
      this.dataSource.data = this.dataSource.data.map((row) => {
        if (row.id === fileIndex) {
          return { ...row, uploadedFile: file };
        }
        return row;
      });
    }
  }

  verArchivo(element: DiplomaDocumentRow): void {
    if (element.uploadedFile) {
      const fileURL = URL.createObjectURL(element.uploadedFile);
      window.open(fileURL, '_blank');
    }
  }

  deleteFile(fileIndex: number): void {
    this.dataSource.data = this.dataSource.data.map((row) => {
      if (row.id === fileIndex) {
        return { ...row, uploadedFile: undefined };
      }
      return row;
    });
  }

  getUploadedDocuments(): DiplomaDocumentRow[] {
    return this.dataSource.data.filter((row) => !!row.uploadedFile);
  }

  areAllRequiredDocsUploaded(): boolean {
    return this.dataSource.data.every(
      (row) => !row.required || row.uploadedFile
    );
  }

  // Verifica si faltan documentos obligatorios y muestra mensaje de error o éxito
  onSubmit(): void {
    const missingDoc = this.dataSource.data.some(
      (doc) => doc.required && !doc.uploadedFile
    );

    if (missingDoc) {
      this.missingRequiredDocs = true;
      return;
    }

    this.missingRequiredDocs = false;

    // Primero mostrar confirmación
    Swal.fire({
      title: '¿Estás seguro?',
      text: '¿Confirmas que toda tu información es correcta?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, confirmar',
      cancelButtonText: 'No, revisar',
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: '¡Éxito!',
          text: 'Se ha subido toda la documentación requerida.',
          icon: 'success',
          confirmButtonColor: '#3085d6',
        }).then(() => {
          // Redirigir después de cerrar el Swal
          this.router.navigate(['/profile/my-courses']);
        });
      }
    });
  }
}
