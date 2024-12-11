import { Component, ElementRef, Inject, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AddLinkDialogData } from 'src/app/shared/models/add-link-dialog-data';
import { LinkTypeContainer } from 'src/app/shared/models/link-types-dto';
import { ResourceRelationshipManagerService } from '../../../../shared/services/resource-relationship-manager.service';
import { Store } from '@ngxs/store';
import { ResetLinking } from 'src/app/state/graph-linking.state';

@Component({
  selector: 'colid-add-link-dialog',
  templateUrl: './add-link-dialog.component.html',
  styleUrls: ['./add-link-dialog.component.scss']
})
export class AddLinkDialogComponent {
  loading: boolean = false;
  linkTypes: LinkTypeContainer[];
  mapPageSize: number = 12;
  checkScroll: boolean = false;
  displayColumns: string[] = ['startNode', 'linkType', 'endNode'];

  @ViewChild('infiniteScroller', { static: false })
  infiniteScroller!: ElementRef;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: AddLinkDialogData,
    public dialogRef: MatDialogRef<AddLinkDialogComponent>,
    private resourceRelationshipManagerService: ResourceRelationshipManagerService,
    private store: Store
  ) {
    this.linkTypes = [];

    //initialize dialog with data from the API
    //check input parameter data for completeness
    if (this.data?.linkNodes?.length == 2) {
      //good to load all data
      const pidUris: string[] = this.data.linkNodes.map((a) => a.id);
      this.loading = true;
      this.resourceRelationshipManagerService
        .getLinkTypes(pidUris)
        .subscribe((res) => {
          let linkTypes: LinkTypeContainer[] = [];
          res.forEach((lt) => {
            let link: LinkTypeContainer = new LinkTypeContainer();
            link.source.uri = lt.sourceUri;
            link.source.name = this.data.linkNodes.find(
              (l) => l.id == lt.sourceUri
            )!.name;

            link.target.uri = lt.targetUri;
            link.target.name = this.data.linkNodes.find(
              (l) => l.id == lt.targetUri
            )!.name;

            link.linkType.key = lt.linkType.value;
            link.linkType.value = lt.linkType.name;

            linkTypes.push(link);
          });
          this.linkTypes = [...linkTypes];
          this.loading = false;
        });
    } else {
      //TODO: There are no two entries in the links list, issue an error
    }
  }

  createLink(selectedElement: LinkTypeContainer) {
    this.dialogRef.close(selectedElement);
  }

  onScroll(_) {
    if (this.checkScroll) return;

    if (
      this?.linkTypes.length == this.mapPageSize &&
      !!this.infiniteScroller &&
      this.infiniteScroller.nativeElement.scrollTop != 0
    ) {
      this.checkScroll = true;

      setTimeout(() => {
        this.checkScroll = false;
      }, 200);
    }
  }

  cancel() {
    this.store.dispatch(new ResetLinking());
    this.dialogRef.close();
  }
}
