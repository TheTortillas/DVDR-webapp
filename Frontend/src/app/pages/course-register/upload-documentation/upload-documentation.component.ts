import { Component } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatChip, MatChipsModule } from '@angular/material/chips';
import { MatIcon } from '@angular/material/icon';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CommonModule } from '@angular/common';

// Interface para las filas de la tabla
interface DocumentRow {
  id: number;
  name: string;
  downloadLink: string;
}

@Component({
  selector: 'app-upload-documentation',
  standalone: true,
  imports: [
    MatIcon,
    MatTooltipModule,
    MatChipsModule,
    MatChip,
    MatTableModule,
    CommonModule,
  ],
  templateUrl: './upload-documentation.component.html',
  styleUrl: './upload-documentation.component.scss',
})
export class UploadDocumentationComponent {
  // Variables para almacenar los archivos seleccionados
  fileMap: { [key: number]: File | null } = {};

  // DataSource para la tabla
  displayedColumns: string[] = ['icon', 'name', 'files'];
  dataSource = new MatTableDataSource<DocumentRow>([
    {
      id: 1,
      name: 'Formato de registro de cursos de formación a lo largo de la vida',
      downloadLink: 'assets/01 FS20H 2024-2.docx',
    },
    {
      id: 2,
      name: 'Lista de cotejo para formato de registro de cursos',
      downloadLink: 'assets/01 LC20H 2024-2.xlsx',
    },
    {
      id: 3,
      name: 'Lista de cotejo para cursos en modalidad no escolarizada',
      downloadLink: 'assets/01 LC20H 2024-2.xlsx',
    },
    {
      id: 4,
      name: 'Formato de protesta de autoría',
      downloadLink: 'assets/02 FPA20H 2024.docx',
    },
    {
      id: 5,
      name: 'Cronograma de actividades',
      downloadLink: 'assets/03 CR20H 2024 .docx',
    },
    {
      id: 6,
      name: 'Formato de curriculum vitae',
      downloadLink: 'assets/04 CV20H 2024.docx',
    },
    {
      id: 7,
      name: 'Ejemplo de carta aval',
      downloadLink: 'assets/05 CA-ejemplo.pdf',
    },
    {
      id: 8,
      name: 'Procedimiento para registrar cursos de hasta 20 horas',
      downloadLink: '',
    },
  ]);

  // Método que se ejecuta cuando el input cambia (cuando el usuario selecciona un archivo)
  onInputChange(event: any, fileIndex: number) {
    const file = event.target.files[0]; // Captura el archivo seleccionado (solo uno porque es un input único)
    if (file) {
      this.fileMap[fileIndex] = file;
    }
  }

  // Método para eliminar un archivo de la lista
  removeFile(fileIndex: number) {
    this.fileMap[fileIndex] = null;
  }

  // Obtener archivo seleccionado
  getFile(fileIndex: number): File | null {
    return this.fileMap[fileIndex] || null;
  }
}
