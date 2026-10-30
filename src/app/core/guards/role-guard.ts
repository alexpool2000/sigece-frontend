import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth } from '../auth/auth';
import { Rol } from '../auth/auth.models';

export const roleGuard: CanActivateFn = (route) => {
  const auth = inject(Auth);
  const roles = route.data?.['roles'] as Rol[] | undefined;
  return auth.tieneRol(roles) ? true : inject(Router).createUrlTree(['/login']);
};