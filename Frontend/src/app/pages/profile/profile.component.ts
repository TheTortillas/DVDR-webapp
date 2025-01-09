import { Component, OnDestroy } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { RouterOutlet } from '@angular/router';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

import { jwtDecode } from 'jwt-decode';
import { StorageService } from '../../core/services/storage.service';
import { UserManagementService } from '../../core/services/user-management.service'; // Ajusta la ruta de tu servicio
import { time } from 'console';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [MatButtonModule, MatDividerModule, MatIconModule, RouterOutlet],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
})
export class ProfileComponent implements OnDestroy {
  private tokenValidationInterval: any;
  private tokenWarningTimeout: any;
  private readonly warningTimeInSeconds = 300; // Tiempo de advertencia en segundos

  private hasShownWarning = false; // Bandera para controlar la alerta

  constructor(
    private router: Router,
    private storageService: StorageService,
    private userManagementService: UserManagementService
  ) {}

  ngOnInit() {
    const username = localStorage.getItem('username');
    const center = localStorage.getItem('center');
    console.log('Usuario:', username, 'Centro:', center);
    if (!username || !center) {
      // Opcional: Manejo si no se encuentran datos
      console.log('Datos no encontrados en localStorage.');
    }

    this.startTokenValidation();
  }

  ngOnDestroy() {
    clearInterval(this.tokenValidationInterval);
    clearTimeout(this.tokenWarningTimeout);
  }

  startTokenValidation() {
    // Valida el token actual antes de iniciar el intervalo
    const initialToken = this.storageService.getItem('token');
    if (initialToken) {
      this.validateToken(initialToken);
    }

    // En cada intervalo, recupera el token más reciente de localStorage
    this.tokenValidationInterval = setInterval(() => {
      const currentToken = this.storageService.getItem('token');
      if (currentToken) {
        this.validateToken(currentToken);
      }
    }, 1000);
  }

  validateToken(token: string) {
    const decodedToken: any = jwtDecode(token);
    const currentTime = Math.floor(Date.now() / 1000); // Tiempo actual en segundos
    const timeToExpire = decodedToken.exp - currentTime;

    console.log(`Tiempo restante de sesión: ${timeToExpire / 60} minutos`);

    if (timeToExpire <= 0) {
      // Token expirado
      this.handleTokenExpiration();
    } else if (
      timeToExpire === this.warningTimeInSeconds &&
      !this.hasShownWarning
    ) {
      this.hasShownWarning = true;

      // Mostrar advertencia si falta 1 minuto o menos
      this.showTokenWarning(timeToExpire);
    }
  }

  handleTokenExpiration() {
    Swal.fire({
      title: 'Sesión expirada',
      text: 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.',
      icon: 'warning',
      confirmButtonText: 'Aceptar',
    }).then(() => {
      this.router.navigate(['/login']);
    });
  }

  showTokenWarning(timeToExpire: number) {
    Swal.fire({
      title: 'Sesión a punto de expirar',
      text: `Tu sesión expirará en ${
        timeToExpire / 60
      } minutos. ¿Deseas extender la sesión?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, extender sesión',
      cancelButtonText: 'No, mantener sesión actual',
    }).then((result) => {
      if (result.isConfirmed) {
        this.userManagementService.refreshToken().subscribe({
          next: (res) => {
            this.storageService.setItem('token', res.token);
            // Se renueva el token y se resetea la bandera
            this.hasShownWarning = false;
            this.validateToken(res.token);
          },
          error: (err) => {
            console.error('Error al refrescar token:', err);
          },
        });
      }
    });
  }
}
