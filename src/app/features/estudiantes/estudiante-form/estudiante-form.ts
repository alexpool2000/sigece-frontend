import { Component, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

import { Nivel, NIVELES } from '../../../core/models/enums';
import { Estudiante, EstudianteRequest } from '../../../core/models/estudiante.models';
import { EstudianteApi } from '../../../core/services/estudiante-api';
import { AlertService } from '../../../core/services/alert.service';

// Validador personalizado para asegurar que la fecha sea en el pasado (@Past)
export const fechaPasadaValidator: ValidatorFn = (
  control: AbstractControl
): ValidationErrors | null => {
  if (!control.value) return null;
  const fechaIngresada = new Date(control.value + 'T00:00:00');
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  if (fechaIngresada >= hoy) {
    return { fechaFutura: true };
  }
  return null;
};

@Component({
  selector: 'app-estudiante-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './estudiante-form.html',
  styleUrl: './estudiante-form.css',
})
export class EstudianteForm {
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(EstudianteApi);
  private readonly alert = inject(AlertService);
  private readonly ref = inject(MatDialogRef<EstudianteForm>);

  readonly datos = inject<Estudiante | null>(MAT_DIALOG_DATA);
  readonly backendError = signal<string | null>(null);
  readonly guardando = signal(false);

  readonly niveles = NIVELES;

  // Límite HTML para el input date (hasta el día de ayer)
  readonly maxFecha = (() => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    const anio = d.getFullYear();
    const mes = String(d.getMonth() + 1).padStart(2, '0');
    const dia = String(d.getDate()).padStart(2, '0');
    return `${anio}-${mes}-${dia}`;
  })();

  // Formulario con validaciones equivalentes al EstudianteRequestDto del backend
  form = this.fb.nonNullable.group({
    codigoSiagie: [
      this.datos?.codigoSiagie ?? '',
      [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(20),
        Validators.pattern(/^[a-zA-Z0-9\-_]+$/), // Alfanumérico sin caracteres extraños
      ],
    ],
    nombres: [
      this.datos?.nombres ?? '',
      [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(100),
      ],
    ],
    apellidos: [
      this.datos?.apellidos ?? '',
      [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(100),
      ],
    ],
    fechaNacimiento: [
      this.datos?.fechaNacimiento ?? '',
      [Validators.required, fechaPasadaValidator],
    ],
    nivel: [
      (this.datos?.nivel ?? '') as Nivel | '',
      [Validators.required],
    ],
    grado: [
      this.datos?.grado ?? '',
      [
        Validators.required,
        Validators.minLength(1),
        Validators.maxLength(20),
      ],
    ],
    seccion: [
      this.datos?.seccion ?? '',
      [
        Validators.required,
        Validators.minLength(1),
        Validators.maxLength(10),
      ],
    ],
  });

  guardar(): void {
    this.backendError.set(null);

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.alert.aviso(
        'Por favor completa correctamente todos los campos obligatorios.',
        'Formulario incompleto'
      );
      return;
    }

    this.guardando.set(true);

    // Sanitización (.trim() para evitar espacios en blanco accidentales)
    const raw = this.form.getRawValue();
    const dto: EstudianteRequest = {
      codigoSiagie: raw.codigoSiagie.trim(),
      nombres: raw.nombres.trim(),
      apellidos: raw.apellidos.trim(),
      fechaNacimiento: raw.fechaNacimiento,
      nivel: raw.nivel as Nivel,
      grado: raw.grado.trim(),
      seccion: raw.seccion.trim().toUpperCase(),
    };

    const req$ = this.datos
      ? this.api.actualizar(this.datos.id, dto)
      : this.api.registrar(dto);

    req$.subscribe({
      next: () => {
        this.guardando.set(false);

        // Notificación de éxito con AlertService
        this.alert.exito(
          this.datos ? '¡Estudiante actualizado!' : '¡Estudiante registrado!',
          'Los datos se guardaron correctamente en el padrón.'
        );

        this.ref.close(true);
      },
      error: (err: HttpErrorResponse) => {
        this.guardando.set(false);
        this.manejarError(err);
      },
    });
  }

  async cancelar(): Promise<void> {
    if (this.form.dirty) {
      // Confirmación con AlertService (SweetAlert2) si hay datos modificados
      const confirmarSalida = await this.alert.confirmarPeligro(
        '¿Deseas cancelar?',
        'Tienes cambios sin guardar que se perderán definitivamente.',
        'Sí, salir'
      );

      if (confirmarSalida) {
        this.ref.close(false);
      }
    } else {
      this.ref.close(false);
    }
  }

  private manejarError(err: HttpErrorResponse): void {
    const body = err.error;

    // 1) Asignar errores específicos devueltos por el backend a cada campo
    const errores = body?.errors as Record<string, string> | undefined;
    if (errores && typeof errores === 'object') {
      for (const [campo, mensaje] of Object.entries(errores)) {
        const control = this.form.get(campo);
        if (control) {
          control.setErrors({ backend: mensaje });
          control.markAsTouched();
        }
      }
    }

    // 2) Extraer mensaje general de error
    const mensajeGeneral =
      body?.message ??
      body?.mensaje ??
      'Ocurrió un error al intentar guardar el estudiante.';

    this.backendError.set(mensajeGeneral);

    // Modal de error de SweetAlert2 con AlertService
    this.alert.error(mensajeGeneral, 'Error al procesar solicitud');
  }

  // Helper para mostrar mensajes de error del backend en la vista
  errorBackend(campo: string): string | null {
    return this.form.get(campo)?.getError('backend') ?? null;
  }
}