import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';
import { roleGuard } from './core/guards/role-guard';

const page = () => import('./shared/placeholder/placeholder').then(m => m.Placeholder);
const ADM = ['ROLE_ADMINISTRADOR'];

export const routes: Routes = [
  { path: 'login', loadComponent: () => import('./features/auth/login/login').then(m => m.Login) },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./layout/main-layout/main-layout').then(m => m.MainLayout),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'incidencias' },
      { path: 'incidencias', loadComponent: () => import('./features/incidencias/incidencia-list/incidencia-list').then(m => m.IncidenciaList) },
      {
        path: 'incidencias/nueva', canActivate: [roleGuard],
        loadComponent: () => import('./features/incidencias/incidencia-form/incidencia-form').then(m => m.IncidenciaForm),
        data: { titulo: 'Registrar incidencia', roles: ['ROLE_TUTOR', 'ROLE_PSICOLOGO'] },
      },
      {
        path: 'incidencias/:id',
        loadComponent: () => import('./features/incidencias/incidencia-detalle/incidencia-detalle').then(m => m.IncidenciaDetalle),
      },
      {
        path: 'estudiantes', canActivate: [roleGuard],
        loadComponent: () => import('./features/estudiantes/estudiante-list/estudiante-list').then(m => m.EstudianteList),
        data: { roles: ['ROLE_ADMINISTRADOR', 'ROLE_TUTOR'] }
      },
      {
        path: 'estudiantes/:id', canActivate: [roleGuard],
        loadComponent: () => import('./features/estudiantes/estudiante-perfil/estudiante-perfil').then(m => m.EstudiantePerfil),
        data: { roles: ['ROLE_ADMINISTRADOR', 'ROLE_TUTOR'] }
      },
      {
        path: 'apoderados', canActivate: [roleGuard],
        loadComponent: () => import('./features/apoderados/apoderado-list/apoderado-list').then(m => m.ApoderadoList),
        data: { roles: ['ROLE_ADMINISTRADOR', 'ROLE_TUTOR'] }
      },
      {
        path: 'notificaciones', loadComponent: page, canActivate: [roleGuard],
        data: { titulo: 'Notificaciones (ECUS18)', roles: ['ROLE_ADMINISTRADOR', 'ROLE_TUTOR'] }
      },
      {
        path: 'derivaciones', loadComponent: page, canActivate: [roleGuard],
        data: { titulo: 'Derivaciones a SíSeVe (ECUS21)', roles: ADM }
      },
      {
        path: 'dashboard', canActivate: [roleGuard],
        loadComponent: () => import('./features/dashboard/dashboard/dashboard').then(m => m.Dashboard),
        data: { titulo: 'Dashboard', roles: ADM }
      },
      {
        path: 'reportes', loadComponent: page, canActivate: [roleGuard],
        data: { titulo: 'Reportes e indicadores (ECUS22)', roles: ADM }
      },
      {
        path: 'admin/usuarios',
        loadComponent: () => import('./features/usuarios/usuario-list/usuario-list').then(m => m.UsuarioList),
        canActivate: [roleGuard],
        data: { titulo: 'Usuarios y roles (ECUS01)', roles: ADM }
      },
      {
        path: 'admin/tipos-incidencia', canActivate: [roleGuard],
        loadComponent: () => import('./features/tipos-incidencia/tipo-incidencia-list/tipo-incidencia-list').then(m => m.TipoIncidenciaList),
        data: { titulo: 'Tipos de incidencia', roles: ADM }
      },
      { path: '403', loadComponent: page, data: { titulo: 'Acceso denegado' } },
    ],
  },
  { path: '**', redirectTo: '' },
];