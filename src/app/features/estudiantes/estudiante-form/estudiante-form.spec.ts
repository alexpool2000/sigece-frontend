import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EstudianteForm } from './estudiante-form';

describe('EstudianteForm', () => {
  let component: EstudianteForm;
  let fixture: ComponentFixture<EstudianteForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EstudianteForm],
    }).compileComponents();

    fixture = TestBed.createComponent(EstudianteForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
