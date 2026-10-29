import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InvolucradoDialog } from './involucrado-dialog';

describe('InvolucradoDialog', () => {
  let component: InvolucradoDialog;
  let fixture: ComponentFixture<InvolucradoDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InvolucradoDialog],
    }).compileComponents();

    fixture = TestBed.createComponent(InvolucradoDialog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
