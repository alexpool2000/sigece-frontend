import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { UsuarioApi } from '../../../core/services/usuario-api';
import {
  RolResponseDto,
  UsuarioMantenimientoResponseDto,
  UsuarioRegistroRequestDto,
  UsuarioRequestDto,
} from '../../../core/models/usuario.models';

@Component({
  selector: 'app-usuario-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './usuario-form.html',
  styleUrl: './usuario-form.css',
})
export class UsuarioForm implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(UsuarioApi);
  private readonly ref = inject(MatDialogRef<UsuarioForm>);
  private readonly snack = inject(MatSnackBar);

  readonly datos = inject<UsuarioMantenimientoResponseDto | null>(MAT_DIALOG_DATA);

  readonly guardando = signal(false);
  readonly roles = signal<RolResponseDto[]>([]);
  readonly ocultarPassword = signal(true);

  readonly form = this.fb.nonNullable.group({
    nombres: [this.datos?.nombres ?? '', [Validators.required, Validators.maxLength(100)]],
    apellidos: [this.datos?.apellidos ?? '', [Validators.required, Validators.maxLength(100)]],
    dni: [this.datos?.dni ?? '', [Validators.required, Validators.pattern(/^[0-9]{8,15}$/)]],
    username: [this.datos?.username ?? '', [Validators.required, Validators.maxLength(50)]],
    password: ['', !this.datos ? [Validators.required, Validators.minLength(8)] : []],
    correo: [this.datos?.correo ?? '', [Validators.required, Validators.email, Validators.maxLength(150)]],
    telefono: [this.datos?.telefono ?? '', [Validators.maxLength(20)]],
    roleId: [this.datos?.rol?.id ?? (null as unknown as number), [Validators.required]],
    activo: [this.datos?.activo ?? true, [Validators.required]],
  });

  constructor() {
    // Si es edición, se bloquean los campos inmutables (DNI, Username)
    if (this.datos) {
      this.form.get('dni')?.disable();
      this.form.get('username')?.disable();
      this.form.get('password')?.disable();
    }
  }

  ngOnInit(): void {
    // Cargamos el catálogo de roles
    this.api.listarRoles().subscribe({
      next: (res) => this.roles.set(res.data),
      error: () => this.snack.open('Error al cargar roles', 'Cerrar', { duration: 3000 }),
    });
  }

  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.guardando.set(true);
    const val = this.form.getRawValue();

    if (this.datos) {
      // Flujo de Actualización
      const dtoUpdate: UsuarioRequestDto = {
        nombres: val.nombres,
        apellidos: val.apellidos,
        correo: val.correo,
        telefono: val.telefono || null,
        roleId: Number(val.roleId),
        activo: val.activo,
      };

      this.api.actualizarPerfil(this.datos.id, dtoUpdate).subscribe({
        next: () => {
          this.snack.open('Usuario actualizado exitosamente', 'Cerrar', { duration: 3000 });
          this.ref.close(true);
        },
        error: () => this.guardando.set(false),
      });
    } else {
      // Flujo de Registro Nuevo
      const dtoCreate: UsuarioRegistroRequestDto = {
        nombres: val.nombres,
        apellidos: val.apellidos,
        dni: val.dni,
        username: val.username,
        password: val.password,
        correo: val.correo,
        telefono: val.telefono || null,
        roleId: Number(val.roleId),
      };

      this.api.registrarUsuario(dtoCreate).subscribe({
        next: () => {
          this.snack.open('Usuario registrado exitosamente', 'Cerrar', { duration: 3000 });
          this.ref.close(true);
        },
        error: () => this.guardando.set(false),
      });
    }
  }
}