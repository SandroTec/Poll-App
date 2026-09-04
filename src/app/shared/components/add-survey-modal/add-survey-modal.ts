import { Component, ElementRef, inject, ViewChild } from '@angular/core';
import { FormGroup, FormControl, ReactiveFormsModule, Validators, FormArray } from '@angular/forms';
import { Router } from '@angular/router';
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


  /**
  * References the dialog element used for the survey modal.
  */
  @ViewChild('dialog') dialog!: ElementRef<HTMLDialogElement>;

  /**
  * opens the survey modal 
  */  openModal() {
    this.dialog.nativeElement.showModal()
  }

  /**
  * Closes the survey modal 
  */
  closeModal() {
    this.dialog.nativeElement.close()
  }

  /**
  * Closes modal when clicking on the backdrop
  */
  onDialogClick(event: MouseEvent) {
    const rect = this.dialog.nativeElement.getBoundingClientRect();
    const isClickOutside = (
      event.clientX < rect.left ||
      event.clientX > rect.right ||
      event.clientY < rect.top ||
      event.clientY > rect.bottom
    );
    if (isClickOutside) {
      this.closeModal();
    }
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

  /**
  * Creates a new question form group.
  *
  * @returns A new question form group.
  */
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

  /**
  * Returns the answers form array of a specific question.
  *
  * @param questionIndex - The index of the question in the questions array.
  * @returns The answers form array of the specified question.
  */
  getAnswers(questionIndex:number) {
    return this.questions.at(questionIndex).controls.answers;
  }

  /**
  * Creates a new answer form group.
  *
  * @returns A new answer form group.
  */
  createAnswersForm() {
    return new FormGroup({
      title: new FormControl('', {nonNullable: true, validators: [Validators.required]}),
    });
  }

  /**
  * Adds a new question form group to the questions array.
  */
  addQuestion() {
    const questions = this.surveyForm.get('questions') as FormArray;
    questions.push(this.createQuestionForm());
  }

  /**
  * Adds a new answer form group to a specific question.
  *
  * @param questionIndex - Index of the question to add the answer to.
  */
  addAnswers(questionIndex: number) {
    const questions = this.surveyForm.get('questions') as FormArray;
    const question = questions.at(questionIndex) as FormGroup;
    const answers = question.get('answers') as FormArray;
    answers.push(this.createAnswersForm());
  }

  /**
  * Submits the survey form and creates the survey with its questions and answers.
  * Closes the modal after submission and resets the form.
  */
  async onSubmit() {
    if (this.surveyForm.valid) {
      const formValue = this.surveyForm.value;
      const survey = new SurveyModel(formValue);
      const createdSurvey = await this.surveySevice.addSurvey(survey);
      for (const questionValue of formValue.questions ?? []) {
        const question = new QuestionModel({...questionValue, survey_id: createdSurvey.id});
        const createdQuestion = await this.surveySevice.addQuestion(question);
        for (const answerValue of questionValue.answers ?? []) {
          const answer = new AnswerModel({...answerValue, question_id: createdQuestion.id});
          await this.surveySevice.addAnswer(answer);
        }
      }
    }
    this.surveyForm.reset();
    this.closeModal()
  }

  /**
  * Resets a  specific form control.
  *
  * @param controlName Name of the form control to reset.
  */
  clearField(controlName:string) {
    this.surveyForm.get(controlName)?.reset();
  }

  /**
  * Resets a question input or removes the question if it is empty.
  *
  * @param questionIndex - The index of the question to reset or remove.
  */
  clearQuestion(questionIndex: number) {
    const question = this.questions.at(questionIndex);

    if (question.controls.title.value !== '') {
        question.controls.title.reset();
    } else if (questionIndex !== 0) {
        this.questions.removeAt(questionIndex);
    }
  }

  /**
  * Resets an answer input or removes the answer if it is empty.
  *
  * @param questionIndex - The index of the question containing the answer.
  * @param answerIndex - The index of the answer to reset or remove.
  */
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
