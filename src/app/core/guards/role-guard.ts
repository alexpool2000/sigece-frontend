import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { Auth } from '../auth/auth';

export const roleGuard: CanActivateFn = (route) =>
  inject(Auth).tieneRol(route.data['roles']) || inject(Router).createUrlTree(['/403']);