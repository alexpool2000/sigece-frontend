import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ApoderadoList } from './apoderado-list';

describe('ApoderadoList', () => {
  let component: ApoderadoList;
  let fixture: ComponentFixture<ApoderadoList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ApoderadoList],
    }).compileComponents();

    fixture = TestBed.createComponent(ApoderadoList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
