import { Component, inject } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-motivo-dialog',
  imports: [ReactiveFormsModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatButtonModule],
  templateUrl: './motivo-dialog.html',
  styleUrl: './motivo-dialog.css',
})
export class MotivoDialog {
  data = inject<{ titulo: string; etiqueta: string; confirmar?: string }>(MAT_DIALOG_DATA);
  private ref = inject(MatDialogRef<MotivoDialog>);
  motivo = new FormControl('', [Validators.required, Validators.maxLength(255)]);

  aceptar() {
    if (this.motivo.valid) this.ref.close(this.motivo.value!.trim());
  }
}