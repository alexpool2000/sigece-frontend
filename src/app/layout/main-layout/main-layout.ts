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

interface Item { label: string; icon: string; ruta: string; roles?: Rol[]; }

const ADM: Rol[] = ['ROLE_ADMINISTRADOR'];
const ADM_TUTOR: Rol[] = ['ROLE_ADMINISTRADOR', 'ROLE_TUTOR'];

const MENU: Item[] = [
  { label: 'Incidencias', icon: 'folder_open', ruta: '/incidencias' },
  { label: 'Nueva incidencia', icon: 'add_circle', ruta: '/incidencias/nueva', roles: ['ROLE_TUTOR', 'ROLE_PSICOLOGO'] },
  { label: 'Estudiantes', icon: 'school', ruta: '/estudiantes', roles: ADM_TUTOR },
  { label: 'Apoderados', icon: 'family_restroom', ruta: '/apoderados', roles: ADM_TUTOR },
  { label: 'Notificaciones', icon: 'notifications', ruta: '/notificaciones', roles: ADM_TUTOR },
  { label: 'Derivaciones SíSeVe', icon: 'send', ruta: '/derivaciones', roles: ADM },
  { label: 'Indicadores', icon: 'dashboard', ruta: '/dashboard', roles: ADM },
  { label: 'Reportes', icon: 'assessment', ruta: '/reportes', roles: ADM },
  { label: 'Tipos de incidencia', icon: 'category', ruta: '/admin/tipos-incidencia', roles: ADM },
  { label: 'Usuarios', icon: 'manage_accounts', ruta: '/admin/usuarios', roles: ADM },
];

@Component({
  selector: 'app-main-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, MatToolbarModule, MatSidenavModule, MatListModule, MatIconModule, MatButtonModule, MatMenuModule],
  template: `
    <mat-toolbar>
      <button mat-icon-button (click)="expandido.set(!expandido())"><mat-icon>menu</mat-icon></button>
      <span>SIGECE</span>
      <span class="spacer"></span>
      <button mat-button [matMenuTriggerFor]="menu">
        <mat-icon>account_circle</mat-icon> {{ auth.usuario()?.nombres }}
      </button>
      <mat-menu #menu="matMenu" class="menu-usuario">
        <button mat-menu-item (click)="auth.logout()"><mat-icon>logout</mat-icon> Cerrar sesión</button>
      </mat-menu>
    </mat-toolbar>
    <mat-sidenav-container autosize>
      <mat-sidenav mode="side" opened [class.mini]="!expandido()">
        <mat-nav-list>
          @for (i of items(); track i.ruta) {
            <a mat-list-item [routerLink]="i.ruta" routerLinkActive="activo" [attr.title]="i.label">
              <mat-icon matListItemIcon>{{ i.icon }}</mat-icon>
              <span matListItemTitle>{{ i.label }}</span>
            </a>
          }
        </mat-nav-list>
      </mat-sidenav>
      <mat-sidenav-content class="contenido"><router-outlet /></mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: `
    .spacer { flex: 1; }

    mat-toolbar {
      background: linear-gradient(135deg, royalblue, steelblue);
      background-attachment: fixed;
      color: #ffffff;
      --mat-toolbar-container-text-color: #ffffff;
    }

    mat-toolbar .mat-mdc-button,
    mat-toolbar .mat-mdc-icon-button,
    mat-toolbar .mat-icon {
      color: #ffffff;
    }

    mat-sidenav-container { height: calc(100vh - 64px); }

    mat-sidenav {
      width: 260px;
      transition: width 0.2s ease;
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

    /* Modo colapsado: solo íconos */
    mat-sidenav.mini { width: 64px; }
    mat-sidenav.mini [matListItemTitle] { display: none; }
    mat-sidenav.mini .mat-mdc-list-item { padding-left: 5px; }

    mat-sidenav .mat-mdc-list-item,
    mat-sidenav .mat-mdc-list-item::before {
      border-radius: 0;
    }

    .contenido { padding: 24px; }

    .activo {
      background: rgba(255, 255, 255, 0.2);
      box-shadow: inset 4px 0 0 #ffffff;
    }
  `,
})
export class MainLayout {
  auth = inject(Auth);
  items = computed(() => MENU.filter(i => this.auth.tieneRol(i.roles)));
  expandido = signal(true); // false = solo íconos, true = íconos con texto
}