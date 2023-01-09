import { AfterViewInit, Component } from '@angular/core';
import { Link, Node } from '../../../core/d3';
import { Observable } from 'rxjs';
import { LinkEditHistory, LinkEditHistoryDto, LinkHistoryAction } from '../../../shared/models/link-editing-history';
import { tap } from 'rxjs/operators';
import { ResourceRelationshipManagerService } from '../../../core/http/resource-relationship-manager.service';
import { Select, Store } from '@ngxs/store';
import { AddLinks, RemoveLinks } from '../../../state/graph-data.state';
import { ClearHistory, DisableLinkingMode, GraphLinkingData, GraphLinkingDataState, RemoveFromHistory, ResetLinkEditHistory, ResetLinking } from '../../../state/graph-linking.state';
import { EndLoading, StartLoading } from '../../../state/graph-visualisation.state';

@Component({
  selector: 'colid-graph-container',
  templateUrl: './graph-container.component.html',
  styleUrls: ['./graph-container.component.scss']
})
export class GraphContainerComponent implements AfterViewInit {
  nodes: Node[] = [];
  links: Link[] = [];
  @Select(GraphLinkingDataState.getGraphLinkingState) linkingProperties$: Observable<GraphLinkingData>;

  linkingModeEnabled: boolean = false;
  linkingNodesSelected: number = 0;
  linkHistory: LinkEditHistory[] = [];
  selectedHistory: LinkEditHistory[] = [];
  constructor(
    private store: Store,
    private service: ResourceRelationshipManagerService
  ) { }

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
    //window.addEventListener("message", this.receiveMessage.bind(this), false);
  }

  //  Listen for filter message from iFrame


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
    this.store.dispatch(new StartLoading());
    this.service.saveLinks(linkEditHistoryDto).subscribe(
      res => {
        this.store.dispatch(new ResetLinkEditHistory());
        this.selectedHistory.forEach(sh => {
          this.store.dispatch(new RemoveFromHistory(sh));
        })
        this.store.dispatch(new EndLoading());
      }
    );
  }


  cancelLinking() {
    this.store.dispatch(new ResetLinking());
  }

  deleteHistoryEntry(event: any, item: LinkEditHistory) {
    event.stopPropagation();
    let link: Link = new Link(item.source.uri, item.target.uri, item.linkType);
    if (item.action == LinkHistoryAction.Delete) {
      //the action in the history was delete, so to undo it the link has to be added again

      this.store.dispatch(new AddLinks([link]));
    }
    if (item.action == LinkHistoryAction.Add) {
      this.store.dispatch(new RemoveLinks([link]));
    }

    this.store.dispatch(new RemoveFromHistory(item));
  }

  cancelSelection(linkHistory) {
    const linksToRemove = linkHistory.map(item => new Link(item.source.uri, item.target.uri, item.linkType));
    this.store.dispatch(new RemoveLinks(linksToRemove));
    this.store.dispatch(new ClearHistory());
    this.store.dispatch(new DisableLinkingMode());
  }
}
