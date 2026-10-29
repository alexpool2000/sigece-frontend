export type Rol = 'ROLE_ADMINISTRADOR' | 'ROLE_TUTOR' | 'ROLE_PSICOLOGO';
export interface LoginRequest { username: string; password: string; }
export interface Usuario { id: number; nombres: string; apellidos: string; rol: Rol; }
export interface AuthResponse { accessToken: string; refreshToken: string; usuario: Usuario; }