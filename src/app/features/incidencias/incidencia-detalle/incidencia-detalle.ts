
import { DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import {
  Observable,
  catchError,
  filter,
  map,
  of,
  switchMap,
  tap,
} from 'rxjs';

import { Auth } from '../../../core/auth/auth';
import { GRAVEDADES } from '../../../core/models/enums';
import {
  Adjunto,
  Involucrado,
} from '../../../core/models/incidente.models';
import { IncidenteApi } from '../../../core/services/incidente-api';
import { AccionSeguimientoApi } from '../../../core/services/accion-seguimiento-api';

import {
  AccionData,
  AccionDialog,
} from '../../../shared/accion-dialog/accion-dialog';
import { EstadoChip } from '../../../shared/estado-chip/estado-chip';
import { GravedadChip } from '../../../shared/gravedad-chip/gravedad-chip';
import { MotivoDialog } from '../../../shared/motivo-dialog/motivo-dialog';

import { InvolucradoDialog } from '../involucrado-dialog/involucrado-dialog';
import { EvidenciaDialog } from '../evidencia-dialog/evidencia-dialog';

@Component({
  selector: 'app-incidencia-detalle',
  imports: [
    DatePipe,
    RouterLink,
    MatTabsModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    GravedadChip,
    EstadoChip,
  ],
  templateUrl: './incidencia-detalle.html',
  styleUrl: './incidencia-detalle.css',
})
export class IncidenciaDetalle {
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(IncidenteApi);
  private readonly accionesApi = inject(AccionSeguimientoApi);
  private readonly dialog = inject(MatDialog);
  private readonly snack = inject(MatSnackBar);
  private readonly auth = inject(Auth);



  private readonly id = this.route.snapshot.paramMap.get('id')!;
  private readonly recarga = signal(0);

  readonly puedeEditar = this.auth.tieneRol([
    'ROLE_TUTOR',
    'ROLE_PSICOLOGO',
  ]);

  readonly puedeGestionar = this.auth.tieneRol([
    'ROLE_ADMINISTRADOR',
    'ROLE_PSICOLOGO',
  ]);

  readonly esAdmin = this.auth.tieneRol(['ROLE_ADMINISTRADOR']);
  readonly esPsicologo = this.auth.tieneRol(['ROLE_PSICOLOGO']);

  readonly columnasInvolucrados: string[] = this.puedeEditar
    ? ['rol', 'nombre', 'documento', 'observaciones', 'acciones']
    : ['rol', 'nombre', 'documento', 'observaciones'];

  readonly columnasEvidencias: string[] = [
    'archivo',
    'tamano',
    'subido',
    'acciones',
  ];

  readonly columnasSeguimiento: string[] = [
    'fecha',
    'tipo',
    'descripcion',
    'usuario',
    'revision',
    'estado',
  ];

  readonly columnasNotificaciones: string[] = [
    'tipo',
    'apoderado',
    'canal',
    'envio',
    'estado',
  ];

  readonly estado = signal<'cargando' | 'ok' | 'error'>('cargando');

  tamano(bytes: number): string {
    return bytes >= 1048576
      ? (bytes / 1048576).toFixed(1) + ' MB'
      : Math.max(1, Math.round(bytes / 1024)) + ' KB';
  }


  readonly expediente = toSignal(
    toObservable(this.recarga).pipe(
      switchMap(() =>
        this.api.obtener(this.id).pipe(
          switchMap((expediente) => {
            if (!expediente) {
              return of(null);
            }

            return this.accionesApi
              .listarPorIncidente(this.id)
              .pipe(
                map((seguimiento) => ({
                  ...expediente,
                  seguimiento,
                })),
                catchError(() => of(expediente)),
              );
          }),
          tap((expediente) => {
            if (expediente) {
              this.estado.set('ok');
            }
          }),
          catchError(() => {
            this.estado.set('error');
            return of(null);
          }),
        ),
      ),
    ),
    { initialValue: null },
  );

  /** Estados a los que se puede pasar manualmente.
   * Resolver y cerrar tienen sus propios botones.
   */
  readonly transiciones = toSignal(
    toObservable(this.recarga).pipe(
      switchMap(() =>
        this.api.transiciones(this.id).pipe(
          catchError(() => of([])),
        ),
      ),
      map((lista) =>
        lista.filter(
          (estado) => estado !== 'RESUELTO' && estado !== 'CERRADO',
        ),
      ),
    ),
    { initialValue: [] },
  );

  private refrescar(mensaje: string): void {
    this.snack.open(mensaje, 'Cerrar', { duration: 3000 });
    this.recarga.update((n) => n + 1);
  }

  // ---------- Involucrados ----------

  agregarInvolucrado(): void {
    this.dialog
      .open(InvolucradoDialog, { width: '520px' })
      .afterClosed()
      .pipe(
        filter(Boolean),
        switchMap((r: any) =>
          this.api.agregarInvolucrado(this.id, r.dto, r.nombre),
        ),
      )
      .subscribe(() => this.refrescar('Involucrado agregado'));
  }

  retirar(p: Involucrado): void {
    this.dialog
      .open(MotivoDialog, {
        width: '480px',
        data: {
          titulo: `Retirar a ${p.nombreCompleto}`,
          etiqueta: 'Motivo del retiro',
          confirmar: 'Retirar',
        },
      })
      .afterClosed()
      .pipe(
        filter(Boolean),
        switchMap((motivo: string) =>
          this.api.retirarInvolucrado(this.id, p.id, motivo),
        ),
      )
      .subscribe(() => this.refrescar('Involucrado retirado'));
  }

  // ---------- Evidencias ----------

  subirEvidencia(): void {
    this.dialog
      .open(EvidenciaDialog, { width: '520px' })
      .afterClosed()
      .pipe(
        filter(Boolean),
        switchMap((r: any) =>
          this.api.subirEvidencia(this.id, r.archivo, r.descripcion),
        ),
      )
      .subscribe({
        next: () => this.refrescar('Evidencia subida'),
        error: (e) =>
          this.snack.open(
            e?.error?.error?.message ??
            e?.message ??
            'No se pudo subir la evidencia',
            'Cerrar',
            { duration: 5000 },
          ),
      });
  }

  descargar(a: Adjunto): void {
    this.api.urlDescarga(a.id).subscribe({
      next: (url) => window.open(url, '_blank'),
      error: (e) =>
        this.snack.open(
          e?.message ?? 'No se pudo generar la descarga',
          'Cerrar',
          { duration: 4000 },
        ),
    });
  }

  verificar(a: Adjunto): void {
    this.api.verificarIntegridad(a.id).subscribe((r) =>
      this.snack.open(
        r.integro
          ? 'El archivo coincide con su hash SHA-256'
          : 'El archivo no coincide con su hash registrado',
        'Cerrar',
        { duration: 6000 },
      ),
    );
  }

  eliminarEvidencia(a: Adjunto): void {
    this.dialog
      .open(MotivoDialog, {
        width: '480px',
        data: {
          titulo: `Eliminar ${a.nombreOriginal}`,
          etiqueta: 'Motivo de eliminación',
          confirmar: 'Eliminar',
        },
      })
      .afterClosed()
      .pipe(
        filter(Boolean),
        switchMap((motivo: string) =>
          this.api.eliminarEvidencia(this.id, a.id, motivo),
        ),
      )
      .subscribe(() => this.refrescar('Evidencia eliminada'));
  }



  registrarAccionSeguimiento(): void {
    this.abrir(
      {
        titulo: 'Registrar acción de seguimiento',
        confirmar: 'Registrar acción',
        campos: [
          {
            nombre: 'tipoAccion',
            etiqueta: 'Tipo de acción',
            tipo: 'select',
            requerido: true,
            opciones: [
              {
                valor: 'ENTREVISTA_ESTUDIANTE',
                texto: 'Entrevista al estudiante',
              },
              {
                valor: 'ENTREVISTA_PADRES',
                texto: 'Entrevista a los padres',
              },
              {
                valor: 'CITACION_APODERADO',
                texto: 'Citación al apoderado',
              },
              {
                valor: 'DERIVACION_PSICOLOGIA',
                texto: 'Derivación a psicología',
              },
              {
                valor: 'MEDIDA_CORRECTIVA_FORMATIVA',
                texto: 'Medida correctiva o formativa',
              },
              {
                valor: 'DERIVACION_DEMUNA_CEM',
                texto: 'Derivación a DEMUNA/CEM',
              },
              {
                valor: 'ACTA_COMPROMISO',
                texto: 'Acta de compromiso',
              },
              {
                valor: 'APUNTE_INTERNO',
                texto: 'Apunte interno',
              },
              {
                valor: 'OTRO',
                texto: 'Otro',
              },
            ],
          },
          {
            nombre: 'descripcion',
            etiqueta: 'Descripción de la acción',
            tipo: 'area',
            requerido: true,
            minimo: 5,
          },
          {
            nombre: 'fechaProgramada',
            etiqueta: 'Fecha y hora programadas',
            tipo: 'fecha',
            requerido: false,
          },
        ],
      },
      (v) =>
        this.accionesApi
          .registrar(this.id, {
            tipoAccion: v.tipoAccion,
            descripcion: v.descripcion,
            fechaProgramada: v.fechaProgramada
              ? new Date(v.fechaProgramada).toISOString()
              : null,
          })
          .pipe(map(() => undefined)),
      'Acción de seguimiento registrada',
    );
  }



  // ---------- Acciones sobre el caso ----------

  private abrir(
    data: AccionData,
    llamada: (v: any) => Observable<void>,
    ok: string,
  ): void {
    this.dialog
      .open(AccionDialog, { data, width: '520px' })
      .afterClosed()
      .pipe(
        filter(Boolean),
        switchMap(llamada),
      )
      .subscribe(() => this.refrescar(ok));
  }

  cambiarEstado(): void {
    this.abrir(
      {
        titulo: 'Cambiar estado',
        confirmar: 'Cambiar estado',
        campos: [
          {
            nombre: 'nuevoEstado',
            etiqueta: 'Nuevo estado',
            tipo: 'select',
            requerido: true,
            opciones: this.transiciones().map((e) => ({
              valor: e,
              texto: e.replaceAll('_', ' '),
            })),
          },
          {
            nombre: 'motivo',
            etiqueta: 'Motivo',
            tipo: 'area',
            requerido: true,
          },
        ],
      },
      (v) => this.api.cambiarEstado(this.id, v.nuevoEstado, v.motivo),
      'Estado actualizado',
    );
  }

  cambiarGravedad(actual: string): void {
    this.abrir(
      {
        titulo: 'Cambiar gravedad',
        campos: [
          {
            nombre: 'gravedad',
            etiqueta: 'Gravedad',
            tipo: 'select',
            requerido: true,
            valor: actual,
            opciones: GRAVEDADES.map((g) => ({
              valor: g,
              texto: g.replace('_', ' '),
            })),
          },
          {
            nombre: 'justificacion',
            etiqueta: 'Justificación',
            tipo: 'area',
            requerido: true,
          },
        ],
      },
      (v) =>
        this.api.clasificarGravedad(
          this.id,
          v.gravedad,
          v.justificacion,
        ),
      'Gravedad actualizada',
    );
  }

  resolver(): void {
    this.abrir(
      {
        titulo: 'Marcar como resuelto',
        mensaje: 'El caso queda resuelto y a la espera del cierre con acta.',
        confirmar: 'Marcar como resuelto',
        campos: [
          {
            nombre: 'observaciones',
            etiqueta: 'Observaciones (opcional)',
            tipo: 'area',
          },
        ],
      },
      (v) => this.api.resolver(this.id, v.observaciones || undefined),
      'Caso resuelto',
    );
  }

  cerrar(): void {
    // El backend decide si permite cerrar el caso.
    this.api.checklistCierre(this.id).subscribe((c) => {
      const mensaje = c.observacionesPendientes.length
        ? 'Pendiente antes de cerrar:\n- ' +
        c.observacionesPendientes.join('\n- ')
        : 'El cierre es definitivo. Registra el acta y las conclusiones.';

      this.abrir(
        {
          titulo: 'Cerrar caso',
          mensaje,
          confirmar: 'Cerrar caso',
          campos: [
            {
              nombre: 'actaCierre',
              etiqueta: 'Acta de cierre',
              tipo: 'area',
              requerido: true,
              minimo: 10,
            },
            {
              nombre: 'conclusionesFinales',
              etiqueta: 'Conclusiones finales',
              tipo: 'area',
              requerido: true,
            },
          ],
        },
        (v) =>
          this.api.cerrar(
            this.id,
            v.actaCierre,
            v.conclusionesFinales,
          ),
        'Caso cerrado',
      );
    });
  }

  derivarSiseve(): void {
    this.abrir(
      {
        titulo: 'Registrar derivación a SíSeVe',
        campos: [
          {
            nombre: 'codigoSiseve',
            etiqueta: 'Código SíSeVe',
            tipo: 'texto',
            requerido: true,
          },
          {
            nombre: 'fecha',
            etiqueta: 'Fecha y hora del reporte',
            tipo: 'fecha',
            requerido: true,
          },
          {
            nombre: 'observaciones',
            etiqueta: 'Observaciones (opcional)',
            tipo: 'area',
          },
        ],
      },
      (v) =>
        this.api.derivarSiseve(
          this.id,
          v.codigoSiseve,
          new Date(v.fecha).toISOString(),
          v.observaciones || undefined,
        ),
      'Derivación registrada',
    );
  }
}
