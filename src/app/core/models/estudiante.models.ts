import { Nivel } from './enums';
import { VinculoFamiliar } from './apoderado.models';

export interface EstudianteRequest {
  codigoSiagie: string; nombres: string; apellidos: string;
  fechaNacimiento: string; // yyyy-MM-dd
  nivel: Nivel; grado: string; seccion: string;
}
// Campos de la respuesta SUPUESTOS (el api-docs no incluye el DTO de respuesta)
export interface Estudiante extends EstudianteRequest { id: number; activo: boolean; }

export interface EstudianteFiltro {
  termino: string; nivel: Nivel | ''; grado: string; seccion: string;
  activo: boolean | ''; page: number; size: number;
}

export interface PerfilEstudiante {
  estudiante: Estudiante;
  apoderados: VinculoFamiliar[];
  totalIncidentesHistoricos: number;
  ultimosIncidentes: unknown[]; // forma aún no confirmada
}

