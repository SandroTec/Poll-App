import { Component } from '@angular/core';
import { Surveys } from '../surveys/surveys';
import { Main } from '../main/main';
import { Header } from '../header/header';

@Component({
  selector: 'app-home',
  imports: [Surveys, Main, Header],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {}
