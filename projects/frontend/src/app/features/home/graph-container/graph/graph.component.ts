import { Component, Input, ChangeDetectorRef, HostListener, ChangeDetectionStrategy, OnInit, AfterViewInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { Store } from '@ngrx/store';
import { ResourceRelationshipManagerService } from 'projects/frontend/src/app/core/http/resource-relationship-manager.service';
import { LinkEditHistory, LinkHistoryAction } from 'projects/frontend/src/app/shared/models/link-editing-history';
import { GraphLinkingData } from 'projects/frontend/src/app/state/graph-linking/graph-linking.model';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ForceDirectedGraph, Link, LinkDto, Node, NodeSaveDto } from '../../../../core/d3';
import { GraphData } from '../../../../state/graph-data/graph-data.model';
import { GraphProperties } from '../../../../state/graph-visualisation/graph-visualisation.model';
import { GraphState } from '../../../../state/store-items';

import { GraphMapDTO } from 'projects/frontend/src/app/shared/models/graph-map';
import { MatMenuTrigger } from '@angular/material/menu';
import * as graphActions from '../../../../state/graph-visualisation/graph-visualisation.actions';
import * as graphDataActions from '../../../../state/graph-data/graph-data.actions';
import * as graphLinkingActions from '../../../../state/graph-linking/graph-linking.actions';
import * as mapDataActions from '../../../../state/map-data/map-data.actions';
import * as savingTriggerActions from '../../../../state/saving-trigger/saving-trigger.actions';
import { LinkTypeContainer, UriName } from 'projects/frontend/src/app/shared/models/link-types-dto';
import { GraphMapData } from 'projects/frontend/src/app/state/map-data/map-data.model';
import { GraphMapMetadata } from 'projects/frontend/src/app/shared/models/graph-map-metadata';
import { AuthService } from 'projects/frontend/src/app/modules/authentication/services/auth.service';
import { SavingTrigger } from 'projects/frontend/src/app/state/saving-trigger/saving-trigger.model';
import { ActivatedRoute } from '@angular/router';
import { GraphMapInfo } from 'projects/frontend/src/app/shared/models/graph-map-info';
import { MatSnackBar } from '@angular/material/snack-bar'
import { NotificationService } from 'projects/frontend/src/app/shared/services/notification.service';

@Component({
  selector: 'graph',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './graph.component.html',
  styleUrls: ['./graph.component.css']
})
export class GraphComponent implements OnInit, AfterViewInit {
  /** Insert already initialized nodes and links here */
  currentMap: GraphMapMetadata = { graphMapId: "", name: "", modifiedBy: "" };
  _nodes: Node[] = [];
  _links: Link[] = [];
  startURI: any = ""

  graph!: ForceDirectedGraph;
  graphProperties$: Observable<GraphProperties>;
  graphDataChanges$: Observable<GraphData>; // this will not store the actual node data, but only the delta to the current state which needs to be processed
  linkingProperties$: Observable<GraphLinkingData>;
  mapDataProperties$: Observable<GraphMapData>;
  currentUser: string = ''

  savingTriggerListener$!: Observable<SavingTrigger>;
  savingInProgress: boolean = false;

  linkingModeEnabled: boolean = false;
  linkingNodesSelected: number = 0;
  linkHistory: LinkEditHistory[] = [];
  selectedHistory: LinkEditHistory[] = [];

  private _options: { width: any, height: any } = { width: window.innerWidth, height: 900 };

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.options.width = event.target.innerWidth;
    this.options.height = 900;
    this.graph.initSimulation(this.options);

  }

  constructor(
    private ref: ChangeDetectorRef,
    private store: Store<GraphState>,
    private authService: AuthService,
    private rrmService: ResourceRelationshipManagerService,
    private route: ActivatedRoute,
    private notificationService: NotificationService,
    private snackBar: MatSnackBar) {
    this.graphProperties$ = this.store.select('graphVisualisation');
    this.graphDataChanges$ = this.store.select('graphData');
    this.linkingProperties$ = this.store.select('graphLinking');
    this.savingTriggerListener$ = this.store.select('savingTrigger');
    this.mapDataProperties$ = this.store.select('mapData');

  }

  ngOnInit() {
    /** Receiving an initialized simulated graph from our custom d3 service */

    /** Binding change detection check on each tick
     * This along with an onPush change detection strategy should enforce checking only when relevant!
     * This improves scripting computation duration in a couple of tests I've made, consistently.
     * Also, it makes sense to avoid unnecessary checks when we are dealing only with simulations data binding.
     */
    this.graph = new ForceDirectedGraph([], [], this._options, this.store, this.rrmService);
    this._nodes = this.graph.getNodes();
    this._links = this.graph.getLinks();
    this.graph.ticker.subscribe((d) => {
      this.ref.markForCheck();
    });


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

    this.mapDataProperties$.pipe(
      tap(
        m => {
          this.currentMap = m.currentMap;
          this.currentUser = m.currentUser;
        }
      )
    ).subscribe();

    //listen for the event when the "saving" action was triggered.
    this.savingTriggerListener$.pipe(
      tap(
        saving => {
          if (saving.savingMap && !this.savingInProgress) {
            this.savingInProgress = true;
            //if saving mode is active, then get the data from the graph service and
            //process it so that it is usable for the API
            let graphMap: GraphMapDTO = new GraphMapDTO();
            graphMap.graphMapId = this.currentMap.graphMapId;
            graphMap.name = this.currentMap.name;
            if (this.currentMap.modifiedBy == "") {
              graphMap.modifiedBy = this.currentUser
            } else {
              graphMap.modifiedBy = this.currentMap.modifiedBy;
            }

            let tmpLinks: Link[] = JSON.parse(JSON.stringify(this.graph.getLinks()));
            graphMap.mapNodes = JSON.parse(JSON.stringify(this.graph.getNodes()));

            const currentNodes: Node[] = JSON.parse(JSON.stringify(this.graph.getNodes()));
            graphMap.mapNodes = currentNodes.map(cn => {
              let saveNode: NodeSaveDto = {
                ...cn,
                mapNodeId: cn.mapNodeId == "" ? null : cn.mapNodeId,
                links: cn.links.map(li => {
                  return {
                    endNode: {
                      name: typeof li.target == 'string' ? li.targetName : li.target.name,
                      value: typeof li.target == 'string' ? li.target : li.target.id,
                      nameValuePairId: saving.saveMapAsNew ? null : li.nameValuePairTargetId
                    },
                    startNode: {
                      name: typeof li.source == 'string' ? li.sourceName : li.source.name,
                      value: typeof li.source == 'string' ? li.source : li.source.id,
                      nameValuePairId: saving.saveMapAsNew ? null : li.nameValuePairSourceId
                    },
                    type: {
                      name: li.name.name,
                      value: li.name.value,
                      nameValuePairId: saving.saveMapAsNew ? null : li.name.nameValuePairId
                    },
                    mapLinkInfoId: saving.saveMapAsNew ? null : li.mapLinkInfoId
                  }
                }),

              };
              return saveNode;
            });

            tmpLinks.forEach(mn => {
              let dto: LinkDto = new LinkDto(mn.source.id, mn.target.id, mn.name);
              dto.mapLinkId = mn.mapLinkId;
              graphMap.mapLinks.push(dto);
            });

            if (saving.saveMapAsNew) {
              graphMap.graphMapId = "";
              graphMap.mapLinks.forEach((l: LinkDto) => {
                l.mapLinkId = null;
                l.name.nameValuePairId = null;
              });
              graphMap.mapNodes.forEach(n => {
                n.mapNodeId = null;
              });
            }

            // call API to save map
            this.rrmService.saveGraphMap(graphMap).subscribe(
              res => {
                this.store.dispatch(mapDataActions.SetCurrentId({ id: res.graphMapId }));
                this.savingInProgress = false;
                this.store.dispatch(savingTriggerActions.EndSavingMap());
                this.authService.currentEmail$.subscribe(
                  email => {
                    if (email) {
                      this.store.dispatch(mapDataActions.LoadOwnMaps({ email: email }));
                    }
                  }
                )
              },
              err => {
                this.snackBar.open(err.error?.message, "Dismiss");
                //TODO Error handling
                this.savingInProgress = false;
                this.store.dispatch(savingTriggerActions.EndSavingMap());
              }
            );
          }
        }
      )
    ).subscribe();

    //listen for data changes and process them accordingly
    this.graphDataChanges$.pipe(
      tap(
        graphDataInput => {

          let graphData: GraphData = JSON.parse(JSON.stringify(graphDataInput));
          if (graphData.addLinks.length > 0) {
            this.graph.addLinks(graphData.addLinks);
          }

          if (graphData.addNodes.length > 0) {
            this.graph.addNodes(graphData.addNodes);
          }

          if (graphData.removeNodes.length > 0) {
            this.graph.removeNodes(graphData.removeNodes);
          }

          if (graphData.removeLinks.length > 0) {
            this.graph.removeLinks(graphData.removeLinks);
          }

          if (graphData.setLinks.length > 0) {
            this.graph.setLinks(graphData.setLinks);
          }

          if (graphData.setNodes.length > 0) {
            this.graph.setNodes(graphData.setNodes);
          }

          if (graphData.resetAll) {
            this.graph.resetGraph();
          }

          this.refreshDataModel();
        }
      )
    ).subscribe();

  }

  refreshDataModel() {
    this._links = this.graph.getLinks();
    this._nodes = this.graph.getNodes();
  }

  ngAfterViewInit() {
    this.route.queryParams.subscribe(params => {
      this.startURI = params.baseNode;
    });

    setTimeout(() => {
      if (this.startURI) {
        this.rrmService.loadResources([this.startURI])
      }
    }, 0);

  }

  get options() {
    return this._options = {
      width: window.innerWidth,
      height: window.innerHeight - 75
    };
  }

  get viewShift() {
    return `translate(${this.options.width / 2.7}, ${this.options.height / 2.7})`;
  }

  @ViewChild('linkMenuTrigger')
  contextMenu!: MatMenuTrigger;

  linkContextMenuPosition = { x: '0px', y: '0px' };

  onContextMenu(event: MouseEvent, item: Link) {
    event.preventDefault();
    this.linkContextMenuPosition.x = event.clientX + 'px';
    this.linkContextMenuPosition.y = event.clientY + 'px';
    this.contextMenu.menuData = { 'item': item };
    this.contextMenu.menu.focusFirstItem('mouse');
    this.contextMenu.openMenu();
  }

  deleteLink(link: Link) {
    let linkCopy: Link = JSON.parse(JSON.stringify(link));
    this.store.dispatch(graphDataActions.RemoveLinks({ links: [linkCopy] }));
    let lc: LinkTypeContainer = {
      linkType: linkCopy.name,
      source: {
        name: link.source.name,
        uri: link.source.id
      },
      target: {
        name: link.target.name,
        uri: link.target.id
      }
    };

    this.store.dispatch(graphLinkingActions.AddToLinkEditHistory({ link: lc, action: LinkHistoryAction.Delete }));
  }

  @ViewChild('nodeMenuTrigger')
  nodeContextMenu!: MatMenuTrigger;
  overlapMaps: GraphMapInfo[] = []
  nodeContextMenuPosition = { x: '0px', y: '0px' };

  onNodeContextMenu(event: MouseEvent, item: Node) {
    event.preventDefault();
    this.rrmService.getGraphsForResource(item.resourceIdentifier).subscribe(res => {
      this.overlapMaps = res
    },
      err => {
        this.overlapMaps = []
      })
    this.nodeContextMenuPosition.x = event.clientX + 'px';
    this.nodeContextMenuPosition.y = event.clientY + 'px';
    this.nodeContextMenu.menuData = { 'item': item };
    this.nodeContextMenu.menu.focusFirstItem('mouse');
    this.nodeContextMenu.openMenu();
  }
  addLink(item: Node) {
    this.store.dispatch(graphLinkingActions.AddLinkableNode({ node: JSON.parse(JSON.stringify(item)) }));
  }

  expandNodes(item: Node) {
    let pidUris: string[] = [];
    item.links.forEach(link => {
      if (link.target as any != item.id) {
        if (pidUris.findIndex(p => p == link.target as any) == -1) {
          pidUris.push(link.target as any);
        }

      }
      if (link.source as any != item.id) {
        if (pidUris.findIndex(p => p == link.source as any) == -1) {
          pidUris.push(link.source as any);
        }
      }
    });
    this.store.dispatch(graphActions.StartLoading());
    this.rrmService.getCheckedResources(pidUris).subscribe(
      res => {
        let transformedContent = this.rrmService.convertResourceDtoToLinksAndNodes(res);
        transformedContent.nodes.forEach(n => {
          n.links.forEach(link => {
            if (link.targetName == item.name) {
              n.fx = item.fx! - 600
            } else {
              n.fx = item.fx! + 600
            }
          })
          n.fy = item.fy!
        })
        this.store.dispatch(graphDataActions.AddNodes({ nodes: transformedContent.nodes }));
        this.store.dispatch(graphDataActions.AddLinks({ links: transformedContent.links }));
        this.store.dispatch(graphDataActions.AddLinks({ links: JSON.parse(JSON.stringify(item.links)) }));
        this.store.dispatch(graphActions.EndLoading());
      },
      err => {
        this.notificationService.notification$.next("Something went wrong with expanding the node")
        this.store.dispatch(graphActions.EndLoading());
      }
    )
  }

  loadIncoming(link: Link) {
    if (!link.isRendered) {
      this.rrmService.loadResources([link.source as any]);
    }
    else {
      const currentNodes: Node[] = JSON.parse(JSON.stringify(this.graph.getNodes()));
      this.hideNode(currentNodes.filter(x => x.id == link.source as any)[0]);
    }
  }

  loadOutgoing(link: Link) {
    if (!link.isRendered) {
      this.rrmService.loadResources([link.target as any]);
    }
    else {
      const currentNodes: Node[] = JSON.parse(JSON.stringify(this.graph.getNodes()));
      this.hideNode(currentNodes.filter(x => x.id == link.target as any)[0]);
    }
  }

  hideNode(item: Node) {
    this.store.dispatch(graphDataActions.RemoveNodes({ nodes: [item] }));
  }

  getIncomingLinks(node: Node): Link[] {
    let links = node.links.filter(l => l.target as any == node.id && !l.isVersionLink)
    let cleanLinks: Link[] = []
    links.forEach(l => {
      if (!this.isLinkDuplicate(cleanLinks, l.source, l.target, l.name)) {
        cleanLinks.push(l);
      }
    })
    return cleanLinks;
  }

  getOutgoingLinks(node: Node): Link[] {
    let links = node.links.filter(l => l.source as any == node.id && !l.isVersionLink);
    let cleanLinks: Link[] = []
    links.forEach(l => {
      if (!this.isLinkDuplicate(cleanLinks, l.source, l.target, l.name)) {
        cleanLinks.push(l);
      }
    })
    return cleanLinks;
  }

  loadSecondMap(graph: GraphMapInfo) {
    this.store.dispatch(mapDataActions.LoadSecondMap({ mapId: graph.graphMapId }))
  }

  loadNewMap(graph: GraphMapInfo) {
    this.store.dispatch(mapDataActions.LoadMap({ mapId: graph.graphMapId }))
  }


  isLinkDuplicate(links: Link[], source: any, target: any, type: UriName) {
    let result = links.findIndex(l => l.source == source && l.target == target && l.name.value == type.value) > -1;
    return result
  }
}
