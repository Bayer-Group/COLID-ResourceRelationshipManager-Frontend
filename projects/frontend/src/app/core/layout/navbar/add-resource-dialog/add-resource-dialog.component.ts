import { Component, OnInit } from '@angular/core';
import { ResourceRelationshipManagerService } from '../../../http/resource-relationship-manager.service'
import { environment } from 'projects/frontend/src/environments/environment';
import { MatDialogRef } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { Select } from '@ngxs/store';
import { GraphProperties, GraphVisualisationState } from 'projects/frontend/src/app/state/graph-visualisation.state';

@Component({
  selector: 'colid-add-resource-dialog',
  templateUrl: './add-resource-dialog.component.html',
  styleUrls: ['./add-resource-dialog.component.scss']
})
export class AddResourceDialogComponent implements OnInit {
  private pidUris: string[] = [];

  @Select(GraphVisualisationState.getGraphVisualisationState) private graphData$: Observable<GraphProperties>;
  public filterView: boolean = false;
  // isValid:boolean=false;
  public dmpUrl: string = "";
  constructor(private resourceRelationshipManagerService: ResourceRelationshipManagerService, public dialogRef: MatDialogRef<AddResourceDialogComponent>) {
    this.dmpUrl = environment.dmpUrl + "/search?fromRRM=true&q=*&sourceDialog=addResource&filterView=";

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
  //no need to decode the uri??
  receiveMessage(event: any) {
    const message = event.data.message;
    //if(event.data.value==this.pidUris)
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
