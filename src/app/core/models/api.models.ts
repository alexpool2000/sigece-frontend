export interface ApiError { code: string; message: string; suggestion?: string; details?: Record<string, string>; }
export interface PaginationMeta { page: number; size: number; totalElements: number; totalPages: number; }
export interface ApiResponse<T> {
  success: boolean; status: number; message: string; data: T;
  error?: ApiError; path?: string; traceId?: string; meta?: PaginationMeta; timestamp?: string;
}
export interface Pagina<T> { content: T[]; totalElements: number; }