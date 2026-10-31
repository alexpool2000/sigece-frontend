import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Auth } from '../../core/auth/auth';
import { Rol } from '../../core/auth/auth.models';

interface MenuItem {
  label: string;
  icon: string;
  ruta: string;
  roles?: Rol[];
}

// Roles del sistema
const ROL_ADMIN: Rol[] = ['ROLE_ADMINISTRADOR'];
const TODOS_LOS_ROLES: Rol[] = ['ROLE_ADMINISTRADOR', 'ROLE_TUTOR', 'ROLE_PSICOLOGO'];
const NOTIFICACIONES_ROLES: Rol[] = ['ROLE_ADMINISTRADOR', 'ROLE_TUTOR'];
const REGISTRO_INCIDENCIA: Rol[] = ['ROLE_TUTOR', 'ROLE_PSICOLOGO', 'ROLE_ADMINISTRADOR'];

const MENU: MenuItem[] = [
  { label: 'Incidencias', icon: 'folder_open', ruta: '/incidencias', roles: TODOS_LOS_ROLES },
  { label: 'Nueva incidencia', icon: 'add_circle', ruta: '/incidencias/nueva', roles: ['ROLE_TUTOR', 'ROLE_PSICOLOGO'] },
  { label: 'Estudiantes', icon: 'school', ruta: '/estudiantes', roles: TODOS_LOS_ROLES },
  { label: 'Apoderados', icon: 'family_restroom', ruta: '/apoderados', roles: TODOS_LOS_ROLES },
  { label: 'Notificaciones', icon: 'notifications', ruta: '/notificaciones', roles: NOTIFICACIONES_ROLES },
  { label: 'Derivaciones SíSeVe', icon: 'send', ruta: '/derivaciones', roles: ROL_ADMIN },
  { label: 'Indicadores', icon: 'dashboard', ruta: '/dashboard', roles: ['ROLE_ADMINISTRADOR', 'ROLE_PSICOLOGO'] },
  { label: 'Reportes', icon: 'assessment', ruta: '/reportes', roles: ROL_ADMIN },
  { label: 'Asignación Aulas', icon: 'meeting_room', ruta: '/admin/tutor-aulas', roles: ROL_ADMIN },
  { label: 'Tipos de incidencia', icon: 'category', ruta: '/admin/tipos-incidencia', roles: ROL_ADMIN },
  { label: 'Usuarios y Roles', icon: 'manage_accounts', ruta: '/admin/usuarios', roles: ROL_ADMIN },
];

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatToolbarModule,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
  ],
  template: `
    <mat-toolbar>
      <button mat-icon-button (click)="expandido.set(!expandido())" aria-label="Alternar menú">
        <mat-icon>menu</mat-icon>
      </button>

      <span class="brand-title">SIGECE</span>
      <span class="sub-title d-none d-md-inline">- Convivencia Escolar</span>

      <span class="spacer"></span>

      <!-- Usuario y Rol Único -->
      <button mat-button [matMenuTriggerFor]="menu" class="btn-usuario">
        <mat-icon>account_circle</mat-icon>
        <span class="user-name">{{ nombreUsuario() }}</span>
        <span class="user-role-badge">{{ rolDisplay() }}</span>
      </button>

      <mat-menu #menu="matMenu" class="menu-usuario">
        <div class="user-header">
          <p class="user-full-name">{{ nombreUsuarioCompleto() }}</p>
          <small class="user-role-text">{{ rolDisplay() }}</small>
        </div>
        <button mat-menu-item routerLink="/perfil">
          <mat-icon>badge</mat-icon>
          <span>Mi Perfil</span>
        </button>
        <button mat-menu-item (click)="auth.logout()">
          <mat-icon color="warn">logout</mat-icon>
          <span>Cerrar sesión</span>
        </button>
      </mat-menu>
    </mat-toolbar>

    <mat-sidenav-container autosize>
      <mat-sidenav mode="side" opened [class.mini]="!expandido()">
        <mat-nav-list>
          @for (item of items(); track item.ruta) {
            <a mat-list-item [routerLink]="item.ruta" routerLinkActive="activo" [attr.title]="item.label">
              <mat-icon matListItemIcon>{{ item.icon }}</mat-icon>
              <span matListItemTitle>{{ item.label }}</span>
            </a>
          }
        </mat-nav-list>
      </mat-sidenav>

      <mat-sidenav-content class="contenido">
        <router-outlet />
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: `
    .spacer { flex: 1; }

    mat-toolbar {
      background: linear-gradient(135deg, royalblue, steelblue);
      background-attachment: fixed;
      color: #ffffff;
      height: 64px;
      padding: 0 16px;
      --mat-toolbar-container-text-color: #ffffff;
    }

    mat-toolbar .mat-mdc-button,
    mat-toolbar .mat-mdc-icon-button,
    mat-toolbar .mat-icon {
      color: #ffffff;
    }

    .brand-title {
      font-weight: 700;
      letter-spacing: 1px;
      margin-left: 8px;
    }

    .sub-title {
      font-size: 0.85rem;
      opacity: 0.85;
      margin-left: 6px;
    }

    .btn-usuario {
      display: flex;
      align-items: center;
      gap: 6px;
      color: #ffffff;
    }

    .user-role-badge {
      font-size: 0.72rem;
      background: rgba(255, 255, 255, 0.25);
      padding: 2px 8px;
      border-radius: 12px;
      margin-left: 6px;
      text-transform: capitalize;
    }

    .user-header {
      padding: 12px 16px 8px;
      border-bottom: 1px solid #e0e0e0;
      margin-bottom: 4px;
    }

    .user-full-name {
      margin: 0;
      font-weight: 600;
      font-size: 0.9rem;
      color: #333;
    }

    .user-role-text {
      color: #666;
      font-size: 0.75rem;
    }

    mat-sidenav-container {
      height: calc(100vh - 64px);
    }

    mat-sidenav {
      width: 260px;
      transition: width 0.35s cubic-bezier(0.4, 0, 0.2, 1);
      overflow-x: hidden;
      white-space: nowrap;
      background: linear-gradient(135deg, royalblue, steelblue);
      background-attachment: fixed;
      border-right: none;
      border-radius: 0;
      --mat-sidenav-container-shape: 0;
      --mat-list-list-item-label-text-color: #ffffff;
      --mat-list-list-item-leading-icon-color: #ffffff;
      --mat-list-list-item-hover-label-text-color: #ffffff;
      --mat-list-list-item-hover-leading-icon-color: #ffffff;
      --mat-list-list-item-focus-label-text-color: #ffffff;
      --mat-list-list-item-container-shape: 0;
      --mat-list-list-item-focus-container-shape: 0;
    }

    mat-sidenav.mini { 
      width: 72px; 
    }
    mat-sidenav [matListItemTitle] {
      opacity: 1;
      transition: opacity 0.35s ease-in-out;
    }
    mat-sidenav.mini [matListItemTitle] { 
      opacity: 0;
      pointer-events: none;
    }
    mat-sidenav.mini .mat-mdc-list-item { 
      padding-left: 16px;
      justify-content: center;
    }

    mat-sidenav .mat-mdc-list-item,
    mat-sidenav .mat-mdc-list-item::before {
      border-radius: 0;
    }


    .contenido {
      padding: 24px;
      background-color: #f8fafc;
      min-height: calc(100vh - 64px);
    }

    .activo {
      background: rgba(255, 255, 255, 0.22) !important;
      box-shadow: inset 4px 0 0 #ffffff;
    }
  `,
})
export class MainLayout {
  readonly auth = inject(Auth);
  readonly expandido = signal(true);

  // Extrae el string del rol único resolviendo si viene como objeto { nombre } o como string
  readonly rolActual = computed<Rol | null>(() => {
    const rawRol = (this.auth.usuario() as any)?.rol;
    if (!rawRol) return null;
    return typeof rawRol === 'object' ? rawRol.nombre : rawRol;
  });

  // Filtra los menús comparando el rol único del usuario contra los roles permitidos
  readonly items = computed(() => {
    const miRol = this.rolActual();
    if (!miRol) return [];
    return MENU.filter((item) => !item.roles || item.roles.includes(miRol));
  });

  readonly nombreUsuario = computed(() => {
    return this.auth.usuario()?.nombres?.split(' ')[0] ?? 'Usuario';
  });

  readonly nombreUsuarioCompleto = computed(() => {
    const u = this.auth.usuario();
    return u ? `${u.nombres} ${u.apellidos}` : 'Usuario';
  });

  readonly rolDisplay = computed(() => {
    switch (this.rolActual()) {
      case 'ROLE_ADMINISTRADOR':
        return 'Administrador';
      case 'ROLE_PSICOLOGO':
        return 'Psicólogo';
      case 'ROLE_TUTOR':
        return 'Tutor';
      default:
        return 'Invitado';
    }
  });
}