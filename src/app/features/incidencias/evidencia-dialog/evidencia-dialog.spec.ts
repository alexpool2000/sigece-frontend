import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EvidenciaDialog } from './evidencia-dialog';

describe('EvidenciaDialog', () => {
  let component: EvidenciaDialog;
  let fixture: ComponentFixture<EvidenciaDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EvidenciaDialog],
    }).compileComponents();

    fixture = TestBed.createComponent(EvidenciaDialog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
