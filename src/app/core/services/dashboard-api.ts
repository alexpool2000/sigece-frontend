import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api.models';
import { DashboardFiltro, Indicadores } from '../models/dashboard.models';

@Injectable({ providedIn: 'root' })
export class DashboardApi {
  private http = inject(HttpClient);

  obtener(f: DashboardFiltro) {
    let params = new HttpParams();
    if (f.fechaDesde) params = params.set('fechaDesde', f.fechaDesde);
    if (f.fechaHasta) params = params.set('fechaHasta', f.fechaHasta);
    if (f.nivel) params = params.set('nivel', f.nivel);
    if (f.grado) params = params.set('grado', f.grado);
    return this.http.get<ApiResponse<Indicadores>>(`${environment.apiUrl}/dashboard/indicadores`, { params })
      .pipe(map(r => r.data));
  }
}