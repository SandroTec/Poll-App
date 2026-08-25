import { Component, inject, ViewChild } from '@angular/core';
import { SurveyService } from '../../services/survey.service';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { Answer } from '../../interfaces/answer';
import { VoteModel } from '../../models/voteModel';
import { AddSurveyModal } from '../add-survey-modal/add-survey-modal';

@Component({
  selector: 'app-survey-detail',
  imports: [RouterLink, AddSurveyModal],
  templateUrl: './survey-detail.html',
  styleUrl: './survey-detail.scss',
})
export class SurveyDetail {
  surveyService = inject(SurveyService);
  route = inject(ActivatedRoute)

  questionList = this.surveyService.questionList;
  answerList = this.surveyService.answerList;

  // safes AddSurveyModal component class as surveyModal
  @ViewChild(AddSurveyModal) surveyModal!: AddSurveyModal;

  //opens surveyModal in AddSurveyModal component
  openSurveyModal() {
    this.surveyModal.openModal();
  }

  async ngOnInit() {
    const surveyId = Number(this.route.snapshot.paramMap.get('id'));
    // Fetch questions by using the surveyId
    await this.surveyService.getQuestions(surveyId);
    // map a new array with the question ids
    const questionIds = this.questionList().map((question) => question.id);
    // Fetch answers by using the question ids
    await this.surveyService.getAnswers(questionIds);
    // Fetch votes by using answer ids
    const answerIds = this.answerList().map(answer => answer.id)
    await this.surveyService.getVotes(answerIds);
  }

  // method to return the answers for a specific question by their question id
  getAnswersForQuestion(questionId: number) {
    return this.answerList().filter((answer: Answer) => answer.question_id === questionId)
  }

  voting(answer_id: number) {
    const vote = new VoteModel({ answer_id });
    this.surveyService.addVotes(vote);
  }

  voteCounting(answer_id: number) {
    return this.surveyService.getVoteCount(answer_id);
  }
}
