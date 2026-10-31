import { Component, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import Swal from 'sweetalert2'; // <-- Importar SweetAlert2

import { Nivel, NIVELES } from '../../../core/models/enums';
import { Estudiante, EstudianteRequest } from '../../../core/models/estudiante.models';
import { EstudianteApi } from '../../../core/services/estudiante-api';

@Component({
  selector: 'app-estudiante-form',
  imports: [
    ReactiveFormsModule, MatDialogModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatButtonModule, MatIconModule,
  ],
  templateUrl: './estudiante-form.html',
  styleUrl: './estudiante-form.css',
})
export class EstudianteForm {
  private fb = inject(FormBuilder);
  private api = inject(EstudianteApi);
  private ref = inject(MatDialogRef<EstudianteForm>);

  datos = inject<Estudiante | null>(MAT_DIALOG_DATA);
  backendError = signal<string | null>(null);

  readonly niveles = NIVELES;
  readonly maxFecha = (() => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  })();
  guardando = signal(false);

  form = this.fb.nonNullable.group({
    codigoSiagie: [this.datos?.codigoSiagie ?? '', [Validators.required, Validators.maxLength(20)]],
    nombres: [this.datos?.nombres ?? '', [Validators.required, Validators.maxLength(100)]],
    apellidos: [this.datos?.apellidos ?? '', [Validators.required, Validators.maxLength(100)]],
    fechaNacimiento: [this.datos?.fechaNacimiento ?? '', Validators.required],
    nivel: [(this.datos?.nivel ?? '') as Nivel | '', Validators.required],
    grado: [this.datos?.grado ?? '', [Validators.required, Validators.maxLength(20)]],
    seccion: [this.datos?.seccion ?? '', [Validators.required, Validators.maxLength(10)]],
  });

  guardar() {
    this.backendError.set(null);                          
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.guardando.set(true);
    const dto = this.form.getRawValue() as EstudianteRequest;
    const req$ = this.datos ? this.api.actualizar(this.datos.id, dto) : this.api.registrar(dto);
    
    req$.subscribe({
      next: () => {
        this.guardando.set(false);
        
        // Alerta de éxito con SweetAlert2
        Swal.fire({
          icon: 'success',
          title: '¡Éxito!',
          text: 'Estudiante guardado correctamente',
          timer: 2000,
          showConfirmButton: false
        });

        this.ref.close(true);
      },
      error: (err: HttpErrorResponse) => {
        this.guardando.set(false);
        this.manejarError(err);
      },
    });
  }

  // Método de cancelación con confirmación de SweetAlert2
  cancelar() {
    if (this.form.dirty) {
      Swal.fire({
        title: '¿Deseas salir?',
        text: 'Tienes cambios sin guardar que se perderán.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, salir',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33'
      }).then((result) => {
        if (result.isConfirmed) {
          this.ref.close();
        }
      });
    } else {
      this.ref.close();
    }
  }

  private manejarError(err: HttpErrorResponse) {
    const body = err.error;

    // 1) Errores por campo
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

    // 2) Mensaje general
    const mensajeGeneral = body?.message ?? 'Ocurrió un error al guardar el estudiante';
    this.backendError.set(mensajeGeneral);

    // Alerta de error general con SweetAlert2
    Swal.fire({
      icon: 'error',
      title: 'Atención',
      text: mensajeGeneral,
      confirmButtonText: 'Entendido'
    });
  }

  // Helper para el template
  errorBackend(campo: string): string | null {
    return this.form.get(campo)?.getError('backend') ?? null;
  }
}