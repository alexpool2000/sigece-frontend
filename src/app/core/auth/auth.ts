import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, finalize, map, tap, throwError } from 'rxjs';
import { AuthApi } from '../services/auth-api';
import {
  AuthResponseDto,
  CambioPasswordRequestDto,
  LoginRequestDto,
  UsuarioMantenimientoResponseDto,
} from '../models/auth.model';

@Injectable({ providedIn: 'root' })
export class Auth {
  private readonly authApi = inject(AuthApi);
  private readonly router = inject(Router);
  private readonly _usuario = signal<UsuarioMantenimientoResponseDto | null>(this.obtenerUsuarioInicial());

  readonly usuario = this._usuario.asReadonly();
  readonly autenticado = computed(() => !!this._usuario());

  // Helper para obtener el rol activo del usuario directamente como string
  readonly rol = computed<string | null>(() => {
    const u = this._usuario() as any;
    if (!u?.rol) return null;
    return typeof u.rol === 'object' ? u.rol.nombre : u.rol;
  });

  // Helpers
  get token(): string | null {
    return localStorage.getItem('accessToken');
  }

  get refreshTokenValue(): string | null {
    return localStorage.getItem('refreshToken');
  }

  login(dto: LoginRequestDto): Observable<AuthResponseDto> {
    return this.authApi.login(dto).pipe(
      map((res) => res.data),
      tap((resp: AuthResponseDto) => this.guardarSesion(resp))
    );
  }

  logout(): void {
    const refreshToken = this.refreshTokenValue;

    if (refreshToken) {
      this.authApi
        .logout({ refreshToken })
        .pipe(finalize(() => this.limpiarSesion()))
        .subscribe();
    } else {
      this.limpiarSesion();
    }
  }

  refresh(): Observable<AuthResponseDto> {
    const refreshToken = this.refreshTokenValue;

    if (!refreshToken) {
      this.limpiarSesion();
      return throwError(() => new Error('No hay refresh token disponible'));
    }

    return this.authApi.refresh({ refreshToken }).pipe(
      map((res) => res.data),
      tap((resp: AuthResponseDto) => this.guardarSesion(resp))
    );
  }

  cargarPerfil(): Observable<UsuarioMantenimientoResponseDto> {
    return this.authApi.me().pipe(
      map((res) => res.data),
      tap((usuario) => {
        localStorage.setItem('usuario', JSON.stringify(usuario));
        this._usuario.set(usuario);
      })
    );
  }

  cambiarPassword(dto: CambioPasswordRequestDto): Observable<void> {
    return this.authApi.cambiarPassword(dto).pipe(map(() => void 0));
  }

  /**
   * Corrige la evaluación buscando la propiedad 'nombre' dentro de u.rol
   */
  tieneRol(roles?: string[]): boolean {
    const u = this._usuario() as any;
    if (!u || !u.rol) return false;
    if (!roles || roles.length === 0) return true;

    const rolNombre: string = typeof u.rol === 'object' ? u.rol.nombre : u.rol;
    return roles.includes(rolNombre);
  }

  private guardarSesion(resp: AuthResponseDto): void {
    localStorage.setItem('accessToken', resp.accessToken);
    localStorage.setItem('refreshToken', resp.refreshToken);
    localStorage.setItem('usuario', JSON.stringify(resp.usuario));
    this._usuario.set(resp.usuario);
  }

  private limpiarSesion(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('usuario');
    this._usuario.set(null);
    this.router.navigate(['/login']);
  }

  private obtenerUsuarioInicial(): UsuarioMantenimientoResponseDto | null {
    try {
      const raw = localStorage.getItem('usuario');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }
}