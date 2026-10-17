import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { Auth } from '../auth/auth';

export const authGuard: CanActivateFn = () =>
  inject(Auth).autenticado() || inject(Router).createUrlTree(['/login']);