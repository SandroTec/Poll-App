import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SurveyForm } from './survey-form';

describe('SurveyForm', () => {
  let component: SurveyForm;
  let fixture: ComponentFixture<SurveyForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SurveyForm],
    }).compileComponents();

    fixture = TestBed.createComponent(SurveyForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
