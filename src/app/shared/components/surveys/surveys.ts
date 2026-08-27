import { Component, inject, signal } from '@angular/core';
import { SurveyService } from '../../services/survey.service';
import { RouterLink } from '@angular/router';
import { Survey } from '../../interfaces/survey';
import { SurveyVoteState } from '../../interfaces/survey-vote-state';

@Component({
  selector: 'app-surveys',
  imports: [RouterLink],
  templateUrl: './surveys.html',
  styleUrl: './surveys.scss',
})
export class Surveys {
  surveyService = inject(SurveyService);
  list = this.surveyService.surveyList;
  state:string = "";
  
  categories = this.surveyService.categories
  selectedCategory = 'All Surveys';

  menuOpen = signal(false);

  showAlert = this.surveyService.showAlert

  openMenu() {
    this.menuOpen.update(open => !open)
  }

  sortCategories(choosenCategory:string) {
    this.selectedCategory = choosenCategory;
    this.menuOpen.set(false);
  }


  
  
  // returns a list of all surveys ending in the next 2 days
  getEndingSoonSurveys() {
    return this.list().filter((survey: Survey) => 
      survey.ends_at !== undefined &&
      this.surveyService.getEndingTime(survey.ends_at) <= 2 && 
      this.surveyService.getEndingTime(survey.ends_at) >= 0
    );
  }

  getPastSurveys() {
    return this.list().filter((survey: Survey) => 
      survey.ends_at !== undefined &&
      this.surveyService.getEndingTime(survey.ends_at) <= 0  &&
      (this.selectedCategory === 'All Surveys' ||
      survey.category === this.selectedCategory)
    );
  }

  getActiveSurveys() {
    return this.list().filter((survey: Survey) => 
      survey.ends_at !== undefined &&
      this.surveyService.getEndingTime(survey.ends_at) >= 0 &&
      (this.selectedCategory === 'All Surveys' ||
      survey.category === this.selectedCategory)
    );
  }

  isSurveyCompleted(surveyId: number) {
    return this.surveyService.completedSurveys().includes(surveyId)
  }
}

