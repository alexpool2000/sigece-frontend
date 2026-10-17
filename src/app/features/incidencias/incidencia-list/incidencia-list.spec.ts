import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IncidenciaList } from './incidencia-list';

describe('IncidenciaList', () => {
  let component: IncidenciaList;
  let fixture: ComponentFixture<IncidenciaList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IncidenciaList],
    }).compileComponents();

    fixture = TestBed.createComponent(IncidenciaList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
