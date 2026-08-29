import { Survey } from '../interfaces/survey';

type SurveyFormData = {
    id?:number;
    title: string;
    description: string | null;
    category: string;
    ends_at: string | null;
};

export class SurveyModel implements Survey {
    id: number;
    title: string;
    description?: string;
    category: string;
    created_at: Date;
    ends_at?: Date;

    constructor(data: Partial<SurveyFormData> = {}) {
        this.id = data.id ?? 0;
        this.title = data.title ?? "";
        this.description = data.description ? "" : undefined;
        this.category = data.category ?? "";
        this.created_at = new Date();
        this.ends_at = data.ends_at ? new Date(data.ends_at) : undefined;
    }

    getCleanAddJson() {
        return {
            title: this.title,
            description: this.description,
            category: this.category,
            created_at: this.created_at,
            ends_at: this.ends_at
        };
    }
}