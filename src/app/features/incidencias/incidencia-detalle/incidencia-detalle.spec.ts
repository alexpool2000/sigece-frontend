import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IncidenciaDetalle } from './incidencia-detalle';

describe('IncidenciaDetalle', () => {
  let component: IncidenciaDetalle;
  let fixture: ComponentFixture<IncidenciaDetalle>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IncidenciaDetalle],
    }).compileComponents();

    fixture = TestBed.createComponent(IncidenciaDetalle);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
