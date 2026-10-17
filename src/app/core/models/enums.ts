export const GRAVEDADES = ['LEVE', 'MODERADA', 'GRAVE', 'MUY_GRAVE'] as const;
export type Gravedad = (typeof GRAVEDADES)[number];

export const ESTADOS = ['REGISTRADO', 'EN_INVESTIGACION', 'EN_SEGUIMIENTO', 'RESUELTO', 'DERIVADO_SISEVE', 'CERRADO'] as const;
export type EstadoIncidente = (typeof ESTADOS)[number];

export const NIVELES = ['INICIAL', 'PRIMARIA', 'SECUNDARIA'] as const;
export type Nivel = (typeof NIVELES)[number];

export const TIPOS_DOCUMENTO = ['DNI', 'CE', 'PASAPORTE'] as const;
export type TipoDocumento = (typeof TIPOS_DOCUMENTO)[number];

export const PARENTESCOS = ['PADRE', 'MADRE', 'TIO', 'TIA', 'ABUELO', 'ABUELA', 'TUTOR_LEGAL', 'APODERADO'] as const;
export type Parentesco = (typeof PARENTESCOS)[number];

export const CATEGORIAS_SISEVE = ['FISICA_SIN_ARMAS', 'FISICA_CON_ARMAS', 'PSICOLOGICA', 'SEXUAL', 'CIBERACOSO'] as const;
export type CategoriaSiseve = (typeof CATEGORIAS_SISEVE)[number];