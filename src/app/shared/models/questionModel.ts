
import { Question } from '../interfaces/question';

type QuestionFormData = {
    title: string;
    survey_id: number;
    allow_multiple_answers: boolean;
};

export class QuestionModel implements Question{
    id:number; 
    title:string;
    survey_id: number;
    allow_multiple_answers: boolean;

    constructor (data: Partial<QuestionFormData> = {}) {
        this.id = 0;
        this.title = data.title ?? "";
        this.survey_id = data.survey_id ?? 0;
        this.allow_multiple_answers = data.allow_multiple_answers ?? false;
    }

    getCleanAddJson() {
        return {
            title: this.title,
            survey_id: this.survey_id,
            allow_multiple_answers: this.allow_multiple_answers
        }
    }
}
