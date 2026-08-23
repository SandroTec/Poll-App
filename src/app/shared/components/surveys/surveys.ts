import { Component, inject, signal } from '@angular/core';
import { SurveyService } from '../../services/survey.service';
import { RouterLink } from '@angular/router';
import { Survey } from '../../interfaces/survey';

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

  openMenu() {
    this.menuOpen.update(open => !open)
  }

  sortCategories(choosenCategory:string) {
    this.selectedCategory = choosenCategory;
    this.menuOpen.set(false);
  }


  // calculates and returns day remaining before survey is ending
  getEndingTime(surveyEndsAt: Date) {
    const now = new Date();
    const endTime = new Date(surveyEndsAt);
    const timeDifference = endTime.getTime() - now.getTime();
    const daysRemaining = Math.ceil(timeDifference / (1000 * 3600 * 24));
    return daysRemaining;
  }
  
  // returns a list of all surveys ending in the next 2 days
  getEndingSoonSurveys() {
    return this.list().filter((survey: Survey) => 
      survey.ends_at !== undefined &&
      this.getEndingTime(survey.ends_at) <= 2 && 
      this.getEndingTime(survey.ends_at) >= 0
    );
  }

  getPastSurveys() {
    return this.list().filter((survey: Survey) => 
      survey.ends_at !== undefined &&
      this.getEndingTime(survey.ends_at) <= 0  &&
      (this.selectedCategory === 'All Surveys' ||
      survey.category === this.selectedCategory)
    );
  }

  getActiveSurveys() {
    return this.list().filter((survey: Survey) => 
      survey.ends_at !== undefined &&
      this.getEndingTime(survey.ends_at) >= 0 &&
      (this.selectedCategory === 'All Surveys' ||
      survey.category === this.selectedCategory)
    );
  }

}

