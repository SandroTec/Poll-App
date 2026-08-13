import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SurveyDetail } from './survey-detail';

describe('SurveyDetail', () => {
  let component: SurveyDetail;
  let fixture: ComponentFixture<SurveyDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SurveyDetail],
    }).compileComponents();

    fixture = TestBed.createComponent(SurveyDetail);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
