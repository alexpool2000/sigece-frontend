import { TestBed } from '@angular/core/testing';
import { IncidenteApi } from './incidente-api';

describe('IncidenteApi', () => {
  let service: IncidenteApi;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(IncidenteApi);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
