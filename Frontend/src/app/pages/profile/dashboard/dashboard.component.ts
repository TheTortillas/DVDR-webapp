import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterLink } from '@angular/router';
import { MatMenuModule } from '@angular/material/menu';
import { StorageService } from '../../../core/services/storage.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    RouterLink,
    MatButtonModule,
    MatDividerModule,
    MatIconModule,
    MatMenuModule,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent {
  username: string | null = '';
  center: string | null = '';

  constructor(private storageService: StorageService, private router: Router) {}

  ngOnInit() {
    const token = this.storageService.getItem('token');

    if (token) {
      const claims = this.storageService.getTokenClaims(token);
      if (claims) {
        this.username = claims.username;
        this.center = claims.center;
      } else {
        console.error('No se pudieron obtener los claims del token');
        this.router.navigate(['/auth/login']);
      }
    } else {
      console.error('No hay token disponible');
      this.router.navigate(['/auth/login']);
    }
  }

  navToCourses() {
    this.router.navigate(['/profile/course-register']);
  }

  navToDiplomas() {
    this.router.navigate(['/profile/diploma-register']);
  }

  navToCertificates(type: 'courses' | 'diplomas') {
    if (type === 'courses') {
      this.router.navigate(['/profile/request-certificates']);
    } else {
      this.router.navigate(['/profile/request-diploma-certificates']);
    }
  }
}
