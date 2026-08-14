import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from './shared/components/header/header';
import { Main } from './shared/components/main/main';
import { Surveys } from './shared/components/surveys/surveys';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, Main, Surveys],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('poll-app');
}
