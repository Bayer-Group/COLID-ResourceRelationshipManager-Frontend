import { Component, EventEmitter, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { GraphLinkingData } from 'projects/frontend/src/app/state/graph-linking/graph-linking.model';
import { GraphState } from 'projects/frontend/src/app/state/store-items';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

import * as graphLinkingActions from '../../../../state/graph-linking/graph-linking.actions';
import * as graphDataActions from '../../../../state/graph-data/graph-data.actions';
import { AddLinkDialogComponent } from '../add-link-dialog/add-link-dialog.component';
import { Link } from '../../../d3';
import { LinkTypeContainer, LinkTypesDto } from 'projects/frontend/src/app/shared/models/link-types-dto';
import { ItemDescriptor } from 'projects/frontend/src/app/shared/models/resource-descriptor-mini';
import { LinkHistoryAction } from 'projects/frontend/src/app/shared/models/link-editing-history';

@Component({
  selector: 'colid-linking',
  templateUrl: './linking.component.html',
  styleUrls: ['./linking.component.scss']
})
export class LinkingComponent implements OnInit {

  private linkingProperties$!: Observable<GraphLinkingData>;

  constructor(
    public dialog: MatDialog,
    private store: Store<GraphState>,
  ) {
    this.linkingProperties$ = this.store.select('graphLinking');
  }

  ngOnInit() {
    this.linkingProperties$.pipe(
      tap(
        linkingProperties => {
          if (linkingProperties.linkNodes.length == 2) {


            let dialogRef: MatDialogRef<AddLinkDialogComponent> = this.dialog.open(AddLinkDialogComponent, {
              height: '600px',
              width: '800px',
              disableClose: true,
              data: {
                linkNodes: linkingProperties.linkNodes
              }
            });

            dialogRef.afterClosed().subscribe((result: LinkTypeContainer) => {
              if (result != null) {
                let links: Link[] = [];
                let link: Link = new Link(result.source.uri, result.target.uri, result.linkType);
                links.push(link);

                //reset linking state to avoid double opening of the dialog
                this.store.dispatch(graphLinkingActions.ResetLinking());
                this.store.dispatch(graphLinkingActions.AddToLinkEditHistory({ link: result, action: LinkHistoryAction.Add }));
                this.store.dispatch(graphDataActions.AddLinks({ links: links }));
              }
            });

          }
        }
      )
    ).subscribe();
  }

  startLinkingMode() {
    this.store.dispatch(graphLinkingActions.EnableLinkingMode());
  }

}
