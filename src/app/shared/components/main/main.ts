import { Component, ViewChild } from '@angular/core';
import { AddSurveyModal } from '../add-survey-modal/add-survey-modal';

@Component({
  selector: 'app-main',
  imports: [AddSurveyModal],
  templateUrl: './main.html',
  styleUrl: './main.scss',
})
export class Main {

  // safes AddSurveyModal component class as surveyModal
  @ViewChild(AddSurveyModal) surveyModal!: AddSurveyModal;

  //opens surveyModal in AddSurveyModal component
  openSurveyModal() {
    this.surveyModal.openModal();
  }

}
