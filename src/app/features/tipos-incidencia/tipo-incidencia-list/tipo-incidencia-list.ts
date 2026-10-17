import { Component, computed, inject, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { catchError, of, switchMap } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { Auth } from '../../../core/auth/auth';
import { CATEGORIAS_SISEVE } from '../../../core/models/enums';
import { TipoIncidencia } from '../../../core/models/tipo-incidencia.models';
import { TipoIncidenciaApi } from '../../../core/services/tipo-incidencia-api';
import { TipoIncidenciaForm } from '../tipo-incidencia-form/tipo-incidencia-form';

@Component({
  selector: 'app-tipo-incidencia-list',
  imports: [MatTableModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule, MatIconModule],
  templateUrl: './tipo-incidencia-list.html',
  styleUrl: './tipo-incidencia-list.css',
})
export class TipoIncidenciaList {
  private api = inject(TipoIncidenciaApi);
  private dialog = inject(MatDialog);
  private snack = inject(MatSnackBar);

  readonly categorias = CATEGORIAS_SISEVE;
  readonly columnas = ['nombre', 'categoria', 'descripcion', 'estado', 'acciones'];
  // Matriz: solo el Administrador edita; Director y Comité en solo lectura
  readonly puedeEditar = inject(Auth).tieneRol(['ROLE_ADMIN']);

  texto = signal('');
  categoria = signal('');
  private recarga = signal(0);

  datos = toSignal(
    toObservable(this.recarga).pipe(switchMap(() => this.api.listarTodos().pipe(catchError(() => of([] as TipoIncidencia[]))))),
    { initialValue: null },
  );

  filtrados = computed(() => {
    const t = this.texto().toLowerCase(), c = this.categoria();
    return (this.datos() ?? []).filter(x =>
      (!t || x.nombre.toLowerCase().includes(t) || (x.descripcion ?? '').toLowerCase().includes(t)) &&
      (!c || x.categoriaSiseve === c));
  });

  abrirForm(tipo: TipoIncidencia | null) {
    this.dialog.open(TipoIncidenciaForm, { width: '560px', data: tipo })
      .afterClosed().subscribe(ok => ok && this.recarga.update(n => n + 1));
  }

  alternar(t: TipoIncidencia) {
    const req$ = t.activo ? this.api.desactivar(t.id) : this.api.reactivar(t.id);
    req$.subscribe(() => {
      this.snack.open(t.activo ? 'Tipo desactivado' : 'Tipo reactivado', 'Cerrar', { duration: 3000 });
      this.recarga.update(n => n + 1);
    });
  }
}