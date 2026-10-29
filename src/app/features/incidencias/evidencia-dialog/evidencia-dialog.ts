import { Component, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-evidencia-dialog',
  imports: [ReactiveFormsModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule],
  templateUrl: './evidencia-dialog.html',
  styleUrl: './evidencia-dialog.css',
})
export class EvidenciaDialog {
  private ref = inject(MatDialogRef<EvidenciaDialog>);
  private readonly maxBytes = 10 * 1024 * 1024;

  archivo = signal<File | null>(null);
  errorArchivo = signal('');
  descripcion = new FormControl('', [Validators.required, Validators.minLength(3), Validators.maxLength(500)]);

  elegir(ev: Event) {
    const f = (ev.target as HTMLInputElement).files?.[0] ?? null;
    if (f && f.size > this.maxBytes) {
      this.archivo.set(null);
      this.errorArchivo.set('El archivo supera los 10 MB.');
      return;
    }
    this.errorArchivo.set('');
    this.archivo.set(f);
  }

  guardar() {
    if (this.archivo() && this.descripcion.valid) {
      this.ref.close({ archivo: this.archivo(), descripcion: this.descripcion.value!.trim() });
    }
  }
}