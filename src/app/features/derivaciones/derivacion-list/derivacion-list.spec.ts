import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DerivacionList } from './derivacion-list';

describe('DerivacionList', () => {
  let component: DerivacionList;
  let fixture: ComponentFixture<DerivacionList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DerivacionList],
    }).compileComponents();

    fixture = TestBed.createComponent(DerivacionList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
