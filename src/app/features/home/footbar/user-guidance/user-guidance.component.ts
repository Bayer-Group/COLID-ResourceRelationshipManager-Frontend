import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Select } from '@ngxs/store';
import { Observable } from 'rxjs';
import { GraphMapMetadata } from 'src/app/shared/models/graph-map-metadata';
import { MapDataState } from 'src/app/state/map-data.state';
import { MapDetailsDialogComponent } from './map-details-dialog/map-details-dialog.component';

@Component({
  selector: 'colid-user-guidance',
  templateUrl: './user-guidance.component.html',
  styleUrls: ['./user-guidance.component.scss'],
})
export class UserGuidanceComponent {
  @Select(MapDataState.getCurrentMap)
  currentMap$: Observable<GraphMapMetadata | null>;

  constructor(private dialog: MatDialog) {}

  showMapDetails(map: GraphMapMetadata): void {
    this.dialog.open(MapDetailsDialogComponent, {
      data: map,
      minWidth: '60vw',
    });
  }
}
