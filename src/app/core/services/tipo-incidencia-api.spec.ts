import { TestBed } from '@angular/core/testing';
import { TipoIncidenciaApi } from './tipo-incidencia-api';

describe('TipoIncidenciaApi', () => {
  let service: TipoIncidenciaApi;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TipoIncidenciaApi);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
