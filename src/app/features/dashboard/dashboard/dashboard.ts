import { NgTemplateOutlet } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { catchError, of, switchMap } from 'rxjs';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { DashboardFiltro, Indicadores } from '../../../core/models/dashboard.models';
import { NIVELES } from '../../../core/models/enums';
import { DashboardApi } from '../../../core/services/dashboard-api';

const COLOR_GRAVEDAD: Record<string, string> = { LEVE: '#2e7d32', MODERADA: '#f9a825', GRAVE: '#ef6c00', MUY_GRAVE: '#c62828' };
const COLOR_ESTADO: Record<string, string> = {
  REGISTRADO: '#546e7a', EN_INVESTIGACION: '#1565c0', EN_SEGUIMIENTO: '#6a1b9a',
  RESUELTO: '#2e7d32', DERIVADO_SISEVE: '#ad1457', CERRADO: '#37474f',
};

interface Fila { etiqueta: string; valor: number; ancho: number; color: string; }

@Component({
  selector: 'app-dashboard',
  imports: [NgTemplateOutlet, MatCardModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatIconModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {
  private api = inject(DashboardApi);
  readonly niveles = NIVELES;
  readonly hoy = new Date().toISOString().slice(0, 10);

  filtro = signal<DashboardFiltro>({ fechaDesde: `${new Date().getFullYear()}-01-01`, fechaHasta: this.hoy, nivel: '', grado: '' });
  error = signal(false);

  datos = toSignal(
    toObservable(this.filtro).pipe(
      switchMap(f => { this.error.set(false); return this.api.obtener(f).pipe(catchError(() => { this.error.set(true); return of(null as Indicadores | null); })); }),
    ),
    { initialValue: null as Indicadores | null },
  );

  gravedad = computed(() => this.filas(this.datos()?.incidentesPorGravedad, COLOR_GRAVEDAD));
  estado = computed(() => this.filas(this.datos()?.incidentesPorEstado, COLOR_ESTADO));
  tipo = computed(() => this.filas(this.datos()?.incidentesPorTipo));
  mes = computed(() => this.filas(this.datos()?.incidentesPorMes, undefined, true));

  cambiar(parcial: Partial<DashboardFiltro>) { this.filtro.update(f => ({ ...f, ...parcial })); }

  private filas(mapa?: Record<string, number>, colores?: Record<string, string>, ordenarClave = false): Fila[] {
    const entradas = Object.entries(mapa ?? {});
    if (ordenarClave) entradas.sort(([a], [b]) => a.localeCompare(b));
    const max = Math.max(1, ...entradas.map(([, v]) => v));
    return entradas.map(([k, v]) => ({
      etiqueta: k.replaceAll('_', ' '), valor: v, ancho: (v / max) * 100, color: colores?.[k] ?? 'var(--mat-sys-primary)',
    }));
  }
}