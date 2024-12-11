import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogClose } from '@angular/material/dialog';

@Component({
  selector: 'app-delete-item-dialog',
  templateUrl: './delete-item-dialog.component.html',
  styleUrls: ['./delete-item-dialog.component.scss'],
  standalone: true,
  imports: [MatDialogClose]
})
export class DeleteItemDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {}
}
