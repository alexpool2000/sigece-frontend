import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';
import { roleGuard } from './core/guards/role-guard';

const page = () => import('./shared/placeholder/placeholder').then(m => m.Placeholder);

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
        path: 'incidencias/nueva', loadComponent: page, canActivate: [roleGuard],
        data: { titulo: 'Registrar incidencia (UC-07)', roles: ['ROLE_DIRECTOR', 'ROLE_TUTOR', 'ROLE_PSICOLOGO'] }
      },
      { path: 'estudiantes', loadComponent: () => import('./features/estudiantes/estudiante-list/estudiante-list').then(m => m.EstudianteList) },
      { path: 'estudiantes/:id', loadComponent: () => import('./features/estudiantes/estudiante-perfil/estudiante-perfil').then(m => m.EstudiantePerfil) },
      { path: 'apoderados', loadComponent: () => import('./features/apoderados/apoderado-list/apoderado-list').then(m => m.ApoderadoList) },
      { path: 'alertas', loadComponent: page, data: { titulo: 'Alertas (UC-18)' } },
      {
        path: 'dashboard', loadComponent: page, canActivate: [roleGuard],
        data: { titulo: 'Dashboard (UC-19)', roles: ['ROLE_DIRECTOR', 'ROLE_COMITE_BIENESTAR'] }
      },
      {
        path: 'reportes', loadComponent: page, canActivate: [roleGuard],
        data: { titulo: 'Reportes (UC-20)', roles: ['ROLE_DIRECTOR', 'ROLE_COMITE_BIENESTAR'] }
      },
      {
        path: 'admin/usuarios', loadComponent: page, canActivate: [roleGuard],
        data: { titulo: 'Usuarios y roles (UC-03)', roles: ['ROLE_ADMIN'] }
      },
      {
        path: 'admin/tipos-incidencia', canActivate: [roleGuard],
        loadComponent: () => import('./features/tipos-incidencia/tipo-incidencia-list/tipo-incidencia-list').then(m => m.TipoIncidenciaList),
        data: { titulo: 'Tipos de incidencia (UC-06)', roles: ['ROLE_ADMIN', 'ROLE_DIRECTOR', 'ROLE_COMITE_BIENESTAR'] }
      },
      { path: '403', loadComponent: page, data: { titulo: 'Acceso denegado' } },
    ],
  },
  { path: '**', redirectTo: '' },
];