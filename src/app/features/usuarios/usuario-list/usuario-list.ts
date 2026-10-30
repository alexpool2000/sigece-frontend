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
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Auth } from '../../../core/auth/auth';
import { UsuarioApi } from '../../../core/services/usuario-api';
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
    MatSnackBarModule,
    MatTooltipModule,
  ],
  templateUrl: './usuario-list.html',
  styleUrl: './usuario-list.css',
})
export class UsuarioList {
  private readonly api = inject(UsuarioApi);
  private readonly dialog = inject(MatDialog);
  private readonly auth = inject(Auth);
  private readonly snack = inject(MatSnackBar);

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
          catchError(() => of({ content: [], totalElements: 0 }))
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

  restablecerPassword(usuario: UsuarioMantenimientoResponseDto): void {
    if (!confirm(`¿Restablecer la contraseña de ${usuario.nombres} al formato predeterminado Minedu@{DNI}?`)) {
      return;
    }

    this.api.restablecerPassword(usuario.id).subscribe({
      next: () => this.snack.open('Contraseña restablecida correctamente', 'Cerrar', { duration: 3000 }),
      error: () => this.snack.open('Error al restablecer contraseña', 'Cerrar', { duration: 3000 }),
    });
  }

  toggleEstado(usuario: UsuarioMantenimientoResponseDto): void {
    const accion$ = usuario.activo
      ? this.api.desactivarUsuario(usuario.id)
      : this.api.reactivarUsuario(usuario.id);

    accion$.subscribe({
      next: () => {
        this.snack.open(`Usuario ${usuario.activo ? 'desactivado' : 'reactivado'}`, 'Cerrar', { duration: 2500 });
        this.recarga.update((n) => n + 1);
      },
      error: () => this.snack.open('Error al cambiar estado del usuario', 'Cerrar', { duration: 3000 }),
    });
  }
}