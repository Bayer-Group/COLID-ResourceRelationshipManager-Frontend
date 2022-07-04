import { Component, OnInit } from '@angular/core';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-support-feedback-bar',
  templateUrl: './support-feedback-bar.component.html',
  styleUrls: ['./support-feedback-bar.component.scss']
})
export class SupportFeedbackBarComponent {

  constructor() { }

  sendFeedbackMail() {
    // tslint:disable-next-line: max-line-length
    window.open(environment.appSupportFeedBack.mailToLink);
  }

}
