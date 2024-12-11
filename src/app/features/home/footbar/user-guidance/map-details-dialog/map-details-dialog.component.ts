import { ClipboardModule } from '@angular/cdk/clipboard';
import { DatePipe } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { GraphMapMetadata } from 'src/app/shared/models/graph-map-metadata';

@Component({
  selector: 'app-map-details-dialog',
  templateUrl: './map-details-dialog.component.html',
  styleUrls: ['./map-details-dialog.component.scss'],
  standalone: true,
  imports: [
    MatDividerModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatDialogModule,
    DatePipe,
    ClipboardModule
  ]
})
export class MapDetailsDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: GraphMapMetadata) {}

  stopPropagation(event: Event) {
    event.stopPropagation();
  }
}
