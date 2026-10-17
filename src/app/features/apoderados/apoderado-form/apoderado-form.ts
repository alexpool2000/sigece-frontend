import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Apoderado, ApoderadoRequest } from '../../../core/models/apoderado.models';
import { TIPOS_DOCUMENTO, TipoDocumento } from '../../../core/models/enums';
import { ApoderadoApi } from '../../../core/services/apoderado-api';

@Component({
  selector: 'app-apoderado-form',
  imports: [ReactiveFormsModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule],
  templateUrl: './apoderado-form.html',
  styleUrl: './apoderado-form.css',
})
export class ApoderadoForm {
  private fb = inject(FormBuilder);
  private api = inject(ApoderadoApi);
  private ref = inject(MatDialogRef<ApoderadoForm>);
  private snack = inject(MatSnackBar);
  datos = inject<Apoderado | null>(MAT_DIALOG_DATA);

  readonly tipos = TIPOS_DOCUMENTO;
  guardando = signal(false);

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
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.guardando.set(true);
    const v = this.form.getRawValue();
    const dto: ApoderadoRequest = { ...v, correo: v.correo || null };
    const req$ = this.datos ? this.api.actualizarContacto(this.datos.id, dto) : this.api.registrar(dto);
    req$.subscribe({
      next: () => { this.snack.open('Apoderado guardado', 'Cerrar', { duration: 3000 }); this.ref.close(true); },
      error: () => this.guardando.set(false),
    });
  }
}