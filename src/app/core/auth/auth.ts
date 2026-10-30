import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, map, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  ApiResponse, AuthApiData, AuthResponse, LoginRequest, Rol, Usuario,
} from './auth.models';

@Injectable({ providedIn: 'root' })
export class Auth {
  private http = inject(HttpClient);
  private router = inject(Router);
  private _usuario = signal<Usuario | null>(this.leerUsuario());

  readonly usuario = this._usuario.asReadonly();
  readonly autenticado = computed(() => !!this._usuario());

  get token() { return localStorage.getItem('accessToken'); }

  login(dto: LoginRequest): Observable<AuthResponse> {
    return this.http
      .post<ApiResponse<AuthApiData>>(`${environment.apiUrl}/auth/login`, dto)
      .pipe(
        map(res => this.mapAuth(res.data)),
        tap(r => {
          localStorage.setItem('accessToken', r.accessToken);
          localStorage.setItem('refreshToken', r.refreshToken);
          localStorage.setItem('usuario', JSON.stringify(r.usuario));
          this._usuario.set(r.usuario);
        }),
      );
  }

  logout() {
    localStorage.clear();
    this._usuario.set(null);
    this.router.navigate(['/login']);
  }

  tieneRol(roles?: Rol[]) {
    const u = this._usuario();
    return !!u && (!roles || roles.includes(u.rol));
  }

  private mapAuth(d: AuthApiData): AuthResponse {
    return {
      accessToken: d.accessToken,
      refreshToken: d.refreshToken,
      usuario: {
        id: d.usuario.id,
        nombres: d.usuario.nombres,
        apellidos: d.usuario.apellidos,
        rol: d.usuario.rol.nombre,
      },
    };
  }

  private leerUsuario(): Usuario | null {
    try {
      const raw = localStorage.getItem('usuario');
      return raw && raw !== 'undefined' ? JSON.parse(raw) : null;
    } catch {
      localStorage.clear();
      return null;
    }
  }
}