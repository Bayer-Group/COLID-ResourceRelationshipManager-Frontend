import { Component } from '@angular/core';
import { environment } from 'projects/frontend/src/environments/environment';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { SearchFilterDialogComponent } from '../../../search/search-filter-dialog/search-filter-dialog.component';
import {
  GraphProperties,
  GraphVisualisationState,
  HideDetailSidebar,
} from '../../../state/graph-visualisation.state';
import { Select, Store } from '@ngxs/store';

@Component({
  selector: 'colid-main-layout',
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.scss'],
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
