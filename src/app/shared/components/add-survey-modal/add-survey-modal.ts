import { Component, ElementRef, inject, ViewChild } from '@angular/core';
import { FormGroup, FormControl, ReactiveFormsModule, Validators, FormArray } from '@angular/forms';
import { Router } from '@angular/router';
import { SurveyForm } from '../survey-form/survey-form';
import { SurveyService } from '../../services/survey.service';
import { SurveyModel } from '../../models/surveyModel';
import { QuestionModel } from '../../models/questionModel';
import { AnswerModel } from '../../models/answerModel';


@Component({
  selector: 'app-add-survey-modal',
  imports: [ReactiveFormsModule],
  templateUrl: './add-survey-modal.html',
  styleUrl: './add-survey-modal.scss',
})

export class AddSurveyModal {
  router = inject(Router);
  surveySevice = inject(SurveyService);

  //safes dialog html element as dialog via ViewChild
  @ViewChild('dialog') dialog!: ElementRef<HTMLDialogElement>;

  // classic showModal to display dialog when button in main is clicked
  openModal() {
    this.dialog.nativeElement.showModal()
  }

  surveyForm = new FormGroup({
    title: new FormControl('n/a', {nonNullable: true, validators: [Validators.required]}),
    description: new FormControl('n/a', {nonNullable: true, validators: [Validators.required]}),
    category: new FormControl('n/a', {nonNullable: true, validators: [Validators.required]}),
    ends_at: new FormControl(''),
    questions: new FormArray([this.createQuestionForm()]),
  })

  createQuestionForm() {
    return new FormGroup({
      title: new FormControl('n/a', {nonNullable: true, validators: [Validators.required]}),
      allow_multiple_answers: new FormControl(false, {nonNullable: true}),
      answers: new FormArray([
        this.createAnswersForm(),
        this.createAnswersForm()
      ]),
    });
  }

  createAnswersForm() {
    return new FormGroup({
      title: new FormControl('n/a', {nonNullable: true, validators: [Validators.required]}),
    });
  }

  addQuestion() {
    const questions = this.surveyForm.get('questions') as FormArray;
    questions.push(this.createQuestionForm());
  }

  addAnswers(questionIndex: number) {
    const questions = this.surveyForm.get('questions') as FormArray;
    const question = questions.at(questionIndex) as FormGroup;
    const answers = question.get('answers') as FormArray;
    answers.push(this.createAnswersForm());
  }

  async onSubmit() {
  if (this.surveyForm.valid) {
    const formValue = this.surveyForm.value;
    const survey = new SurveyModel(formValue);
    const createdSurvey = await this.surveySevice.addSurvey(survey);
    for (const questionValue of formValue.questions ?? []) {
      const question = new QuestionModel({
        ...questionValue,
        survey_id: createdSurvey.id
      });
      const createdQuestion =
        await this.surveySevice.addQuestion(question);
      for (const answerValue of questionValue.answers ?? []) {
        const answer = new AnswerModel({
          ...answerValue,
          question_id: createdQuestion.id
        });
        await this.surveySevice.addAnswer(answer);
      }
    }
  }
}
}
