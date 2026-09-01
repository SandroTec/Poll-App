import { Component, inject, ViewChild } from '@angular/core';
import { SurveyService } from '../../services/survey.service';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { Answer } from '../../interfaces/answer';
import { Survey } from '../../interfaces/survey';
import { SelectedAnswer } from "../../interfaces/selected-answer";
import { VoteModel } from '../../models/voteModel';
import { AddSurveyModal } from '../add-survey-modal/add-survey-modal';
import { SurveyVoteState } from '../../interfaces/survey-vote-state';
import { Question } from '../../interfaces/question';

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

  /**
  * References the survey modal component.
  */
  @ViewChild(AddSurveyModal) surveyModal!: AddSurveyModal;

  /**
  * Opens the survey modal.
  */
  openSurveyModal() {
    this.surveyModal.openModal();
  }

  /**
  * Fetches survey details from the database.
  */
  async ngOnInit() {
    this.surveyId = Number(this.route.snapshot.paramMap.get('id'));
    await this.surveyService.getQuestions(this.surveyId);
    const questionIds = this.questionList().map((question) => question.id);
    await this.surveyService.getAnswers(questionIds);
    const answerIds = this.answerList().map(answer => answer.id)
    await this.surveyService.getVotes(answerIds);
  }

  /**
  * Returns the currently opened survey.
  * 
  * @returns The currently opened survey or `undefined` if it was not found.
  */
  getSurvey(): Survey | undefined {
    const survey = this.surveyList().find((survey: Survey)=> survey.id === this.surveyId);
    return survey;
  }

  /**
  * Formats a given date to the German date format.
  *
  * @param date - The date to format.
  * @returns The formatted German date string.
  */
  formatDate(date:Date | undefined) {
    if (!date) return 'no ending date'
    const deDate = new Date(date)
    return deDate.toLocaleDateString('de-DE');
  }

  /**
  * Returns answers for a specific question.
  * 
  * @param questionId - The ID of the question to get answers for.
  * @returns A list of answers related to the specific question.
  */
  getAnswersForQuestion(questionId: number) {
    return this.answerList().filter((answer: Answer) => answer.question_id === questionId);
  }

  /**
  * Saves the current vote state to the local storage.
  *
  * @param surveyId - The ID of the survey.
  * @param selectedAnswers - The selected answers.
  * @param completed - Indicates whether the survey is completed.
  */
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

  /**
  * Checks whether a specific answer is selected for a question.
  *
  * @param questionId - The ID of the question.
  * @param answerId - The ID of the answer.
  * @returns `true` if the answer is selected, otherwise `false`.
  */
  isAnswerSelected(questionId:number, answerId:number) {
    const storedState = localStorage.getItem(`survey-${this.surveyId}`);
    if (!storedState) return false;
    const voteState: SurveyVoteState = JSON.parse(storedState);
    return voteState.selectedAnswers.some(selectedAnswer =>
      selectedAnswer.questionId === questionId &&
      selectedAnswer.answerId === answerId
    );
  }

  /**
  * Updates the vote state for a survey.
  *
  * @param surveyId - The ID of the survey.
  * @param questionId - The ID of the question.
  * @param answerId - The ID of the answer.
  */
  updateVoteState(surveyId: number, questionId: number, answerId: number) {
      const storedState = localStorage.getItem(`survey-${surveyId}`);
      if (storedState) {
        let voteState: SurveyVoteState = JSON.parse(storedState);
        if (voteState.completed) return;
        const question = this.questionList().find(question => question.id === questionId);
        voteState = this.updateSelectedAnswers(voteState, question, questionId, answerId);
        this.saveVoteState(surveyId, voteState.selectedAnswers, false);
      } else {
        this.saveVoteState(surveyId, [{questionId, answerId}], false);
      }; 
  }

  /**
  * Updates the selected answers based on the question's settings.
  *
  * @param voteState - The current vote state.
  * @param question - The question containing the answer settings.
  * @param questionId - The ID of the question.
  * @param answerId - The ID of the answer.
  * @returns The updated vote state.
  */
  updateSelectedAnswers(voteState: SurveyVoteState, question: Question | undefined, questionId: number, answerId: number) {
      if (question?.allow_multiple_answers) {
        if (voteState.selectedAnswers.some(selectedAnswer => selectedAnswer.questionId === questionId && selectedAnswer.answerId === answerId)) {
          voteState.selectedAnswers = voteState.selectedAnswers.filter(selectedAnswer => selectedAnswer.questionId !== questionId || selectedAnswer.answerId !== answerId);
        } else {
          voteState.selectedAnswers.push({questionId, answerId});
        }
      } else {
        if (voteState.selectedAnswers.some(selectedAnswer => selectedAnswer.questionId === questionId && selectedAnswer.answerId === answerId)) {
          voteState.selectedAnswers = voteState.selectedAnswers.filter(selectedAnswer => selectedAnswer.questionId !== questionId);
        } else {
          voteState.selectedAnswers = voteState.selectedAnswers.filter(selectedAnswer => selectedAnswer.questionId !== questionId);
          voteState.selectedAnswers.push({questionId, answerId});
        }
      }
      return voteState;
  }

  /**
  * Saves the selected votes to the database and marks the survey as completed.
  *
  */
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

  /**
  * Calculates the total number of votes from the database and local storage.
  *
  * @param answerId - The ID of the answer.
  * @returns The total amount of votes.
  */
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

  /**
  * Checks whether the survey is completed.
  *
  * @returns `true` if the survey is completed, otherwise `false`.
  */
  isSurveyCompleted() {
    const storedState = localStorage.getItem(`survey-${this.surveyId}`);
    if (!storedState) return false;
    return JSON.parse(storedState).completed;
  }

  /**
  * Checks whether an answer has been selected for every question.
  *
  * @returns `true` if all questions are answered, otherwise `false`.
  */
  hasSelectedAnswers() {
    const storedState = localStorage.getItem(`survey-${this.surveyId}`);
    if (!storedState) return false;
    const voteState: SurveyVoteState = JSON.parse(storedState);
    return this.questionList().every(question =>
      voteState.selectedAnswers.some(selectedAnswer => selectedAnswer.questionId === question.id)
    );
  }

  /**
  * Returns the total amount of votes for a question.
  *
  * @param questionId - The ID of the question
  * @returns The total amount of votes for the question.
  */
  getTotalVotesForQuestion(questionId:number) {
    const questionPool = this.answerList().filter((answer:Answer) => answer.question_id === questionId);
    return questionPool.reduce((sum, answer) => {
      const voteCount = this.voteCounting(answer.id)

      return sum + voteCount;
    }, 0)
  }

  /**
  * Calculates the percentage of votes for an answer.
  *
  * @param answerId - The ID of the answer
  * @param questionId - The ID of the question
  * @returns The rounded percentage of votes.
  */
  getPercentageForAnswer(answerId:number, questionId:number) {
    const votes = this.voteCounting(answerId);
    const totalVotes = this.getTotalVotesForQuestion(questionId);
    if (totalVotes === 0) return 0;
    const percentage = (votes / totalVotes) * 100
    return Math.round(percentage);
  }

}

