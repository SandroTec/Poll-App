import { Component, ViewChild } from '@angular/core';
import { AddSurveyModal } from '../add-survey-modal/add-survey-modal';

@Component({
  selector: 'app-main',
  imports: [AddSurveyModal],
  templateUrl: './main.html',
  styleUrl: './main.scss',
})
export class Main {

  @ViewChild(AddSurveyModal) surveyModal!: AddSurveyModal;

  openSurveyModal() {
    this.surveyModal.openModal();
  }

  
}
