import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTabsModule } from '@angular/material/tabs';
import { RouterModule } from '@angular/router';
import { AlertService } from '../../core/services/alert.service'; // Ajusta la ruta a tu AlertService
import { CambioPasswordRequestDto } from '../../core/models/auth.model';
import { Auth } from '../../core/auth/auth';

export const passwordMatchValidator: ValidatorFn = (
  control: AbstractControl
): ValidationErrors | null => {
  const password = control.get('nuevoPassword');
  const confirm = control.get('confirmacionPassword');
  if (password && confirm && password.value !== confirm.value) {
    return { passwordMismatch: true };
  }
  return null;
};

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatFormFieldModule,
    MatInputModule,
    MatChipsModule,
  ],
  templateUrl: './perfil.html',
  styleUrl: './perfil.css',
})
export class Perfil implements OnInit {
  private readonly auth = inject(Auth);
  private readonly alert = inject(AlertService);
  private readonly fb = inject(FormBuilder);

  // Estados reactivos
  usuario = signal<any>(null);
  estado = signal<'cargando' | 'exito' | 'error'>('cargando');
  guardandoPassword = signal(false);

  // Visibilidad de contraseñas
  ocultarActual = signal(true);
  ocultarNuevo = signal(true);
  ocultarConfirmar = signal(true);

  // Formulario reactivo
  formPassword: FormGroup = this.fb.group(
    {
      passwordActual: ['', [Validators.required]],
      nuevoPassword: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(50)]],
      confirmacionPassword: ['', [Validators.required]],
    },
    { validators: passwordMatchValidator }
  );

  ngOnInit(): void {
    this.cargarPerfil();
  }

  cargarPerfil(): void {
    // 1. Carga inmediata desde LocalStorage
    const localUser = localStorage.getItem('usuario');
    if (localUser) {
      try {
        const parsed = JSON.parse(localUser);
        this.usuario.set(parsed);
        this.estado.set('exito');
      } catch (e) {
        console.error('Error parseando usuario local', e);
      }
    }

    // 2. Sincronización en segundo plano con el servidor
    this.auth.cargarPerfil().subscribe({
      next: (datos) => {
        this.usuario.set(datos);
        this.estado.set('exito');
      },
      error: () => {
        if (!this.usuario()) {
          this.estado.set('error');
        }
      },
    });
  }

  obtenerNombreRol(rol: any): string {
    if (!rol) return 'USUARIO';
    if (typeof rol === 'string') return rol.replace('ROLE_', '');
    if (typeof rol === 'object' && rol.nombre) return rol.nombre.replace('ROLE_', '');
    return 'USUARIO';
  }

  cambiarPassword(): void {
    if (this.formPassword.invalid || this.guardandoPassword()) {
      this.formPassword.markAllAsTouched();
      return;
    }

    this.guardandoPassword.set(true);

    const dto: CambioPasswordRequestDto = {
      passwordActual: this.formPassword.value.passwordActual,
      nuevoPassword: this.formPassword.value.nuevoPassword,
      confirmacionPassword: this.formPassword.value.confirmacionPassword,
    };

    this.auth.cambiarPassword(dto).subscribe({
      next: async () => {
        this.guardandoPassword.set(false);
        this.formPassword.reset();

        // 1. Mostrar mensaje de SweetAlert con botón de confirmación
        await this.alert.exitoConConfirmacion(
          '¡Contraseña actualizada con éxito!',
          'Por motivos de seguridad, tu sesión ha finalizado. Por favor, inicia sesión con tu nueva contraseña.',
          'Iniciar sesión'
        );

        // 2. Limpia el LocalStorage (tokens y usuario) y redirige a /login
        this.auth.logout();
      },
      error: (err) => {
        this.guardandoPassword.set(false);
        const mensaje =
          err?.error?.message ||
          err?.error?.mensaje ||
          'No se pudo actualizar la contraseña. Verifica tu clave actual.';
        
        // Alerta de error de SweetAlert
        this.alert.error(mensaje, 'Error al cambiar contraseña');
      },
    });
  }
}