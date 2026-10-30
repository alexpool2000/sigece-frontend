import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  AuthResponseDto,
  CambioPasswordRequestDto,
  LoginRequestDto,
  RefreshTokenRequestDto,
  UsuarioMantenimientoResponseDto,
} from '../models/auth.model';
import { ApiResponse } from '../models/api.models';

@Injectable({ providedIn: 'root' })
export class AuthApi {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/auth`;

  /**
   * Autenticación con credenciales (usuario / contraseña)
   */
  login(dto: LoginRequestDto): Observable<ApiResponse<AuthResponseDto>> {
    return this.http.post<ApiResponse<AuthResponseDto>>(`${this.base}/login`, dto);
  }

  /**
   * Renovación del token de acceso usando el refresh token
   */
  refresh(dto: RefreshTokenRequestDto): Observable<ApiResponse<AuthResponseDto>> {
    return this.http.post<ApiResponse<AuthResponseDto>>(`${this.base}/refresh`, dto);
  }

  /**
   * Cierre de sesión e invalidación del token
   */
  logout(dto: RefreshTokenRequestDto): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(`${this.base}/logout`, dto);
  }

  /**
   * Obtiene la sesión y datos del usuario actualmente autenticado
   */
  me(): Observable<ApiResponse<UsuarioMantenimientoResponseDto>> {
    return this.http.get<ApiResponse<UsuarioMantenimientoResponseDto>>(`${this.base}/me`);
  }

  /**
   * Endpoint de soporte para cambio de contraseña
   */
  cambiarPassword(dto: CambioPasswordRequestDto): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(`${this.base}/cambiar-password`, dto);
  }
}