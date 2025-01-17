import {
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  OnInit,
} from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CommonModule } from '@angular/common';

import { DataService } from '../../../../core/services/data.service';
import { MatError, MatFormFieldModule } from '@angular/material/form-field';

// Interface para las filas de la tabla
interface DocumentRow {
  id: number;
  name: string;
  filePath: string;
  uploadedFile?: File; // Nuevo campo para el archivo subido
  type: string; // Tipo de archivo (URL o archivo)
  required: boolean; // Indicador si el documento es obligatorio
}

@Component({
  selector: 'app-upload-documentation',
  standalone: true,
  imports: [
    MatIcon,
    MatTooltipModule,
    MatTableModule,
    CommonModule,
    MatError,
    MatFormFieldModule,
  ],
  templateUrl: './upload-documentation.component.html',
  styleUrl: './upload-documentation.component.scss',
})
export class UploadDocumentationComponent implements OnChanges, OnInit {
  @Input() modality!: string; // Recibe la modalidad del curso desde el componente padre del primer paso del stepper
  fileMap: { [key: number]: File | null } = {};
  displayedColumns: string[] = ['icon', 'name', 'files', 'actions'];
  dataSource = new MatTableDataSource<DocumentRow>([]);

  constructor(private dataService: DataService) {}

  ngOnInit(): void {
    // Si ya hay una modalidad válida al iniciar, cargar los documentos
    if (this.modality) {
      this.loadDocumentTemplates();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Detectar cambios en la modalidad
    if (changes['modality'] && !changes['modality'].firstChange) {
      console.log('Modality changed:', changes['modality'].currentValue);
      this.loadDocumentTemplates();
    }
  }

  loadDocumentTemplates(): void {
    this.dataService.getDocumentTemplates(this.modality).subscribe({
      next: (data: DocumentRow[]) => {
        this.dataSource.data = data.map((item) => ({
          id: item.id,
          name: item.name,
          filePath: item.filePath,
          type: item.type,
          required: item.required,
        }));
      },
      error: (err) => {
        console.error('Error loading document templates:', err);
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

  verArchivo(element: DocumentRow): void {
    if (element.uploadedFile) {
      const fileURL = URL.createObjectURL(element.uploadedFile);
      window.open(fileURL, '_blank');
    }
  }

  removeFile(fileIndex: number): void {
    this.fileMap[fileIndex] = null;
  }

  getFile(fileIndex: number): File | null {
    return this.fileMap[fileIndex] || null;
  }

  deleteFile(fileIndex: number): void {
    this.dataSource.data = this.dataSource.data.map((row) => {
      if (row.id === fileIndex) {
        return { ...row, uploadedFile: undefined };
      }
      return row;
    });
  }
}
