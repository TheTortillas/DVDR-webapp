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
import { DiplomasService } from '../../../core/services/diplomas.service';
import { StorageService } from '../../../core/services/storage.service';

interface DiplomaDocumentRow {
  id: number;
  name: string;
  filePath: string;
  uploadedFile?: File;
  type: string;
  required: boolean;
}

@Component({
  selector: 'app-diploma-register',
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
  templateUrl: './diploma-register.component.html',
  styleUrl: './diploma-register.component.scss',
})
export class DiplomaRegisterComponent implements OnInit {
  dataSource = new MatTableDataSource<DiplomaDocumentRow>([]);
  displayedColumns: string[] = ['icon', 'name', 'files', 'actions'];
  // Variable para mostrar/ocultar el error
  missingRequiredDocs = false;

  constructor(
    private dataService: DataService,
    private diplomasService: DiplomasService,
    private storageService: StorageService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Cargar plantillas al iniciar
    this.loadDiplomaeDocumentTemplates();
  }

  loadDiplomaeDocumentTemplates(): void {
    this.dataService.getDiplomaeDocumentTemplates().subscribe({
      next: (data: DiplomaDocumentRow[]) => {
        // Filtrar sólo los documentos que tienen required = true
        const requiredDocs = data.filter((doc) => doc.required);

        this.dataSource.data = requiredDocs.map((item) => ({
          id: item.id,
          name: item.name,
          filePath: item.filePath,
          type: item.type,
          required: item.required,
        }));
        //console.log('Diploma templates loaded:', this.dataSource.data);
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
        const token = this.storageService.getItem('token');
        if (!token) {
          Swal.fire('Error', 'No se encontró la sesión del usuario', 'error');
          return;
        }

        const claims = this.storageService.getTokenClaims(token);
        if (!claims || !claims.username) {
          Swal.fire(
            'Error',
            'No se pudo obtener la información del usuario',
            'error'
          );
          return;
        }

        // Crear FormData
        const formData = new FormData();
        formData.append('Username', claims.username); // Cambiado a 'Username' con mayúscula

        // Agregar documentos como array
        this.dataSource.data.forEach((doc, index) => {
          if (doc.uploadedFile) {
            formData.append(
              `Documents[${index}].DocumentId`,
              doc.id.toString()
            );
            formData.append(`Documents[${index}].File`, doc.uploadedFile);
          }
        });

        formData.append('FolderName', '0000'); // Cambiado a 'Username' con mayúscula

        // Enviar solicitud
        this.diplomasService.requestDiplomaRegistration(formData).subscribe({
          next: (response) => {
            Swal.fire({
              title: '¡Éxito!',
              text: 'Se ha enviado la solicitud correctamente.',
              icon: 'success',
              confirmButtonColor: '#3085d6',
            }).then(() => {
              this.router.navigate(['/profile/my-courses']);
            });
          },
          error: (error) => {
            console.error('Error:', error);
            Swal.fire({
              title: 'Error',
              text: 'Hubo un problema al enviar la solicitud. Por favor, intenta nuevamente.',
              icon: 'error',
            });
          },
        });
      }
    });
  }
}
