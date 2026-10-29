import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AccionDialog } from './accion-dialog';

describe('AccionDialog', () => {
  let component: AccionDialog;
  let fixture: ComponentFixture<AccionDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccionDialog],
    }).compileComponents();

    fixture = TestBed.createComponent(AccionDialog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
