
import { Question } from '../interfaces/question';

export class QuestionModel implements Question{
    id:number; 
    title:string;
    survey_id: number;

    constructor (data: Partial<Question> = {}) {
        this.id = data.id ?? 0;
        this.title = data.title ?? "";
        this.survey_id = data.survey_id ?? 0;

    }

    getCleanAddJson() {
        return {
            title: this.title,
            survey_id: this.survey_id
        }
    }
}
