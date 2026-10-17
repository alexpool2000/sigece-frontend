import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EstadoChip } from './estado-chip';

describe('EstadoChip', () => {
  let component: EstadoChip;
  let fixture: ComponentFixture<EstadoChip>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EstadoChip],
    }).compileComponents();

    fixture = TestBed.createComponent(EstadoChip);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
