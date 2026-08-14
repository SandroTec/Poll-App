import { Injectable } from '@angular/core';
import { createClient } from '@supabase/supabase-js';

@Injectable({
  providedIn: 'root',
})
export class SurveyService {

  supabase = createClient('https://zlbbjaxdutacpsrcqhrz.supabase.co/','sb_publishable_3yQFBsKbiKiTv7vtWH2hZQ_CJkhtaid');

  async getSurveys() {
    return this.supabase.from('surveys').select('*');
  }

  async getQuestions(surveyId: number) {
    return this.supabase.from('survey_questions').select('*').eq('survey_id', surveyId);
  }

  async getAnswers(questionId: number) {
    return this.supabase.from('question_answers').select('*').eq('question_id', questionId);
  }
  
}
