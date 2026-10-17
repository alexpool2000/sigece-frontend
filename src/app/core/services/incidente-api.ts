import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, delay, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ESTADOS, GRAVEDADES } from '../models/enums';
import { IncidenteFiltro, IncidenteResumen, Pagina } from '../models/incidente.models';

const TIPOS = ['Agresión física', 'Acoso verbal', 'Ciberacoso', 'Discriminación', 'Daño a propiedad'];
const NOMBRES = ['Luis Ramos', 'Ana Torres', 'Carlos Díaz', 'María Quispe', 'José Flores', 'Lucía Vega'];

const MOCK: IncidenteResumen[] = Array.from({ length: 23 }, (_, i) => ({
  id: String(i + 1),
  codigoCaso: `INC-2026-${String(i + 1).padStart(6, '0')}`,
  fechaOcurrencia: new Date(2026, 8, 1 + (i % 28), 9 + (i % 6), 0).toISOString(),
  estudiantes: [NOMBRES[i % 6], ...(i % 4 === 0 ? [NOMBRES[(i + 2) % 6]] : [])],
  tipo: TIPOS[i % 5],
  gravedad: GRAVEDADES[i % 4],
  estado: ESTADOS[i % 6],
  responsable: i % 5 === 0 ? null : 'Psic. ' + NOMBRES[(i + 1) % 6],
  reincidencia: i % 7 === 0,
}));

@Injectable({ providedIn: 'root' })
export class IncidenteApi {
  private http = inject(HttpClient);

  listar(f: IncidenteFiltro): Observable<Pagina<IncidenteResumen>> {
    if (!environment.mock.incidentes) {
      let params = new HttpParams().set('page', f.pagina).set('size', f.tamano);
      if (f.texto) params = params.set('q', f.texto);
      if (f.gravedad) params = params.set('gravedad', f.gravedad);
      if (f.estado) params = params.set('estado', f.estado);
      return this.http.get<Pagina<IncidenteResumen>>(`${environment.apiUrl}/incidentes`, { params });
    }
    const t = f.texto.toLowerCase();
    const filtrados = MOCK.filter(i =>
      (!t || i.codigoCaso.toLowerCase().includes(t) || i.estudiantes.join(' ').toLowerCase().includes(t)) &&
      (!f.gravedad || i.gravedad === f.gravedad) && (!f.estado || i.estado === f.estado));
    const ini = f.pagina * f.tamano;
    return of({ content: filtrados.slice(ini, ini + f.tamano), totalElements: filtrados.length }).pipe(delay(300));
  }
}