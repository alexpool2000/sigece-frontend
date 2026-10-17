import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GravedadChip } from './gravedad-chip';

describe('GravedadChip', () => {
  let component: GravedadChip;
  let fixture: ComponentFixture<GravedadChip>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GravedadChip],
    }).compileComponents();

    fixture = TestBed.createComponent(GravedadChip);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
