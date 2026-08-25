import { Routes } from '@angular/router';
import { SurveyDetail } from './shared/components/survey-detail/survey-detail';
import { Home } from './shared/components/home/home';


export const routes: Routes = [
    {path:"", component:Home},
    {path:"detail/:id", component:SurveyDetail},
]