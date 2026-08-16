import { Component, ElementRef, ViewChild } from '@angular/core';

@Component({
  selector: 'app-add-survey-modal',
  imports: [],
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
}
