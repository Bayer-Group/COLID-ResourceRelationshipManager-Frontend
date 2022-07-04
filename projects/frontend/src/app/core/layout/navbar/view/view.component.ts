import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { GraphProperties } from 'projects/frontend/src/app/state/graph-visualisation/graph-visualisation.model';
import { GraphState } from 'projects/frontend/src/app/state/store-items';
import { environment } from 'projects/frontend/src/environments/environment';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import * as graphActions from '../../../../state/graph-visualisation/graph-visualisation.actions';
import * as graphLinkingActions from '../../../../state/graph-linking/graph-linking.actions';

@Component({
  selector: 'colid-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.scss']
})
export class ViewComponent implements OnInit {
  isLongNameSelected: boolean = true;
  isLinkNameSelected: boolean = true;
  isFilterViewSelected: boolean = false;

  graphSettings$: Observable<GraphProperties>;

  constructor(private store: Store<GraphState>) {
    this.graphSettings$ = this.store.select('graphVisualisation');
  }

  ngOnInit() {
    this.graphSettings$.pipe(
      tap(
        settings => {
          this.isLongNameSelected = settings.showLongNames;
          this.isLinkNameSelected = settings.showConnectionNames;
        }
      )
    )
  }

  toggleResourceName() {
    this.isLongNameSelected = !this.isLongNameSelected;
    this.store.dispatch(graphActions.ShowLongNames({ showLongNames: this.isLongNameSelected }));
  }

  toggleFilterView() {
    this.isFilterViewSelected = !this.isFilterViewSelected;
    (document.getElementById('detail-frame') as unknown as HTMLIFrameElement)
      .contentWindow?.postMessage({ message: "filterView", value: this.isFilterViewSelected }, "*");
    this.store.dispatch(graphActions.clearFilter())
    this.store.dispatch(graphActions.toggleFilterView({ filterView: this.isFilterViewSelected }));
  }

  toggleConnectionName() {
    this.isLinkNameSelected = !this.isLinkNameSelected;
    this.store.dispatch(graphActions.ShowConnectionNames({ showConnectionNames: this.isLinkNameSelected }));
  }

  cancelLinking() {
    this.store.dispatch(graphLinkingActions.ResetLinking());
  }
}
