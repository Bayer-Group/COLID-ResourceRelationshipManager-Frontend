import { AfterViewInit, Component } from '@angular/core';
import { Link, Node } from '../../../core/d3';
import { Store } from '@ngrx/store';
import { GraphState } from '../../../state/store-items';
import { Observable } from 'rxjs';
import { GraphLinkingData } from '../../../state/graph-linking/graph-linking.model';
import { LinkEditHistory, LinkEditHistoryDto, LinkHistoryAction } from '../../../shared/models/link-editing-history';
import { tap } from 'rxjs/operators';
import * as graphLinkingActions from '../../../state/graph-linking/graph-linking.actions';
import * as graphDataActions from '../../../state/graph-data/graph-data.actions';
import * as graphVisualisationActions from '../../../state/graph-visualisation/graph-visualisation.actions';
import { ResourceRelationshipManagerService } from '../../../core/http/resource-relationship-manager.service';

@Component({
  selector: 'colid-graph-container',
  templateUrl: './graph-container.component.html',
  styleUrls: ['./graph-container.component.scss']
})
export class GraphContainerComponent implements AfterViewInit {
  nodes: Node[] = [];
  links: Link[] = [];
  linkingProperties$: Observable<GraphLinkingData>;

  linkingModeEnabled: boolean = false;
  linkingNodesSelected: number = 0;
  linkHistory: LinkEditHistory[] = [];
  selectedHistory: LinkEditHistory[] = [];

  constructor(
    private store: Store<GraphState>,
    private service: ResourceRelationshipManagerService
  ) {
    this.linkingProperties$ = this.store.select('graphLinking');

  }
  ngAfterViewInit(): void {
    this.linkingProperties$.pipe(
      tap(
        linking => {
          this.linkingModeEnabled = linking.linkingModeEnabled;
          this.linkingNodesSelected = linking.linkNodes.length;
          this.linkHistory = linking.linkEditHistory;
          this.selectedHistory = this.linkHistory;
        }
      )
    ).subscribe();
    window.addEventListener("message", this.receiveMessage.bind(this), false);
  }

  //  Listen for filter message from iFrame
  receiveMessage(event: any) {
    const message = event.data.message;
    const uris = event.data.value
    if (message == "selectedPidURIs") {
      this.store.dispatch(graphVisualisationActions.setFilter({ pidUris: uris }))
    }
  }

  save() {
    let linkEditHistoryDto: LinkEditHistoryDto[] = [];
    this.selectedHistory.forEach(sh => {
      linkEditHistoryDto.push({
        action: sh.action,
        linkType: sh.linkType,
        sourceUri: sh.source.uri,
        targetUri: sh.target.uri
      });
    });
    this.store.dispatch(graphVisualisationActions.StartLoading());
    this.service.saveLinks(linkEditHistoryDto).subscribe(
      res => {
        this.store.dispatch(graphLinkingActions.ResetLinkEditHistory());
        this.selectedHistory.forEach(sh => {
          this.store.dispatch(graphLinkingActions.RemoveFromHistory({ item: sh }));
        })
        this.store.dispatch(graphVisualisationActions.EndLoading());
      }
    );
  }

  cancelLinking() {
    this.store.dispatch(graphLinkingActions.ResetLinking());
  }

  deleteHistoryEntry(event: any, item: LinkEditHistory) {
    event.stopPropagation();
    let link: Link = new Link(item.source.uri, item.target.uri, item.linkType);
    if (item.action == LinkHistoryAction.Delete) {
      //the action in the history was delete, so to undo it the link has to be added again

      this.store.dispatch(graphDataActions.AddLinks({ links: [link] }));
    }
    if (item.action == LinkHistoryAction.Add) {
      this.store.dispatch(graphDataActions.RemoveLinks({ links: [link] }));
    }

    this.store.dispatch(graphLinkingActions.RemoveFromHistory({ item: item }));
  }
}
