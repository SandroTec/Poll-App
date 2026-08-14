import { Component, inject } from '@angular/core';
import { SurveyService } from '../../services/survey.service';

@Component({
  selector: 'app-surveys',
  imports: [],
  templateUrl: './surveys.html',
  styleUrl: './surveys.scss',
})
export class Surveys {
  surveyService = inject(SurveyService);
  list = this.surveyService.surveyList;
}
