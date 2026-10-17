import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ApoderadoForm } from './apoderado-form';

describe('ApoderadoForm', () => {
  let component: ApoderadoForm;
  let fixture: ComponentFixture<ApoderadoForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ApoderadoForm],
    }).compileComponents();

    fixture = TestBed.createComponent(ApoderadoForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
