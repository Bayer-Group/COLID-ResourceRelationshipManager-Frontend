import { Output } from '@angular/core';
import { Component, EventEmitter } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AddResourceDialogComponent } from 'projects/frontend/src/app/core/layout/navbar/add-resource-dialog/add-resource-dialog.component';
import { Store } from '@ngrx/store';
import * as graphLinkingActions from '../../../../state/graph-linking/graph-linking.actions';
import { GraphState } from 'projects/frontend/src/app/state/store-items';

@Component({
  selector: 'colid-resource',
  templateUrl: './resource.component.html',
  styleUrls: ['./resource.component.scss']
})
export class ResourceComponent {

  constructor(public dialog: MatDialog, private store: Store<GraphState>) { }

  openDialog() {
    const dialogRef = this.dialog.open(AddResourceDialogComponent, {
      width: '1800px',
      height: '900px'
    });
  }

  cancelLinking() {
    this.store.dispatch(graphLinkingActions.ResetLinking());
  }


}
