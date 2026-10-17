import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { DatePipe } from '@angular/common';
import { Auth } from '../../../core/auth/auth';
import { VinculoFamiliar } from '../../../core/models/apoderado.models';
import { PerfilEstudiante } from '../../../core/models/estudiante.models';
import { ApoderadoApi } from '../../../core/services/apoderado-api';
import { EstudianteApi } from '../../../core/services/estudiante-api';
import { AsignarApoderado } from '../asignar-apoderado/asignar-apoderado';

@Component({
  selector: 'app-estudiante-perfil',
  imports: [RouterLink, DatePipe, MatCardModule, MatTableModule, MatButtonModule, MatIconModule],
  templateUrl: './estudiante-perfil.html',
  styleUrl: './estudiante-perfil.css',
})
export class EstudiantePerfil {
  private route = inject(ActivatedRoute);
  private api = inject(EstudianteApi);
  private apoderadoApi = inject(ApoderadoApi);
  private dialog = inject(MatDialog);
  private snack = inject(MatSnackBar);

  readonly id = Number(this.route.snapshot.paramMap.get('id'));
  readonly puedeEditar = inject(Auth).tieneRol(['ROLE_ADMIN', 'ROLE_DIRECTOR', 'ROLE_TUTOR', 'ROLE_PSICOLOGO']);
  readonly columnas = ['nombre', 'documento', 'parentesco', 'contacto', 'principal', 'acciones'];

  perfil = signal<PerfilEstudiante | null>(null);
  error = signal(false);

  constructor() { this.cargar(); }

  cargar() {
    this.api.perfil(this.id).subscribe({
      next: p => { this.perfil.set(p); this.error.set(false); },
      error: () => this.error.set(true),
    });
  }

  asignar() {
    const tienePrincipal = this.perfil()?.apoderados.some(a => a.esContactoPrincipal) ?? false;
    this.dialog.open(AsignarApoderado, { width: '560px', data: { estudianteId: this.id, tienePrincipal } })
      .afterClosed().subscribe(ok => ok && this.cargar());
  }

  hacerPrincipal(v: VinculoFamiliar) {
    this.apoderadoApi.marcarPrincipal(v.apoderadoId, this.id).subscribe(() => {
      this.snack.open('Contacto principal actualizado', 'Cerrar', { duration: 3000 });
      this.cargar();
    });
  }

  quitar(v: VinculoFamiliar) {
    if (!confirm(`¿Quitar a ${v.nombreApoderado} como apoderado?`)) return;
    this.api.desasignarApoderado(this.id, v.apoderadoId).subscribe(() => {
      this.snack.open('Apoderado desvinculado', 'Cerrar', { duration: 3000 });
      this.cargar();
    });
  }
}