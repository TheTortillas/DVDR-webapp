import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink, Router } from '@angular/router';
import { StorageService } from '../../../core/services/storage.service';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';

import Swal from 'sweetalert2';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    RouterLink,
    MatButtonModule,
    CommonModule,
    MatIconModule,
    MatMenuModule,
  ],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
})
export class NavbarComponent {
  constructor(private router: Router, private storageService: StorageService) {}

  isLoggedInAndProfile(): boolean {
    const token = this.storageService.getItem('token');

    if (!token || !this.storageService.isTokenValid(token)) {
      return false;
    }

    const claims = this.storageService.getTokenClaims(token);
    return (
      !!claims && this.router.url.includes('/profile') && claims.role === 'user'
    );
  }

  isLoggedInAndAdmin(): boolean {
    const token = this.storageService.getItem('token');

    if (!token || !this.storageService.isTokenValid(token)) {
      return false;
    }

    const claims = this.storageService.getTokenClaims(token);
    return (
      !!claims &&
      this.router.url.includes('/management') &&
      claims.role === 'root'
    );
  }

  logout() {
    Swal.fire({
      title: '¿Estás seguro?',
      text: '¿Realmente deseas cerrar sesión?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, cerrar sesión',
      cancelButtonText: 'No, mantener sesión',
    }).then((result) => {
      if (result.isConfirmed) {
        this.storageService.clear();
        this.router.navigate(['/home']).then(() => {
          Swal.fire({
            title: 'Sesión cerrada con éxito',
            text: 'Nos vemos pronto',
            icon: 'success',
            confirmButtonText: 'Aceptar',
          });
        });
      }
    });
  }
}
