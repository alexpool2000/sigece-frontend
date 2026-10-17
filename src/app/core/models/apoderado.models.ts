import { TipoDocumento } from './enums';
import { Parentesco } from './enums';

export interface ApoderadoRequest {
  nombres: string; apellidos: string; tipoDocumento: TipoDocumento;
  numeroDocumento: string; telefono: string; correo?: string | null;
}
// Campos de la respuesta SUPUESTOS (el api-docs no incluye el DTO de respuesta)
export interface Apoderado extends ApoderadoRequest { id: number; }

export interface ApoderadoFiltro { termino: string; tipoDocumento: TipoDocumento | ''; page: number; size: number; }

export interface VinculoFamiliar {
  estudianteId: number; apoderadoId: number;
  nombreApoderado: string; nombreEstudiante: string;
  numeroDocumento: string; parentesco: Parentesco;
  esContactoPrincipal: boolean; telefono: string; correo: string | null;
}
export interface AsignarApoderadoRequest { apoderadoId: number; parentesco: Parentesco; esContactoPrincipal: boolean; }