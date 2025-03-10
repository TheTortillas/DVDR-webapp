import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import {
  User,
  UserManagementService,
} from '../../../core/services/user-management.service';
import { AddUserDialogComponent } from './add-user-dialog/add-user-dialog.component';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    FormsModule,
  ],
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss'],
})
export class UsersComponent implements OnInit {
  displayedColumns: string[] = [
    'username',
    'email',
    'fullName',
    'centerName',
    'role',
    'createdAt',
    'actions',
  ];
  dataSource: MatTableDataSource<User>;
  selectedRole: string = '';

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private usersService: UserManagementService,
    private dialog: MatDialog
  ) {
    this.dataSource = new MatTableDataSource();
  }

  ngOnInit() {
    this.loadUsers();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadUsers() {
    this.usersService.getAllUsers().subscribe({
      next: (users) => {
        this.dataSource.data = users;
      },
      error: (error) => console.error('Error loading users:', error),
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  filterByRole() {
    this.dataSource.filter = this.selectedRole;
  }

  openAddDialog() {
    const dialogRef = this.dialog.open(AddUserDialogComponent, {
      width: '40%',
      height: '90%',
      maxWidth: '100vw',
      maxHeight: '100vh',
      autoFocus: false,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadUsers();
      }
    });
  }

  async changePassword(user: User) {
    const { value: password } = await Swal.fire({
      title: 'Nueva contraseña',
      html: `
      <div style="width: 100%;">
        <input
          id="passwordField"
          type="password"
          class="swal2-input"
          placeholder="Ingresa la nueva contraseña"
        />
        <button
          id="togglePassword"
          style="
            margin-top: 8px;
            border: none;
            background: none;
            cursor: pointer;
            padding: 5px;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 4px;
            color: #666;
            width: 100%;
          "
        >
          <span class="material-icons">visibility</span>
          <span id="toggleText">Mostrar contraseña</span>
        </button>
      </div>
    `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Actualizar',
      cancelButtonText: 'Cancelar',
      didOpen: () => {
        const toggleBtn = document.getElementById('togglePassword');
        const toggleIcon = toggleBtn?.querySelector('.material-icons');
        const toggleText = document.getElementById('toggleText');
        const passField = document.getElementById(
          'passwordField'
        ) as HTMLInputElement;

        if (toggleBtn && passField && toggleIcon && toggleText) {
          toggleBtn.addEventListener('click', (event) => {
            event.preventDefault();
            if (passField.type === 'password') {
              passField.type = 'text';
              toggleIcon.textContent = 'visibility_off';
              toggleText.textContent = 'Ocultar';
            } else {
              passField.type = 'password';
              toggleIcon.textContent = 'visibility';
              toggleText.textContent = 'Mostrar';
            }
          });
        }
      },
      preConfirm: () => {
        const passField = document.getElementById(
          'passwordField'
        ) as HTMLInputElement;
        if (!passField.value) {
          Swal.showValidationMessage('Debes ingresar una contraseña');
          return null;
        }
        if (passField.value.length < 6) {
          Swal.showValidationMessage(
            'La contraseña debe tener al menos 6 caracteres'
          );
          return null;
        }
        return passField.value;
      },
    });

    if (password) {
      this.usersService.updatePassword(user.username, password).subscribe({
        next: (res) => {
          Swal.fire({
            icon: 'success',
            title: '¡Éxito!',
            text: res.message || 'Contraseña actualizada correctamente',
            timer: 1500,
          });
        },
        error: (error) => {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: error.error?.message || 'Error al actualizar la contraseña',
          });
        },
      });
    }
  }
}
