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

  /**
  * Toggles the category menu.
  */
  openMenu() {
    this.menuOpen.update(open => !open)
  }

  /**
  * Changes the selected category and closes the menu.
  *
  * @param chosenCategory - The category to select.
  */
  sortCategories(chosenCategory:string) {
    this.selectedCategory = chosenCategory;
    this.menuOpen.set(false);
  }

  /**
  * Returns the surveys that are ending within the next 2 days.
  *
  * @returns Surveys ending within the next 2 days.
  */
  getEndingSoonSurveys() {
    return this.list().filter((survey: Survey) => 
      survey.ends_at !== undefined &&
      this.surveyService.getEndingTime(survey.ends_at) <= 2 && 
      this.surveyService.getEndingTime(survey.ends_at) >= 0
    );
  }

  /**
  * Returns all past surveys.
  *
  * @returns All past surveys.
  */
  getPastSurveys() {
    return this.list().filter((survey: Survey) => 
      survey.ends_at !== undefined &&
      this.surveyService.getEndingTime(survey.ends_at) <= 0  &&
      (this.selectedCategory === 'All Surveys' ||
      survey.category === this.selectedCategory)
    );
  }

  /**
  * Returns all active surveys.
  *
  * @returns All active surveys.
  */
  getActiveSurveys() {
    return this.list().filter((survey: Survey) => 
      survey.ends_at !== undefined &&
      this.surveyService.getEndingTime(survey.ends_at) >= 0 &&
      (this.selectedCategory === 'All Surveys' ||
      survey.category === this.selectedCategory)
    );
  }

  /**
  * Checks if the survey is completed.
  *
  * @param surveyId - The ID of the survey to check.
  * @returns `true` if the survey is completed, otherwise `false`.
  */
  isSurveyCompleted(surveyId: number) {
    return this.surveyService.completedSurveys().includes(surveyId)
  }
}

