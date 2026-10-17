import { Component, input } from '@angular/core';
import { Gravedad } from '../../core/models/enums';

const COLOR: Record<Gravedad, string> = { LEVE: '#2e7d32', MODERADA: '#f9a825', GRAVE: '#ef6c00', MUY_GRAVE: '#c62828' };

@Component({
  selector: 'app-gravedad-chip',
  template: `<span class="chip" [style.background]="color()">{{ valor().replace('_', ' ') }}</span>`,
  styles: `.chip { color: #fff; padding: 2px 10px; border-radius: 12px; font-size: 12px; font-weight: 500; white-space: nowrap; }`,
})
export class GravedadChip {
  valor = input.required<Gravedad>();
  color = () => COLOR[this.valor()];
}