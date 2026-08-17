
import { Survey } from '../interfaces/survey';

export class SurveyModal implements Survey{
    id:number; 
    title:string;
    description:string;
    category: string;
    created_at: Date;
    ends_at?: Date;

    //when I'm not sure if the data is complete, I can use Partial<Survey> to make all properties optional
    constructor (data: Partial<Survey> = {}) {
        this.id = data.id ?? 0;
        this.title = data.title ?? "";
        this.description = data.description ?? "";
        this.category = data.category ?? "";
        this.created_at = data.created_at ?? new Date();
        this.ends_at = data.ends_at;

    }

    // get a clean json object for adding a new Survey to the database, without the id property!!!
    getCleanAddJson() {
        return {
            title: this.title,
            description: this.description,
            category: this.category,
            created_at : this.created_at,
            ends_at: this.ends_at
        }
    }
}
