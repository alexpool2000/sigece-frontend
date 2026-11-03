import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api.models';
import { SiseveDerivacionRequest, SiseveDerivacionResponse, SiseveEvaluacion, SisevePendiente } from '../models/siseve-api.models';

@Injectable({ providedIn: 'root' })
export class SiseveApiService {
  private http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/derivaciones-siseve`;

  listarPendientes(): Observable<SisevePendiente[]> {
    return this.http.get<ApiResponse<SisevePendiente[]>>(`${this.baseUrl}/pendientes`)
      .pipe(map(res => res.data));
  }

  evaluarCaso(incidenteId: string): Observable<SiseveEvaluacion> {
    return this.http.get<ApiResponse<SiseveEvaluacion>>(`${this.baseUrl}/${incidenteId}/evaluacion`)
      .pipe(map(res => res.data));
  }

  consultarEstado(incidenteId: string): Observable<SiseveDerivacionResponse> {
    return this.http.get<ApiResponse<SiseveDerivacionResponse>>(`${this.baseUrl}/${incidenteId}/estado`)
      .pipe(map(res => res.data));
  }

  derivarCaso(incidenteId: string, payload: SiseveDerivacionRequest): Observable<SiseveDerivacionResponse> {
    return this.http.post<ApiResponse<SiseveDerivacionResponse>>(`${this.baseUrl}/${incidenteId}`, payload)
      .pipe(map(res => res.data));
  }

  listarDerivados(): Observable<SiseveDerivacionResponse[]> {
    return this.http.get<ApiResponse<SiseveDerivacionResponse[]>>(`${this.baseUrl}/derivados`)
      .pipe(map(res => res.data));
  }
}