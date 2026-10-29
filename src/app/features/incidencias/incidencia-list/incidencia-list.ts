import { DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { debounceTime, switchMap, tap } from 'rxjs';
import { ESTADOS, GRAVEDADES } from '../../../core/models/enums';
import { IncidenteFiltro } from '../../../core/models/incidente.models';
import { IncidenteApi } from '../../../core/services/incidente-api';
import { EstadoChip } from '../../../shared/estado-chip/estado-chip';
import { GravedadChip } from '../../../shared/gravedad-chip/gravedad-chip';
import { Auth } from '../../../core/auth/auth';

@Component({
  selector: 'app-incidencia-list',
  imports: [
    DatePipe, RouterLink, MatTableModule, MatPaginatorModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatIconModule, MatButtonModule, GravedadChip, EstadoChip,
  ],
  templateUrl: './incidencia-list.html',
  styleUrl: './incidencia-list.css',
})
export class IncidenciaList {
  private api = inject(IncidenteApi);
  private router = inject(Router);
  private auth = inject(Auth);

  readonly gravedades = GRAVEDADES;
  readonly estados = ESTADOS;
  readonly columnas = ['codigo', 'fecha', 'estudiantes', 'tipo', 'gravedad', 'estado', 'responsable', 'alertas', 'acciones'];
  readonly puedeEditar = this.auth.tieneRol(['ROLE_TUTOR', 'ROLE_PSICOLOGO']);

  filtro = signal<IncidenteFiltro>({ texto: '', gravedad: '', estado: '', pagina: 0, tamano: 10 });
  resultado = toSignal(
    toObservable(this.filtro).pipe(
      debounceTime(300),
      switchMap(f => this.api.listar(f)),
      tap(r => console.log('Resultado del listado:', r)),
    ),
    { initialValue: null },
  );

  cambiar(parcial: Partial<IncidenteFiltro>) {
    this.filtro.update(f => ({ ...f, ...parcial, pagina: 0 }));
  }
  paginar(e: PageEvent) {
    this.filtro.update(f => ({ ...f, pagina: e.pageIndex, tamano: e.pageSize }));
  }
  abrir(id: string) { this.router.navigate(['/incidencias', id]); }
}