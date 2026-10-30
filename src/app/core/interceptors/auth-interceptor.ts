import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { Auth } from '../auth/auth';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(Auth);
  const token = auth.token;
  const esLogin = req.url.includes('/auth/login');

  const request = token && !esLogin
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(request).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status === 401 && !esLogin) auth.logout();
      return throwError(() => err);
    }),
  );
};