import { TestBed } from '@angular/core/testing';
import { ApoderadoApi } from './apoderado-api';

describe('ApoderadoApi', () => {
  let service: ApoderadoApi;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ApoderadoApi);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
