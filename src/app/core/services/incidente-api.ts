
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, delay, from, map, of, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  ESTADOS,
  EstadoIncidente,
  GRAVEDADES,
  Gravedad,
} from '../models/enums';

import {
  Adjunto,
  CierreChecklist,
  IncidenteDetalle,
  IncidenteExpediente,
  IncidenteFiltro,
  IncidenteRequest,
  IncidenteResumen,
  Involucrado,
  InvolucradoRequest,
  Pagina,
  AccionSeguimiento,
  Notificacion,
} from '../models/incidente.models';

// ======================================================
// DATOS DE PRUEBA
// ======================================================

const TIPOS = [
  'Agresión física',
  'Acoso verbal',
  'Ciberacoso',
  'Discriminación',
  'Daño a propiedad',
];

const NOMBRES = [
  'Luis Ramos',
  'Ana Torres',
  'Carlos Díaz',
  'María Quispe',
  'José Flores',
  'Lucía Vega',
];

const EVIDENCIAS_MOCK = new Map<string, Adjunto[]>();
const ARCHIVOS_MOCK = new Map<number, File>();

const sha256 = async (f: File): Promise<string> => {
  const buf = await crypto.subtle.digest(
    'SHA-256',
    await f.arrayBuffer(),
  );

  return [...new Uint8Array(buf)]
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
};

const MOCK: IncidenteResumen[] = Array.from(
  { length: 23 },
  (_, i) => ({
    id: String(i + 1),
    codigoCaso: `INC-2026-${String(i + 1).padStart(6, '0')}`,
    fechaOcurrencia: new Date(
      2026,
      8,
      1 + (i % 28),
      9 + (i % 6),
      0,
    ).toISOString(),
    estudiantes: [
      NOMBRES[i % 6],
      ...(i % 4 === 0 ? [NOMBRES[(i + 2) % 6]] : []),
    ],
    tipo: TIPOS[i % 5],
    gravedad: GRAVEDADES[i % GRAVEDADES.length],
    estado: ESTADOS[i % ESTADOS.length],
    responsable:
      i % 5 === 0
        ? null
        : 'Psic. ' + NOMBRES[(i + 1) % 6],
    reincidencia: i % 7 === 0,
  }),
);

// ======================================================
// ESTADOS Y DATOS COMPLEMENTARIOS
// ======================================================

const SIGUIENTES: Partial<
  Record<EstadoIncidente, EstadoIncidente[]>
> = {
  REGISTRADO: ['EN_INVESTIGACION'],
  EN_INVESTIGACION: ['EN_SEGUIMIENTO'],
  EN_SEGUIMIENTO: ['RESUELTO'],
  RESUELTO: ['CERRADO'],
  CERRADO: [],
};

const EXTRA_MOCK = new Map<
  string,
  Partial<IncidenteDetalle>
>();

const extra = (
  id: string,
  p: Partial<IncidenteDetalle>,
) => {
  EXTRA_MOCK.set(id, {
    ...EXTRA_MOCK.get(id),
    ...p,
  });
};

const INVOLUCRADOS_MOCK = new Map<string, Involucrado[]>();

const involucradosMock = (
  r: IncidenteResumen,
): Involucrado[] => {
  if (!INVOLUCRADOS_MOCK.has(r.id)) {
    INVOLUCRADOS_MOCK.set(
      r.id,
      r.estudiantes.map((nombre, k) => ({
        id: k + 1,
        nombreCompleto: nombre,
        tipoInvolucrado: 'ESTUDIANTE',
        rolInvolucrado:
          k === 0 ? ('VICTIMA' as const) : ('AGRESOR' as const),
      })),
    );
  }

  return INVOLUCRADOS_MOCK.get(r.id)!;
};

// ======================================================
// RESPUESTAS DE LA API
// ======================================================

interface ApiResponse<T> {
  data: T;
  meta?: {
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
  };
}

interface IncidenteResumenApi {
  id: string;
  codigoCaso: string;
  tipoIncidenciaNombre: string;
  gravedad: Gravedad;
  lugarOcurrencia: string;
  fechaOcurrencia: string;
  estado: EstadoIncidente;
  responsableNombre: string | null;
  estudiantes: string[];
}

const aResumen = (
  r: IncidenteResumenApi,
): IncidenteResumen => ({
  id: r.id,
  codigoCaso: r.codigoCaso,
  fechaOcurrencia: r.fechaOcurrencia,
  estudiantes: r.estudiantes ?? [],
  tipo: r.tipoIncidenciaNombre,
  gravedad: r.gravedad,
  estado: r.estado,
  responsable: r.responsableNombre ?? null,
  reincidencia: false,
});

// ======================================================
// SERVICIO
// ======================================================

@Injectable({ providedIn: 'root' })
export class IncidenteApi {
  private http = inject(HttpClient);

  private url = (id: string) =>
    `${environment.apiUrl}/incidentes/${id}`;

  private enMock = (id: string) =>
    MOCK.find((i) => i.id === id)!;

  private ok = (): Observable<void> =>
    of(undefined).pipe(delay(300));

  // ====================================================
  // LISTADO Y BÚSQUEDA DE INCIDENCIAS
  // ====================================================

  listar(
    f: IncidenteFiltro,
  ): Observable<Pagina<IncidenteResumen>> {
    // MODO REAL: consultar el backend
    if (!environment.mock.incidentes) {
      let params = new HttpParams()
        .set('page', String(f.pagina))
        .set('size', String(f.tamano));

      const texto = f.texto.trim();

      if (texto) {
        params = params.set('termino', texto);
      }

      if (f.gravedad) {
        params = params.set('gravedad', f.gravedad);
      }

      if (f.estado) {
        params = params.set('estado', f.estado);
      }

      return this.http
        .get<ApiResponse<IncidenteResumenApi[]>>(
          `${environment.apiUrl}/incidentes/buscar`,
          { params },
        )
        .pipe(
          map((r) => ({
            content: (r.data ?? []).map(aResumen),
            totalElements:
              r.meta?.totalElements ?? r.data?.length ?? 0,
          })),
        );
    }

    // MODO MOCK: conservar los datos simulados
    const texto = f.texto.trim().toLowerCase();

    const filtrados = MOCK.filter(
      (i) =>
        (
          !texto ||
          i.codigoCaso.toLowerCase().includes(texto) ||
          i.estudiantes.join(' ').toLowerCase().includes(texto)
        ) &&
        (!f.gravedad || i.gravedad === f.gravedad) &&
        (!f.estado || i.estado === f.estado),
    );

    const inicio = f.pagina * f.tamano;

    return of({
      content: filtrados.slice(inicio, inicio + f.tamano),
      totalElements: filtrados.length,
    }).pipe(delay(300));
  }

  // ====================================================
  // OBTENER EXPEDIENTE
  // ====================================================

  obtener(id: string): Observable<IncidenteExpediente> {
    if (!environment.mock.incidentes) {
      return this.http
        .get<ApiResponse<IncidenteExpediente>>(this.url(id))
        .pipe(map((r) => r.data));
    }

    const r = MOCK.find((i) => i.id === id);

    if (!r) {
      return throwError(
        () => new Error('Incidente no encontrado'),
      );
    }

    // Corrección: declarar explícitamente el tipo del expediente.
    const seguimiento: AccionSeguimiento[] = [
      {
        id: 1,
        usuarioNombre: 'Psic. de prueba',
        tipoAccion: 'ENTREVISTA_ESTUDIANTE',
        descripcion: 'Entrevista con el estudiante afectado.',
        fechaAccion: r.fechaOcurrencia,
        estadoAccion: 'COMPLETADA',
      },
      {
        id: 2,
        usuarioNombre: 'Psic. de prueba',
        tipoAccion: 'CITACION_APODERADO',
        descripcion:
          'Citación para conversar sobre lo ocurrido.',
        fechaAccion: r.fechaOcurrencia,
        fechaProximaRevision: r.fechaOcurrencia,
        estadoAccion: 'PENDIENTE',
      },
    ];

    const notificaciones: Notificacion[] = [
      {
        id: 1,
        apoderadoNombre: 'Apoderado de prueba',
        tipoNotificacion: 'AVISO_INCIDENCIA',
        origen: 'AUTOMATICA',
        canal: 'WHATSAPP',
        destino: '987654321',
        fechaEnvio: r.fechaOcurrencia,
        estadoEnvio: 'ENTREGADO',
        intentosEnvio: 1,
      },
    ];

    const expediente: IncidenteExpediente = {
      incidente: {
        id: r.id,
        codigoCaso: r.codigoCaso,
        tipoIncidenciaNombre: r.tipo,
        gravedad: r.gravedad,
        estado: r.estado,
        descripcion: 'Descripción de prueba del incidente.',
        lugarOcurrencia: 'Patio',
        medioOcurrencia: 'PRESENCIAL',
        fechaOcurrencia: r.fechaOcurrencia,
        fechaRegistro: r.fechaOcurrencia,
        reportadoPorNombre: 'Tutor de prueba',
        responsableActualNombre:
          r.responsable ?? 'Sin responsable',
        notificarApoderado: true,
        reportadoSiseve: false,
        ...EXTRA_MOCK.get(id),
      },
      involucrados: [...involucradosMock(r)],
      seguimiento,
      evidencias: [
        ...(EVIDENCIAS_MOCK.get(id) ?? []),
      ],
      notificaciones,
    };

    return of(expediente).pipe(delay(300));
  }

  // ====================================================
  // REGISTRAR INCIDENTE
  // ====================================================

  registrar(
    dto: IncidenteRequest,
    tipoNombre = 'Sin tipo',
  ): Observable<{ id: string; codigoCaso: string }> {
    if (!environment.mock.incidentes) {
      return this.http
        .post<
          ApiResponse<{ id: string; codigoCaso: string }>
        >(`${environment.apiUrl}/incidentes`, dto)
        .pipe(map((r) => r.data));
    }

    const n = MOCK.length + 1;

    const nuevo: IncidenteResumen = {
      id: String(n),
      codigoCaso: `INC-2026-${String(n).padStart(6, '0')}`,
      fechaOcurrencia: dto.fechaOcurrencia,
      estudiantes: [],
      tipo: tipoNombre,
      gravedad: dto.gravedad,
      estado: ESTADOS[0],
      responsable: null,
      reincidencia: false,
    };

    MOCK.push(nuevo);

    return of({
      id: nuevo.id,
      codigoCaso: nuevo.codigoCaso,
    }).pipe(delay(300));
  }

  // ====================================================
  // INVOLUCRADOS
  // ====================================================

  agregarInvolucrado(
    incidenteId: string,
    dto: InvolucradoRequest,
    nombre = 'Estudiante',
  ): Observable<Involucrado> {
    if (!environment.mock.incidentes) {
      return this.http
        .post<ApiResponse<Involucrado>>(
          `${this.url(incidenteId)}/involucrados`,
          dto,
        )
        .pipe(map((r) => r.data));
    }

    const nuevo: Involucrado = {
      id: Date.now(),
      nombreCompleto: nombre,
      tipoInvolucrado: 'ESTUDIANTE',
      rolInvolucrado: dto.rolInvolucrado,
      observaciones: dto.observaciones,
    };

    involucradosMock(
      this.enMock(incidenteId),
    ).push(nuevo);

    return of(nuevo).pipe(delay(300));
  }

  retirarInvolucrado(
    incidenteId: string,
    involucradoId: number,
    motivo: string,
  ): Observable<void> {
    if (!environment.mock.incidentes) {
      return this.http
        .delete<ApiResponse<void>>(
          `${this.url(incidenteId)}/involucrados/${involucradoId}`,
          { body: { motivo } },
        )
        .pipe(map(() => undefined));
    }

    const lista = involucradosMock(
      this.enMock(incidenteId),
    );

    const pos = lista.findIndex(
      (p) => p.id === involucradoId,
    );

    if (pos >= 0) {
      lista.splice(pos, 1);
    }

    return this.ok();
  }

  // ====================================================
  // ESTADOS DEL INCIDENTE
  // ====================================================

  transiciones(
    id: string,
  ): Observable<EstadoIncidente[]> {
    if (!environment.mock.incidentes) {
      return this.http
        .get<ApiResponse<EstadoIncidente[]>>(
          `${this.url(id)}/transiciones`,
        )
        .pipe(map((r) => r.data));
    }

    return of(
      SIGUIENTES[this.enMock(id).estado] ?? [],
    ).pipe(delay(200));
  }

  cambiarEstado(
    id: string,
    nuevoEstado: EstadoIncidente,
    motivo: string,
  ): Observable<void> {
    if (!environment.mock.incidentes) {
      return this.http
        .patch(`${this.url(id)}/estado`, {
          nuevoEstado,
          motivo,
        })
        .pipe(map(() => undefined));
    }

    this.enMock(id).estado = nuevoEstado;

    return this.ok();
  }

  clasificarGravedad(
    id: string,
    gravedad: Gravedad,
    justificacion: string,
  ): Observable<void> {
    if (!environment.mock.incidentes) {
      return this.http
        .patch(`${this.url(id)}/gravedad`, {
          gravedad,
          justificacion,
        })
        .pipe(map(() => undefined));
    }

    this.enMock(id).gravedad = gravedad;

    return this.ok();
  }

  // ====================================================
  // RESOLUCIÓN Y CIERRE
  // ====================================================

  resolver(
    id: string,
    observaciones?: string,
  ): Observable<void> {
    if (!environment.mock.incidentes) {
      return this.http
        .post(`${this.url(id)}/resolucion`, {
          observaciones,
        })
        .pipe(map(() => undefined));
    }

    this.enMock(id).estado = 'RESUELTO';

    extra(id, {
      fechaResolucion: new Date().toISOString(),
      resueltoPorNombre: 'Psicólogo de prueba',
    });

    return this.ok();
  }

  checklistCierre(
    id: string,
  ): Observable<CierreChecklist> {
    if (!environment.mock.incidentes) {
      return this.http
        .get<ApiResponse<CierreChecklist>>(
          `${this.url(id)}/cierre/checklist`,
        )
        .pipe(map((r) => r.data));
    }

    return of({
      todasLasAccionesCompletadas: true,
      apoderadosNotificados: true,
      actaCierrePresente: false,
      cumplePlazosLegales: true,
      listoParaCierre: true,
      observacionesPendientes: [],
    }).pipe(delay(200));
  }

  cerrar(
    id: string,
    actaCierre: string,
    conclusionesFinales: string,
  ): Observable<void> {
    if (!environment.mock.incidentes) {
      return this.http
        .post(`${this.url(id)}/cierre`, {
          actaCierre,
          conclusionesFinales,
        })
        .pipe(map(() => undefined));
    }

    this.enMock(id).estado = 'CERRADO';

    extra(id, {
      actaCierre,
      conclusionesFinales,
      fechaCierre: new Date().toISOString(),
      cerradoPorNombre: 'Administrador de prueba',
    });

    return this.ok();
  }

  // ====================================================
  // DERIVACIÓN A SÍSEVE
  // ====================================================

  derivarSiseve(
    id: string,
    codigoSiseve: string,
    fechaReporteSiseve: string,
    observacionesSiseve?: string,
  ): Observable<void> {
    if (!environment.mock.incidentes) {
      return this.http
        .post(`${this.url(id)}/derivacion-siseve`, {
          codigoSiseve,
          fechaReporteSiseve,
          observacionesSiseve,
        })
        .pipe(map(() => undefined));
    }

    extra(id, {
      reportadoSiseve: true,
      codigoSiseve,
      fechaReporteSiseve,
      observacionesSiseve,
      derivadoPorNombre: 'Administrador de prueba',
    });

    return this.ok();
  }

  // ====================================================
  // EVIDENCIAS Y ARCHIVOS
  // ====================================================

  subirEvidencia(
    incidenteId: string,
    archivo: File,
    descripcion: string,
  ): Observable<Adjunto> {
    if (!environment.mock.incidentes) {
      const fd = new FormData();

      fd.append(
        'datos',
        new Blob(
          [JSON.stringify({ descripcion })],
          { type: 'application/json' },
        ),
      );

      fd.append('archivo', archivo);

      return this.http
        .post<ApiResponse<Adjunto>>(
          `${environment.apiUrl}/incidentes/${incidenteId}/adjuntos`,
          fd,
        )
        .pipe(map((r) => r.data));
    }

    return from(sha256(archivo)).pipe(
      delay(300),
      map((hash) => {
        const lista =
          EVIDENCIAS_MOCK.get(incidenteId) ?? [];

        if (lista.some((a) => a.hashSha256 === hash)) {
          throw new Error(
            'Este archivo ya está registrado en el caso',
          );
        }

        const nuevo: Adjunto = {
          id: Date.now(),
          nombreOriginal: archivo.name,
          descripcion,
          tipoMime:
            archivo.type || 'application/octet-stream',
          tamanoBytes: archivo.size,
          hashSha256: hash,
          subidoPorNombre: 'Usuario de prueba',
          createdAt: new Date().toISOString(),
        };

        EVIDENCIAS_MOCK.set(
          incidenteId,
          [...lista, nuevo],
        );

        ARCHIVOS_MOCK.set(nuevo.id, archivo);

        return nuevo;
      }),
    );
  }

  urlDescarga(
    adjuntoId: number,
    minutos = 15,
  ): Observable<string> {
    if (!environment.mock.incidentes) {
      const params = new HttpParams().set(
        'minutos',
        minutos,
      );

      return this.http
        .get<
          ApiResponse<{ urlDescargaTemporal: string }>
        >(
          `${environment.apiUrl}/adjuntos/${adjuntoId}/descarga`,
          { params },
        )
        .pipe(
          map((r) => r.data.urlDescargaTemporal),
        );
    }

    const f = ARCHIVOS_MOCK.get(adjuntoId);

    return f
      ? of(URL.createObjectURL(f))
      : throwError(
          () => new Error('Archivo no disponible en el mock'),
        );
  }

  verificarIntegridad(
    adjuntoId: number,
  ): Observable<{ integro: boolean }> {
    if (!environment.mock.incidentes) {
      return this.http
        .get<ApiResponse<{ integro: boolean }>>(
          `${environment.apiUrl}/adjuntos/${adjuntoId}/integridad`,
        )
        .pipe(map((r) => r.data));
    }

    return of({ integro: true }).pipe(delay(300));
  }

  eliminarEvidencia(
    incidenteId: string,
    adjuntoId: number,
    motivoEliminacion: string,
  ): Observable<void> {
    if (!environment.mock.incidentes) {
      return this.http
        .delete(
          `${environment.apiUrl}/adjuntos/${adjuntoId}`,
          { body: { motivoEliminacion } },
        )
        .pipe(map(() => undefined));
    }

    EVIDENCIAS_MOCK.set(
      incidenteId,
      (EVIDENCIAS_MOCK.get(incidenteId) ?? []).filter(
        (a) => a.id !== adjuntoId,
      ),
    );

    ARCHIVOS_MOCK.delete(adjuntoId);

    return of(undefined).pipe(delay(300));
  }
}
