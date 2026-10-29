import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { Auth } from '../../../core/auth/auth';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private fb = inject(FormBuilder);
  private auth = inject(Auth);
  private router = inject(Router);

  form = this.fb.nonNullable.group({
    username: ['', Validators.required],
    password: ['', Validators.required],
  });
  ver = signal(false);
  cargando = signal(false);
  error = signal('');

  entrar() {
  this.cargando.set(true);
  this.error.set('');
  this.auth.login(this.form.getRawValue()).subscribe({
    next: async r => {
      const destino = r.usuario.rol === 'ROLE_ADMINISTRADOR' ? '/dashboard' : '/incidencias';
      const ok = await this.router.navigate([destino]);
      console.log('Login OK. Navegación a', destino, '→', ok);
      if (!ok) {
        this.cargando.set(false);
        this.error.set('No se pudo abrir la pantalla inicial');
      }
    },
    error: e => {
      console.error('Login falló', e);
      this.cargando.set(false);
      this.error.set(e.status === 403 ? 'Cuenta desactivada' : 'Usuario o contraseña incorrectos');
    },
  });
}
}