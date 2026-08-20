import { Vote } from '../interfaces/vote';

type VoteFormData = {
    title: string;
    answer_id: number;
};

export class VoteModel implements Vote{
    id:number; 
    answer_id: number;

    constructor (data: Partial<VoteFormData> = {}) {
        this.id = 0;
        this.answer_id = data.answer_id ?? 0;
    }

    getCleanAddJson() {
        return {
            answer_id: this.answer_id
        }
    }
}
