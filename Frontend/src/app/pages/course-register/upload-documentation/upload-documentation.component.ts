import { Component } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatChip, MatChipsModule } from '@angular/material/chips';
import { MatIcon } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-upload-documentation',
  standalone: true,
  imports: [MatButton, MatIcon, MatTooltipModule, MatChipsModule, MatChip],
  templateUrl: './upload-documentation.component.html',
  styleUrl: './upload-documentation.component.scss'
})
export class UploadDocumentationComponent {

  // Variables para almacenar los archivos seleccionados
  file1: File | null = null;
  file2: File | null = null;
  file3: File | null = null;
  file4: File | null = null;
  file5: File | null = null;
  file6: File | null = null;
  file7: File | null = null;
  file8: File | null = null;

  // Método que se ejecuta cuando el input cambia (cuando el usuario selecciona un archivo)
  onInputChange(event: any, fileIndex: number) {
    const file = event.target.files[0];  // Captura el archivo seleccionado (solo uno porque es un input único)
    if (file) {
      switch (fileIndex) {
        case 1:
          this.file1 = file;
          break;
        case 2:
          this.file2 = file;
          break;
        case 3:
          this.file3 = file;
          break;
        case 4:
          this.file4 = file;
          break;
        case 5:
          this.file5 = file;
          break;
        case 6:
          this.file6 = file;
          break;
        case 7:
          this.file7 = file;
          break;
        case 8:
          this.file8 = file;
          break;
      }
    }
  }

  // Método para eliminar un archivo de la lista
  removeFile(fileIndex: number) {
    switch (fileIndex) {
      case 1:
        this.file1 = null;
        break;
      case 2:
        this.file2 = null;
        break;
      case 3:
        this.file3 = null;
        break;
      case 4:
        this.file4 = null;
        break;
      case 5:
        this.file5 = null;
        break;
      case 6:
        this.file6 = null;
        break;
      case 7:
        this.file7 = null;
        break;
      case 8:
        this.file8 = null;
        break;
    }
  }

  fileInputChange(fileInputEvent: any) {
    console.log(fileInputEvent.target.files[0]);
  }
}