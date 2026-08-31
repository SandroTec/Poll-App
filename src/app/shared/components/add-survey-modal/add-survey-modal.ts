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
  categories = this.surveySevice.categories.slice(1);


  //safes dialog html element as dialog via ViewChild
  @ViewChild('dialog') dialog!: ElementRef<HTMLDialogElement>;

  // classic showModal to display dialog when button in main is clicked
  openModal() {
    this.dialog.nativeElement.showModal()
  }
  closeModal() {
    this.dialog.nativeElement.close()
  }

  surveyForm = new FormGroup({
    title: new FormControl('', {nonNullable: true, validators: [Validators.required]}),
    description: new FormControl('', {nonNullable: false}),
    category: new FormControl('', {nonNullable: true, validators: [Validators.required]}),
    ends_at: new FormControl(''),
    questions: new FormArray([this.createQuestionForm()]),
  })

  get questions() {
    return this.surveyForm.controls.questions;
  }

  createQuestionForm() {
    return new FormGroup({
      title: new FormControl('', {nonNullable: true, validators: [Validators.required]}),
      allow_multiple_answers: new FormControl(false, {nonNullable: true}),
      answers: new FormArray([
        this.createAnswersForm(),
        this.createAnswersForm()
      ], {validators: [Validators.required]}),
    });
  }

  getAnswers(questionIndex:number) {
    return this.questions.at(questionIndex).controls.answers;
  }

  createAnswersForm() {
    return new FormGroup({
      title: new FormControl('', {nonNullable: true, validators: [Validators.required]}),
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
        const createdQuestion = await this.surveySevice.addQuestion(question);
        for (const answerValue of questionValue.answers ?? []) {
          const answer = new AnswerModel({
            ...answerValue,
            question_id: createdQuestion.id
          });
          await this.surveySevice.addAnswer(answer);
        }
      }
    }
    this.closeModal()
  }

  //clears specific input field and set form to invalid
  clearField(controlName:string) {
    this.surveyForm.get(controlName)?.reset();
  }

  clearQuestion(questionIndex: number) {
    const question = this.questions.at(questionIndex);

    if (question.controls.title.value !== '') {
        question.controls.title.reset();
    } else if (questionIndex !== 0) {
        this.questions.removeAt(questionIndex);
    }
  }

  clearAnswer(questionIndex: number, answerIndex:number) {
    const answers = this.getAnswers(questionIndex);
    const answer = answers.at(answerIndex);

    if (answer.controls.title.value !== '') {
        answer.controls.title.reset();
    } else if (answerIndex >= 2) {
        answers.removeAt(answerIndex);
    }
  }
}
