import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { Auth } from '../auth/auth';
import { AlertService } from '../services/alert.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const alerta = inject(AlertService);
  const auth = inject(Auth);
  return next(req).pipe(catchError((e: HttpErrorResponse) => {
    if (!req.url.includes('/auth/login')) {
      const msg = e.error?.error?.message ?? e.error?.message;
      if (e.status === 401) auth.logout();
      else if (e.status === 403) alerta.error('No tiene permisos para esta acción', 'Acceso denegado');
      else if (e.status === 400 || e.status === 409 || e.status === 404) alerta.error(msg ?? 'Solicitud no válida');
      else if (e.status >= 500 || e.status === 0) alerta.error('No se pudo conectar con el servidor', 'Error de conexión');
    }
    return throwError(() => e);
  }));
};