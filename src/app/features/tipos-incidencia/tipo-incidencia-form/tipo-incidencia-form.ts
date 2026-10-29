import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CATEGORIAS_SISEVE, CategoriaSiseve, GRAVEDADES, Gravedad } from '../../../core/models/enums';
import { TipoIncidencia, TipoIncidenciaRequest } from '../../../core/models/tipo-incidencia.models';
import { TipoIncidenciaApi } from '../../../core/services/tipo-incidencia-api';

@Component({
  selector: 'app-tipo-incidencia-form',
  imports: [ReactiveFormsModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule],
  templateUrl: './tipo-incidencia-form.html',
  styleUrl: './tipo-incidencia-form.css',
})
export class TipoIncidenciaForm {
  private fb = inject(FormBuilder);
  private api = inject(TipoIncidenciaApi);
  private ref = inject(MatDialogRef<TipoIncidenciaForm>);
  private snack = inject(MatSnackBar);
  datos = inject<TipoIncidencia | null>(MAT_DIALOG_DATA);

  readonly categorias = CATEGORIAS_SISEVE;
  readonly gravedades = GRAVEDADES;
  
  guardando = signal(false);

  form = this.fb.nonNullable.group({
    nombre: [this.datos?.nombre ?? '', [Validators.required, Validators.maxLength(100)]],
    categoriaSiseve: [(this.datos?.categoriaSiseve ?? '') as CategoriaSiseve | '', Validators.required],
    descripcion: [this.datos?.descripcion ?? '', Validators.maxLength(255)],
    gravedadBase: [(this.datos?.gravedadBase ?? 'LEVE') as Gravedad, Validators.required],
  });

  guardar() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.guardando.set(true);
    const v = this.form.getRawValue();
    const dto: TipoIncidenciaRequest = { nombre: v.nombre, categoriaSiseve: v.categoriaSiseve as CategoriaSiseve, gravedadBase: v.gravedadBase, descripcion: v.descripcion || null };
    const req$ = this.datos ? this.api.actualizar(this.datos.id, dto) : this.api.crear(dto);
    req$.subscribe({
      next: () => { this.snack.open('Tipo de incidencia guardado', 'Cerrar', { duration: 3000 }); this.ref.close(true); },
      error: () => this.guardando.set(false), // el interceptor muestra el mensaje del backend (p. ej. 409 si ya existe)
    });
  }
}