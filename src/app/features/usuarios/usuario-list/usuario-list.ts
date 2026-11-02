import { Component, inject, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { catchError, combineLatest, map, of, switchMap } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';

import { Auth } from '../../../core/auth/auth';
import { UsuarioApi } from '../../../core/services/usuario-api';
import { AlertService } from '../../../core/services/alert.service';
import {
  RolResponseDto,
  UsuarioFiltroRequestDto,
  UsuarioMantenimientoResponseDto,
} from '../../../core/models/usuario.models';
import { UsuarioForm } from '../usuario-form/usuario-form';

@Component({
  selector: 'app-usuario-list',
  standalone: true,
  imports: [
    MatTableModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
  ],
  templateUrl: './usuario-list.html',
  styleUrl: './usuario-list.css',
})
export class UsuarioList {
  private readonly api = inject(UsuarioApi);
  private readonly dialog = inject(MatDialog);
  private readonly auth = inject(Auth);
  private readonly alert = inject(AlertService);

  readonly columnas = ['usuario', 'dni', 'rol', 'contacto', 'estado', 'acciones'];
  readonly puedeEditar = this.auth.tieneRol(['ROLE_ADMINISTRADOR']);

  // Catálogo de roles para el filtro superior
  readonly roles = toSignal(
    this.api.listarRoles().pipe(
      map((res) => res.data),
      catchError(() => of([] as RolResponseDto[]))
    ),
    { initialValue: [] }
  );

  filtro = signal<UsuarioFiltroRequestDto>({
    termino: '',
    roleId: undefined,
    activo: undefined,
    page: 0,
    size: 10,
  });

  private readonly recarga = signal(0);

  // Pipeline reactivo de búsqueda y paginación
  resultado = toSignal(
    combineLatest([toObservable(this.filtro), toObservable(this.recarga)]).pipe(
      switchMap(([f]) =>
        this.api.buscar(f).pipe(
          map((res) => ({
            content: res.data ?? [],
            totalElements: res.meta?.totalElements ?? res.data?.length ?? 0,
          })),
          catchError(() => {
            this.alert.error('No se pudo cargar la lista de usuarios institucionales.');
            return of({ content: [], totalElements: 0 });
          })
        )
      )
    ),
    { initialValue: null }
  );

  cambiar(parcial: Partial<UsuarioFiltroRequestDto>): void {
    this.filtro.update((f) => ({ ...f, ...parcial, page: 0 }));
  }

  paginar(e: PageEvent): void {
    this.filtro.update((f) => ({ ...f, page: e.pageIndex, size: e.pageSize }));
  }

  abrirForm(usuario: UsuarioMantenimientoResponseDto | null): void {
    this.dialog
      .open(UsuarioForm, { width: '620px', data: usuario })
      .afterClosed()
      .subscribe((ok) => ok && this.recarga.update((n) => n + 1));
  }

  async restablecerPassword(usuario: UsuarioMantenimientoResponseDto): Promise<void> {
    const nombreCompleto = `${usuario.nombres} ${usuario.apellidos}`;

    // Confirmación modal con AlertService
    const confirmado = await this.alert.confirmar(
      '¿Restablecer contraseña?',
      `La contraseña de ${nombreCompleto} volverá al formato por defecto: Minedu@${usuario.dni}`,
      'Sí, restablecer'
    );

    if (!confirmado) return;

    this.api.restablecerPassword(usuario.id).subscribe({
      next: () => {
        this.alert.exito(
          'Contraseña restablecida',
          `La contraseña para @${usuario.username} se restableció con éxito.`
        );
      },
      error: (err) => {
        const mensaje =
          err?.error?.message ??
          err?.error?.mensaje ??
          err?.message ??
          'Ocurrió un error al restablecer la contraseña.';
        this.alert.error(mensaje, 'Error');
      },
    });
  }

  async toggleEstado(usuario: UsuarioMantenimientoResponseDto): Promise<void> {
    const nombreCompleto = `${usuario.nombres} ${usuario.apellidos}`;
    const accion = usuario.activo ? 'desactivar' : 'reactivar';

    // Si está activo, advertir que perderá el acceso de inmediato
    const confirmado = usuario.activo
      ? await this.alert.confirmarPeligro(
          `¿Desactivar a ${nombreCompleto}?`,
          'El usuario perderá el acceso al sistema inmediatamente.',
          'Sí, desactivar'
        )
      : await this.alert.confirmar(
          `¿Reactivar a ${nombreCompleto}?`,
          'El usuario podrá volver a iniciar sesión con sus credenciales.',
          'Sí, reactivar'
        );

    if (!confirmado) return;

    const accion$ = usuario.activo
      ? this.api.desactivarUsuario(usuario.id)
      : this.api.reactivarUsuario(usuario.id);

    accion$.subscribe({
      next: () => {
        this.alert.exito(
          usuario.activo ? 'Usuario desactivado' : 'Usuario reactivado',
          `${nombreCompleto} fue ${usuario.activo ? 'desactivado' : 'reactivado'} correctamente.`
        );
        this.recarga.update((n) => n + 1);
      },
      error: (err) => {
        const mensaje =
          err?.error?.message ??
          err?.error?.mensaje ??
          err?.message ??
          `No se pudo ${accion} al usuario.`;
        this.alert.error(mensaje, 'Error al cambiar estado');
      },
    });
  }
}