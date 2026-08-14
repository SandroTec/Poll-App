import { Injectable, signal } from '@angular/core';
import { createClient } from '@supabase/supabase-js';
import { Survey } from '../interfaces/survey';

@Injectable({
  providedIn: 'root',
})
export class SurveyService {

  supabase = createClient('https://zlbbjaxdutacpsrcqhrz.supabase.co/','sb_publishable_3yQFBsKbiKiTv7vtWH2hZQ_CJkhtaid');

  surveyList = signal<Survey[]>([])

  constructor() {
    this.getSurveys();

  }

  async getSurveys() {
    let response = await this.supabase.from('surveys').select('*');
    this.surveyList.set((response.data ?? []) as Survey[]);

  }

  async getQuestions(surveyId: number) {
    return this.supabase.from('survey_questions').select('*').eq('survey_id', surveyId);
  }

  async getAnswers(questionId: number) {
    return this.supabase.from('question_answers').select('*').eq('question_id', questionId);
  }
  
}
