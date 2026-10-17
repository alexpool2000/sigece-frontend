import { EstadoIncidente, Gravedad } from './enums';

export interface IncidenteResumen {
  id: string;
  codigoCaso: string;
  fechaOcurrencia: string;
  estudiantes: string[];
  tipo: string;
  gravedad: Gravedad;
  estado: EstadoIncidente;
  responsable: string | null;
  reincidencia: boolean;
}

export interface IncidenteFiltro {
  texto: string;
  gravedad: Gravedad | '';
  estado: EstadoIncidente | '';
  pagina: number;
  tamano: number;
}

export type { Pagina } from './api.models';