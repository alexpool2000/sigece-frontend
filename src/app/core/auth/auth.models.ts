export type Rol = 'ROLE_ADMIN' | 'ROLE_DIRECTOR' | 'ROLE_TUTOR' | 'ROLE_PSICOLOGO' | 'ROLE_COMITE_BIENESTAR';
export interface LoginRequest { username: string; password: string; }
export interface Usuario { id: number; nombres: string; apellidos: string; rol: Rol; }
export interface AuthResponse { accessToken: string; refreshToken: string; usuario: Usuario; }