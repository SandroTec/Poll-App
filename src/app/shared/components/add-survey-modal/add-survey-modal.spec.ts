import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddSurveyModal } from './add-survey-modal';

describe('AddSurveyModal', () => {
  let component: AddSurveyModal;
  let fixture: ComponentFixture<AddSurveyModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddSurveyModal],
    }).compileComponents();

    fixture = TestBed.createComponent(AddSurveyModal);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
