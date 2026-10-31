import { Component, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import Swal from 'sweetalert2';

import { Apoderado, ApoderadoRequest } from '../../../core/models/apoderado.models';
import { TIPOS_DOCUMENTO, TipoDocumento } from '../../../core/models/enums';
import { ApoderadoApi } from '../../../core/services/apoderado-api';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-apoderado-form',
  imports: [ReactiveFormsModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule, MatIconModule],
  templateUrl: './apoderado-form.html',
  styleUrl: './apoderado-form.css',
})
export class ApoderadoForm {
  private fb = inject(FormBuilder);
  private api = inject(ApoderadoApi);
  private ref = inject(MatDialogRef<ApoderadoForm>);
  datos = inject<Apoderado | null>(MAT_DIALOG_DATA);

  readonly tipos = TIPOS_DOCUMENTO;
  guardando = signal(false);
  backendError = signal<string | null>(null);

  form = this.fb.nonNullable.group({
    nombres: [this.datos?.nombres ?? '', [Validators.required, Validators.maxLength(100)]],
    apellidos: [this.datos?.apellidos ?? '', [Validators.required, Validators.maxLength(100)]],
    tipoDocumento: [(this.datos?.tipoDocumento ?? 'DNI') as TipoDocumento, Validators.required],
    numeroDocumento: [this.datos?.numeroDocumento ?? '', [Validators.required, Validators.minLength(8), Validators.maxLength(15)]],
    telefono: [this.datos?.telefono ?? '', [Validators.required, Validators.maxLength(20)]],
    correo: [this.datos?.correo ?? '', [Validators.email, Validators.maxLength(150)]],
  });

  constructor() {
    if (this.datos) {
      ['nombres', 'apellidos', 'tipoDocumento', 'numeroDocumento'].forEach(c => this.form.get(c)!.disable());
    }
  }

  guardar() {
    this.backendError.set(null);
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.guardando.set(true);
    const v = this.form.getRawValue();
    const dto: ApoderadoRequest = { ...v, correo: v.correo || null };
    const req$ = this.datos ? this.api.actualizarContacto(this.datos.id, dto) : this.api.registrar(dto);

    req$.subscribe({
      next: () => {
        this.guardando.set(false);

        // Alerta de éxito con SweetAlert2
        Swal.fire({
          icon: 'success',
          title: '¡Éxito!',
          text: 'Apoderado guardado correctamente',
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
    const mensajeGeneral = body?.message ?? 'Ocurrió un error al guardar el apoderado';
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