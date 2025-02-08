import { Component, OnDestroy } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { RouterOutlet, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { StorageService } from '../../core/services/storage.service';
import { UserManagementService } from '../../core/services/user-management.service';
import { jwtDecode } from 'jwt-decode';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-management',
  standalone: true,
  imports: [MatButtonModule, MatDividerModule, MatIconModule, RouterOutlet],
  templateUrl: './management.component.html',
  styleUrl: './management.component.scss',
})
export class ManagementComponent implements OnDestroy {
  private tokenValidationInterval: any;
  private tokenWarningTimeout: any;
  private readonly warningTimeInSeconds = 300; // 5 minutos de advertencia
  private hasShownWarning = false;

  constructor(
    private router: Router,
    private storageService: StorageService,
    private userManagementService: UserManagementService,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    const username = localStorage.getItem('username');

    if (!username) {
      console.log('Datos no encontrados en localStorage.');
    }

    this.startTokenValidation();
  }

  ngOnDestroy() {
    clearInterval(this.tokenValidationInterval);
    clearTimeout(this.tokenWarningTimeout);
  }

  startTokenValidation() {
    const initialToken = this.storageService.getItem('token');
    if (initialToken) {
      this.validateToken(initialToken);
    }

    this.tokenValidationInterval = setInterval(() => {
      const currentToken = this.storageService.getItem('token');
      if (currentToken) {
        this.validateToken(currentToken);
      }
    }, 1000);
  }

  validateToken(token: string) {
    const decodedToken: any = jwtDecode(token);
    const currentTime = Math.floor(Date.now() / 1000);
    const timeToExpire = decodedToken.exp - currentTime;

    if (timeToExpire <= 0) {
      this.handleTokenExpiration();
    } else if (
      timeToExpire === this.warningTimeInSeconds &&
      !this.hasShownWarning
    ) {
      this.hasShownWarning = true;
      this.showTokenWarning(timeToExpire);
    }
  }

  handleTokenExpiration() {
    this.dialog.closeAll();
    this.storageService.clear();
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
