import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { GraphMapMetadata } from 'src/app/shared/models/graph-map-metadata';

@Component({
  selector: 'app-map-details-dialog',
  templateUrl: './map-details-dialog.component.html',
  styleUrls: ['./map-details-dialog.component.scss'],
})
export class MapDetailsDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: GraphMapMetadata) {}
}
