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

export type EstadoAccion = 'PENDIENTE' | 'EN_PROCESO' | 'COMPLETADA';

export interface AccionEstadoRequestDto {
  nuevoEstado: EstadoAccion;
  comentarioEjecucion?: string;
}

export interface AccionRevisionRequestDto {
  nuevaFechaRevision: string;
  justificacion: string;
}

export interface AccionSeguimientoRequestDto {
  tipoAccion: TipoAccion;
  descripcion: string;
  fechaAccion?: string | null;      
  fechaProgramada?: string | null;  
  fechaProximaRevision?: string | null;
}

export interface AccionFiltroRequestDto {
  tipoAccion?: TipoAccion;
  estadoAccion?: EstadoAccion;
  fechaDesde?: string;
  fechaHasta?: string;
}


export interface AccionSeguimientoResponseDto {
  id: number;
  incidenteId: string;
  usuarioId: number;
  usuarioNombre: string;
  tipoAccion: TipoAccion;
  descripcion: string;
  fechaAccion: string;
  fechaProximaRevision?: string | null;
  estadoAccion: EstadoAccion;
  fechaCompletada?: string | null;
  createdAt: string;
}