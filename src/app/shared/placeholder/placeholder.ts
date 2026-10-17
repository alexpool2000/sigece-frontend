import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-placeholder',
  template: `<h2>{{ titulo }}</h2><p>Pantalla pendiente de implementar.</p>`,
})
export class Placeholder {
  titulo = inject(ActivatedRoute).snapshot.data['titulo'];
}