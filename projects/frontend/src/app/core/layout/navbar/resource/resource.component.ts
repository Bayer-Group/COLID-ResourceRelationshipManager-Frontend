import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Store } from '@ngxs/store';
import { SearchFilterDialogComponent } from 'projects/frontend/src/app/shared/search-filter-dialog/search-filter-dialog.component';
import { ResetLinking } from 'projects/frontend/src/app/state/graph-linking.state';

@Component({
  selector: 'colid-resource',
  templateUrl: './resource.component.html',
  styleUrls: ['./resource.component.scss']
})
export class ResourceComponent {

  constructor(public dialog: MatDialog, private store: Store) { }

  openModal() {
    this.cancelLinking();
    this.dialog.open(SearchFilterDialogComponent, {
      "width": '80vw',
      "height": '90vh',
    });
  }

  cancelLinking() {
    this.store.dispatch(new ResetLinking());
  }


}
