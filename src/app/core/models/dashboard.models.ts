import { Nivel } from './enums';

export interface Indicadores {
  totalIncidentes: number;
  totalReincidentes: number;
  totalDerivadosSiseve: number;
  totalCerrados: number;
  porcentajeResolucion: number;
  incidentesPorGravedad: Record<string, number>;
  incidentesPorEstado: Record<string, number>;
  incidentesPorTipo: Record<string, number>;
  incidentesPorMes: Record<string, number>;
}

export interface DashboardFiltro { fechaDesde: string; fechaHasta: string; nivel: Nivel | ''; grado: string; }