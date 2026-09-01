import { Component, ViewChild } from '@angular/core';
import { AddSurveyModal } from '../add-survey-modal/add-survey-modal';

@Component({
  selector: 'app-main',
  imports: [AddSurveyModal],
  templateUrl: './main.html',
  styleUrl: './main.scss',
})
export class Main {

  /**
  * References the survey modal component.
  */
  @ViewChild(AddSurveyModal) surveyModal!: AddSurveyModal;

  /**
  * Opens the survey modal
  */
  openSurveyModal() {
    this.surveyModal.openModal();
  }

}
