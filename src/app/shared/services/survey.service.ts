import { Injectable, signal } from '@angular/core';
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
    .subscribe(status => {
      console.log(
        'channel status',
        status
      )
    });

    this.questionChannel = this.supabase.channel('question-change-channel')
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'survey_questions' },
      (payload) => {
        let tmpQuestion = new QuestionModel(payload.new)
        this.questionList.update(list => [...list, tmpQuestion]);
      }
    )
    .subscribe(status => {
      console.log(
        'channel status',
        status
      )
    });

    this.answerChannel = this.supabase.channel('answer-change-channel')
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'question_answers' },
      (payload) => {
        let tmpAnswer = new AnswerModel(payload.new)
        this.answerList.update(list => [...list, tmpAnswer]);
      }
    )
    .subscribe(status => {
      console.log(
        'channel status',
        status
      )
    });


    this.voteChannel = this.supabase.channel('vote-insert-channel')
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'votes' },
      (payload) => {
        let tmpVote = new VoteModel(payload.new)
        this.voteList.update(list => [...list, tmpVote]);
        console.log('VOTE LIST:', this.voteList());
      }
    )
    .subscribe()

  }

  ngOnDestroy() {
    //very important to unsubscribe from the channel when the component is destroyed, 
    //otherwise we will get multiple subscriptions and multiple updates to the productlist signal
    this.supabase.removeChannel(this.surveyChannel);
    this.supabase.removeChannel(this.questionChannel);
    this.supabase.removeChannel(this.answerChannel);
    this.supabase.removeChannel(this.voteChannel);
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

  async getVotes(answerIds: number[]) {
    let response = await this.supabase.from('votes').select('*').in('answer_id', answerIds);
    this.voteList.set((response.data ?? []) as Vote[]);
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

  async addVotes(vote: VoteModel) {
    const vote_data = vote.getCleanAddJson();
    const { data, error } = await this.supabase
      .from('votes')
      .insert([vote_data])
      .select();
    if (error) {
      console.error(error);
    }
  }

  getVoteCount(answer_id:number) {
    return this.voteList().filter(vote => vote.answer_id === answer_id).length
  }

  // get all completed surveys from localStorage and return them into the completedSurveys-signal
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

// calculates and returns day remaining before survey is ending
  getEndingTime(surveyEndsAt: Date | undefined) {
    if (!surveyEndsAt) return 4 // return 4 so they are not in the ending soon list if they got no ending time.
    const now = new Date();
    const endTime = new Date(surveyEndsAt);
    const timeDifference = endTime.getTime() - now.getTime();
    const daysRemaining = Math.ceil(timeDifference / (1000 * 3600 * 24));
    return daysRemaining;
  }

  getTotalVotesForQuestion(questionId:number) {
    const questionPool = this.answerList().filter((answer:Answer) => answer.question_id === questionId);
    return questionPool.reduce((sum, answer) => {
      const voteCount = this.getVoteCount(answer.id)

      return sum + voteCount;
    }, 0)
  }

  getPercentageForAnswer(answerId:number, questionId:number) {
    const votes = this.getVoteCount(answerId);
    const totalVotes = this.getTotalVotesForQuestion(questionId);
    if (totalVotes === 0) return 0;
    const percentage = (votes / totalVotes) * 100
    return Math.round(percentage);
  }
}
