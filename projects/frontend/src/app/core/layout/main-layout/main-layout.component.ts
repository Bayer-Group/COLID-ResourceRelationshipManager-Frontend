import { Component } from '@angular/core';
import { environment } from 'projects/frontend/src/environments/environment';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';
import { SearchFilterDialogComponent } from '../../../shared/search-filter-dialog/search-filter-dialog.component';
import { GraphProperties, GraphVisualisationState, HideDetailSidebar } from '../../../state/graph-visualisation.state';
import { Select, Store } from '@ngxs/store';

@Component({
  selector: 'colid-main-layout',
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.scss']
})
export class MainLayoutComponent {
  @Select(GraphVisualisationState.getGraphVisualisationState) graphProperties$: Observable<GraphProperties>;
  pidUri: string = "";
  dmpUrl: string = "";
  openDrawer: boolean = false;
  loadingResources: boolean = false;

  constructor(private store: Store, private matDialog: MatDialog) {
    this.dmpUrl = environment.dmpUrl + "/resource-detail?sourceDialog=detailView"
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
    this.store.dispatch(new HideDetailSidebar());
  }

  gotoSearch() {

  }
  openModal() {
    this.matDialog.open(SearchFilterDialogComponent, {
      "width": '600px',
      "height": '500px',
      //"autoFocus": false
    });
  }
}

