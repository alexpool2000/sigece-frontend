import { CategoriaSiseve } from './enums';

export interface TipoIncidenciaRequest { nombre: string; categoriaSiseve: CategoriaSiseve; descripcion?: string | null; }
// Campos de la respuesta SUPUESTOS (el api-docs no incluye el DTO de respuesta)
export interface TipoIncidencia extends TipoIncidenciaRequest { id: number; activo: boolean; }