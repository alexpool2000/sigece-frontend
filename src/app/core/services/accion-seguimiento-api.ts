import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import {
    AccionSeguimiento,
    EstadoAccion,
    TipoAccion,
} from '../models/incidente.models';

interface ApiResponse<T> {
    data: T;
    message?: string;
}

export interface AccionSeguimientoRequest {
    tipoAccion: TipoAccion;
    descripcion: string;
    fechaAccion?: string | null;
    fechaProgramada?: string | null;
    fechaProximaRevision?: string | null;
}

export interface AccionEstadoRequest {
    nuevoEstado: EstadoAccion;
    comentarioEjecucion?: string | null;
}

export interface AccionRevisionRequest {
    nuevaFechaRevision: string;
    justificacion: string;
}

@Injectable({
    providedIn: 'root',
})
export class AccionSeguimientoApi {
    private readonly http = inject(HttpClient);

    private readonly baseUrl =
        `${environment.apiUrl}/acciones-seguimiento`;

    listarPorIncidente(
        incidenteId: string,
    ): Observable<AccionSeguimiento[]> {
        return this.http
            .get<ApiResponse<AccionSeguimiento[]>>(
                `${this.baseUrl}/incidente/${incidenteId}`,
            )
            .pipe(map((response) => response.data));
    }

    registrar(
        incidenteId: string,
        request: AccionSeguimientoRequest,
    ): Observable<AccionSeguimiento> {
        return this.http
            .post<ApiResponse<AccionSeguimiento>>(
                `${this.baseUrl}/incidente/${incidenteId}`,
                request,
            )
            .pipe(map((response) => response.data));
    }

    obtenerPorId(
        accionId: number,
    ): Observable<AccionSeguimiento> {
        return this.http
            .get<ApiResponse<AccionSeguimiento>>(
                `${this.baseUrl}/${accionId}`,
            )
            .pipe(map((response) => response.data));
    }

    actualizarEstado(
        accionId: number,
        request: AccionEstadoRequest,
    ): Observable<AccionSeguimiento> {
        return this.http
            .patch<ApiResponse<AccionSeguimiento>>(
                `${this.baseUrl}/${accionId}/estado`,
                request,
            )
            .pipe(map((response) => response.data));
    }

    reprogramarRevision(
        accionId: number,
        request: AccionRevisionRequest,
    ): Observable<AccionSeguimiento> {
        return this.http
            .patch<ApiResponse<AccionSeguimiento>>(
                `${this.baseUrl}/${accionId}/revision`,
                request,
            )
            .pipe(map((response) => response.data));
    }

    listarPendientesPorUsuario(
        usuarioId: number,
    ): Observable<AccionSeguimiento[]> {
        return this.http
            .get<ApiResponse<AccionSeguimiento[]>>(
                `${this.baseUrl}/usuario/${usuarioId}/pendientes`,
            )
            .pipe(map((response) => response.data));
    }

    listarVencidas(): Observable<AccionSeguimiento[]> {
        return this.http
            .get<ApiResponse<AccionSeguimiento[]>>(
                `${this.baseUrl}/vencidas`,
            )
            .pipe(map((response) => response.data));
    }

    buscarPorFiltros(
        filtros: Record<string, string | number | boolean>,
    ): Observable<AccionSeguimiento[]> {
        let params = new HttpParams();

        for (const [clave, valor] of Object.entries(filtros)) {
            params = params.set(clave, String(valor));
        }

        return this.http
            .get<ApiResponse<AccionSeguimiento[]>>(
                `${this.baseUrl}/buscar`,
                { params },
            )
            .pipe(map((response) => response.data));
    }
}
