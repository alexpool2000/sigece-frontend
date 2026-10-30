export type Rol = 'ROLE_ADMINISTRADOR' | 'ROLE_TUTOR' | 'ROLE_PSICOLOGO';
export interface LoginRequest {
    username: string;
    password: string;
}
export interface Usuario {
    id: number;
    nombres: string;
    apellidos: string;
    rol: Rol;
}
export interface AuthResponse {
    accessToken: string;
    refreshToken: string;
    usuario: Usuario;
}

export interface ApiResponse<T> {
  success: boolean;
  status: number;
  message: string;
  data: T;
  path?: string;
  traceId?: string;
  timestamp?: string;
}

export interface UsuarioApi {
  id: number;
  nombres: string;
  apellidos: string;
  dni?: string;
  correo?: string;
  username?: string;
  telefono?: string;
  rol: { id: number; nombre: Rol; descripcion?: string };
  activo?: boolean;
}

export interface AuthApiData {
  accessToken: string;
  refreshToken: string;
  tokenType?: string;
  expiresIn?: number;
  usuario: UsuarioApi;
}