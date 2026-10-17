import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TipoIncidenciaForm } from './tipo-incidencia-form';

describe('TipoIncidenciaForm', () => {
  let component: TipoIncidenciaForm;
  let fixture: ComponentFixture<TipoIncidenciaForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TipoIncidenciaForm],
    }).compileComponents();

    fixture = TestBed.createComponent(TipoIncidenciaForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
