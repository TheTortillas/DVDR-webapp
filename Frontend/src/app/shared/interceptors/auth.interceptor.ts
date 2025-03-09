import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { LoadingService } from '../../core/services/loading.service';
import { finalize } from 'rxjs/operators';
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';

export const AuthInterceptor: HttpInterceptorFn = (req, next) => {
  const platformId = inject(PLATFORM_ID);
  const loadingService = inject(LoadingService);

  let token = null;

  if (isPlatformBrowser(platformId)) {
    token = localStorage.getItem('token');
  }

  // Mostrar pantalla de carga
  loadingService.showLoading();

  const authReq = token
    ? req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
        },
      })
    : req;

  return next(authReq).pipe(
    finalize(() => {
      // Ocultar pantalla de carga
      loadingService.hideLoading();
    })
  );
};
