import { Component, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { AbstractControl, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { catchError, debounceTime, map, of, startWith, switchMap } from 'rxjs';
import { Apoderado } from '../../../core/models/apoderado.models';
import { PARENTESCOS, Parentesco } from '../../../core/models/enums';
import { ApoderadoApi } from '../../../core/services/apoderado-api';
import { EstudianteApi } from '../../../core/services/estudiante-api';

const seleccionValida = (c: AbstractControl) => (typeof c.value === 'object' && c.value ? null : { seleccion: true });

@Component({
  selector: 'app-asignar-apoderado',
  imports: [ReactiveFormsModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatAutocompleteModule, MatCheckboxModule, MatButtonModule],
  templateUrl: './asignar-apoderado.html',
  styleUrl: './asignar-apoderado.css',
})
export class AsignarApoderado {
  private fb = inject(FormBuilder);
  private apoderadoApi = inject(ApoderadoApi);
  private estudianteApi = inject(EstudianteApi);
  private ref = inject(MatDialogRef<AsignarApoderado>);
  private snack = inject(MatSnackBar);
  data = inject<{ estudianteId: number; tienePrincipal: boolean }>(MAT_DIALOG_DATA);

  readonly parentescos = PARENTESCOS;
  guardando = signal(false);

  form = this.fb.nonNullable.group({
    apoderado: [null as Apoderado | string | null, seleccionValida],
    parentesco: ['PADRE' as Parentesco, Validators.required],
    esContactoPrincipal: [!this.data.tienePrincipal],
  });

  constructor() {
    // Solo puede haber un contacto principal por estudiante
    if (this.data.tienePrincipal) this.form.controls.esContactoPrincipal.disable();
  }

  opciones = toSignal(
    this.form.controls.apoderado.valueChanges.pipe(
      startWith(''),
      debounceTime(300),
      map(v => (typeof v === 'string' ? v : '')),
      switchMap(t => this.apoderadoApi.buscar({ termino: t, tipoDocumento: '', page: 0, size: 8 }).pipe(
        map(r => r.content), catchError(() => of([] as Apoderado[])))),
    ),
    { initialValue: [] as Apoderado[] },
  );

  mostrar = (a: Apoderado | string | null) =>
    a && typeof a === 'object' ? `${a.apellidos}, ${a.nombres} · ${a.numeroDocumento}` : '';

  guardar() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.guardando.set(true);
    const v = this.form.getRawValue();
    this.estudianteApi.asignarApoderado(this.data.estudianteId, {
      apoderadoId: (v.apoderado as Apoderado).id,
      parentesco: v.parentesco,
      esContactoPrincipal: v.esContactoPrincipal,
    }).subscribe({
      next: () => { this.snack.open('Apoderado asignado', 'Cerrar', { duration: 3000 }); this.ref.close(true); },
      error: () => this.guardando.set(false),
    });
  }
}