
import { Component, inject } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

export interface CampoAccion {
  nombre: string;
  etiqueta: string;
  tipo: 'texto' | 'area' | 'select' | 'fecha';
  requerido?: boolean;
  minimo?: number;
  valor?: string;
  opciones?: { valor: string; texto: string }[];
}

export interface AccionData {
  titulo: string;
  mensaje?: string;
  confirmar?: string;
  campos: CampoAccion[];
}

@Component({
  selector: 'app-accion-dialog',
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
  ],
  templateUrl: './accion-dialog.html',
  styleUrl: './accion-dialog.css',
})
export class AccionDialog {
  data = inject<AccionData>(MAT_DIALOG_DATA);
  private ref = inject(MatDialogRef<AccionDialog>);

  form = new FormGroup(
    Object.fromEntries(
      this.data.campos.map((c) => {
        const validadores = [];

        if (c.requerido) {
          validadores.push(Validators.required);
        }

        if (c.minimo) {
          validadores.push(Validators.minLength(c.minimo));
        }

        return [
          c.nombre,
          new FormControl(c.valor ?? '', validadores),
        ];
      }),
    ),
  );

  constructor() {
    const tipoAccion = this.form.get('tipoAccion');
    const fechaProgramada = this.form.get('fechaProgramada');

    // Estos campos solo existen en el formulario de seguimiento.
    if (!tipoAccion || !fechaProgramada) {
      return;
    }

    const tiposQueRequierenFecha = [
      'ENTREVISTA_ESTUDIANTE',
      'ENTREVISTA_PADRES',
      'CITACION_APODERADO',
    ];

    const actualizarValidacion = (tipo: string | null) => {
      const requiereFecha = tiposQueRequierenFecha.includes(tipo ?? '');

      if (requiereFecha) {
        fechaProgramada.setValidators([Validators.required]);
      } else {
        fechaProgramada.clearValidators();
      }

      fechaProgramada.updateValueAndValidity();
    };

    // Aplicar la validación inicial.
    actualizarValidacion(tipoAccion.value);

    // Actualizar la validación al cambiar el tipo de acción.
    tipoAccion.valueChanges.subscribe((tipo) => {
      actualizarValidacion(tipo);
    });
  }

  aceptar(): void {
    if (this.form.valid) {
      this.ref.close(this.form.getRawValue());
    }
  }
}
