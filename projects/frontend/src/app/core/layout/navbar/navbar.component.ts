import { Component, OnInit } from '@angular/core';
import { environment } from 'projects/frontend/src/environments/environment';
import { Store } from '@ngxs/store';
import { ResetAll } from '../../../state/graph-data.state';
import { ResetLinking } from '../../../state/graph-linking.state';
import { ToggleDetailSidebar } from '../../../state/graph-visualisation.state';
import {
  SetCurrentId,
  SetCurrentName,
  SetDescription,
  SetCurrentMap,
} from '../../../state/map-data.state';

@Component({
  selector: 'colid-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent {
  versionNumber = environment.versionNumber;
  environmentLabel =
    environment.environment == 'Prod' ? '' : environment.environment;

  constructor(private store: Store) {}

  newMap() {
    this.store.dispatch(new SetCurrentMap(null));
    this.store.dispatch(new ResetAll());
    this.store.dispatch(new ResetLinking());
  }
}
