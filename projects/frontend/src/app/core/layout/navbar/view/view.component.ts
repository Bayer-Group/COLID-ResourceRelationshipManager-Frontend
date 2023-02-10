import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ResetLinking } from 'projects/frontend/src/app/state/graph-linking.state';
import { Select, Store } from '@ngxs/store';
import {
  ClearFilter,
  GraphProperties,
  GraphVisualisationState,
  ShowConnectionNames,
  ShowLongNames,
  ToggleFilterView,
} from 'projects/frontend/src/app/state/graph-visualisation.state';

@Component({
  selector: 'colid-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.scss'],
})
export class ViewComponent implements OnInit {
  isLongNameSelected: boolean = true;
  isLinkNameSelected: boolean = true;
  isFilterViewSelected: boolean = false;

  @Select(GraphVisualisationState.getGraphVisualisationState)
  graphSettings$: Observable<GraphProperties>;

  constructor(private store: Store) {}

  ngOnInit() {
    this.graphSettings$.pipe(
      tap((settings) => {
        this.isLongNameSelected = settings.showLongNames;
        this.isLinkNameSelected = settings.showConnectionNames;
      })
    );
  }

  toggleResourceName() {
    this.isLongNameSelected = !this.isLongNameSelected;
    this.store.dispatch(new ShowLongNames(this.isLongNameSelected));
  }

  toggleFilterView() {
    this.isFilterViewSelected = !this.isFilterViewSelected;
    (
      document.getElementById('detail-frame') as unknown as HTMLIFrameElement
    ).contentWindow?.postMessage(
      { message: 'filterView', value: this.isFilterViewSelected },
      '*'
    );
    this.store.dispatch(new ClearFilter());
    this.store.dispatch(new ToggleFilterView(this.isFilterViewSelected));
  }

  toggleConnectionName() {
    this.isLinkNameSelected = !this.isLinkNameSelected;
    this.store.dispatch(new ShowConnectionNames(this.isLinkNameSelected));
  }

  cancelLinking() {
    this.store.dispatch(new ResetLinking());
  }
}
