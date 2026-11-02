import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api.models';
import {
  AccionEstadoRequestDto,
  AccionFiltroRequestDto,
  AccionRevisionRequestDto,
  AccionSeguimientoRequestDto,
  AccionSeguimientoResponseDto,
} from '../models/accion.models';

@Injectable({
  providedIn: 'root',
})
export class AccionSeguimientoApi {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/acciones-seguimiento`;

  // GET /api/v1/acciones-seguimiento/incidente/{incidenteId}
  listarPorIncidente(
    incidenteId: string,
  ): Observable<AccionSeguimientoResponseDto[]> {
    return this.http
      .get<ApiResponse<AccionSeguimientoResponseDto[]>>(
        `${this.baseUrl}/incidente/${incidenteId}`,
      )
      .pipe(map((response) => response.data));
  }

  // POST /api/v1/acciones-seguimiento/incidente/{incidenteId}
  registrar(
    incidenteId: string,
    request: AccionSeguimientoRequestDto,
  ): Observable<AccionSeguimientoResponseDto> {
    return this.http
      .post<ApiResponse<AccionSeguimientoResponseDto>>(
        `${this.baseUrl}/incidente/${incidenteId}`,
        request,
      )
      .pipe(map((response) => response.data));
  }

  // GET /api/v1/acciones-seguimiento/{accionId}
  obtenerPorId(
    accionId: number,
  ): Observable<AccionSeguimientoResponseDto> {
    return this.http
      .get<ApiResponse<AccionSeguimientoResponseDto>>(
        `${this.baseUrl}/${accionId}`,
      )
      .pipe(map((response) => response.data));
  }

  // PATCH /api/v1/acciones-seguimiento/{accionId}/estado
  actualizarEstado(
    accionId: number,
    request: AccionEstadoRequestDto,
  ): Observable<AccionSeguimientoResponseDto> {
    return this.http
      .patch<ApiResponse<AccionSeguimientoResponseDto>>(
        `${this.baseUrl}/${accionId}/estado`,
        request,
      )
      .pipe(map((response) => response.data));
  }

  // PATCH /api/v1/acciones-seguimiento/{accionId}/revision
  reprogramarRevision(
    accionId: number,
    request: AccionRevisionRequestDto,
  ): Observable<AccionSeguimientoResponseDto> {
    return this.http
      .patch<ApiResponse<AccionSeguimientoResponseDto>>(
        `${this.baseUrl}/${accionId}/revision`,
        request,
      )
      .pipe(map((response) => response.data));
  }

  // GET /api/v1/acciones-seguimiento/usuario/{usuarioId}/pendientes
  listarPendientesPorUsuario(
    usuarioId: number,
  ): Observable<AccionSeguimientoResponseDto[]> {
    return this.http
      .get<ApiResponse<AccionSeguimientoResponseDto[]>>(
        `${this.baseUrl}/usuario/${usuarioId}/pendientes`,
      )
      .pipe(map((response) => response.data));
  }

  // GET /api/v1/acciones-seguimiento/vencidas
  listarVencidas(): Observable<AccionSeguimientoResponseDto[]> {
    return this.http
      .get<ApiResponse<AccionSeguimientoResponseDto[]>>(
        `${this.baseUrl}/vencidas`,
      )
      .pipe(map((response) => response.data));
  }

  // GET /api/v1/acciones-seguimiento/buscar
  buscarPorTipo(
    filtro: AccionFiltroRequestDto,
  ): Observable<AccionSeguimientoResponseDto[]> {
    let params = new HttpParams();

    if (filtro.tipoAccion) params = params.set('tipoAccion', filtro.tipoAccion);
    if (filtro.estadoAccion) params = params.set('estadoAccion', filtro.estadoAccion);
    if (filtro.fechaDesde) params = params.set('fechaDesde', filtro.fechaDesde);
    if (filtro.fechaHasta) params = params.set('fechaHasta', filtro.fechaHasta);

    return this.http
      .get<ApiResponse<AccionSeguimientoResponseDto[]>>(
        `${this.baseUrl}/buscar`,
        { params },
      )
      .pipe(map((response) => response.data));
  }
}