import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef } from '@angular/material/dialog';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { UserManagementService } from '../../../../core/services/user-management.service';
import { DataService } from '../../../../core/services/data.service';
import Swal from 'sweetalert2';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-add-user-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIcon,
  ],
  templateUrl: './add-user-dialog.component.html',
})
export class AddUserDialogComponent implements OnInit {
  hidePassword = true;
  userForm: FormGroup;
  centers: any[] = [];

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<AddUserDialogComponent>,
    private usersService: UserManagementService,
    private dataService: DataService
  ) {
    this.userForm = this.fb.group({
      username: [
        '',
        [
          Validators.required,
          Validators.pattern(/^\S*$/), // Validador para no permitir espacios
        ],
      ],
      email: ['', [Validators.required, Validators.email]],
      password: [
        '',
        [
          Validators.required,
          Validators.minLength(8),
          Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/), // Al menos una mayúscula, una minúscula y un número
        ],
      ],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      secondLastName: [''],
      role: ['user', Validators.required],
      centerName: [''],
    });
  }

  ngOnInit() {
    this.loadCenters();
    this.userForm.get('role')?.valueChanges.subscribe((role) => {
      const centerControl = this.userForm.get('centerName');
      if (role === 'user') {
        centerControl?.setValidators(Validators.required);
      } else {
        centerControl?.clearValidators();
        centerControl?.setValue('');
      }
      centerControl?.updateValueAndValidity();
    });
  }

  loadCenters() {
    this.dataService.getCentersList().subscribe({
      next: (centers) => {
        this.centers = centers;
      },
      error: (error) => console.error('Error loading centers:', error),
    });
  }

  onSubmit() {
    if (this.userForm.valid) {
      this.usersService.createUser(this.userForm.value).subscribe({
        next: (response) => {
          Swal.fire({
            title: 'Éxito',
            text: 'Usuario creado correctamente',
            icon: 'success',
          });
          this.dialogRef.close(true);
        },
        error: (error) => {
          Swal.fire({
            title: 'Error',
            text: 'No se pudo crear el usuario',
            icon: 'error',
          });
        },
      });
    }
  }

  onCancel() {
    this.dialogRef.close();
  }
}
