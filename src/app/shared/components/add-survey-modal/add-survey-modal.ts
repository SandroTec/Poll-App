import { Component, ElementRef, viewChild, ViewChild } from '@angular/core';

@Component({
  selector: 'app-add-survey-modal',
  imports: [],
  templateUrl: './add-survey-modal.html',
  styleUrl: './add-survey-modal.scss',
})

export class AddSurveyModal {
  @ViewChild('dialog') dialog!: ElementRef<HTMLDialogElement>;

  openModal() {
    this.dialog.nativeElement.showModal()
  }
}
