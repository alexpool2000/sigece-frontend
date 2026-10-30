import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Auth } from '../auth/auth';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(Auth);
  const token = auth.token;

  // Si es la petición de login, se deja pasar limpia sin headers de auth
  if (req.url.includes('/auth/login')) {
    return next(req);
  }

  // Si no hay token guardado, sigue la petición tal cual
  if (!token) {
    return next(req);
  }

  // Adjuntamos únicamente el Bearer token
  return next(
    req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    }),
  );
};