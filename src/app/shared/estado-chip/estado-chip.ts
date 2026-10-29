import { Component, input } from '@angular/core';
import { EstadoIncidente } from '../../core/models/enums';

const COLOR: Record<EstadoIncidente, string> = {
  REGISTRADO: '#546e7a', EN_INVESTIGACION: '#1565c0', EN_SEGUIMIENTO: '#6a1b9a',
  RESUELTO: '#2e7d32', CERRADO: '#37474f',
};

@Component({
  selector: 'app-estado-chip',
  template: `<span class="chip" [style.background]="color()">{{ valor().replaceAll('_', ' ') }}</span>`,
  styles: `.chip { color: #fff; padding: 2px 10px; border-radius: 12px; font-size: 12px; font-weight: 500; white-space: nowrap; }`,
})
export class EstadoChip {
  valor = input.required<EstadoIncidente>();
  color = () => COLOR[this.valor()];
}