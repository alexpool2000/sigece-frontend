import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EstudianteList } from './estudiante-list';

describe('EstudianteList', () => {
  let component: EstudianteList;
  let fixture: ComponentFixture<EstudianteList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EstudianteList],
    }).compileComponents();

    fixture = TestBed.createComponent(EstudianteList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
