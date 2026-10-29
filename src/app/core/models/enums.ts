export const GRAVEDADES = ['LEVE', 'MODERADO', 'GRAVE', 'MUY_GRAVE'] as const;
export type Gravedad = (typeof GRAVEDADES)[number];

export const ESTADOS = ['REGISTRADO', 'EN_INVESTIGACION', 'EN_SEGUIMIENTO', 'RESUELTO', 'CERRADO'] as const;
export type EstadoIncidente = (typeof ESTADOS)[number];

export const NIVELES = ['INICIAL', 'PRIMARIA', 'SECUNDARIA'] as const;
export type Nivel = (typeof NIVELES)[number];

export const TIPOS_DOCUMENTO = ['DNI', 'CE', 'PASAPORTE'] as const;
export type TipoDocumento = (typeof TIPOS_DOCUMENTO)[number];

export const PARENTESCOS = ['PADRE', 'MADRE', 'TIO', 'TIA', 'ABUELO', 'ABUELA', 'TUTOR_LEGAL', 'APODERADO'] as const;
export type Parentesco = (typeof PARENTESCOS)[number];

export const CATEGORIAS_SISEVE = ['FISICA_SIN_ARMAS', 'FISICA_CON_ARMAS', 'PSICOLOGICA', 'SEXUAL', 'CIBERACOSO'] as const;
export type CategoriaSiseve = (typeof CATEGORIAS_SISEVE)[number];

export const MEDIOS_OCURRENCIA = ['PRESENCIAL', 'DIGITAL'] as const;
export type MedioOcurrencia = (typeof MEDIOS_OCURRENCIA)[number];

export const ROLES_INVOLUCRADO = ['VICTIMA', 'AGRESOR', 'TESTIGO'] as const;
export type RolInvolucrado = (typeof ROLES_INVOLUCRADO)[number];

export const TIPOS_ACCION = ['ENTREVISTA_ESTUDIANTE', 'ENTREVISTA_PADRES', 'CITACION_APODERADO', 'DERIVACION_PSICOLOGIA', 'MEDIDA_CORRECTIVA_FORMATIVA', 'DERIVACION_DEMUNA_CEM', 'ACTA_COMPROMISO', 'APUNTE_INTERNO', 'OTRO'] as const;
export type TipoAccion = (typeof TIPOS_ACCION)[number];

export const TIPOS_NOTIFICACION = ['AVISO_INCIDENCIA', 'CITACION', 'ENTREVISTA', 'CIERRE_CASO'] as const;
export type TipoNotificacion = (typeof TIPOS_NOTIFICACION)[number];

export const ESTADOS_ENVIO = ['PENDIENTE', 'ENVIADO', 'ENTREGADO', 'FALLIDO', 'LEIDO'] as const;
export type EstadoEnvio = (typeof ESTADOS_ENVIO)[number];