import { Component, OnInit } from '@angular/core';
import { ResourceRelationshipManagerService } from '../../../http/resource-relationship-manager.service'
import { Store } from '@ngrx/store';
import { GraphState } from 'projects/frontend/src/app/state/store-items';
import * as graphVisualisationActions from '../../../../state/graph-visualisation/graph-visualisation.actions';
import * as graphDataActions from '../../../../state/graph-data/graph-data.actions';
import { Link, Node } from 'projects/frontend/src/app/core/d3/models';


import { Output, EventEmitter } from '@angular/core';
import { environment } from 'projects/frontend/src/environments/environment';
import { MatDialogRef } from '@angular/material/dialog';
import { NodeLinkContainer } from 'projects/frontend/src/app/shared/models/node-link-container';
import { GraphProperties } from 'projects/frontend/src/app/state/graph-visualisation/graph-visualisation.model';
import { Observable } from 'rxjs';

@Component({
  selector: 'colid-add-resource-dialog',
  templateUrl: './add-resource-dialog.component.html',
  styleUrls: ['./add-resource-dialog.component.scss']
})
export class AddResourceDialogComponent implements OnInit {
  private pidUris: string[] = [];

  private node1: Node[] = [];
  private graphData$: Observable<GraphProperties> | undefined;
  public filterView: boolean = false;
  // isValid:boolean=false;
  public dmpUrl: string = "";
  constructor(private resourceRelationshipManagerService: ResourceRelationshipManagerService, private store: Store<GraphState>, public dialogRef: MatDialogRef<AddResourceDialogComponent>) {
    this.dmpUrl = environment.dmpUrl + "/search?fromRRM=true&q=*&sourceDialog=addResource&filterView=";

    this.graphData$ = this.store.select('graphVisualisation');
    this.graphData$.subscribe(
      data => {
        this.filterView = data.filterViewEnabled
      }
    )
  }

  ngOnInit(): void {
    window.addEventListener("message", this.receiveMessage.bind(this), false);
  }
  //event handler to receive broadcasted message events from the iframe
  //used for communication of PID URIs from DMP to this application
  receiveMessage(event: any) {
    const message = event.data.message;
    if (message == "selectedPidURIs") {
      let uris: string[] = event.data.value;
      this.pidUris = [];
      uris.forEach(
        u => {
          this.pidUris.push(decodeURIComponent(u));
        }
      )
    }
  }

  ongetPidUri(event: any) {
    this.dialogRef.close();
    if (this.pidUris.length > 0 || environment.environment == 'local') {
      this.resourceRelationshipManagerService.loadResources(this.pidUris);
    }


  }
}
