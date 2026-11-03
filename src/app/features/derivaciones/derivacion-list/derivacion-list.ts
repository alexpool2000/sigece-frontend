import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';

import { GRAVEDADES } from '../../../core/models/enums';
import { AlertService } from '../../../core/services/alert.service';
import { SiseveDerivacionResponse, SiseveEvaluacion, SisevePendiente } from '../../../core/models/siseve-api.models';


@Component({
  selector: 'app-derivacion-list',
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    ReactiveFormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './derivacion-list.html',
  styleUrl: './derivacion-list.css',
})
export class DerivacionList {
  private readonly fb = inject(FormBuilder);
  private readonly alert = inject(AlertService);

  readonly gravedades = GRAVEDADES;

  // Columnas separadas según la bandeja
  readonly columnasPendientes = ['codigo', 'fecha', 'tipo', 'gravedad', 'plazo', 'alertas', 'acciones'];
  readonly columnasDerivadas = ['codigo', 'codigoSiseve', 'fechaReporte', 'derivadoPor', 'observaciones'];

  // Estados
  bandeja = signal<'PENDIENTES' | 'DERIVADOS'>('PENDIENTES');
  cargando = signal(false);
  guardando = signal(false);

  filtro = signal({
    texto: '',
    gravedad: '',
    urgente: '',
    pagina: 0,
    tamano: 10,
  });

  // Datos crudos del backend
  listaPendientes = signal<SisevePendiente[]>([]);
  listaDerivadas = signal<SiseveDerivacionResponse[]>([]);

  // Modales
  casoAEvaluar = signal<SiseveEvaluacion | null>(null);
  casoADerivar = signal<SisevePendiente | null>(null);

  // Formulario reactivo para derivación
  formDerivacion: FormGroup = this.fb.group({
    codigoSiseve: ['', [Validators.required]],
    modoDerivacion: ['MANUAL_PORTAL', [Validators.required]],
    observacionesSiseve: [''],
  });

  // ================= COMPUTED SEPARADOS Y ESTRICTAMENTE TIPADOS =================

  // 1. Paginado para Pendientes
  pendientesPaginados = computed<SisevePendiente[]>(() => {
    const texto = this.filtro().texto.toLowerCase().trim();
    const grav = this.filtro().gravedad;
    const urg = this.filtro().urgente;

    const filtrados = this.listaPendientes().filter((item) => {
      const matchTexto =
        !texto ||
        item.codigoCaso?.toLowerCase().includes(texto) ||
        item.tipoIncidenciaNombre?.toLowerCase().includes(texto);
      const matchGravedad = !grav || item.gravedad === grav;
      const matchUrgente =
        !urg ||
        (urg === 'urgente' && item.diasTranscurridos >= 1) ||
        (urg === 'en_plazo' && item.diasTranscurridos === 0);

      return matchTexto && matchGravedad && matchUrgente;
    });

    const inicio = this.filtro().pagina * this.filtro().tamano;
    return filtrados.slice(inicio, inicio + this.filtro().tamano);
  });

  // 2. Paginado para Derivadas
  derivadasPaginadas = computed<SiseveDerivacionResponse[]>(() => {
    const texto = this.filtro().texto.toLowerCase().trim();

    const filtrados = this.listaDerivadas().filter((item) => {
      return (
        !texto ||
        item.codigoCaso?.toLowerCase().includes(texto) ||
        item.codigoSiseve?.toLowerCase().includes(texto) ||
        (item.derivadoPor ?? '').toLowerCase().includes(texto)
      );
    });

    const inicio = this.filtro().pagina * this.filtro().tamano;
    return filtrados.slice(inicio, inicio + this.filtro().tamano);
  });

  totalElementos = computed(() => {
    return this.bandeja() === 'PENDIENTES'
      ? this.listaPendientes().length
      : this.listaDerivadas().length;
  });

  // ================= MÉTODOS =================

  cambiarBandeja(nuevaBandeja: 'PENDIENTES' | 'DERIVADOS'): void {
    this.bandeja.set(nuevaBandeja);
    this.filtro.update((f) => ({ ...f, pagina: 0 }));
  }

  cambiar(parcial: Partial<{ texto: string; gravedad: string; urgente: string }>): void {
    this.filtro.update((f) => ({ ...f, ...parcial, pagina: 0 }));
  }

  paginar(e: PageEvent): void {
    this.filtro.update((f) => ({ ...f, pagina: e.pageIndex, tamano: e.pageSize }));
  }

  abrirEvaluacion(caso: SisevePendiente): void {
    // Si tienes un endpoint para evaluar, llámalo aquí. Ejemplo visual:
    this.casoAEvaluar.set({
      codigoCaso: caso.codigoCaso,
      derivacionObligatoria: caso.gravedad === 'GRAVE' || caso.gravedad === 'MUY_GRAVE',
      recomendacionTecnica:
        caso.gravedad === 'GRAVE'
          ? 'El protocolo SíSeVe exige derivación obligatoria en menos de 24 horas por gravedad reportada.'
          : 'Derivación preventiva sugerida según criterio pedagógico.',
      baseLegal: 'D.S. N° 004-2018-MINEDU - Lineamientos para la Gestión de la Convivencia Escolar.',
    } as SiseveEvaluacion);
  }

  cerrarEvaluacion(): void {
    this.casoAEvaluar.set(null);
  }

  abrirDerivar(caso: SisevePendiente): void {
    this.casoADerivar.set(caso);
    this.formDerivacion.reset({
      codigoSiseve: '',
      modoDerivacion: 'MANUAL_PORTAL',
      observacionesSiseve: '',
    });
  }

  cerrarDerivar(): void {
    this.casoADerivar.set(null);
  }

  async confirmarDerivacion(): Promise<void> {
    if (this.formDerivacion.invalid || this.guardando()) {
      this.formDerivacion.markAllAsTouched();
      return;
    }

    const caso = this.casoADerivar();
    if (!caso) return;

    const val = this.formDerivacion.value;

    const confirmar = await this.alert.confirmar(
      `¿Registrar derivación a SíSeVe?`,
      `El caso ${caso.codigoCaso} quedará registrado con el código SíSeVe: ${val.codigoSiseve}`,
      'Sí, registrar derivación'
    );

    if (!confirmar) return;

    this.guardando.set(true);

    // Aquí invocas tu servicio API de derivación
    // Ejemplo: this.siseveApi.derivar(caso.incidenteId, val).subscribe(...)
    setTimeout(() => {
      this.guardando.set(false);
      this.cerrarDerivar();
      this.alert.exito('Caso derivado exitosamente', `Código SíSeVe asignado: ${val.codigoSiseve}`);
    }, 600);
  }
}