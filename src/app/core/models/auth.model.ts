export interface LoginRequestDto {
    username: string;
    password: string;
}
  
  export interface RefreshTokenRequestDto {
    refreshToken: string;
  }
  
  export interface CambioPasswordRequestDto {
    passwordActual: string;
    nuevoPassword: string;
    confirmacionPassword: string;
  }
  
  export interface UsuarioResponseDto {
    id: number;
    nombres: string;
    apellidos: string;
    username: string;
    correo: string;
    rol: string;
    activo: boolean;
    debeCambiarPassword: boolean;
    ultimoAcceso: string | null; 
  }
  
  export interface UsuarioMantenimientoResponseDto {
    id: number;
    nombres: string;
    apellidos: string;
    username: string;
    correo: string;
    rol?: string;
    activo?: boolean;
    debeCambiarPassword?: boolean;
    [key: string]: any; 
  }
  
  export interface AuthResponseDto {
    accessToken: string;
    refreshToken: string;
    tokenType: string;
    expiresIn: number;
    usuario: UsuarioMantenimientoResponseDto;
  }