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

    if (!token) {
      this.router.navigate(['/auth/login']);
      return false;
    }

    // Validar el token y obtener los claims
    if (!this.storageService.isTokenValid(token)) {
      this.storageService.clear();
      this.router.navigate(['/auth/login']);
      return false;
    }

    const claims = this.storageService.getTokenClaims(token);
    if (!claims) {
      this.router.navigate(['/auth/login']);
      return false;
    }

    const requestedRoute = state.url;

    if (requestedRoute.startsWith('/profile') && claims.role !== 'user') {
      this.router.navigate(['/auth/login']);
      return false;
    }

    if (requestedRoute.startsWith('/management') && claims.role !== 'root') {
      this.router.navigate(['/auth/login']);
      return false;
    }

    return true;
  }
}
