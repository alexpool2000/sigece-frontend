import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

import { CATEGORIAS_SISEVE, CategoriaSiseve, GRAVEDADES, Gravedad } from '../../../core/models/enums';
import { TipoIncidencia, TipoIncidenciaRequest } from '../../../core/models/tipo-incidencia.models';
import { TipoIncidenciaApi } from '../../../core/services/tipo-incidencia-api';
import { AlertService } from '../../../core/services/alert.service';

@Component({
  selector: 'app-tipo-incidencia-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
  ],
  templateUrl: './tipo-incidencia-form.html',
  styleUrl: './tipo-incidencia-form.css',
})
export class TipoIncidenciaForm {
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(TipoIncidenciaApi);
  private readonly ref = inject(MatDialogRef<TipoIncidenciaForm>);
  private readonly alert = inject(AlertService);

  readonly datos = inject<TipoIncidencia | null>(MAT_DIALOG_DATA);

  readonly categorias = CATEGORIAS_SISEVE;
  readonly gravedades = GRAVEDADES;

  guardando = signal(false);

  form = this.fb.nonNullable.group({
    nombre: [
      this.datos?.nombre ?? '',
      [Validators.required, Validators.minLength(3), Validators.maxLength(100)],
    ],
    categoriaSiseve: [
      (this.datos?.categoriaSiseve ?? '') as CategoriaSiseve | '',
      Validators.required,
    ],
    descripcion: [
      this.datos?.descripcion ?? '',
      [Validators.maxLength(255)],
    ],
    gravedadBase: [
      (this.datos?.gravedadBase ?? 'LEVE') as Gravedad,
      Validators.required,
    ],
  });

  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.alert.aviso(
        'Por favor completa correctamente todos los campos obligatorios.',
        'Formulario incompleto'
      );
      return;
    }

    this.guardando.set(true);
    const v = this.form.getRawValue();

    const dto: TipoIncidenciaRequest = {
      nombre: v.nombre.trim(),
      categoriaSiseve: v.categoriaSiseve as CategoriaSiseve,
      gravedadBase: v.gravedadBase,
      descripcion: v.descripcion?.trim() || null,
    };

    const req$ = this.datos
      ? this.api.actualizar(this.datos.id, dto)
      : this.api.crear(dto);

    req$.subscribe({
      next: () => {
        this.guardando.set(false);

        // Notificación de éxito con SweetAlert2
        this.alert.exito(
          this.datos ? 'Tipo actualizado' : 'Tipo registrado',
          `"${dto.nombre}" fue guardado exitosamente en el catálogo.`
        );

        this.ref.close(true);
      },
      error: (err) => {
        this.guardando.set(false);
        const errorMsg =
          err?.error?.message ??
          err?.error?.mensaje ??
          err?.message ??
          'Ocurrió un error al guardar el tipo de incidencia.';

        // Modal de error de SweetAlert2 (ej. 409 conflicto si el nombre ya existe)
        this.alert.error(errorMsg, 'Error al guardar');
      },
    });
  }

  async cancelar(): Promise<void> {
    if (this.form.dirty) {
      const confirmar = await this.alert.confirmarPeligro(
        '¿Deseas cancelar?',
        'Tienes cambios sin guardar que se perderán.',
        'Sí, salir'
      );
      if (confirmar) {
        this.ref.close(false);
      }
    } else {
      this.ref.close(false);
    }
  }
}