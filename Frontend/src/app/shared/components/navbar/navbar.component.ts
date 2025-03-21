import {
  Component,
  Inject,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink, Router } from '@angular/router';
import { StorageService } from '../../../core/services/storage.service';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MessagesService } from '../../../core/services/messages.service';
import { RejectionMessagesService } from '../../../core/services/rejection-messages.service';
import { MatBadgeModule } from '@angular/material/badge';

import Swal from 'sweetalert2';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    RouterLink,
    MatButtonModule,
    CommonModule,
    MatIconModule,
    MatMenuModule,
    MatBadgeModule,
  ],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
})
export class NavbarComponent implements OnInit, OnDestroy {
  unattendMessages: number = 0;
  private subscription: Subscription | null = null;

  // Añadir a las propiedades de la clase:
  unreadRejectionMessages: number = 0;
  private rejectionSubscription: Subscription | null = null;

  constructor(
    private router: Router,
    private storageService: StorageService,
    private messagesService: MessagesService,
    private rejectionMessagesService: RejectionMessagesService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.loadUnreadMessages();
      this.loadUnreadRejectionMessages();

      // Suscribirse a cambios en el estado de los mensajes
      this.subscription = this.messagesService.messageStatusChanged$.subscribe(
        () => {
          this.loadUnreadMessages();
        }
      );

      // Suscribirse a cambios en el estado de los mensajes de rechazo
      this.rejectionSubscription =
        this.rejectionMessagesService.messageStatusChanged$.subscribe(() => {
          this.loadUnreadRejectionMessages();
        });
    }
  }

  ngOnDestroy() {
    // Limpiar las suscripciones al destruir el componente
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    if (this.rejectionSubscription) {
      this.rejectionSubscription.unsubscribe();
    }
  }

  isLoggedInAndProfile(): boolean {
    if (!isPlatformBrowser(this.platformId)) {
      return false;
    }

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
    if (!isPlatformBrowser(this.platformId)) {
      return false;
    }

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

  isLoggedInAndVerifier(): boolean {
    if (!isPlatformBrowser(this.platformId)) {
      return false;
    }

    const token = this.storageService.getItem('token');
    if (!token || !this.storageService.isTokenValid(token)) {
      return false;
    }

    const claims = this.storageService.getTokenClaims(token);
    return (
      !!claims &&
      this.router.url.includes('/verification') &&
      claims.role === 'verifier'
    );
  }

  // Añadir el método para cargar los mensajes de rechazo no leídos:
  private loadUnreadRejectionMessages() {
    const token = this.storageService.getItem('token');
    if (token) {
      const claims = this.storageService.getTokenClaims(token);
      if (claims && claims.username) {
        this.rejectionMessagesService
          .getUnreadMessagesCount(claims.username)
          .subscribe({
            next: (count) => {
              this.unreadRejectionMessages = count;
            },
            error: (error) => {
              console.error('Error loading unread rejection messages:', error);
            },
          });
      }
    }
  }

  // Añadir método para ir al buzón de rechazos:
  goToRejectionMessages() {
    this.router.navigate(['/profile/inbox']);
  }

  private loadUnreadMessages() {
    this.messagesService.getAllMessages().subscribe({
      next: (messages) => {
        this.unattendMessages = messages.filter((m) => !m.attended).length;
      },
      error: (error) => {
        console.error('Error loading unread messages:', error);
      },
    });
  }

  goToMessages() {
    this.router.navigate(['/management/messages']);
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
