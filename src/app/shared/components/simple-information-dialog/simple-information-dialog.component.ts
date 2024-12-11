import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogClose } from '@angular/material/dialog';

interface DialogData {
  header: string;
  body: string;
}

@Component({
  selector: 'app-simple-information-dialog',
  templateUrl: './simple-information-dialog.component.html',
  styleUrls: ['./simple-information-dialog.component.scss'],
  standalone: true,
  imports: [MatDialogClose]
})
export class SimpleInformationDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: DialogData) {}
}
