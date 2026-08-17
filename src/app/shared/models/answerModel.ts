
import { Answer } from '../interfaces/answer';

export class AnswerModel implements Answer{
    id:number; 
    title:string;
    question_id: number;

    constructor (data: Partial<Answer> = {}) {
        this.id = data.id ?? 0;
        this.title = data.title ?? "";
        this.question_id = data.question_id ?? 0;
    }

    getCleanAddJson() {
        return {
            title: this.title,
            question_id: this.question_id
        }
    }
}
