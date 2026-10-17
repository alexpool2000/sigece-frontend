import { TestBed } from '@angular/core/testing';
import { EstudianteApi } from './estudiante-api';

describe('EstudianteApi', () => {
  let service: EstudianteApi;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EstudianteApi);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
