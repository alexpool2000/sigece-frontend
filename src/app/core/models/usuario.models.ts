export type RolNombre =
  | 'ROLE_ADMINISTRADOR'
  | 'ROLE_PSICOLOGO'
  | 'ROLE_TUTOR'
  | 'ROLE_TRABAJADOR'
  | 'ROLE_INVITADO';

export interface RolResponseDto {
  id: number;
  nombre: RolNombre;
  descripcion: string;
}

export interface UsuarioFiltroRequestDto {
  termino?: string;
  roleId?: number;
  activo?: boolean;
  page?: number;
  size?: number;
}

export interface UsuarioMantenimientoResponseDto {
  id: number;
  nombres: string;
  apellidos: string;
  dni: string;
  correo: string;
  username: string;
  telefono?: string | null;
  rol: RolResponseDto;
  activo: boolean;
  ultimoAcceso?: string | null;
  intentosFallidos?: number;
  debeCambiarPassword: boolean;
  createdAt?: string;
}

export interface UsuarioRegistroRequestDto {
  nombres: string;
  apellidos: string;
  dni: string;
  correo: string;
  username: string;
  password?: string;
  telefono?: string | null;
  roleId: number;
}

export interface UsuarioRequestDto {
  nombres: string;
  apellidos: string;
  correo: string;
  telefono?: string | null;
  roleId: number;
  activo: boolean;
}

export interface UsuarioResumenResponseDto {
  id: number;
  nombreCompleto: string;
  username: string;
  rol: RolNombre;
  casosActivosAsignados: number;
}

export interface CambioPasswordRequestDto {
  passwordActual: string;
  nuevoPassword: string;
  confirmacionPassword: string;
}