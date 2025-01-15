import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormGroup,
  FormBuilder,
  Validators,
} from '@angular/forms';
import { FilesService } from '../../core/services/files.service';

@Component({
  selector: 'app-pruebas-ficheros',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './pruebas-ficheros.component.html',
  styleUrl: './pruebas-ficheros.component.scss',
})
export class PruebasFicherosComponent {
  uploadForm: FormGroup;
  selectedFiles: File[] = [];
  uploadProgress: number | null = null;
  message: string = '';

  constructor(private fb: FormBuilder, private filesService: FilesService) {
    this.uploadForm = this.fb.group({
      fileName: ['', Validators.required],
      courseDate: ['', Validators.required],
      center: ['', Validators.required],
      files: [null, Validators.required],
    });
  }

  onFileSelected(event: any): void {
    if (event.target.files && event.target.files.length > 0) {
      this.selectedFiles = Array.from(event.target.files);
      this.uploadForm.patchValue({ files: this.selectedFiles });
    }
  }

  onSubmit(): void {
    if (this.uploadForm.invalid) {
      this.message =
        'Por favor, completa todos los campos y selecciona al menos un archivo.';
      return;
    }

    const formData = new FormData();
    formData.append('FileName', this.uploadForm.get('fileName')?.value);
    formData.append('CourseDate', this.uploadForm.get('courseDate')?.value);
    formData.append('Center', this.uploadForm.get('center')?.value);

    this.selectedFiles.forEach((file, index) => {
      formData.append('Files', file, file.name);
    });

    this.filesService.uploadFiles(formData).subscribe({
      next: (response) => {
        this.message = response.message;
        this.uploadProgress = 100;
        // Opcional: limpiar el formulario
        this.uploadForm.reset();
        this.selectedFiles = [];
      },
      error: (error) => {
        this.message =
          error.error?.message || 'Ocurrió un error durante la subida.';
        this.uploadProgress = null;
      },
    });
  }
}
