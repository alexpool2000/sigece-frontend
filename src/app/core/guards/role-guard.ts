import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth } from '../auth/auth';
import { Rol } from '../auth/auth.models';

export const roleGuard: CanActivateFn = (route) => {
  const auth = inject(Auth);
  const router = inject(Router);
  const rolesPermitidos = route.data?.['roles'] as Rol[] | undefined;

  // Si la ruta no exige roles específicos, se permite el acceso
  if (!rolesPermitidos || rolesPermitidos.length === 0) {
    return true;
  }

  // Si cumple el rol requerido, continúa
  if (auth.tieneRol(rolesPermitidos)) {
    return true;
  }

  // Usuario autenticado pero sin privilegios suficientes -> Redirigir a 403
  return router.createUrlTree(['/403']);
};