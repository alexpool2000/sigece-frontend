import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';

import { UsuarioApi } from '../../../core/services/usuario-api';
import { AlertService } from '../../../core/services/alert.service';
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
  private readonly alert = inject(AlertService);

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
    // Si es edición, se bloquean los campos inmutables (DNI, Username, Password)
    if (this.datos) {
      this.form.get('dni')?.disable();
      this.form.get('username')?.disable();
      this.form.get('password')?.disable();
    }
  }

  ngOnInit(): void {
    // Cargamos el catálogo de roles disponibles
    this.api.listarRoles().subscribe({
      next: (res) => this.roles.set(res.data),
      error: () => this.alert.error('No se pudo cargar el listado de roles institucionales.'),
    });
  }

  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.alert.aviso(
        'Por favor completa correctamente todos los campos obligatorios.',
        'Formulario incompleto'
      );
      return;
    }

    this.guardando.set(true);
    const val = this.form.getRawValue();

    if (this.datos) {
      // 1. Flujo de Actualización
      const dtoUpdate: UsuarioRequestDto = {
        nombres: val.nombres.trim(),
        apellidos: val.apellidos.trim(),
        correo: val.correo.trim(),
        telefono: val.telefono?.trim() || null,
        roleId: Number(val.roleId),
        activo: val.activo,
      };

      this.api.actualizarPerfil(this.datos.id, dtoUpdate).subscribe({
        next: () => {
          this.guardando.set(false);
          this.alert.exito(
            'Usuario actualizado',
            `Los datos del usuario @${this.datos?.username} se guardaron exitosamente.`
          );
          this.ref.close(true);
        },
        error: (err) => {
          this.guardando.set(false);
          const errorMsg =
            err?.error?.message ??
            err?.error?.mensaje ??
            err?.message ??
            'No se pudo actualizar el usuario.';
          this.alert.error(errorMsg, 'Error al actualizar');
        },
      });
    } else {
      // 2. Flujo de Registro Nuevo
      const dtoCreate: UsuarioRegistroRequestDto = {
        nombres: val.nombres.trim(),
        apellidos: val.apellidos.trim(),
        dni: val.dni.trim(),
        username: val.username.trim(),
        password: val.password,
        correo: val.correo.trim(),
        telefono: val.telefono?.trim() || null,
        roleId: Number(val.roleId),
      };

      this.api.registrarUsuario(dtoCreate).subscribe({
        next: () => {
          this.guardando.set(false);
          this.alert.exito(
            'Usuario registrado',
            `La cuenta institucional @${dtoCreate.username} fue creada con éxito.`
          );
          this.ref.close(true);
        },
        error: (err) => {
          this.guardando.set(false);
          const errorMsg =
            err?.error?.message ??
            err?.error?.mensaje ??
            err?.message ??
            'No se pudo registrar al nuevo usuario.';
          this.alert.error(errorMsg, 'Error al registrar');
        },
      });
    }
  }

  async cancelar(): Promise<void> {
    if (this.form.dirty) {
      const confirmar = await this.alert.confirmarPeligro(
        '¿Deseas salir del formulario?',
        'Hay información sin guardar que se perderá.',
        'Sí, salir'
      );
      if (confirmar) {
        this.ref.close(false);
      }
    } else {
      this.ref.close(false);
    }
  }
}