import { Vote } from '../interfaces/vote';

type VoteFormData = {
    answer_id: number;
};

export class VoteModel implements Vote{
    id:number; 
    answer_id: number;

    constructor (data: Partial<VoteFormData> = {}) {
        this.id = 0;
        this.answer_id = data.answer_id ?? 0;
    }

    /**
    * Returns the vote data required to create an vote.
    *
    * @returns The vote data without the ID.
    */
    getCleanAddJson() {
        return {
            answer_id: this.answer_id
        }
    }
}
