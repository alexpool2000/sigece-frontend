import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IncidenciaForm } from './incidencia-form';

describe('IncidenciaForm', () => {
  let component: IncidenciaForm;
  let fixture: ComponentFixture<IncidenciaForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IncidenciaForm],
    }).compileComponents();

    fixture = TestBed.createComponent(IncidenciaForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
