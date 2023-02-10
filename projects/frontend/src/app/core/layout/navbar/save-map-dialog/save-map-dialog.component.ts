import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'colid-save-map-dialog',
  templateUrl: './save-map-dialog.component.html',
  styleUrls: ['./save-map-dialog.component.scss'],
})
export class SaveMapDialogComponent {
  name: string | null;
  description: string | null;
  isSaveAs: boolean;

  constructor(
    public dialogRef: MatDialogRef<SaveMapDialogComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      name: string;
      description: string;
      id: string;
      isSaveAs: boolean;
    }
  ) {
    this.name = data.name ?? null;
    this.description = data.description ?? null;
    this.isSaveAs = data.isSaveAs ?? false;
  }

  ok() {
    this.dialogRef.close({
      id: this.data.id,
      name: this.name,
      description: this.description,
      saveAsNew: this.data.id == null,
    });
  }

  cancel() {
    this.dialogRef.close();
  }
}
