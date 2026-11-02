import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { DatePipe } from '@angular/common';

import { Auth } from '../../../core/auth/auth';
import { VinculoFamiliar } from '../../../core/models/apoderado.models';
import { PerfilEstudiante } from '../../../core/models/estudiante.models';
import { ApoderadoApi } from '../../../core/services/apoderado-api';
import { EstudianteApi } from '../../../core/services/estudiante-api';
import { AlertService } from '../../../core/services/alert.service';
import { AsignarApoderado } from '../asignar-apoderado/asignar-apoderado';

@Component({
  selector: 'app-estudiante-perfil',
  standalone: true,
  imports: [
    RouterLink,
    DatePipe,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './estudiante-perfil.html',
  styleUrl: './estudiante-perfil.css',
})
export class EstudiantePerfil {
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(EstudianteApi);
  private readonly apoderadoApi = inject(ApoderadoApi);
  private readonly dialog = inject(MatDialog);
  private readonly alert = inject(AlertService);

  readonly id = Number(this.route.snapshot.paramMap.get('id'));
  readonly puedeEditar = inject(Auth).tieneRol(['ROLE_ADMINISTRADOR']);
  readonly columnas = ['nombre', 'documento', 'parentesco', 'contacto', 'principal', 'acciones'];

  perfil = signal<PerfilEstudiante | null>(null);
  error = signal(false);

  constructor() {
    this.cargar();
  }

  cargar(): void {
    this.api.perfil(this.id).subscribe({
      next: (p) => {
        this.perfil.set(p);
        this.error.set(false);
      },
      error: () => this.error.set(true),
    });
  }

  asignar(): void {
    const tienePrincipal = this.perfil()?.apoderados.some((a) => a.esContactoPrincipal) ?? false;

    this.dialog
      .open(AsignarApoderado, {
        width: '560px',
        data: { estudianteId: this.id, tienePrincipal },
      })
      .afterClosed()
      .subscribe((ok) => {
        if (ok) {
          this.alert.exito('Apoderado asignado', 'El apoderado se vinculó correctamente al estudiante.');
          this.cargar();
        }
      });
  }

  async hacerPrincipal(v: VinculoFamiliar): Promise<void> {
    const confirmar = await this.alert.confirmar(
      '¿Designar contacto principal?',
      `¿Deseas establecer a ${v.nombreApoderado} como el contacto principal para las notificaciones y avisos?`,
      'Sí, designar'
    );

    if (!confirmar) return;

    this.apoderadoApi.marcarPrincipal(v.apoderadoId, this.id).subscribe({
      next: () => {
        this.alert.exito(
          'Contacto principal actualizado',
          `${v.nombreApoderado} es ahora el contacto principal del estudiante.`
        );
        this.cargar();
      },
      error: (err) => {
        const errorMsg =
          err?.error?.message ??
          err?.error?.mensaje ??
          err?.message ??
          'No se pudo actualizar el contacto principal.';
        this.alert.error(errorMsg, 'Error al actualizar');
      },
    });
  }

  async quitar(v: VinculoFamiliar): Promise<void> {
    const confirmado = await this.alert.confirmarPeligro(
      `¿Desvincular a ${v.nombreApoderado}?`,
      'El apoderado dejará de estar asociado a este estudiante.',
      'Sí, desvincular'
    );

    if (!confirmado) return;

    this.api.desasignarApoderado(this.id, v.apoderadoId).subscribe({
      next: () => {
        this.alert.exito(
          'Apoderado desvinculado',
          `${v.nombreApoderado} fue retirado de la ficha del estudiante.`
        );
        this.cargar();
      },
      error: (err) => {
        const errorMsg =
          err?.error?.message ??
          err?.error?.mensaje ??
          err?.message ??
          'No se pudo desvincular al apoderado.';
        this.alert.error(errorMsg, 'Error al desvincular');
      },
    });
  }
}