import { CategoriaSiseve, Gravedad } from './enums';

export interface TipoIncidenciaRequest { 
    nombre: string; 
    categoriaSiseve: CategoriaSiseve; 
    gravedadBase: Gravedad; 
    descripcion?: string | null; }
// Campos de la respuesta SUPUESTOS hasta que el backend actualice su API
export interface TipoIncidencia extends TipoIncidenciaRequest { id: number; activo: boolean; }