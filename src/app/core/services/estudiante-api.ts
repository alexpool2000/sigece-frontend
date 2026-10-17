import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse, Pagina } from '../models/api.models';
import { AsignarApoderadoRequest, VinculoFamiliar } from '../models/apoderado.models';
import { Estudiante, EstudianteFiltro, EstudianteRequest, PerfilEstudiante } from '../models/estudiante.models';


@Injectable({ providedIn: 'root' })
export class EstudianteApi {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/estudiantes`;

  perfil(id: number) { return this.http.get<ApiResponse<PerfilEstudiante>>(`${this.base}/${id}/perfil`).pipe(map(r => r.data)); }
  asignarApoderado(id: number, dto: AsignarApoderadoRequest) {
    return this.http.post<ApiResponse<VinculoFamiliar>>(`${this.base}/${id}/apoderados`, dto).pipe(map(r => r.data));
  }
  desasignarApoderado(id: number, apoderadoId: number) {
    return this.http.delete<ApiResponse<unknown>>(`${this.base}/${id}/apoderados/${apoderadoId}`);
  }

  buscar(f: EstudianteFiltro): Observable<Pagina<Estudiante>> {
    let params = new HttpParams().set('page', f.page).set('size', f.size);
    if (f.termino) params = params.set('termino', f.termino);
    if (f.nivel) params = params.set('nivel', f.nivel);
    if (f.grado) params = params.set('grado', f.grado);
    if (f.seccion) params = params.set('seccion', f.seccion);
    if (f.activo !== '') params = params.set('activo', f.activo);
    return this.http.get<ApiResponse<any>>(`${this.base}/buscar`, { params }).pipe(
      map(r => {
        const lista = Array.isArray(r.data) ? r.data : (r.data?.content ?? []);
        return { content: lista, totalElements: r.meta?.totalElements ?? r.data?.totalElements ?? lista.length };
      }),
    );
  }
  registrar(dto: EstudianteRequest) { return this.http.post<ApiResponse<Estudiante>>(this.base, dto).pipe(map(r => r.data)); }
  actualizar(id: number, dto: EstudianteRequest) { return this.http.put<ApiResponse<Estudiante>>(`${this.base}/${id}`, dto).pipe(map(r => r.data)); }
  desactivar(id: number) { return this.http.patch<ApiResponse<unknown>>(`${this.base}/${id}/desactivar`, {}); }
  reactivar(id: number) { return this.http.patch<ApiResponse<unknown>>(`${this.base}/${id}/reactivar`, {}); }
}