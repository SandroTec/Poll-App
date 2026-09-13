import { Injectable, signal, inject } from '@angular/core';
import { createClient } from '@supabase/supabase-js';
import { Survey } from '../interfaces/survey';
import { Question } from '../interfaces/question';
import { Answer } from '../interfaces/answer';
import { SurveyModel } from '../models/surveyModel';
import { QuestionModel } from '../models/questionModel';
import { AnswerModel } from '../models/answerModel';
import { Vote } from '../interfaces/vote';
import { VoteModel } from '../models/voteModel';
import { SurveyVoteState } from '../interfaces/survey-vote-state';
import { Router } from '@angular/router';


@Injectable({
  providedIn: 'root',
})
export class SurveyService {

  supabase = createClient('https://zlbbjaxdutacpsrcqhrz.supabase.co/','sb_publishable_3yQFBsKbiKiTv7vtWH2hZQ_CJkhtaid');
  surveyList = signal<Survey[]>([]);
  questionList = signal<Question[]>([]);
  answerList = signal<Answer[]>([]);
  voteList = signal<Vote[]>([]);

  showAlert = signal(false);

  completedSurveys = signal<number[]>(this.getCompletedSurveys());

  private router = inject(Router);

  surveyChannel;
  questionChannel;
  answerChannel;
  voteChannel;

  categories = [
    "All Surveys", "Team Activities", "Health & Wellness", 
    "Gaming & Entertainment", "Education & Learning", 
    "Lifestyle & Preferences", "Technology & Innovation"
  ];

  constructor() {
    this.getSurveys();

    this.surveyChannel = this.supabase.channel('survey-change-channel')
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'surveys' },
      (payload) => {
        let tmpSurvey = new SurveyModel(payload.new)
        this.surveyList.update(list => [...list, tmpSurvey]);
        this.showAlert.set(true)
        setTimeout(() => {
          this.showAlert.set(false);
          this.openSurvey(tmpSurvey.id)
        }, 3000);
      }
    )
    .on(
      'postgres_changes',
      { event: 'DELETE', schema: 'public', table: 'surveys' },
      (payload) => {
        const tmpSurveyID = payload.old["id"]
        this.surveyList.update(list => list.filter(survey => survey.id !== tmpSurveyID));
      }
    )
    .subscribe();

    this.questionChannel = this.supabase.channel('question-change-channel')
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'survey_questions' },
      (payload) => {
        let tmpQuestion = new QuestionModel(payload.new)
        this.questionList.update(list => [...list, tmpQuestion]);
      }
    )
    .subscribe();

    this.answerChannel = this.supabase.channel('answer-change-channel')
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'question_answers' },
      (payload) => {
        let tmpAnswer = new AnswerModel(payload.new)
        this.answerList.update(list => [...list, tmpAnswer]);
      }
    )
    .subscribe();


    this.voteChannel = this.supabase.channel('vote-insert-channel')
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'votes' },
      (payload) => {
        let tmpVote = new VoteModel(payload.new)
        this.voteList.update(list => [...list, tmpVote]);
      }
    )
    .subscribe()

  }

  /**
  * Unsubscribes from all Supabase channels when the service is destroyed.
  */
  ngOnDestroy() {
    this.supabase.removeChannel(this.surveyChannel);
    this.supabase.removeChannel(this.questionChannel);
    this.supabase.removeChannel(this.answerChannel);
    this.supabase.removeChannel(this.voteChannel);
  }

  /**
  * Navigates to detail.
  * @param surveyId - Index of the survey to navigate to.
  */
  openSurvey(surveyId: number) {
    this.router.navigate(['detail', surveyId]);
  }

  /**
   * Fetches all surveys from the database and updates the survey list.
   */
  async getSurveys() {
    try {
      const { data, error } = await this.supabase.from('surveys').select('*');
      
      if (error) {
        console.error('Error fetching surveys:', error.message);
        this.surveyList.set([]);
        return;
      }

      this.surveyList.set((data ?? []) as Survey[]);
    } catch (err) {
      console.error('Unexpected error fetching surveys:', err);
      this.surveyList.set([]);
    }
  }

  /**
   * Fetches all questions from the database and updates the question list.
   * 
   * @param surveyId - The ID of the survey.
   */   
  async getQuestions(surveyId: number) {
    try {
      const { data, error } = await this.supabase.from('survey_questions').select('*').eq('survey_id', surveyId);
      if (error) {
        console.error(`Error fetching questions for survey ${surveyId}:`, error.message);
        this.questionList.set([]);
        return;
      }
      this.questionList.set((data ?? []) as Question[]);
    } catch (err) {
      console.error('Unexpected error fetching questions:', err);
      this.questionList.set([]);
    }
  }

  /**
   * Fetches all answers from the database and updates the answer list.
   * 
   * @param questionIds - The IDs of the questions.
   */   
  async getAnswers(questionIds: number[]) {
    if (!questionIds || questionIds.length === 0) {
      this.answerList.set([]);
      return;
    }
    try {
      const { data, error } = await this.supabase
        .from('question_answers').select('*').in('question_id', questionIds);
      if (error) {
        console.error('Error fetching answers:', error.message);
        this.answerList.set([]);
        return;
      }
      this.answerList.set((data ?? []) as Answer[]);
    } catch (err) {
      console.error('Unexpected error fetching answers:', err);
      this.answerList.set([]);
    }
  }

  /**
   * Fetches all votes from the database and updates the vote list.
   * 
   * @param answerIds - The IDs of the answers.
   */   
  async getVotes(answerIds: number[]) {
    if (!answerIds || answerIds.length === 0) {
      this.voteList.set([]);
      return;
    }
    try {
      const { data, error } = await this.supabase.from('votes').select('*').in('answer_id', answerIds);
      if (error) {
        console.error('Error fetching votes:', error.message);
        this.voteList.set([]);
        return;
      }
      this.voteList.set((data ?? []) as Vote[]);
    } catch (err) {
      console.error('Unexpected error fetching votes:', err);
      this.voteList.set([]);
    }
  }

  /**
   * Adds a survey to the database.
   * 
   * @param survey - The survey to insert into the database.
   * @returns The inserted survey object or null if failed.
   */  
  async addSurvey(survey: SurveyModel) {
    try {
      const survey_data = survey.getCleanAddJson();
      const { data, error } = await this.supabase .from('surveys').insert([survey_data]).select();
      if (error) {
        console.error('Error inserting survey:', error.message);
        return null;
      }
      return data?.[0] ?? null;
    } catch (err) {
      console.error('Unexpected error in addSurvey:', err);
      return null;
    }
  }

  /**
   * Adds a question to the database.
   * 
   * @param question - The question to insert into the database.
   * @returns The inserted question object or null if failed.
   */  
  async addQuestion(question: QuestionModel) {
    try {
      const question_data = question.getCleanAddJson();
      const { data, error } = await this.supabase.from('survey_questions').insert([question_data]).select();
      if (error) {
        console.error('Error inserting question:', error.message);
        return null;
      }
      return data?.[0] ?? null;
    } catch (err) {
      console.error('Unexpected error in addQuestion:', err);
      return null;
    }
  }

  /**
   * Adds an answer to the database.
   * 
   * @param answer - The answer to insert into the database.
   * @returns The inserted answer object or null if failed.
   */  
  async addAnswer(answer: AnswerModel) {
    try {
      const answer_data = answer.getCleanAddJson();
      const { data, error } = await this.supabase.from('question_answers').insert([answer_data]).select();
      if (error) {
        console.error('Error inserting answer:', error.message);
        return null;
      }
      return data?.[0] ?? null;
    } catch (err) {
      console.error('Unexpected error in addAnswer:', err);
      return null;
    }
  }

  /**
   * Adds a vote to the database.
   * 
   * @param vote - The vote to insert into the database.
   * @returns The inserted vote object or null if failed.
   */  
  async addVotes(vote: VoteModel) {
    try {
      const vote_data = vote.getCleanAddJson();
      const { data, error } = await this.supabase.from('votes').insert([vote_data]).select();
      if (error) {
        console.error('Error inserting vote:', error.message);
        return null;
      }
      return data?.[0] ?? null;
    } catch (err) {
      console.error('Unexpected error in addVotes:', err);
      return null;
    }
  }

  /**
  * Returns the total amount of votes for a specific answer from the database.
  * 
  * @param answer_id - The ID of the answer.
  * @returns The total amount of votes for a specific answer.
  */  
  getVoteCount(answer_id:number) {
    return this.voteList().filter(vote => vote.answer_id === answer_id).length
  }

  /**
  * Returns the IDs of all completed surveys.
  *
  * @returns An array of completed survey IDs.
  */ 
  getCompletedSurveys() {
    const completed: number[] = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith('survey-')) {
            const storedState = localStorage.getItem(key);
            if (!storedState) continue;
            const voteState: SurveyVoteState = JSON.parse(storedState);
            if (voteState.completed) {
                completed.push(Number(key.replace('survey-', '')));
            }
        }
    }
    return completed;
  }

  /**
   * Returns the remaining days until the survey ends or 4 if no end date is set.
   *
   * @param surveyEndsAt - The survey's end date or `undefined`.
   * @returns The remaining days until the survey ends or 4 if no end date is set.
   */
  getEndingTime(surveyEndsAt: Date | undefined) {
    if (!surveyEndsAt) return 4 
    const now = new Date();
    const endTime = new Date(surveyEndsAt);
    const timeDifference = endTime.getTime() - now.getTime();
    const daysRemaining = Math.ceil(timeDifference / (1000 * 3600 * 24));
    return daysRemaining;
  }

}
