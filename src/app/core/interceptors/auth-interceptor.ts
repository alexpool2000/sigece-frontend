
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Auth } from '../auth/auth';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = inject(Auth).token;

  const headers: Record<string, string> = {
    'X-Usuario-Id': '2',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return next(
    req.clone({
      setHeaders: headers,
    }),
  );
};
