import { Component, inject } from '@angular/core';
import { SurveyService } from '../../services/survey.service';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { Answer } from '../../interfaces/answer';

@Component({
  selector: 'app-survey-detail',
  imports: [RouterLink],
  templateUrl: './survey-detail.html',
  styleUrl: './survey-detail.scss',
})
export class SurveyDetail {
  surveyService = inject(SurveyService);
  route = inject(ActivatedRoute)

  questionList = this.surveyService.questionList;
  answerList = this.surveyService.answerList;

  async ngOnInit() {
    const surveyId = Number(this.route.snapshot.paramMap.get('id'));
    // Fetch questions by using the surveyId
    await this.surveyService.getQuestions(surveyId);
    // map a new array with the question ids
    const questionIds = this.questionList().map((question) => question.id);
    // Fetch answers by using the question ids
    await this.surveyService.getAnswers(questionIds);
  }

  // method to return the answers for a specific question by their question id
  getAnswersForQuestion(questionId: number) {
    return this.answerList().filter((answer: Answer) => answer.question_id === questionId)
  }
}
