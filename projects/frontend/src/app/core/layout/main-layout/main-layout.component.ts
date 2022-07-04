import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { environment } from 'projects/frontend/src/environments/environment';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { GraphProperties } from '../../../state/graph-visualisation/graph-visualisation.model';
import { GraphState } from '../../../state/store-items';
import * as graphVisualisationActions from '../../../state/graph-visualisation/graph-visualisation.actions';

@Component({
  selector: 'colid-main-layout',
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.scss']
})
export class MainLayoutComponent {
  graphProperties$: Observable<GraphProperties>;
  pidUri: string = "";
  dmpUrl: string = "";
  openDrawer: boolean = false;
  loadingResources: boolean = false;

  constructor(private store: Store<GraphState>) {
    this.dmpUrl = environment.dmpUrl + "/resource-detail?sourceDialog=detailView"
    this.graphProperties$ = this.store.select('graphVisualisation');
    this.graphProperties$.pipe(
      tap(
        gp => {
          this.openDrawer = gp.showDetailSidebar;
          if (this.openDrawer) {
            (document.getElementById('detail-frame') as unknown as HTMLIFrameElement)
              .contentWindow?.postMessage({ message: "sourceDialog", value: "detailSidebar" }, "*");
          }
          this.loadingResources = gp.loadingResources;
        }
      )
    ).subscribe(gp => {
      if (gp.detailedResource == this.pidUri) {

      } else {
        this.pidUri = gp.detailedResource;
        (document.getElementById('detail-frame') as unknown as HTMLIFrameElement)
          .contentWindow?.postMessage({ message: "nodeSelection", value: gp.detailedResource }, "*");
      }
    });
  }

  hideSidebar() {
    this.store.dispatch(graphVisualisationActions.HideDetailSidebar());
  }
}

