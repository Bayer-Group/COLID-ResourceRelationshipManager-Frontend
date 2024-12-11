import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import {
  GraphVisualisationState,
  HideDetailSidebar
} from '../../../state/graph-visualisation.state';
import { Select, Store } from '@ngxs/store';

@Component({
  selector: 'colid-main-layout',
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.scss']
})
export class MainLayoutComponent {
  @Select(GraphVisualisationState.getLoadingResourcesStatus)
  loadingResources$: Observable<boolean>;
  @Select(GraphVisualisationState.getSidebarState)
  sidebarState$: Observable<boolean>;

  constructor(private store: Store) {}

  hideSidebar() {
    this.store.dispatch(new HideDetailSidebar());
  }
}
