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
  description: string = "";
  id: string = "";
  isSaveAs: boolean = false;

  constructor(
    public dialogRef: MatDialogRef<SaveMapDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { name: string, description: string, id: string, isSaveAs: boolean }
  ) {
    this.name = data.name;
    this.oldName = data.name;
    this.description = data.description;
    this.id = data.id;
    this.isSaveAs = data.isSaveAs;
  }

  ngOnInit(): void {

  };

  ok() {
    this.dialogRef.close({ name: this.name, description: this.description, saveAsNew: (this.id == "") });
  }

  cancel() {
    this.dialogRef.close();
  }

}
