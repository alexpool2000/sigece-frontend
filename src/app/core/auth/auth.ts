import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, delay, of, tap, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthResponse, LoginRequest, Rol, Usuario } from './auth.models';

@Injectable({ providedIn: 'root' })
export class Auth {
  private http = inject(HttpClient);
  private router = inject(Router);
  private _usuario = signal<Usuario | null>(JSON.parse(localStorage.getItem('usuario') ?? 'null'));

  readonly usuario = this._usuario.asReadonly();
  readonly autenticado = computed(() => !!this._usuario());

  get token() { return localStorage.getItem('accessToken'); }

  login(dto: LoginRequest): Observable<AuthResponse> {
    const req$ = environment.mock.auth
      ? this.mockLogin(dto)
      : this.http.post<AuthResponse>(`${environment.apiUrl}/auth/login`, dto);
    return req$.pipe(tap(r => {
      localStorage.setItem('accessToken', r.accessToken);
      localStorage.setItem('refreshToken', r.refreshToken);
      localStorage.setItem('usuario', JSON.stringify(r.usuario));
      this._usuario.set(r.usuario);
    }));
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

  // Solo para desarrollo: usuarios admin, director, tutor, psicologo, comite / clave 1234
  private mockLogin(dto: LoginRequest): Observable<AuthResponse> {
    const roles: Record<string, Rol> = {
      admin: 'ROLE_ADMIN', director: 'ROLE_DIRECTOR', tutor: 'ROLE_TUTOR',
      psicologo: 'ROLE_PSICOLOGO', comite: 'ROLE_COMITE_BIENESTAR',
    };
    const rol = roles[dto.username];
    if (!rol || dto.password !== '1234')
      return throwError(() => new HttpErrorResponse({ status: 401 }));
    return of({
      accessToken: 'mock-token', refreshToken: 'mock-refresh',
      usuario: { id: 1, nombres: dto.username, apellidos: '(mock)', rol },
    }).pipe(delay(400));
  }
}