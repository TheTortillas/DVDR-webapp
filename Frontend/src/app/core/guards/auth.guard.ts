import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { StorageService } from '../services/storage.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private router: Router, private storageService: StorageService) {}

  canActivate(): boolean {
    const token = this.storageService.getItem('token');
    const username = this.storageService.getItem('username');
    const center = this.storageService.getItem('center');

    if (token && username && center) {
      return true;
    }
    this.router.navigate(['/login']);
    return false;
  }
}
