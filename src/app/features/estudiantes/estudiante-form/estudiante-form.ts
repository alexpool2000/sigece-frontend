import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Nivel, NIVELES } from '../../../core/models/enums';
import { Estudiante, EstudianteRequest } from '../../../core/models/estudiante.models';
import { EstudianteApi } from '../../../core/services/estudiante-api';

@Component({
  selector: 'app-estudiante-form',
  imports: [ReactiveFormsModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule],
  templateUrl: './estudiante-form.html',
  styleUrl: './estudiante-form.css',
})
export class EstudianteForm {
  private fb = inject(FormBuilder);
  private api = inject(EstudianteApi);
  private ref = inject(MatDialogRef<EstudianteForm>);
  private snack = inject(MatSnackBar);
  datos = inject<Estudiante | null>(MAT_DIALOG_DATA);

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
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.guardando.set(true);
    const dto = this.form.getRawValue() as EstudianteRequest;
    const req$ = this.datos ? this.api.actualizar(this.datos.id, dto) : this.api.registrar(dto);
    req$.subscribe({
      next: () => { this.snack.open('Estudiante guardado', 'Cerrar', { duration: 3000 }); this.ref.close(true); },
      error: () => this.guardando.set(false), // el interceptor ya mostró el mensaje del backend
    });
  }
}