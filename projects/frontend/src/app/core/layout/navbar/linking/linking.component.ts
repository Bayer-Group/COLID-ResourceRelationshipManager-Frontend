import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AddLinkDialogComponent } from '../add-link-dialog/add-link-dialog.component';
import { Link } from '../../../d3';
import { LinkTypeContainer } from 'projects/frontend/src/app/shared/models/link-types-dto';
import { LinkHistoryAction } from 'projects/frontend/src/app/shared/models/link-editing-history';
import { AddLinks } from 'projects/frontend/src/app/state/graph-data.state';
import { Select, Store } from '@ngxs/store';
import {
  AddToLinkEditHistory,
  EnableLinkingMode,
  GraphLinkingData,
  GraphLinkingDataState,
  ResetLinking,
} from 'projects/frontend/src/app/state/graph-linking.state';

@Component({
  selector: 'colid-linking',
  templateUrl: './linking.component.html',
  styleUrls: ['./linking.component.scss'],
})
export class LinkingComponent implements OnInit {
  @Select(GraphLinkingDataState.getGraphLinkingState)
  private linkingProperties$!: Observable<GraphLinkingData>;

  constructor(public dialog: MatDialog, private store: Store) {}

  ngOnInit() {
    this.linkingProperties$
      .pipe(
        tap((linkingProperties) => {
          if (linkingProperties.linkNodes.length == 2) {
            let dialogRef: MatDialogRef<AddLinkDialogComponent> =
              this.dialog.open(AddLinkDialogComponent, {
                height: '600px',
                width: '800px',
                disableClose: true,
                data: {
                  linkNodes: linkingProperties.linkNodes,
                },
              });

            dialogRef.afterClosed().subscribe((result: LinkTypeContainer) => {
              if (result != null) {
                let links: Link[] = [];
                let link: Link = new Link(
                  result.source.uri,
                  result.target.uri,
                  result.linkType
                );
                link.outbound = true;
                links.push(link);

                //reset linking state to avoid double opening of the dialog
                this.store.dispatch(new ResetLinking());
                this.store.dispatch(
                  new AddToLinkEditHistory(result, LinkHistoryAction.Add)
                );
                this.store.dispatch(new AddLinks(links));
              }
            });
          }
        })
      )
      .subscribe();
  }

  startLinkingMode() {
    this.store.dispatch(new EnableLinkingMode());
  }
}
