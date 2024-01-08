import { OnInit, AfterViewInit, Component, ViewChild } from '@angular/core';
import { Link } from '../../../core/d3';
import { Observable } from 'rxjs';
import {
  LinkEditHistory,
  LinkEditHistoryDto,
  LinkHistoryAction,
} from '../../../shared/models/link-editing-history';
import { tap } from 'rxjs/operators';
import { ResourceRelationshipManagerService } from '../../../core/http/resource-relationship-manager.service';
import { Select, Store } from '@ngxs/store';
import { AddLinks, RemoveLinks } from '../../../state/graph-data.state';
import {
  ClearHistory,
  DisableLinkingMode,
  GraphLinkingData,
  GraphLinkingDataState,
  RemoveFromHistory,
  ResetLinkEditHistory,
  ResetLinking,
} from '../../../state/graph-linking.state';
import {
  EndLoading,
  StartLoading,
} from '../../../state/graph-visualisation.state';
import { GraphComponent } from './graph/graph.component';
import { LinkDto } from '../../../shared/models/link-dto';
import { ActivatedRoute } from '@angular/router';
import { LoadMap } from '../../../state/map-data.state';

@Component({
  selector: 'colid-graph-container',
  templateUrl: './graph-container.component.html',
  styleUrls: ['./graph-container.component.scss'],
})
export class GraphContainerComponent implements OnInit, AfterViewInit {
  @ViewChild(GraphComponent) graphComponent: GraphComponent;
  @Select(GraphLinkingDataState.getGraphLinkingState)
  linkingProperties$: Observable<GraphLinkingData>;

  linkingModeEnabled: boolean = false;
  linkingNodesSelected: number = 0;
  linkHistory: LinkEditHistory[] = [];
  constructor(
    private store: Store,
    private service: ResourceRelationshipManagerService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const mapId = this.route.snapshot.paramMap.get('mapId');
    if (mapId != null) {
      this.store.dispatch(new LoadMap(mapId));
    }
  }

  ngAfterViewInit(): void {
    this.linkingProperties$
      .pipe(
        tap((linking) => {
          this.linkingModeEnabled = linking.linkingModeEnabled;
          this.linkingNodesSelected = linking.linkNodes.length;
          this.linkHistory = linking.linkEditHistory;
        })
      )
      .subscribe();
  }

  save() {
    let linkEditHistoryDto: LinkEditHistoryDto[] = [];
    this.linkHistory.forEach((sh) => {
      linkEditHistoryDto.push({
        action: sh.action,
        linkType: sh.linkType,
        sourceUri: sh.source.uri,
        targetUri: sh.target.uri,
      });
    });
    this.store.dispatch(new StartLoading());
    this.service.saveLinks(linkEditHistoryDto).subscribe((_) => {
      this.store.dispatch(new ResetLinkEditHistory());
      const nodes = this.graphComponent.graph.getNodes();
      linkEditHistoryDto.forEach((linkEdit) => {
        if (linkEdit.action == LinkHistoryAction.Delete) {
          nodes.forEach((node) => {
            const linkToRemoveIndex = node.links.findIndex(
              (l) =>
                ((l.source == linkEdit.sourceUri &&
                  l.target == linkEdit.targetUri) ||
                  (l.source == linkEdit.targetUri &&
                    l.target == linkEdit.sourceUri)) &&
                l.linkType.key == linkEdit.linkType.key
            );
            if (linkToRemoveIndex > -1) {
              node.links.splice(linkToRemoveIndex, 1);
            }
          });
        }
        if (linkEdit.action == LinkHistoryAction.Add) {
          const sourceNode = nodes.find((n) => n.id == linkEdit.sourceUri);
          const targetNode = nodes.find((n) => n.id == linkEdit.targetUri);
          if (sourceNode && targetNode) {
            const sourceLink: LinkDto = {
              display: true,
              isRendered: true,
              isVersionLink: false,
              linkType: linkEdit.linkType,
              outbound: true,
              source: sourceNode.id,
              sourceName: sourceNode.name,
              sourceType: sourceNode.resourceTypeId,
              target: targetNode.id,
              targetName: targetNode.name,
              targetType: targetNode.resourceTypeId,
            };
            sourceNode.links.push(sourceLink);
            const targetLink: LinkDto = {
              display: true,
              isRendered: true,
              isVersionLink: false,
              linkType: linkEdit.linkType,
              outbound: false,
              source: targetNode.id,
              sourceName: targetNode.name,
              sourceType: targetNode.resourceTypeId,
              target: sourceNode.id,
              targetName: sourceNode.name,
              targetType: sourceNode.resourceTypeId,
            };
            targetNode.links.push(targetLink);
          }
        }
      });
      this.store.dispatch(new EndLoading());
    });
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
    const linksToRemove = linkHistory
      .filter((lh) => lh.action === LinkHistoryAction.Add)
      .map((item) => new Link(item.source.uri, item.target.uri, item.linkType));
    const linksToAdd = linkHistory
      .filter((lh) => lh.action === LinkHistoryAction.Delete)
      .map((item) => new Link(item.source.uri, item.target.uri, item.linkType));
    this.store.dispatch(new RemoveLinks(linksToRemove));
    this.store.dispatch(new AddLinks(linksToAdd));
    this.store.dispatch(new ClearHistory());
    this.store.dispatch(new DisableLinkingMode());
  }
}
