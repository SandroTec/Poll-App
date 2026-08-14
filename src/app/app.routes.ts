import { Routes } from '@angular/router';
import { SurveyDetail } from './shared/components/survey-detail/survey-detail';
import { Surveys } from './shared/components/surveys/surveys';

export const routes: Routes = [
    {path:"", component:Surveys},
    {path:"detail/:id", component:SurveyDetail},
]