import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  CambioPasswordRequestDto,
  RolNombre,
  RolResponseDto,
  UsuarioFiltroRequestDto,
  UsuarioMantenimientoResponseDto,
  UsuarioRegistroRequestDto,
  UsuarioRequestDto,
  UsuarioResumenResponseDto,
} from '../models/usuario.models';
import { ApiResponse } from '../models/api.models';

@Injectable({ providedIn: 'root' })
export class UsuarioApi {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/usuarios`;

  /**
   * Registra un nuevo usuario en el sistema (Solo Administrador)
   */
  registrarUsuario(dto: UsuarioRegistroRequestDto): Observable<ApiResponse<UsuarioMantenimientoResponseDto>> {
    return this.http.post<ApiResponse<UsuarioMantenimientoResponseDto>>(this.base, dto);
  }

  /**
   * Actualiza los datos de un usuario existente por su ID
   */
  actualizarPerfil(usuarioId: number, dto: UsuarioRequestDto): Observable<ApiResponse<UsuarioMantenimientoResponseDto>> {
    return this.http.put<ApiResponse<UsuarioMantenimientoResponseDto>>(`${this.base}/${usuarioId}`, dto);
  }

  /**
   * Cambia la contraseña del usuario actualmente autenticado
   */
  cambiarPassword(dto: CambioPasswordRequestDto): Observable<ApiResponse<void>> {
    return this.http.patch<ApiResponse<void>>(`${this.base}/cambiar-password`, dto);
  }

  /**
   * Restablece la contraseña de un usuario a su formato por defecto (Solo Administrador)
   */
  restablecerPassword(usuarioId: number): Observable<ApiResponse<void>> {
    return this.http.patch<ApiResponse<void>>(`${this.base}/${usuarioId}/restablecer-password`, {});
  }

  /**
   * Realiza la baja lógica de un usuario
   */
  desactivarUsuario(usuarioId: number): Observable<ApiResponse<void>> {
    return this.http.patch<ApiResponse<void>>(`${this.base}/${usuarioId}/desactivar`, {});
  }

  /**
   * Reactiva a un usuario previamente desactivado
   */
  reactivarUsuario(usuarioId: number): Observable<ApiResponse<void>> {
    return this.http.patch<ApiResponse<void>>(`${this.base}/${usuarioId}/reactivar`, {});
  }

  /**
   * Obtiene la ficha completa de un usuario por su ID
   */
  obtenerPorId(usuarioId: number): Observable<ApiResponse<UsuarioMantenimientoResponseDto>> {
    return this.http.get<ApiResponse<UsuarioMantenimientoResponseDto>>(`${this.base}/${usuarioId}`);
  }

  /**
   * Obtiene la ficha de un usuario por su nombre de usuario (username)
   */
  obtenerPorUsername(username: string): Observable<ApiResponse<UsuarioMantenimientoResponseDto>> {
    return this.http.get<ApiResponse<UsuarioMantenimientoResponseDto>>(`${this.base}/username/${username}`);
  }

  /**
   * Búsqueda paginada y con filtros de usuarios
   */
  buscar(filtro?: UsuarioFiltroRequestDto): Observable<ApiResponse<UsuarioMantenimientoResponseDto[]>> {
    let params = new HttpParams();

    if (filtro) {
      if (filtro.termino) {
        params = params.set('termino', filtro.termino);
      }
      if (filtro.roleId !== undefined && filtro.roleId !== null) {
        params = params.set('roleId', filtro.roleId.toString());
      }
      if (filtro.activo !== undefined && filtro.activo !== null) {
        params = params.set('activo', filtro.activo.toString());
      }
      if (filtro.page !== undefined && filtro.page !== null) {
        params = params.set('page', filtro.page.toString());
      }
      if (filtro.size !== undefined && filtro.size !== null) {
        params = params.set('size', filtro.size.toString());
      }
    }

    return this.http.get<ApiResponse<UsuarioMantenimientoResponseDto[]>>(`${this.base}/buscar`, { params });
  }

  /**
   * Lista usuarios activos por un rol específico y su conteo de casos asignados
   */
  listarPorRol(rol: RolNombre): Observable<ApiResponse<UsuarioResumenResponseDto[]>> {
    return this.http.get<ApiResponse<UsuarioResumenResponseDto[]>>(`${this.base}/rol/${rol}`);
  }

  /**
   * Obtiene el número de expedientes activos asignados a un usuario
   */
  contarCasosActivosAsignados(usuarioId: number): Observable<ApiResponse<number>> {
    return this.http.get<ApiResponse<number>>(`${this.base}/${usuarioId}/casos-activos/conteo`);
  }

  /**
   * Obtiene el catálogo completo de roles del sistema
   */
  listarRoles(): Observable<ApiResponse<RolResponseDto[]>> {
    return this.http.get<ApiResponse<RolResponseDto[]>>(`${this.base}/roles`);
  }
}