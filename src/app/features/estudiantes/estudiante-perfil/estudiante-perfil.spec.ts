import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EstudiantePerfil } from './estudiante-perfil';

describe('EstudiantePerfil', () => {
  let component: EstudiantePerfil;
  let fixture: ComponentFixture<EstudiantePerfil>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EstudiantePerfil],
    }).compileComponents();

    fixture = TestBed.createComponent(EstudiantePerfil);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
