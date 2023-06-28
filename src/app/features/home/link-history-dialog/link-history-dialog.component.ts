import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

interface LinkData {
  startPidUri: string;
  endPidUri: string;
}

@Component({
  selector: 'colid-link-history-dialog',
  templateUrl: './link-history-dialog.component.html',
  styleUrls: ['./link-history-dialog.component.scss'],
})
export class LinkHistoryDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: LinkData) {}
}
