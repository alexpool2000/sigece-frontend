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

export interface IncidenteRequest {
  tipoIncidenciaId: number;
  gravedad: Gravedad;
  descripcion: string;
  lugarOcurrencia: string;
  medioOcurrencia: 'PRESENCIAL' | 'DIGITAL';
  fechaOcurrencia: string; // ISO 8601
  notificarApoderado: boolean;
}


export interface IncidenteDetalle {
  id: string;
  codigoCaso: string;
  tipoIncidenciaNombre: string;
  gravedad: Gravedad;
  estado: EstadoIncidente;
  descripcion: string;
  lugarOcurrencia: string;
  medioOcurrencia: 'PRESENCIAL' | 'DIGITAL';
  fechaOcurrencia: string;
  fechaRegistro: string;
  reportadoPorNombre: string | null;
  responsableActualNombre: string | null;
  notificarApoderado: boolean;
  reportadoSiseve: boolean;
  codigoSiseve?: string | null;
  fechaResolucion?: string | null;
  resueltoPorNombre?: string;
  actaCierre?: string | null;
  conclusionesFinales?: string | null;
  fechaCierre?: string | null;
  cerradoPorNombre?: string | null;
  fechaReporteSiseve?: string | null;
  observacionesSiseve?: string | null;
  derivadoPorNombre?: string | null;
}

export interface Involucrado {
  id: number;
  nombreCompleto: string;
  documentoIdentidad?: string;
  tipoInvolucrado: string;
  rolInvolucrado: 'VICTIMA' | 'AGRESOR' | 'TESTIGO';
  observaciones?: string;
}

export interface InvolucradoRequest {
  estudianteId?: number;
  usuarioId?: number;
  rolInvolucrado: 'VICTIMA' | 'AGRESOR' | 'TESTIGO';
  observaciones?: string;
}


export interface IncidenteExpediente {
  incidente: IncidenteDetalle;
  involucrados: Involucrado[];
  seguimiento: AccionSeguimiento[];
  evidencias: Adjunto[];
  notificaciones: Notificacion[];
}

export interface IncidenteRequest {
  tipoIncidenciaId: number;
  gravedad: Gravedad;
  descripcion: string;
  lugarOcurrencia: string;
  medioOcurrencia: 'PRESENCIAL' | 'DIGITAL';
  fechaOcurrencia: string;      // ISO 8601
  notificarApoderado: boolean;
}

export interface CierreChecklist {
  todasLasAccionesCompletadas: boolean;
  apoderadosNotificados: boolean;
  actaCierrePresente: boolean;
  cumplePlazosLegales: boolean;
  listoParaCierre: boolean;
  observacionesPendientes: string[];
}

export interface Adjunto {
  id: number;
  nombreOriginal: string;
  descripcion: string;
  tipoMime: string;
  tamanoBytes: number;
  hashSha256: string;
  subidoPorNombre: string;
  createdAt: string;
}

export type TipoAccion =
  | 'ENTREVISTA_ESTUDIANTE'
  | 'ENTREVISTA_PADRES'
  | 'CITACION_APODERADO'
  | 'DERIVACION_PSICOLOGIA'
  | 'MEDIDA_CORRECTIVA_FORMATIVA'
  | 'DERIVACION_DEMUNA_CEM'
  | 'ACTA_COMPROMISO'
  | 'APUNTE_INTERNO'
  | 'OTRO';

export type EstadoAccion =
  | 'PENDIENTE'
  | 'EN_PROCESO'
  | 'COMPLETADA';

export interface AccionSeguimiento {
  id: number;
  incidenteId?: string;
  usuarioId?: number;
  usuarioNombre: string;
  tipoAccion: TipoAccion;
  descripcion: string;
  fechaAccion: string;
  fechaProximaRevision?: string | null;
  estadoAccion: EstadoAccion;
  fechaCompletada?: string | null;
  createdAt?: string;
}

export interface Notificacion {
  id: number;
  apoderadoNombre?: string;
  tipoNotificacion: string;
  origen: string;
  canal: string;
  destino?: string;
  fechaEnvio?: string;
  estadoEnvio: 'PENDIENTE' | 'ENVIADO' | 'ENTREGADO' | 'FALLIDO' | 'LEIDO';
  intentosEnvio: number;
  detalleResultado?: string;
}

export type { Pagina } from './api.models';