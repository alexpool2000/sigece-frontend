import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { catchError, throwError } from 'rxjs';
import { Auth } from '../auth/auth';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const snack = inject(MatSnackBar);
  const auth = inject(Auth);
  return next(req).pipe(catchError((e: HttpErrorResponse) => {
    if (!req.url.includes('/auth/login')) {
      const msg = e.error?.error?.message ?? e.error?.message;
      if (e.status === 401) auth.logout();
      else if (e.status === 403) snack.open('No tiene permisos para esta acción', 'Cerrar', { duration: 4000 });
      else if (e.status === 400 || e.status === 409 || e.status === 404) snack.open(msg ?? 'Solicitud no válida', 'Cerrar', { duration: 5000 });
      else if (e.status >= 500 || e.status === 0) snack.open('No se pudo conectar con el servidor', 'Cerrar', { duration: 4000 });
    }
    return throwError(() => e);
  }));
};