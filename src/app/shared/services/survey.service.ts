import { Injectable, signal } from '@angular/core';
import { createClient } from '@supabase/supabase-js';
import { Survey } from '../interfaces/survey';
import { Question } from '../interfaces/question';
import { Answer } from '../interfaces/answer';
import { SurveyModel } from '../models/surveyModel';
import { QuestionModel } from '../models/questionModel';
import { AnswerModel } from '../models/answerModel';


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

  async addSurvey(survey: SurveyModel) {
    const survey_data = survey.getCleanAddJson()
    const { data, error } = await this.supabase
      .from('surveys')
      .insert([survey_data])
      .select();
      return data?.[0]
  }

  async addQuestion(question: QuestionModel) {
    const question_data = question.getCleanAddJson()
    const { data, error } = await this.supabase
      .from('survey_questions')
      .insert([question_data])
      .select();
      return data?.[0]

  }
  
  async addAnswer(answer: AnswerModel) {
    const answer_data = answer.getCleanAddJson()
    const { data, error } = await this.supabase
      .from('question_answers')
      .insert([answer_data])
      .select();

  }
}
