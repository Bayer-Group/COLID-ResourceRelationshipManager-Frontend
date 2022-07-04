import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'colid-save-confirmation-dialog',
  templateUrl: './save-confirmation-dialog.component.html',
  styleUrls: ['./save-confirmation-dialog.component.scss']
})
export class SaveConfirmationDialogComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<SaveConfirmationDialogComponent>
  ) { }

  ngOnInit(): void {
  }

  cancel() {
    this.dialogRef.close();
  }

  discard() {
    this.dialogRef.close('discard');
  }

}
