import { Component, inject, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { catchError, combineLatest, of, switchMap } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';

import { Auth } from '../../../core/auth/auth';
import { Apoderado, ApoderadoFiltro } from '../../../core/models/apoderado.models';
import { TIPOS_DOCUMENTO } from '../../../core/models/enums';
import { ApoderadoApi } from '../../../core/services/apoderado-api';
import { AlertService } from '../../../core/services/alert.service';
import { ApoderadoForm } from '../apoderado-form/apoderado-form';

@Component({
  selector: 'app-apoderado-list',
  standalone: true,
  imports: [
    MatTableModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './apoderado-list.html',
  styleUrl: './apoderado-list.css',
})
export class ApoderadoList {
  private readonly api = inject(ApoderadoApi);
  private readonly dialog = inject(MatDialog);
  private readonly auth = inject(Auth);
  private readonly alert = inject(AlertService);

  readonly tipos = TIPOS_DOCUMENTO;
  readonly columnas = ['documento', 'nombre', 'telefono', 'correo', 'acciones'];

  // Control de permisos según roles (UC-06 / UC-07)
  readonly puedeEditar = this.auth.tieneRol(['ROLE_ADMINISTRADOR']);

  filtro = signal<ApoderadoFiltro>({
    termino: '',
    tipoDocumento: '',
    page: 0,
    size: 10,
  });

  private recarga = signal(0);

  resultado = toSignal(
    combineLatest([toObservable(this.filtro), toObservable(this.recarga)]).pipe(
      switchMap(([f]) =>
        this.api.buscar(f).pipe(
          catchError(() => {
            this.alert.error('No se pudo cargar el directorio de apoderados.');
            return of({ content: [], totalElements: 0 });
          })
        )
      )
    ),
    { initialValue: null }
  );

  cambiar(parcial: Partial<ApoderadoFiltro>): void {
    this.filtro.update((f) => ({ ...f, ...parcial, page: 0 }));
  }

  paginar(e: PageEvent): void {
    this.filtro.update((f) => ({ ...f, page: e.pageIndex, size: e.pageSize }));
  }

  abrirForm(apoderado: Apoderado | null): void {
    this.dialog
      .open(ApoderadoForm, { width: '560px', data: apoderado })
      .afterClosed()
      .subscribe((ok) => {
        if (ok) {
          this.recarga.update((n) => n + 1);
        }
      });
  }

  async eliminar(apoderado: Apoderado): Promise<void> {
    const nombreCompleto = `${apoderado.nombres} ${apoderado.apellidos}`;

    // Confirmación modal con SweetAlert2
    const confirmado = await this.alert.confirmarPeligro(
      `¿Deseas retirar a ${nombreCompleto}?`,
      'El apoderado será eliminado del directorio institucional.',
      'Sí, eliminar'
    );

    if (!confirmado) return;

    this.api.eliminar(apoderado.id).subscribe({
      next: () => {
        this.alert.exito(
          'Apoderado eliminado',
          `${nombreCompleto} fue retirado del directorio correctamente.`
        );
        this.recarga.update((n) => n + 1);
      },
      error: (err) => {
        const errorMsg =
          err?.error?.message ??
          err?.error?.mensaje ??
          err?.message ??
          'No se pudo eliminar al apoderado.';

        this.alert.error(errorMsg, 'Error al eliminar');
      },
    });
  }
}