import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AddLinkDialogData } from 'projects/frontend/src/app/shared/models/add-link-dialog-data';
import { LinkTypeContainer, LinkTypesDto } from 'projects/frontend/src/app/shared/models/link-types-dto';
import { GraphState } from 'projects/frontend/src/app/state/store-items';
import { ResourceRelationshipManagerService } from '../../../http/resource-relationship-manager.service';
import * as graphLinkingActions from '../../../../state/graph-linking/graph-linking.actions';
import { Store } from '@ngrx/store';

@Component({
  selector: 'colid-add-link-dialog',
  templateUrl: './add-link-dialog.component.html',
  styleUrls: ['./add-link-dialog.component.scss']
})
export class AddLinkDialogComponent implements OnInit {

  loading: boolean = false;
  linkTypes: LinkTypeContainer[];

  displayColumns: string[] = ['startNode', 'linkType', 'endNode'];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: AddLinkDialogData,
    public dialogRef: MatDialogRef<AddLinkDialogComponent>,
    private resourceRelationshipManagerService: ResourceRelationshipManagerService,
    private store: Store<GraphState>
  ) {
    this.linkTypes = [];

    //initialize dialog with data from the API
    //check input parameter data for completeness
    if (this.data.linkNodes.length == 2) {
      //good to load all data
      const pidUris: string[] = this.data.linkNodes.map(a => a.resourceIdentifier);
      this.loading = true;
      this.resourceRelationshipManagerService.getLinkTypes(pidUris).subscribe(
        res => {
          let linkTypes: LinkTypeContainer[] = [];
          res.forEach(lt => {
            let link: LinkTypeContainer = new LinkTypeContainer();
            link.source.uri = lt.sourceUri;
            link.source.name = this.data.linkNodes.find(l => l.id == lt.sourceUri)!.name;
            //link.source.name = "hallo";

            link.target.uri = lt.targetUri;
            link.target.name = this.data.linkNodes.find(l => l.id == lt.targetUri)!.name;
            //link.target.name = "hallo";

            link.linkType.value = lt.linkType.value;
            link.linkType.name = lt.linkType.name;

            linkTypes.push(link);
          });
          this.linkTypes = [...linkTypes];
          this.loading = false;
        }
      );
    } else {
      //TODO: There are no two entries in the links list, issue an error
    }
  }

  ngOnInit(): void {

  }

  createLink(selectedElement: LinkTypeContainer) {
    this.dialogRef.close(selectedElement);
  }

  cancel() {
    this.store.dispatch(graphLinkingActions.ResetLinking());
    this.dialogRef.close();
  }

}
