import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'colid-save-confirmation-dialog',
  templateUrl: './save-confirmation-dialog.component.html',
  styleUrls: ['./save-confirmation-dialog.component.scss']
})
export class SaveConfirmationDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<SaveConfirmationDialogComponent>
  ) {}

  cancel() {
    this.dialogRef.close();
  }

  discard() {
    this.dialogRef.close('discard');
  }
}
