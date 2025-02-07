import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
} from '@angular/router';
import { StorageService } from '../services/storage.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private router: Router, private storageService: StorageService) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    const token = this.storageService.getItem('token');
    const role = this.storageService.getItem('role'); // Obtiene el rol guardado

    if (!token || !role) {
      this.router.navigate(['/auth/login']);
      return false;
    }

    const requestedRoute = state.url;

    if (requestedRoute.startsWith('/profile') && role !== 'user') {
      this.router.navigate(['/auth/login']);
      return false;
    }

    if (requestedRoute.startsWith('/management') && role !== 'root') {
      this.router.navigate(['/auth/login']);
      return false;
    }

    return true;
  }
}
