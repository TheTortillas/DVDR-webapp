import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import {
  MatDialogRef,
  MatDialogModule,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { DataService, Center } from '../../../../core/services/data.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-edit-center-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
  ],
  templateUrl: './edit-center-dialog.component.html',
  styleUrl: './edit-center-dialog.component.scss',
})
export class EditCenterDialogComponent {
  centerForm: FormGroup;
  centerTypes = ['CITTA', 'CVDR', 'UA'];
  genderOptions = [
    { value: 'H', label: 'Hombre' },
    { value: 'M', label: 'Mujer' },
  ];

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<EditCenterDialogComponent>,
    private dataService: DataService,
    @Inject(MAT_DIALOG_DATA) public data: Center
  ) {
    // Inicializar el formulario con los datos del centro
    this.centerForm = this.fb.group({
      id: [data.id],
      name: [data.name, [Validators.required]],
      type: [data.type, [Validators.required]],
      identifier: [data.identifier, [Validators.required, Validators.min(1)]],
      directorFullName: [data.directorFullName || ''],
      academicTitle: [data.academicTitle || ''],
      gender: [data.gender || ''],
    });
  }

  onSubmit(): void {
    if (this.centerForm.valid) {
      this.dataService.updateCenter(this.centerForm.value).subscribe({
        next: (response) => {
          if (response.statusCode === 1) {
            // Éxito
            Swal.fire({
              title: '¡Éxito!',
              text: response.message,
              icon: 'success',
              confirmButtonText: 'Aceptar',
              confirmButtonColor: '#3085d6',
            }).then(() => {
              this.dialogRef.close(true);
            });
          } else {
            // Error con mensaje específico
            Swal.fire({
              title: 'Error',
              text: response.message,
              icon: 'error',
              confirmButtonText: 'Aceptar',
              confirmButtonColor: '#d33',
            });
          }
        },
        error: (error) => {
          // Error general
          Swal.fire({
            title: 'Error',
            text: 'Ocurrió un error al actualizar el centro',
            icon: 'error',
            confirmButtonText: 'Aceptar',
            confirmButtonColor: '#d33',
          });
          console.error('Error al actualizar centro:', error);
        },
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
