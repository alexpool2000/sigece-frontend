import { Component, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { catchError, finalize, of } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpErrorResponse } from '@angular/common/http';
import { GRAVEDADES, Gravedad } from '../../../core/models/enums';
import { IncidenteApi } from '../../../core/services/incidente-api';
import { TipoIncidenciaApi } from '../../../core/services/tipo-incidencia-api';

/** Fecha y hora local en el formato de <input type="datetime-local"> */
const ahoraLocal = () => {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
};
const fechaNoFutura = (control: import('@angular/forms').AbstractControl) => {
  if (!control.value) return null;

  const fecha = new Date(control.value).getTime();
  const ahora = Date.now();

  if (Number.isNaN(fecha)) {
    return { fechaInvalida: true };
  }

  return fecha > ahora ? { fechaFutura: true } : null;
};

@Component({
  selector: 'app-incidencia-form',
  imports: [
    ReactiveFormsModule, RouterLink, MatFormFieldModule, MatInputModule, MatSelectModule,
    MatSlideToggleModule, MatButtonModule,
  ],
  templateUrl: './incidencia-form.html',
  styleUrl: './incidencia-form.css',
})
export class IncidenciaForm {
  private fb = inject(FormBuilder);
  private api = inject(IncidenteApi);
  private tiposApi = inject(TipoIncidenciaApi);
  private router = inject(Router);
  private snack = inject(MatSnackBar);

  readonly gravedades = GRAVEDADES;
  readonly maxFecha = ahoraLocal();

  guardando = signal(false);


  readonly errorTipos = signal(false);
  readonly cargandoTipos = signal(true);

  tipos = toSignal(
    this.tiposApi.listarActivos().pipe(
      catchError(() => {
        this.errorTipos.set(true);
        return of([]);
      }),
      finalize(() => this.cargandoTipos.set(false))
    ),
    { initialValue: [] }
  );


  form = this.fb.nonNullable.group({
    tipoIncidenciaId: [null as number | null, Validators.required],
    gravedad: ['', Validators.required],
    fechaOcurrencia: [
      ahoraLocal(),
      [Validators.required, fechaNoFutura],
    ],
    medioOcurrencia: ['PRESENCIAL', Validators.required],
    lugarOcurrencia: [
      '',
      [
        Validators.required,
        Validators.pattern(/\S/),
        Validators.maxLength(150),
      ],
    ],
    descripcion: [
      '',
      [
        Validators.required,
        Validators.pattern(/\S/),
        Validators.maxLength(2000),
      ],
    ],

    notificarApoderado: [false],
  });

  alElegirTipo(id: number) {
    const base = this.tipos().find((t) => t.id === id)?.gravedadBase;
    if (base) this.form.patchValue({ gravedad: base });
  }

  guardar() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    const tipo = this.tipos().find((t) => t.id === v.tipoIncidenciaId);
    this.guardando.set(true);

    this.api
      .registrar(
        {
          tipoIncidenciaId: v.tipoIncidenciaId!,
          gravedad: v.gravedad as Gravedad,
          descripcion: v.descripcion,
          lugarOcurrencia: v.lugarOcurrencia,
          medioOcurrencia: v.medioOcurrencia as 'PRESENCIAL' | 'DIGITAL',
          fechaOcurrencia: new Date(v.fechaOcurrencia).toISOString(),
          notificarApoderado: v.notificarApoderado,
        },
        tipo?.nombre,
      )

      .subscribe({
        next: (inc) => {
          this.snack.open(
            `Incidencia ${inc.codigoCaso} registrada`,
            'Cerrar',
            { duration: 4000 }
          );
          this.router.navigate(['/incidencias', inc.id]);
        },
        error: (error: HttpErrorResponse) => {
          this.guardando.set(false);

          let mensaje = 'No se pudo registrar la incidencia. Inténtalo nuevamente.';

          if (error.status === 0) {
            mensaje = 'No se pudo conectar con el servidor. Verifica tu conexión.';
          } else if (error.error?.message) {
            mensaje = error.error.message;
          } else if (error.status === 400) {
            mensaje = 'Los datos enviados no son válidos. Revisa el formulario.';
          } else if (error.status === 401 || error.status === 403) {
            mensaje = 'No tienes autorización para registrar esta incidencia.';
          }

          this.snack.open(mensaje, 'Cerrar', { duration: 5000 });
        },
      });

  }
}