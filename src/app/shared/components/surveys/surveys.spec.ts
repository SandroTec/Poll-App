import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Surveys } from './surveys';

describe('Surveys', () => {
  let component: Surveys;
  let fixture: ComponentFixture<Surveys>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Surveys],
    }).compileComponents();

    fixture = TestBed.createComponent(Surveys);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
