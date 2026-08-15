import { Injectable, signal } from '@angular/core';
import { createClient } from '@supabase/supabase-js';
import { Survey } from '../interfaces/survey';
import { Question } from '../interfaces/question';
import { Answer } from '../interfaces/answer';


@Injectable({
  providedIn: 'root',
})
export class SurveyService {

  supabase = createClient('https://zlbbjaxdutacpsrcqhrz.supabase.co/','sb_publishable_3yQFBsKbiKiTv7vtWH2hZQ_CJkhtaid');

  surveyList = signal<Survey[]>([]);
  questionList = signal<Question[]>([]);
  answerList = signal<Answer[]>([]);

  constructor() {
    this.getSurveys();

  }

  // method to fetch surveys from the Supabase database and update the surveyList signal
  async getSurveys() {
    let response = await this.supabase.from('surveys').select('*');
    this.surveyList.set((response.data ?? []) as Survey[]);
  }

  // method to fetch questions for a specific survey from the Supabase database and update the questionList signal
  async getQuestions(surveyId: number) {
    let response = await this.supabase.from('survey_questions').select('*').eq('survey_id', surveyId);
    this.questionList.set((response.data ?? []) as Question[]);

  }

  // method to fetch answers for specific questions from the Supabase database 
  // and update the answerList signal
  // using .in() to filter by an array of question ids
  async getAnswers(questionIds: number[]) {
    let response = await this.supabase.from('question_answers').select('*').in('question_id', questionIds);
    this.answerList.set((response.data ?? []) as Answer[]);

  }
  
}
