import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse, Pagina } from '../models/api.models';
import { Apoderado, ApoderadoFiltro, ApoderadoRequest } from '../models/apoderado.models';

@Injectable({ providedIn: 'root' })
export class ApoderadoApi {
    private http = inject(HttpClient);
    private base = `${environment.apiUrl}/apoderados`;

    marcarPrincipal(apoderadoId: number, estudianteId: number) {
        return this.http.patch<ApiResponse<unknown>>(`${this.base}/${apoderadoId}/estudiantes/${estudianteId}/principal`, {});
    }

    buscar(f: ApoderadoFiltro): Observable<Pagina<Apoderado>> {
        let params = new HttpParams().set('page', f.page).set('size', f.size);
        if (f.termino) params = params.set('termino', f.termino);
        if (f.tipoDocumento) params = params.set('tipoDocumento', f.tipoDocumento);
        return this.http.get<ApiResponse<any>>(`${this.base}/buscar`, { params }).pipe(
            map(r => {
                const lista = Array.isArray(r.data) ? r.data : (r.data?.content ?? []);
                return { content: lista, totalElements: r.meta?.totalElements ?? r.data?.totalElements ?? lista.length };
            }),
        );
    }
    registrar(dto: ApoderadoRequest) { return this.http.post<ApiResponse<Apoderado>>(this.base, dto).pipe(map(r => r.data)); }
    // El endpoint solo actualiza teléfono y correo; el DTO se envía completo porque así lo define el api-docs
    actualizarContacto(id: number, dto: ApoderadoRequest) {
        return this.http.patch<ApiResponse<Apoderado>>(`${this.base}/${id}/contacto`, dto).pipe(map(r => r.data));
    }
}