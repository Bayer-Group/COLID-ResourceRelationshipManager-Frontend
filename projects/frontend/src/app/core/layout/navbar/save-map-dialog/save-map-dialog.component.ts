import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'colid-save-map-dialog',
  templateUrl: './save-map-dialog.component.html',
  styleUrls: ['./save-map-dialog.component.scss']
})
export class SaveMapDialogComponent implements OnInit {

  name: string = "";
  oldName: string = "";

  constructor(
    public dialogRef: MatDialogRef<SaveMapDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { name: string }
  ) {
    this.name = data.name;
    this.oldName = data.name;
  }

  ngOnInit(): void {

  };

  ok() {
    this.dialogRef.close({ name: this.name, saveAsNew: (this.oldName != this.name) });
  }

  cancel() {
    this.dialogRef.close();
  }

}
