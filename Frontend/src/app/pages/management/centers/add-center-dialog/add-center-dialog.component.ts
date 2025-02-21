import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { DataService } from '../../../../core/services/data.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-add-center-dialog',
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
  templateUrl: './add-center-dialog.component.html',
  styleUrl: './add-center-dialog.component.scss',
})
export class AddCenterDialogComponent {
  centerForm: FormGroup;
  centerTypes = ['CITTA', 'CVDR', 'UA'];

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<AddCenterDialogComponent>,
    private dataService: DataService
  ) {
    this.centerForm = this.fb.group({
      name: ['', [Validators.required]],
      type: ['', [Validators.required]],
      identifier: ['', [Validators.required, Validators.min(1)]],
    });
  }

  onSubmit(): void {
    if (this.centerForm.valid) {
      this.dataService.addCenter(this.centerForm.value).subscribe({
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
            text: 'Ocurrió un error al registrar el centro',
            icon: 'error',
            confirmButtonText: 'Aceptar',
            confirmButtonColor: '#d33',
          });
        },
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
