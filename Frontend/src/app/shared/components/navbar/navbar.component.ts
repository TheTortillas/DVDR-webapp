import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink, Router } from '@angular/router';
import { StorageService } from '../../../core/services/storage.service';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, MatButtonModule, CommonModule, MatIconModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
})
export class NavbarComponent {
  constructor(private router: Router, private storageService: StorageService) {}

  isLoggedInAndProfile(): boolean {
    const token = this.storageService.getItem('token');
    return (
      !!token &&
      this.storageService.isTokenValid(token) &&
      this.router.url.includes('/profile')
    );
  }
}
