
import { Answer } from '../interfaces/answer';

type AnswerFormData = {
    id?:number;
    title: string;
    question_id: number;
};

export class AnswerModel implements Answer{
    id:number; 
    title:string;
    question_id: number;

    constructor (data: Partial<AnswerFormData> = {}) {
        this.id = data.id ?? 0;
        this.title = data.title ?? "";
        this.question_id = data.question_id ?? 0;
    }

    /**
    * Returns the answer data required to create an answer.
    *
    * @returns The answer data without the ID.
    */
    getCleanAddJson() {
        return {
            title: this.title,
            question_id: this.question_id
        }
    }
}
