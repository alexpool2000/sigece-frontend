import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AsignarApoderado } from './asignar-apoderado';

describe('AsignarApoderado', () => {
  let component: AsignarApoderado;
  let fixture: ComponentFixture<AsignarApoderado>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AsignarApoderado],
    }).compileComponents();

    fixture = TestBed.createComponent(AsignarApoderado);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
