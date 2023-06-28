import { Component } from '@angular/core';
import { Select } from '@ngxs/store';
import { Observable } from 'rxjs';
import { GraphMapMetadata } from 'src/app/shared/models/graph-map-metadata';
import { MapDataState } from 'src/app/state/map-data.state';

@Component({
  selector: 'colid-user-guidance',
  templateUrl: './user-guidance.component.html',
  styleUrls: ['./user-guidance.component.scss'],
})
export class UserGuidanceComponent {
  @Select(MapDataState.getCurrentMap)
  currentMap$: Observable<GraphMapMetadata | null>;
}
