import { Component, inject } from '@angular/core';
import { SurveyService } from '../../services/survey.service';
import { RouterLink } from '@angular/router';


@Component({
  selector: 'app-surveys',
  imports: [RouterLink],
  templateUrl: './surveys.html',
  styleUrl: './surveys.scss',
})
export class Surveys {
  surveyService = inject(SurveyService);
  list = this.surveyService.surveyList;

  
  
}

