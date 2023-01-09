import { Component, OnInit } from '@angular/core';
import { environment } from 'projects/frontend/src/environments/environment';
import { Store } from '@ngxs/store';
import { ResetAll } from '../../../state/graph-data.state';
import { ResetLinking } from '../../../state/graph-linking.state';
import { ToggleDetailSidebar } from '../../../state/graph-visualisation.state';
import { SetCurrentId, SetCurrentModifiedBy, SetCurrentName, SetDescription } from '../../../state/map-data.state';

@Component({
  selector: 'colid-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})

export class NavbarComponent implements OnInit {
  versionNumber = environment.versionNumber;
  environmentLabel = environment.environment == 'Prod' ? "" : environment.environment;

  constructor(private store: Store) { }

  ngOnInit() { }

  newMap() {

    this.store.dispatch(new SetCurrentId(""));
    this.store.dispatch(new SetCurrentName(""));
    this.store.dispatch(new SetDescription(""));
    this.store.dispatch(new SetCurrentModifiedBy(""));
    this.store.dispatch(new ResetAll());
    this.store.dispatch(new ResetLinking());
  }

  toggleSidebar() {
    this.store.dispatch(new ToggleDetailSidebar());
  }

}
