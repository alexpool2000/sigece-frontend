export type ModoDerivacion = 'MANUAL_PORTAL' | 'OFICIO_UGEL' | 'OTRO';

export interface SisevePendiente {
    incidenteId: string;
    codigoCaso: string;
    tipoIncidenciaNombre: string;
    gravedad: string;
    fechaOcurrencia: string;
    diasTranscurridos: number;
  }
  
  export interface SiseveEvaluacion {
    incidenteId: string;
    codigoCaso: string;
    derivacionObligatoria: boolean;
    baseLegal: string;
    recomendacionTecnica: string;
  }
  
  export interface SiseveDerivacionRequest {
    codigoSiseve: string;
    modoDerivacion: ModoDerivacion;
    observacionesSiseve?: string;
  }
  
  export interface SiseveDerivacionResponse {
    id: string;
    codigoCaso: string;
    reportadoSiseve: boolean;
    codigoSiseve: string;
    fechaReporteSiseve: string;
    observacionesSiseve?: string;
    derivadoPor?: string;
  }