import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Constants } from 'src/app/shared/constants';
import { Observable } from 'rxjs';
import { StatusBuildInformationDto } from 'src/app/shared/models/dto/status-build-information-dto';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-help',
  templateUrl: './help.component.html',
  styleUrls: ['./help.component.scss']
})
export class HelpComponent {
  logo = Constants.Assets.Logo;

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: { buildInformation$: Observable<StatusBuildInformationDto> }
  ) {}

  sendFeedbackMail() {
    window.open(environment.appSupportFeedBack.mailToLink);
  }

  createSupportTicket() {
    window.open(environment.appSupportFeedBack.supportTicketLink);
  }
}
