import { SelectedAnswer } from "./selected-answer";

export interface SurveyVoteState {
    selectedAnswers: SelectedAnswer[];
    completed: boolean;
}
