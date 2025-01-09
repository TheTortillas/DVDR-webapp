import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { LoadingService } from '../../core/services/loading.service';
import { finalize } from 'rxjs/operators';

export const AuthInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('token');
  const loadingService = inject(LoadingService);

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
