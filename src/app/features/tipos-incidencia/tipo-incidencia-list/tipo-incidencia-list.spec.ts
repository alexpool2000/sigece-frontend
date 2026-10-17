import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TipoIncidenciaList } from './tipo-incidencia-list';

describe('TipoIncidenciaList', () => {
  let component: TipoIncidenciaList;
  let fixture: ComponentFixture<TipoIncidenciaList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TipoIncidenciaList],
    }).compileComponents();

    fixture = TestBed.createComponent(TipoIncidenciaList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
