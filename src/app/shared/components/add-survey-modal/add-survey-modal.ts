import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormGroup, FormControl, ReactiveFormsModule, Validators, FormArray } from '@angular/forms';

@Component({
  selector: 'app-add-survey-modal',
  imports: [ReactiveFormsModule],
  templateUrl: './add-survey-modal.html',
  styleUrl: './add-survey-modal.scss',
})

export class AddSurveyModal {
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
      question: new FormControl('n/a', {nonNullable: true, validators: [Validators.required]}),
      multiple_answers: new FormControl(true, {nonNullable: true}),
      answers: new FormArray([this.createAnswersForm()]),
    });
  }

  createAnswersForm() {
    return new FormGroup({
      answer: new FormControl('n/a', {nonNullable: true, validators: [Validators.required]}),
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
}
