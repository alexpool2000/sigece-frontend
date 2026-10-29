import { RouterLink } from '@angular/router';
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
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { Auth } from '../../../core/auth/auth';
import { NIVELES } from '../../../core/models/enums';
import { Estudiante, EstudianteFiltro } from '../../../core/models/estudiante.models';
import { EstudianteApi } from '../../../core/services/estudiante-api';
import { EstudianteForm } from '../estudiante-form/estudiante-form';

@Component({
  selector: 'app-estudiante-list',
  imports: [MatTableModule, MatPaginatorModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule, MatIconModule, RouterLink],
  templateUrl: './estudiante-list.html',
  styleUrl: './estudiante-list.css',
})
export class EstudianteList {
  private api = inject(EstudianteApi);
  private dialog = inject(MatDialog);
  private snack = inject(MatSnackBar);
  private auth = inject(Auth);

  readonly niveles = NIVELES;
  readonly columnas = ['codigo', 'nombre', 'nivel', 'estado', 'acciones'];
  // Matriz: Comité solo lectura en UC-04
  readonly puedeEditar = this.auth.tieneRol(['ROLE_ADMINISTRADOR']);
  readonly soloSusAulas = this.auth.tieneRol(['ROLE_TUTOR']);

  filtro = signal<EstudianteFiltro>({ termino: '', nivel: '', grado: '', seccion: '', activo: true, page: 0, size: 10 });
  private recarga = signal(0);

  resultado = toSignal(
    combineLatest([toObservable(this.filtro), toObservable(this.recarga)]).pipe(
      switchMap(([f]) => this.api.buscar(f).pipe(catchError(() => of({ content: [], totalElements: 0 })))),
    ),
    { initialValue: null },
  );

  cambiar(parcial: Partial<EstudianteFiltro>) { this.filtro.update(f => ({ ...f, ...parcial, page: 0 })); }
  paginar(e: PageEvent) { this.filtro.update(f => ({ ...f, page: e.pageIndex, size: e.pageSize })); }

  abrirForm(est: Estudiante | null) {
    this.dialog.open(EstudianteForm, { width: '560px', data: est })
      .afterClosed().subscribe(ok => ok && this.recarga.update(n => n + 1));
  }

  alternar(e: Estudiante) {
    const accion = e.activo ? 'desactivar' : 'reactivar';
    if (!confirm(`¿Desea ${accion} a ${e.nombres} ${e.apellidos}?`)) return;
    const req$ = e.activo ? this.api.desactivar(e.id) : this.api.reactivar(e.id);
    req$.subscribe(() => {
      this.snack.open(e.activo ? 'Estudiante desactivado' : 'Estudiante reactivado', 'Cerrar', { duration: 3000 });
      this.recarga.update(n => n + 1);
    });
  }
}