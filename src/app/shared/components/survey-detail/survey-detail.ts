import { Component, inject, ViewChild } from '@angular/core';
import { SurveyService } from '../../services/survey.service';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { Answer } from '../../interfaces/answer';
import { Survey } from '../../interfaces/survey';
import { SelectedAnswer } from "../../interfaces/selected-answer";
import { VoteModel } from '../../models/voteModel';
import { AddSurveyModal } from '../add-survey-modal/add-survey-modal';
import { SurveyVoteState } from '../../interfaces/survey-vote-state';

@Component({
  selector: 'app-survey-detail',
  imports: [RouterLink, AddSurveyModal],
  templateUrl: './survey-detail.html',
  styleUrl: './survey-detail.scss',
})
export class SurveyDetail {
  surveyService = inject(SurveyService);
  route = inject(ActivatedRoute)

  surveyList = this.surveyService.surveyList;
  questionList = this.surveyService.questionList;
  answerList = this.surveyService.answerList;

  surveyId!: number;

  // safes AddSurveyModal component class as surveyModal
  @ViewChild(AddSurveyModal) surveyModal!: AddSurveyModal;

  //opens surveyModal in AddSurveyModal component
  openSurveyModal() {
    this.surveyModal.openModal();
  }

  async ngOnInit() {
    this.surveyId = Number(this.route.snapshot.paramMap.get('id'));
    // Fetch questions by using the surveyId
    await this.surveyService.getQuestions(this.surveyId);
    // map a new array with the question ids
    const questionIds = this.questionList().map((question) => question.id);
    // Fetch answers by using the question ids
    await this.surveyService.getAnswers(questionIds);
    // Fetch votes by using answer ids
    const answerIds = this.answerList().map(answer => answer.id)
    await this.surveyService.getVotes(answerIds);
  }

  getSurvey() {
    const survey = this.surveyList().find((survey: Survey)=> survey.id === this.surveyId);
    return survey;
  }

  formatDate(date:Date | undefined) {
    if (!date) return 'no ending date'
    const deDate = new Date(date)
    return deDate.toLocaleDateString('de-DE');
  }

  // method to return the answers for a specific question by their question id
  getAnswersForQuestion(questionId: number) {
    return this.answerList().filter((answer: Answer) => answer.question_id === questionId);
  }

  saveVoteState(surveyId:number, selectedAnswers:SelectedAnswer[], completed:boolean) {
    const voteState: SurveyVoteState = {
      selectedAnswers: selectedAnswers,
      completed: completed
    };
    localStorage.setItem(
      `survey-${surveyId}`,
      JSON.stringify(voteState)
    );
  }

  isAnswerSelected(questionId:number, answerId:number) {
    const storedState = localStorage.getItem(`survey-${this.surveyId}`);
    if (!storedState) return false;
    const voteState: SurveyVoteState = JSON.parse(storedState);
    return voteState.selectedAnswers.some(selectedAnswer =>
      selectedAnswer.questionId === questionId &&
      selectedAnswer.answerId === answerId
    );
  }

  updateVoteState(surveyId:number, questionId:number, answerId:number) {
    const storedState = localStorage.getItem(`survey-${surveyId}`);
    if (storedState) {
      const voteState: SurveyVoteState = JSON.parse(storedState);
      if (voteState.completed) return;
      const question = this.questionList().find(question => question.id === questionId);
       if (question?.allow_multiple_answers) {
        if (voteState.selectedAnswers.some(selectedAnswer => 
          selectedAnswer.questionId === questionId && selectedAnswer.answerId === answerId)) {
            voteState.selectedAnswers = voteState.selectedAnswers.filter(selectedAnswer => 
            selectedAnswer.questionId !== questionId || selectedAnswer.answerId !== answerId);
        } else {
          voteState.selectedAnswers.push({questionId, answerId});
        }
      } else {
        if (voteState.selectedAnswers.some(selectedAnswer => 
          selectedAnswer.questionId === questionId && selectedAnswer.answerId === answerId)) {
            voteState.selectedAnswers = voteState.selectedAnswers.filter(selectedAnswer => 
            selectedAnswer.questionId !== questionId);
        } else {
          voteState.selectedAnswers = voteState.selectedAnswers.filter(selectedAnswer => 
            selectedAnswer.questionId !== questionId);
          voteState.selectedAnswers.push({questionId, answerId});
        }
      }
      this.saveVoteState(surveyId, voteState.selectedAnswers, false);
    } else {
      this.saveVoteState(surveyId, [{questionId, answerId}], false);
    }; 
  }

  async voting() {
    const storedState = localStorage.getItem(`survey-${this.surveyId}`);
    if (!storedState) return;
    const voteState: SurveyVoteState = JSON.parse(storedState);
    if (voteState.completed) return;
    await Promise.all( 
      voteState.selectedAnswers.map(selectedAnswer => {
        const vote = new VoteModel({ answer_id: selectedAnswer.answerId });
        return this.surveyService.addVotes(vote);
      })
    )
    voteState.completed = true;
    this.saveVoteState(this.surveyId, voteState.selectedAnswers, true);
    this.surveyService.completedSurveys.update(ids => [...ids, this.surveyId]);
  }

  voteCounting(answer_id: number) {
    const storedState = localStorage.getItem(`survey-${this.surveyId}`);
    let localVotes = 0;
    if (storedState) {
      const voteState: SurveyVoteState = JSON.parse(storedState);
      const isSelected = voteState.selectedAnswers.some(selectedAnswer =>
        selectedAnswer.answerId === answer_id
      );
      if (!voteState.completed && isSelected) {localVotes = 1}
    }
    return this.surveyService.getVoteCount(answer_id) + localVotes;
  }

  isSurveyCompleted() {
    const storedState = localStorage.getItem(`survey-${this.surveyId}`);
    if (!storedState) return false;
    return JSON.parse(storedState).completed;
  }

  hasSelectedAnswers() {
    const storedState = localStorage.getItem(`survey-${this.surveyId}`);
    if (!storedState) return false;
    const voteState: SurveyVoteState = JSON.parse(storedState);
    return this.questionList().every(question =>
      voteState.selectedAnswers.some(selectedAnswer => selectedAnswer.questionId === question.id)
    );
  }
}

