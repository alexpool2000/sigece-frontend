import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse, Pagina } from '../models/api.models';
import {
  Apoderado,
  ApoderadoFiltro,
  ApoderadoRequest,
  VinculoFamiliar,
} from '../models/apoderado.models';

@Injectable({ providedIn: 'root' })
export class ApoderadoApi {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/apoderados`;

  /**
   * POST /api/v1/apoderados
   * Registra un nuevo apoderado institucional.
   */
  registrar(dto: ApoderadoRequest): Observable<Apoderado> {
    return this.http
      .post<ApiResponse<Apoderado>>(this.base, dto)
      .pipe(map((r) => r.data));
  }

  /**
   * PATCH /api/v1/apoderados/{apoderadoId}/contacto
   * Actualiza el teléfono y correo electrónico del apoderado.
   */
  actualizarContacto(id: number, dto: ApoderadoRequest): Observable<Apoderado> {
    return this.http
      .patch<ApiResponse<Apoderado>>(`${this.base}/${id}/contacto`, dto)
      .pipe(map((r) => r.data));
  }

  /**
   * GET /api/v1/apoderados/{apoderadoId}
   * Recupera los datos de un apoderado mediante su ID único.
   */
  obtenerPorId(apoderadoId: number): Observable<Apoderado> {
    return this.http
      .get<ApiResponse<Apoderado>>(`${this.base}/${apoderadoId}`)
      .pipe(map((r) => r.data));
  }

  /**
   * GET /api/v1/apoderados/documento/{numeroDocumento}
   * Consulta al apoderado mediante su DNI o carné de extranjería.
   */
  obtenerPorNumeroDocumento(numeroDocumento: string): Observable<Apoderado> {
    return this.http
      .get<ApiResponse<Apoderado>>(`${this.base}/documento/${numeroDocumento}`)
      .pipe(map((r) => r.data));
  }

  /**
   * GET /api/v1/apoderados/estudiante/{estudianteId}
   * Obtiene la lista de apoderados vinculados a un estudiante en particular.
   */
  listarPorEstudiante(estudianteId: number): Observable<Apoderado[]> {
    return this.http
      .get<ApiResponse<Apoderado[]>>(`${this.base}/estudiante/${estudianteId}`)
      .pipe(map((r) => r.data));
  }

  /**
   * GET /api/v1/apoderados/{apoderadoId}/vinculos
   * Obtiene la lista de estudiantes vinculados a un apoderado con su parentesco.
   */
  listarVinculosPorApoderado(apoderadoId: number): Observable<VinculoFamiliar[]> {
    return this.http
      .get<ApiResponse<VinculoFamiliar[]>>(`${this.base}/${apoderadoId}/vinculos`)
      .pipe(map((r) => r.data));
  }

  /**
   * GET /api/v1/apoderados/buscar
   * Búsqueda paginada con filtros dinámicos (término de búsqueda, tipo documento, etc.).
   */
  buscar(f: ApoderadoFiltro): Observable<Pagina<Apoderado>> {
    let params = new HttpParams().set('page', f.page).set('size', f.size);
    if (f.termino) params = params.set('termino', f.termino.trim());
    if (f.tipoDocumento) params = params.set('tipoDocumento', f.tipoDocumento);

    return this.http.get<ApiResponse<any>>(`${this.base}/buscar`, { params }).pipe(
      map((r) => {
        const lista = Array.isArray(r.data) ? r.data : (r.data?.content ?? []);
        return {
          content: lista,
          totalElements: r.meta?.totalElements ?? r.data?.totalElements ?? lista.length,
        };
      })
    );
  }

  /**
   * PATCH /api/v1/apoderados/{apoderadoId}/estudiantes/{estudianteId}/principal
   * Establece a este apoderado como el contacto principal para el estudiante.
   */
  marcarPrincipal(apoderadoId: number, estudianteId: number): Observable<void> {
    return this.http
      .patch<ApiResponse<void>>(
        `${this.base}/${apoderadoId}/estudiantes/${estudianteId}/principal`,
        {}
      )
      .pipe(map(() => void 0));
  }

  /**
   * DELETE /api/v1/apoderados/{apoderadoId}
   * Realiza la eliminación lógica del apoderado (retorna 204 No Content).
   */
  eliminar(apoderadoId: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${apoderadoId}`);
  }
}