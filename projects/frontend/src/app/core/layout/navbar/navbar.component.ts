import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Store } from '@ngrx/store';
import { GraphState } from '../../../state/store-items';
import * as graphVisualisationActions from '../../../state/graph-visualisation/graph-visualisation.actions';
import * as mapDataActions from '../../../state/map-data/map-data.actions';
import * as graphDataActions from '../../../state/graph-data/graph-data.actions';
import * as graphLinkingActions from '../../../state/graph-linking/graph-linking.actions';
import { environment } from 'projects/frontend/src/environments/environment';

@Component({
  selector: 'colid-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})

export class NavbarComponent implements OnInit {
  environmentLabel: string = ""

  constructor(private store: Store<GraphState>) {

  }
  ngOnInit() {
    if (environment.environment == "development") {
      this.environmentLabel = "(DEV)"
    } else if (environment.environment == "qa") {
      this.environmentLabel = "QA"
    }
  }

  newMap() {

    this.store.dispatch(mapDataActions.SetCurrentId({ id: "" }));
    this.store.dispatch(mapDataActions.SetCurrentName({ name: "" }));
    this.store.dispatch(mapDataActions.SetCurrentModifiedBy({ modifiedBy: "" }));
    this.store.dispatch(graphDataActions.ResetAll());
    this.store.dispatch(graphLinkingActions.ResetLinking());
  }
  toggleSidebar() {
    this.store.dispatch(graphVisualisationActions.ToggleDetailSidebar());
  }
}
