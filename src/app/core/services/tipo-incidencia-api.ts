import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api.models';
import { TipoIncidencia, TipoIncidenciaRequest } from '../models/tipo-incidencia.models';

@Injectable({ providedIn: 'root' })
export class TipoIncidenciaApi {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/tipos-incidencia`;

  listarTodos() { return this.http.get<ApiResponse<TipoIncidencia[]>>(this.base).pipe(map(r => r.data ?? [])); }
  // Para el formulario de registrar incidencia (solo los activos)
  listarActivos() { return this.http.get<ApiResponse<TipoIncidencia[]>>(`${this.base}/activos`).pipe(map(r => r.data ?? [])); }
  crear(dto: TipoIncidenciaRequest) { return this.http.post<ApiResponse<TipoIncidencia>>(this.base, dto).pipe(map(r => r.data)); }
  actualizar(id: number, dto: TipoIncidenciaRequest) { return this.http.put<ApiResponse<TipoIncidencia>>(`${this.base}/${id}`, dto).pipe(map(r => r.data)); }
  desactivar(id: number) { return this.http.patch<ApiResponse<unknown>>(`${this.base}/${id}/desactivar`, {}); }
  reactivar(id: number) { return this.http.patch<ApiResponse<unknown>>(`${this.base}/${id}/reactivar`, {}); }
}