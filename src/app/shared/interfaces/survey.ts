export interface Survey {

    id: number;
    title:string;
    description: string;
    category: string;
    created_at: Date;
    ends_at?: Date;
}
