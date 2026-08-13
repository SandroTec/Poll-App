import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditSurvey } from './edit-survey';

describe('EditSurvey', () => {
  let component: EditSurvey;
  let fixture: ComponentFixture<EditSurvey>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditSurvey],
    }).compileComponents();

    fixture = TestBed.createComponent(EditSurvey);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
