import {
  Component,
  ChangeDetectorRef,
  HostListener,
  ChangeDetectionStrategy,
  OnInit,
  AfterViewInit,
  ViewChild,
  OnDestroy,
} from '@angular/core';
import { ResourceRelationshipManagerService } from 'projects/frontend/src/app/core/http/resource-relationship-manager.service';
import {
  LinkEditHistory,
  LinkHistoryAction,
} from 'projects/frontend/src/app/shared/models/link-editing-history';
import { Observable, Subscription } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ForceDirectedGraph, Link, Node } from '../../../../core/d3';
import { MatMenuTrigger } from '@angular/material/menu';
import { LinkTypeContainer } from 'projects/frontend/src/app/shared/models/link-types-dto';
import { GraphMapMetadata } from 'projects/frontend/src/app/shared/models/graph-map-metadata';
import { AuthService } from 'projects/frontend/src/app/modules/authentication/services/auth.service';
import { ActivatedRoute } from '@angular/router';
import { GraphMapInfo } from 'projects/frontend/src/app/shared/models/graph-map-info';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NotificationService } from 'projects/frontend/src/app/shared/services/notification.service';
import {
  GraphMapV2SaveDto,
  NodeV2SaveDto,
} from 'projects/frontend/src/app/shared/models/gaph-map-v2-save-dto';
import { GraphMapV2 } from 'projects/frontend/src/app/shared/models/graph-map-v2';
import { MatDialog } from '@angular/material/dialog';
import { GraphDialogComponent } from '../graph-dialog/graph-dialog/graph-dialog.component';
import { CookieService } from 'ngx-cookie';
import { Select, Store } from '@ngxs/store';
import {
  GraphMapData,
  LoadMap,
  LoadOwnMaps,
  LoadSecondMap,
  MapDataState,
  SetCurrentMap,
} from 'projects/frontend/src/app/state/map-data.state';
import {
  AddLinks,
  AddNodes,
  GraphData,
  GraphDataState,
  RemoveLinks,
  RemoveNodes,
  SelectNodes,
  ToggleExclusive,
} from 'projects/frontend/src/app/state/graph-data.state';
import {
  AddLinkableNode,
  AddToLinkEditHistory,
  GraphLinkingData,
  GraphLinkingDataState,
} from 'projects/frontend/src/app/state/graph-linking.state';
import {
  EndSavingMap,
  SavingTrigger,
  SavingTriggerState,
} from 'projects/frontend/src/app/state/saving-trigger.state';
import {
  EndLoading,
  GraphProperties,
  GraphVisualisationState,
  ResetMultiSelectedPidUris,
  SetMultiSelectedPidUris,
  StartLoading,
  UpdateMultiSelectedPidUris,
} from 'projects/frontend/src/app/state/graph-visualisation.state';
import { LinkDto } from 'projects/frontend/src/app/shared/models/link-dto';
import { Constants } from 'projects/frontend/src/app/shared/constants';

@Component({
  selector: 'graph',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './graph.component.html',
  styleUrls: ['./graph.component.css'],
})
export class GraphComponent implements OnInit, AfterViewInit, OnDestroy {
  /** Insert already initialized nodes and links here */
  currentMap: GraphMapMetadata = {
    graphMapId: '',
    name: '',
    description: '',
    modifiedBy: '',
  };
  _nodes: Node[] = [];
  _links: Link[] = [];

  graph!: ForceDirectedGraph;
  @Select(GraphVisualisationState.getGraphVisualisationState)
  graphProperties$: Observable<GraphProperties>;
  @Select(GraphVisualisationState.getSidebarState)
  sidebarState$: Observable<boolean>;
  @Select(GraphDataState.getGraphDataState)
  graphDataChanges$: Observable<GraphData>; // this will not store the actual node data, but only the delta to the current state which needs to be processed
  @Select(GraphLinkingDataState.getGraphLinkingState)
  linkingProperties$: Observable<GraphLinkingData>;
  @Select(MapDataState.getMapDataState)
  mapDataProperties$: Observable<GraphMapData>;
  currentUser: string = '';

  moveMap: boolean = false;
  moveMapWidth: number = 800;
  doubleClickXCoordinate: number = 0;

  @Select(SavingTriggerState.getSavingTriggerState)
  savingTriggerListener$!: Observable<SavingTrigger>;
  savingInProgress: boolean = false;

  linkingModeEnabled: boolean = false;
  linkingNodesSelected: number = 0;
  linkHistory: LinkEditHistory[] = [];
  selectedHistory: LinkEditHistory[] = [];

  masterSub: Subscription = new Subscription();

  private _options: { width: any; height: any } = {
    width: window.innerWidth,
    height: 900,
  };

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.options.width = event.target.innerWidth;
    this.options.height = 900;
    this.graph.initSimulation(this.options);
  }

  constructor(
    private ref: ChangeDetectorRef,
    public dialog: MatDialog,
    private store: Store,
    private authService: AuthService,
    private rrmService: ResourceRelationshipManagerService,
    private route: ActivatedRoute,
    private notificationService: NotificationService,
    private snackBar: MatSnackBar,
    private cookieService: CookieService
  ) {}

  ngOnInit() {
    /** Receiving an initialized simulated graph from our custom d3 service */

    /** Binding change detection check on each tick
     * This along with an onPush change detection strategy should enforce checking only when relevant!
     * This improves scripting computation duration in a couple of tests I've made, consistently.
     * Also, it makes sense to avoid unnecessary checks when we are dealing only with simulations data binding.
     */
    this.graph = new ForceDirectedGraph([], [], this._options, this.store);
    this._nodes = this.graph.getNodes();
    this._links = this.graph.getLinks();
    this.masterSub.add(
      this.graph.ticker.subscribe((d) => {
        this.ref.markForCheck();
      })
    );

    this.masterSub.add(
      this.linkingProperties$
        .pipe(
          tap((linking) => {
            this.linkingModeEnabled = linking.linkingModeEnabled;
            this.linkingNodesSelected = linking.linkNodes.length;
            this.linkHistory = linking.linkEditHistory;
            this.selectedHistory = this.linkHistory;
          })
        )
        .subscribe()
    );

    this.masterSub.add(
      this.mapDataProperties$
        .pipe(
          tap((m) => {
            this.currentMap = m.currentMap;
            this.currentUser = m.currentUser;
          })
        )
        .subscribe()
    );

    //listen for the event when the "saving" action was triggered.
    this.masterSub.add(
      this.savingTriggerListener$
        .pipe(
          tap((saving) => {
            if (saving.savingMap && !this.savingInProgress) {
              this.savingInProgress = true;

              //prepare all the data for saving
              let nodes: Node[] = this.decoupleNodeList(this.graph.getNodes());

              let savingPayload: GraphMapV2SaveDto = {
                id: saving.saveMapAsNew ? '' : this.currentMap.graphMapId,
                name: this.currentMap.name,
                description: this.currentMap.description,
                nodes: nodes.map(
                  (x) =>
                    <NodeV2SaveDto>{
                      id: x.id,
                      fx: Number.parseInt(x.fx!.toFixed(20)),
                      fy: Number.parseInt(x.fy!.toFixed(20)),
                    }
                ),
              };

              //call new saving method
              this.rrmService.saveGraphMapV2(savingPayload).subscribe(
                (res: GraphMapV2) => {
                  const map: GraphMapMetadata = {
                    graphMapId: res.id,
                    name: res.name,
                    description: res.description,
                    modifiedBy: res.modifiedBy,
                  };
                  //handle when saving was successful
                  this.store.dispatch(new SetCurrentMap(map));
                  this.savingInProgress = false;
                  this.store.dispatch(new EndSavingMap());
                  this.snackBar.open(
                    'Map has been saved successfully',
                    'Dismiss',
                    { duration: 3000, panelClass: 'success-snackbar' }
                  );
                  this.authService.currentEmail$.subscribe((email) => {
                    if (email) {
                      this.store.dispatch(new LoadOwnMaps(email));
                    }
                  });
                },
                (err) => {
                  this.snackBar.open(err.error?.message, 'Dismiss');
                  this.savingInProgress = false;
                  this.store.dispatch(new EndSavingMap());
                }
              );
            }
          })
        )
        .subscribe()
    );

    //listen for data changes and process them accordingly
    this.masterSub.add(
      this.graphDataChanges$
        .pipe(
          tap((graphDataInput) => {
            let graphData: GraphData = JSON.parse(
              JSON.stringify(graphDataInput)
            );
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
            if (graphData.toggle != '') {
              this.graph.toggleNode(graphData.toggle);
            }
            if (graphData.toggleExclusive != '') {
              this.graph.toggleExclusive(graphData.toggleExclusive);
            }

            if (graphData.selectNodes.length > 0) {
              this.graph.selectNodes(graphData.selectNodes);
            }

            this.refreshDataModel();
          })
        )
        .subscribe()
    );

    this.masterSub.add(
      this.sidebarState$.subscribe((sidebarOpen) => {
        const remainingSpace = this.options.width - this.doubleClickXCoordinate;
        if (sidebarOpen && remainingSpace < 800) {
          const nodeWith = 180;
          this.moveMapWidth = 800 - remainingSpace + nodeWith;
          this.moveMap = true;
        } else {
          this.moveMap = false;
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.masterSub.unsubscribe();
  }

  openDialog(node: Node) {
    const dialogRef = this.dialog.open(GraphDialogComponent, {
      height: 'auto',
      width: '60vw',
      data: {
        links: this.getIncomingOutgoingLinks(node),
        pidUri: node.id,
        resourceLabel: node.name,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result && result.displayedLinks && result.hiddenLinks) {
        // adjust links in the nodes
        result.newLinks.forEach((l) => {
          if (l.outbound) {
            node.links.push(l);
            const targetLink: LinkDto = {
              ...l,
              outbound: false,
              source: l.target,
              sourceName: l.targetName,
              sourceType: l.targetType,
              target: l.source,
              targetName: l.sourceName,
              targetType: l.sourceType,
            };
            this.graph
              .getNodes()
              .find((n) => n.id == l.target)
              ?.links.push(targetLink);
          } else {
            this.graph
              .getNodes()
              .find((n) => n.id == l.target)
              ?.links.push(l);
            const sourceLink: LinkDto = {
              ...l,
              outbound: false,
              source: l.target,
              sourceName: l.targetName,
              sourceType: l.targetType,
              target: l.source,
              targetName: l.sourceName,
              targetType: l.sourceType,
            };
            node.links.push(sourceLink);
          }
        });
        result.hiddenLinks.forEach((r) => {
          const currentNodes: Node[] = JSON.parse(
            JSON.stringify(this.graph.getNodes())
          );
          const nodeToRemove = currentNodes.find((x) => x.id == r.target);
          if (nodeToRemove) {
            this.hideNode(nodeToRemove);
          }
        });
        if (result.displayedLinks.length > 0) {
          const versionLinkNodeIds = result.displayedLinks
            .filter((x) => x.isVersionLink)
            .map((a) => a.source);
          let nodeIds = result.displayedLinks.map((a) => a.target);
          nodeIds.push(...versionLinkNodeIds);
          this.rrmService.loadResources(nodeIds);
        }
      }
    });
  }

  decoupleLinkList(links: Link[]) {
    let newLinks: Link[] = [];
    links.forEach((l) => {
      newLinks.push(Object.assign(new Link(), JSON.parse(JSON.stringify(l))));
    });
    return newLinks;
  }
  decoupleNodeList(nodes: Node[]) {
    let newNodes: Node[] = [];
    nodes.forEach((node) => {
      newNodes.push(
        Object.assign(new Node(node.id), JSON.parse(JSON.stringify(node)))
      );
    });
    return newNodes;
  }

  refreshDataModel() {
    this._links = this.graph.getLinks();
    this._nodes = this.graph.getNodes();
  }

  ngAfterViewInit() {
    this.route.queryParams.subscribe((params) => {
      const startURI: string = params.baseNode;
      if (startURI && startURI.length > 0) {
        setTimeout(() => {
          this.rrmService.loadResources([startURI]).then((_) => {
            const nodes = this.graph.getNodes();
            if (nodes.length > 0) {
              this.expandNodes(nodes[0]);
            }
          });
        });
      }
      const viewSelectedResources: boolean = params.viewSelectedResources;
      let selectedResources = this.cookieService.getObject(
        'selectedResources'
      ) as string[];
      if (selectedResources != null && viewSelectedResources) {
        setTimeout(() => this.rrmService.loadResources(selectedResources), 0);
      }
    });
  }

  get options() {
    return (this._options = {
      width: window.innerWidth,
      height: window.innerHeight - 75,
    });
  }

  get viewShift() {
    return `translate(${this.options.width / 2.7}, ${
      this.options.height / 2.7
    })`;
  }

  @ViewChild('linkMenuTrigger')
  contextMenu!: MatMenuTrigger;
  linkContextMenuPosition = { x: '0px', y: '0px' };

  onContextMenu(event: MouseEvent, item: Link) {
    event.preventDefault();
    this.linkContextMenuPosition.x = event.clientX + 'px';
    this.linkContextMenuPosition.y = event.clientY + 'px';
    this.contextMenu.menuData = { item: item };
    this.contextMenu.menu.focusFirstItem('mouse');
    this.contextMenu.openMenu();
  }

  @ViewChild('nodeMenuTrigger')
  nodeContextMenu!: MatMenuTrigger;
  overlapMaps: GraphMapInfo[] = [];
  nodeContextMenuPosition = { x: '0px', y: '0px' };

  onNodeContextMenu(event: MouseEvent, item: Node) {
    event.preventDefault();
    if (
      this.store.selectSnapshot(GraphVisualisationState.getMultiSelectedPidUris)
        .length > 0
    ) {
      this.mainContextMenuPosition.x = event.clientX + 'px';
      this.mainContextMenuPosition.y = event.clientY + 'px';
      this.mainContextMenu.openMenu();
    } else {
      this.rrmService.getGraphsForResource(item.id).subscribe(
        (res) => {
          this.overlapMaps = res;
        },
        (_) => {
          this.overlapMaps = [];
        }
      );
      this.nodeContextMenuPosition.x = event.clientX + 'px';
      this.nodeContextMenuPosition.y = event.clientY + 'px';
      this.nodeContextMenu.menuData = { item: item };
      this.nodeContextMenu.menu.focusFirstItem('mouse');
      this.nodeContextMenu.openMenu();
    }
  }

  @ViewChild('mainMenuTrigger')
  mainContextMenu!: MatMenuTrigger;
  mainContextMenuPosition = { x: '0px', y: '0px' };

  onMainContextMenu(event: MouseEvent) {
    event.preventDefault();
    if (
      this.store.selectSnapshot(GraphVisualisationState.getMultiSelectedPidUris)
        .length > 0
    ) {
      this.mainContextMenuPosition.x = event.clientX + 'px';
      this.mainContextMenuPosition.y = event.clientY + 'px';
      this.mainContextMenu.openMenu();
    }
  }

  addLink(item: Node) {
    this.store.dispatch(
      new AddLinkableNode(
        Object.assign(new Node(item.id), JSON.parse(JSON.stringify(item)))
      )
    );
  }

  deleteLink(link: Link) {
    if (link.isVersionLink) return;
    let linkCopy: Link = Object.assign(
      new Link(),
      JSON.parse(JSON.stringify(link))
    );
    this.store.dispatch(new RemoveLinks([linkCopy]));
    let lc: LinkTypeContainer = {
      linkType: linkCopy.linkType,
      source: {
        name: link.source.name,
        uri: link.source.id,
      },
      target: {
        name: link.target.name,
        uri: link.target.id,
      },
    };

    this.store.dispatch(new AddToLinkEditHistory(lc, LinkHistoryAction.Delete));
  }

  expandSelectedNodes() {
    const multiSelectedPidUris = this.store.selectSnapshot(
      GraphVisualisationState.getMultiSelectedPidUris
    );
    const selectedNodes = this._nodes.filter((n) =>
      multiSelectedPidUris.includes(n.id)
    );
    let pidUris: string[] = this.getPidUrisForExpandingNodes(selectedNodes);
    this.store.dispatch(new StartLoading());
    this.rrmService.getCheckedResources(pidUris).subscribe(
      (res) => {
        let transformedContent =
          this.rrmService.convertResourceDtoToLinksAndNodes(res);
        transformedContent.nodes.forEach((n) => {
          n.links.forEach((link) => {
            const firstLinkedNode = selectedNodes.find(
              (n) => n.name == link.targetName
            );
            if (firstLinkedNode) {
              if (link.outbound) {
                n.fx = firstLinkedNode.fx - 400;
              } else if (!link.outbound) {
                n.fx = firstLinkedNode.fx + 400;
              }
              n.fy = firstLinkedNode.fy;
            }
          });
        });
        this.store.dispatch(new AddNodes(transformedContent.nodes));
        this.store.dispatch(new AddLinks(transformedContent.links));
        this.store.dispatch(new EndLoading());
      },
      (err) => {
        this.notificationService.notification$.next(
          'Something went wrong with expanding the node'
        );
        this.store.dispatch(new EndLoading());
      }
    );
  }

  expandNodes(item: Node) {
    let pidUris: string[] = this.getPidUrisForExpandingNodes([item]);
    if (pidUris.length > 0) {
      this.store.dispatch(new StartLoading());
      this.rrmService.getCheckedResources(pidUris).subscribe(
        (res) => {
          let transformedContent =
            this.rrmService.convertResourceDtoToLinksAndNodes(res);
          transformedContent.nodes.forEach((n) => {
            n.links.forEach((link) => {
              if (link.targetName == item.name && link.outbound) {
                n.fx = item.fx - 400;
              } else if (link.targetName == item.name && !link.outbound) {
                n.fx = item.fx + 400;
              }
            });
            n.fy = item.fy!;
          });
          this.store.dispatch(new AddNodes(transformedContent.nodes));
          this.store.dispatch(new AddLinks(transformedContent.links));
          this.store.dispatch(new EndLoading());
        },
        (err) => {
          this.notificationService.notification$.next(
            'Something went wrong with expanding the node'
          );
          this.store.dispatch(new EndLoading());
        }
      );
    }
  }

  private getPidUrisForExpandingNodes(nodes: Node[]) {
    const pidUris: Set<string> = new Set();
    let containsVersionLinks: boolean = false;
    nodes.forEach((node) => {
      node.links.forEach((link) => {
        if (link.display) {
          if (link.target != node.id) {
            if (!pidUris.has(link.target)) {
              pidUris.add(link.target);
            }
          }
          if (link.source != node.id) {
            if (!pidUris.has(link.source)) {
              pidUris.add(link.source);
            }
          }
          if (link.linkType.key == Constants.Metadata.HasVersion) {
            containsVersionLinks = true;
          }
        }
      });
      if (containsVersionLinks) pidUris.add(node.id);
    });
    return [...pidUris];
  }

  loadIncoming(link: Link) {
    if (!link.isRendered) {
      this.rrmService.loadResources([link.source as any]);
    } else {
      const currentNodes: Node[] = JSON.parse(
        JSON.stringify(this.graph.getNodes())
      );
      this.hideNode(
        currentNodes.filter((x) => x.id == (link.source as any))[0]
      );
    }
  }

  loadOutgoing(link: Link) {
    if (!link.isRendered) {
      this.rrmService.loadResources([link.target as any]);
    } else {
      const currentNodes: Node[] = JSON.parse(
        JSON.stringify(this.graph.getNodes())
      );
      this.hideNode(
        currentNodes.filter((x) => x.id == (link.target as any))[0]
      );
    }
  }

  selectLinkedNodes(item: Node) {
    let nodeURLs: string[] = [];
    item.links.forEach((l) => {
      nodeURLs.push(l.target);
    });
    nodeURLs.push(item.id);

    this.store.dispatch(new SelectNodes(nodeURLs));
    this.store.dispatch(new SetMultiSelectedPidUris(nodeURLs));
  }

  selectLinkedNodesMultipleNodes() {
    const selectedNodeUris: Set<string> = new Set();
    const selectedNodes = this.getMultiSelectedNodes();
    selectedNodes.forEach((node) => {
      node.links.forEach((link) => {
        selectedNodeUris.add(link.target);
      });
      selectedNodeUris.add(node.id);
    });
    this.store.dispatch(new SelectNodes([...selectedNodeUris]));
    this.store.dispatch(new UpdateMultiSelectedPidUris([...selectedNodeUris]));
  }

  hideNode(item: Node) {
    this.store.dispatch(new RemoveNodes([item]));
  }

  hideMultipleNodes() {
    const nodesToHide = this.getMultiSelectedNodes();
    this.store.dispatch(new RemoveNodes(nodesToHide));
    this.store.dispatch(new ResetMultiSelectedPidUris());
  }

  deleteHighlightedlinks(link?: Link) {
    const nodes = this.getMultiSelectedNodes();
    const linksToDelete: Set<Link> = new Set();
    if (nodes.length > 0) {
      nodes.forEach((node) => {
        const links = this._links.filter(
          (link) =>
            (link.source === node || link.target === node) &&
            !link.isVersionLink
        );
        links.forEach((l) => linksToDelete.add(l));
      });
    } else {
      const singleSelectedNode = this._nodes.find((n) => n.selected);
      const links = this._links.filter(
        (link) =>
          (link.source === singleSelectedNode ||
            link.target === singleSelectedNode) &&
          !link.isVersionLink
      );
      links.forEach((l) => linksToDelete.add(l));
    }
    const linksCopy = [...linksToDelete].map((link) => {
      return Object.assign(new Link(), JSON.parse(JSON.stringify(link)));
    });
    this.store.dispatch(new RemoveLinks(linksCopy));
    linksCopy.forEach((linkCopy) => {
      let lc: LinkTypeContainer = {
        linkType: linkCopy.linkType,
        source: {
          name: linkCopy.source.name,
          uri: linkCopy.source.id,
        },
        target: {
          name: linkCopy.target.name,
          uri: linkCopy.target.id,
        },
      };

      this.store.dispatch(
        new AddToLinkEditHistory(lc, LinkHistoryAction.Delete)
      );
    });
  }

  getIncomingOutgoingLinks(node: Node): LinkDto[] {
    let links: LinkDto[] = [];
    node.links.forEach((l) => {
      let trueSource = l.outbound ? l.source : l.target;
      let trueTarget = l.outbound ? l.target : l.source;

      if (
        !this.isLinkDuplicate(links, trueSource, trueTarget, l.linkType.key)
      ) {
        links.push(l);
      }
    });
    return links;
  }

  loadSecondMap(graph: GraphMapInfo) {
    this.store.dispatch(new LoadSecondMap(graph.id));
  }

  loadNewMap(graph: GraphMapInfo) {
    this.store.dispatch(new LoadMap(graph.id));
  }

  isLinkDuplicate(links: LinkDto[], source: any, target: any, type: string) {
    let result =
      links.findIndex(
        (l) =>
          l.source == source && l.target == target && l.linkType.key == type
      ) > -1;
    return result;
  }

  setDoubleClickXPosition(xPosition: number) {
    this.doubleClickXCoordinate = xPosition;
  }

  private getMultiSelectedNodes() {
    const multiSelectedPidUris = this.store.selectSnapshot(
      GraphVisualisationState.getMultiSelectedPidUris
    );
    const nodes = this._nodes.filter((n) =>
      multiSelectedPidUris.includes(n.id)
    );
    return nodes;
  }
}
