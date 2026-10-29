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
import { ApoderadoForm } from '../apoderado-form/apoderado-form';

@Component({
  selector: 'app-apoderado-list',
  imports: [MatTableModule, MatPaginatorModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule, MatIconModule],
  templateUrl: './apoderado-list.html',
  styleUrl: './apoderado-list.css',
})
export class ApoderadoList {
  private api = inject(ApoderadoApi);
  private dialog = inject(MatDialog);
  private auth = inject(Auth);

  readonly tipos = TIPOS_DOCUMENTO;
  readonly columnas = ['documento', 'nombre', 'telefono', 'correo', 'acciones'];
  // Matriz: Comité solo lectura en UC-05
  readonly puedeEditar = this.auth.tieneRol(['ROLE_ADMINISTRADOR']);

  filtro = signal<ApoderadoFiltro>({ termino: '', tipoDocumento: '', page: 0, size: 10 });
  private recarga = signal(0);

  resultado = toSignal(
    combineLatest([toObservable(this.filtro), toObservable(this.recarga)]).pipe(
      switchMap(([f]) => this.api.buscar(f).pipe(catchError(() => of({ content: [], totalElements: 0 })))),
    ),
    { initialValue: null },
  );

  cambiar(parcial: Partial<ApoderadoFiltro>) { this.filtro.update(f => ({ ...f, ...parcial, page: 0 })); }
  paginar(e: PageEvent) { this.filtro.update(f => ({ ...f, page: e.pageIndex, size: e.pageSize })); }

  abrirForm(apoderado: Apoderado | null) {
    this.dialog.open(ApoderadoForm, { width: '560px', data: apoderado })
      .afterClosed().subscribe(ok => ok && this.recarga.update(n => n + 1));
  }
}