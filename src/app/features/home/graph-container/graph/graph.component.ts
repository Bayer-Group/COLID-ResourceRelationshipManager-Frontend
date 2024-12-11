import {
  Component,
  ChangeDetectorRef,
  HostListener,
  ChangeDetectionStrategy,
  OnInit,
  AfterViewInit,
  ViewChild
} from '@angular/core';
import { ResourceRelationshipManagerService } from 'src/app/shared/services/resource-relationship-manager.service';
import {
  LinkEditHistory,
  LinkHistoryAction
} from 'src/app/shared/models/link-editing-history';
import { Observable, Subscription } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';
import { ForceDirectedGraph, Link, Node } from '../../../../core/d3';
import { MatMenuTrigger } from '@angular/material/menu';
import { LinkTypeContainer } from 'src/app/shared/models/link-types-dto';
import { GraphMapMetadata } from 'src/app/shared/models/graph-map-metadata';
import { AuthService } from 'src/app/modules/authentication/services/auth.service';
import { ActivatedRoute } from '@angular/router';
import { GraphMapInfo } from 'src/app/shared/models/graph-map-info';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NotificationService } from 'src/app/shared/services/notification.service';
import {
  GraphMapV2SaveDto,
  NodeV2SaveDto
} from 'src/app/shared/models/gaph-map-v2-save-dto';
import { GraphMapV2 } from 'src/app/shared/models/graph-map-v2';
import { MatDialog } from '@angular/material/dialog';
import {
  GraphDialogComponent,
  GraphDialogResultData
} from '../graph-dialog/graph-dialog/graph-dialog.component';
import { CookieService } from 'ngx-cookie';
import { Select, Store } from '@ngxs/store';
import {
  GraphMapData,
  LoadMap,
  LoadOwnMaps,
  LoadSecondMap,
  MapDataState,
  SetCurrentMap
} from 'src/app/state/map-data.state';
import {
  AddLinks,
  AddNodes,
  GraphData,
  GraphDataState,
  RemoveLinks,
  RemoveNodes,
  SelectNodes
} from 'src/app/state/graph-data.state';
import {
  AddLinkableNode,
  AddToLinkEditHistory,
  GraphLinkingData,
  GraphLinkingDataState
} from 'src/app/state/graph-linking.state';
import {
  EndSavingMap,
  SavingTrigger,
  SavingTriggerState
} from 'src/app/state/saving-trigger.state';
import {
  EndLoading,
  GraphProperties,
  GraphVisualisationState,
  ResetMultiSelectedPidUris,
  SetMultiSelectedPidUris,
  StartLoading,
  UpdateMultiSelectedPidUris
} from 'src/app/state/graph-visualisation.state';
import { LinkDto } from 'src/app/shared/models/link-dto';
import { LinkHistoryDialogComponent } from '../../link-history-dialog/link-history-dialog.component';
import { MapDetailsDialogComponent } from '../../footbar/user-guidance/map-details-dialog/map-details-dialog.component';
import { SubscriptionHelperDirective } from 'src/app/shared/directives/subscription-helper.directive';
import { ColidIconsService } from 'src/app/shared/icons/services/colid-icons.service';
import { IconTypes } from 'src/app/shared/icons/models/icon-types';
import { toBoolean } from 'src/app/shared/string-functions';

const ITEMS_PER_COLUMN = 19;
const MINIMUM_ITEMS_PER_COLUMN = 11;
const SHIFT = 5;

interface ExpandDropdownData {
  originalValue: string;
  readableValue: string;
  counter: number;
}

enum FilterType {
  LinkType = 'LinkType',
  ResourceType = 'ResourceType',
  Outbound = 'Outbound'
}

@Component({
  selector: 'graph',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './graph.component.html',
  styleUrls: ['./graph.component.css']
})
export class GraphComponent
  extends SubscriptionHelperDirective
  implements OnInit, AfterViewInit
{
  @ViewChild('linkMenuTrigger')
  linkContextMenu!: MatMenuTrigger;
  linkContextMenuPosition = { x: '0px', y: '0px' };

  @ViewChild('nodeMenuTrigger')
  nodeContextMenu!: MatMenuTrigger;
  nodeContextMenuPosition = { x: '0px', y: '0px' };

  overlapMaps: GraphMapInfo[] = [];

  S3: IconTypes = IconTypes.S3;
  filterType = FilterType;
  linkTypes: Array<ExpandDropdownData> = [];
  resourceTypes: Array<ExpandDropdownData> = [];
  counters = {
    allLinks: 0,
    inbound: 0,
    outbound: 0
  };

  @ViewChild('mainMenuTrigger')
  mainContextMenu!: MatMenuTrigger;
  mainContextMenuPosition = { x: '0px', y: '0px' };

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

  @Select(SavingTriggerState.getSavingTriggerState)
  savingTriggerListener$!: Observable<SavingTrigger>;

  graph!: ForceDirectedGraph;
  masterSub: Subscription = new Subscription();

  /** Insert already initialized nodes and links here */
  currentMap: GraphMapMetadata | null = null;
  nodes: Node[] = [];
  links: Link[] = [];

  moveMap = false;
  moveMapWidth: number = 800;
  doubleClickXCoordinate: number = 0;
  linkingModeEnabled = false;
  linkingNodesSelected: number = 0;
  linkHistory: LinkEditHistory[] = [];
  selectedHistory: LinkEditHistory[] = [];
  savingInProgress = false;

  private _options: { width: any; height: any } = {
    width: window.innerWidth,
    height: 900
  };

  get options() {
    return (this._options = {
      width: window.innerWidth,
      height: window.innerHeight - 75
    });
  }

  get viewShift() {
    return `translate(${this.options.width / 2.7}, ${
      this.options.height / 2.7
    })`;
  }

  get hasAnyLinks(): boolean {
    return this.counters.allLinks > 0;
  }

  get hasInboundLinks(): boolean {
    return this.counters.inbound > 0;
  }

  get hasOutboundLinks(): boolean {
    return this.counters.outbound > 0;
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.options.width = event.target.innerWidth;
    this.options.height = 900;
    this.graph.initSimulation(this.options);
  }

  constructor(
    public dialog: MatDialog,
    private snackBar: MatSnackBar,
    private ref: ChangeDetectorRef,
    private store: Store,
    private route: ActivatedRoute,
    private authService: AuthService,
    private rrmService: ResourceRelationshipManagerService,
    private notificationService: NotificationService,
    private cookieService: CookieService,
    private appIconService: ColidIconsService
  ) {
    super();
  }

  ngOnInit(): void {
    this.initGraph();

    this.subscribeToLinkingProperties();
    this.subscribeToMapDataProperties();
    this.subscribeToSavingTriggerListener();
    this.subscribeToGraphDataChanges();
    this.subscribeToSidebarState();
    this.subscribeToPidUrisToLoadResources();
  }

  ngAfterViewInit(): void {
    this.loadInitialResourcesAndExpandFirstNode();
    this.loadStoredSelectedResources();
  }

  openDialog(node: Node): void {
    const dialogRef = this.dialog.open(GraphDialogComponent, {
      height: 'auto',
      width: '80vw',
      data: {
        links: this.getIncomingOutgoingLinks(node),
        pidUri: node.id,
        resourceLabel: node.name
      }
    });

    dialogRef
      .afterClosed()
      .pipe(takeUntil(this._unsubscribe))
      .subscribe((result: GraphDialogResultData) => {
        this.store.dispatch(new StartLoading());

        if (result) {
          this.addRestoredLinks(result?.restoredLinks, node);
          this.hideDeselectedLinks(result?.hiddenLinks);
          this.displaySelectedLinks(result?.displayedLinks, node);
        }

        this.store.dispatch(new EndLoading());
      });
  }

  onLinkContextMenu(event: MouseEvent, item: Link): void {
    event.preventDefault();

    if (item.isVersionLink) return;

    this.linkContextMenuPosition.x = event.clientX + 'px';
    this.linkContextMenuPosition.y = event.clientY + 'px';
    this.linkContextMenu.menuData = { item: item };
    this.linkContextMenu.menu.focusFirstItem('mouse');
    this.linkContextMenu.openMenu();
  }

  onNodeContextMenu(event: MouseEvent, item: Node): void {
    event.preventDefault();

    this.store.selectSnapshot(GraphVisualisationState.getMultiSelectedPidUris)
      .length > 0
      ? this.openMultiselectContextMenu(event)
      : this.openNodeContextMenu(event, item);
  }

  onBackgroundContextMenu(event: MouseEvent): void {
    event.preventDefault();

    if (
      this.store.selectSnapshot(GraphVisualisationState.getMultiSelectedPidUris)
        .length > 0
    )
      this.openMultiselectContextMenu(event);
  }

  addLink(item: Node): void {
    this.store.dispatch(
      new AddLinkableNode(
        Object.assign(new Node(item.id), JSON.parse(JSON.stringify(item)))
      )
    );
  }

  deleteLink(link: Link): void {
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
        uri: link.source.id
      },
      target: {
        name: link.target.name,
        uri: link.target.id
      }
    };

    this.store.dispatch(new AddToLinkEditHistory(lc, LinkHistoryAction.Delete));
  }

  showLinkHistory(link: Link): void {
    this.dialog.open(LinkHistoryDialogComponent, {
      width: '80vw',
      data: {
        startPidUri: link.source.id,
        endPidUri: link.target.id
      }
    });
  }

  expandSelected(): void {
    const multiSelectedPidUris: string[] = this.store.selectSnapshot(
      GraphVisualisationState.getMultiSelectedPidUris
    );

    this.nodes
      .filter((n) => multiSelectedPidUris.includes(n.id))
      .forEach((node: Node) => this.expand(node));
  }

  private applyFilters(
    nodeToExpand: Node,
    filterType: FilterType,
    filterValue: string
  ): Array<string> {
    /*
     * Dev note: The node we expand will always be the source of the link,
     * so we can only consider the target for filters
     */

    let filteredNodeIds: Set<string> = new Set<string>();

    nodeToExpand.links.forEach((link: LinkDto) => {
      if (filteredNodeIds.has(link.target)) return;

      // No filter provided - adding every target node
      if (!filterType) {
        filteredNodeIds.add(link.target);

        return;
      }

      switch (filterType) {
        case FilterType.ResourceType:
          if (link.targetType === filterValue) {
            filteredNodeIds.add(link.target);
          }
          break;
        case FilterType.LinkType:
          if (link.linkType.key === filterValue) {
            filteredNodeIds.add(link.target);
          }
          break;
        case FilterType.Outbound:
          if (link.outbound === toBoolean(filterValue)) {
            filteredNodeIds.add(link.target);
          }
          break;
        default:
          throw new Error('Unsupported filter type provided: ' + filterType);
      }
    });

    return Array.from(filteredNodeIds);
  }

  expand(
    nodeToExpand: Node,
    filterType?: FilterType,
    filterValue?: string
  ): void {
    this.store.dispatch(new StartLoading());

    let nodeIdsToLoad: Array<string> = this.applyFilters(
      nodeToExpand,
      filterType,
      filterValue
    );

    if (nodeIdsToLoad.length === 0) {
      this.snackBar.open(
        'All linked resources are already rendered',
        'Dismiss',
        { duration: 3000, panelClass: 'success-snackbar' }
      );

      this.store.dispatch(new EndLoading());

      return;
    }

    this.rrmService
      .getResources(nodeIdsToLoad)
      .pipe(takeUntil(this._unsubscribe))
      .subscribe((newNodes) => {
        this.setInboundOutboundNodesPosition(newNodes, nodeToExpand);

        this.store.dispatch(new AddNodes(newNodes));

        this.store.dispatch(
          new AddLinks(this.extractLinks([...newNodes, nodeToExpand]))
        );

        this.store.dispatch(new EndLoading());
      });
  }

  private extractLinks(resources: Node[]): Array<Link> {
    const links: Link[] = [];

    resources.forEach((node) => {
      node.links.forEach((link) => {
        links.push(Object.assign(new Link(), JSON.parse(JSON.stringify(link))));
      });
    });

    return links;
  }

  extractLinkProperties(node: Node): void {
    let linkTypes: Array<ExpandDropdownData> = [];
    let resourceTypes: Array<ExpandDropdownData> = [];
    this.counters = {
      allLinks: 0,
      inbound: 0,
      outbound: 0
    };

    node.links.forEach((link) => {
      this.counters.allLinks++;
      link.outbound ? this.counters.outbound++ : this.counters.inbound++;

      linkTypes = this.addToData(
        linkTypes,
        link.linkType.key,
        link.isVersionLink ? 'Version' : link.linkType.value
      );

      resourceTypes = this.addToData(
        resourceTypes,
        link.targetType,
        this.appIconService._tooltipMapping.get(
          // TODO: refactor this usage of icons service's tooltip method,
          // it should be a separate mapping method for the resource type
          encodeURIComponent(link.targetType)
        )
      );
    });

    this.linkTypes = linkTypes;
    this.resourceTypes = resourceTypes;
  }

  private addRestoredLinks(
    restoredLinks: Array<LinkDto>,
    currentNode: Node
  ): void {
    restoredLinks?.forEach((link) => {
      const reversedLink: LinkDto = {
        ...link,
        outbound: !link.outbound,
        source: link.target,
        sourceName: link.targetName,
        sourceType: link.targetType,
        target: link.source,
        targetName: link.sourceName,
        targetType: link.sourceType
      };

      currentNode.links.push(link);

      this.nodes.find((n) => n.id == link.target)?.links.push(reversedLink);
    });
  }

  private hideDeselectedLinks(hiddenLinks: Array<LinkDto>): void {
    hiddenLinks?.forEach((r) => {
      const nodeToRemove = JSON.parse(JSON.stringify(this.nodes))?.find(
        (x) => x.id == r.target
      );

      if (nodeToRemove) {
        this.hideNode(nodeToRemove);
      }
    });
  }

  private displaySelectedLinks(
    displayedLinks: Array<LinkDto>,
    currentNode: Node
  ): void {
    const nodeIdsToLoad: Set<string> = new Set<string>();

    displayedLinks?.forEach((link) => {
      const sourceRendered = this.nodes.find((node) => node.id == link.source);
      const targetRendered = this.nodes.find((node) => node.id == link.target);

      if (!sourceRendered) {
        nodeIdsToLoad.add(link.source);
      } else if (!targetRendered) {
        nodeIdsToLoad.add(link.target);
      } else {
        this.store.dispatch(
          new AddLinks([
            Object.assign(new Link(), JSON.parse(JSON.stringify(link)))
          ])
        );
      }
    });

    if (Array.from(nodeIdsToLoad)?.length > 0) {
      this.loadResources(Array.from(nodeIdsToLoad), undefined, currentNode);
    }
  }

  private addToData(
    data: Array<ExpandDropdownData>,
    originalValue: string,
    readableValue: string
  ): Array<ExpandDropdownData> {
    const existingItem = data.find(
      (item) => item.originalValue === originalValue
    );

    const counter = (existingItem?.counter || 0)! + 1;

    if (existingItem) {
      existingItem.counter = counter;
    } else {
      data.push({
        originalValue,
        readableValue,
        counter
      });
    }

    return data;
  }

  selectLinkedNodes(node: Node): void {
    let nodeURIs: Set<string> = new Set();

    node?.links.forEach((link) => {
      nodeURIs.add(link.target);
    });

    nodeURIs.add(node.id);

    this.store.dispatch(new SelectNodes(Array.from(nodeURIs)));
    this.store.dispatch(new SetMultiSelectedPidUris(Array.from(nodeURIs)));
  }

  selectAllHighlightedLinkedNodes(): void {
    const selectedNodeUris: Set<string> = new Set();
    const selectedNodes = this.getMultiSelectedNodes();

    selectedNodes.forEach((node) => {
      node?.links.forEach((link) => {
        selectedNodeUris.add(link.target);
      });

      selectedNodeUris.add(node.id);
    });

    this.store.dispatch(new SelectNodes(Array.from(selectedNodeUris)));
    this.store.dispatch(
      new UpdateMultiSelectedPidUris(Array.from(selectedNodeUris))
    );
  }

  hideNode(node: Node): void {
    this.store.dispatch(new RemoveNodes([node]));
  }

  hideHighlightedNodes(): void {
    const nodesToHide = this.getMultiSelectedNodes();

    this.store.dispatch(new RemoveNodes(nodesToHide));
    this.store.dispatch(new ResetMultiSelectedPidUris());
  }

  deleteHighlightedlinks(): void {
    const nodes = this.getMultiSelectedNodes();
    const linksToDelete: Set<Link> = new Set();

    if (nodes.length > 0) {
      nodes.forEach((node) => {
        const links = this.links.filter(
          (link) =>
            (link.source === node || link.target === node) &&
            !link.isVersionLink
        );

        links.forEach((l) => linksToDelete.add(l));
      });
    } else {
      const singleSelectedNode = this.nodes.find((n) => n.selected);

      const links = this.links.filter(
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
          uri: linkCopy.source.id
        },
        target: {
          name: linkCopy.target.name,
          uri: linkCopy.target.id
        }
      };

      this.store.dispatch(
        new AddToLinkEditHistory(lc, LinkHistoryAction.Delete)
      );
    });
  }

  loadSecondMap(graph: GraphMapInfo): void {
    this.store.dispatch(new LoadSecondMap(graph.id));
  }

  loadNewMap(graph: GraphMapInfo): void {
    this.store.dispatch(new LoadMap(graph.id));
  }

  setDoubleClickXPosition(xPosition: number): void {
    this.doubleClickXCoordinate = xPosition;
  }

  private initGraph(): void {
    /** Receiving an initialized simulated graph from our custom d3 service */

    /** Binding change detection check on each tick
     * This along with an onPush change detection strategy should enforce checking only when relevant!
     * This improves scripting computation duration in a couple of tests I've made, consistently.
     * Also, it makes sense to avoid unnecessary checks when we are dealing only with simulations data binding.
     */
    this.graph = new ForceDirectedGraph([], [], this._options, this.store);

    this.nodes = this.graph.getNodes();
    this.links = this.graph.getLinks();

    this.masterSub.add(
      this.graph.ticker.pipe(takeUntil(this._unsubscribe)).subscribe((_) => {
        this.ref.markForCheck();
      })
    );
  }

  private subscribeToLinkingProperties(): void {
    this.masterSub.add(
      this.linkingProperties$
        .pipe(
          takeUntil(this._unsubscribe),
          tap((linking) => {
            this.linkingModeEnabled = linking?.linkingModeEnabled;
            this.linkingNodesSelected = linking?.linkNodes.length;
            this.linkHistory = linking?.linkEditHistory;
            this.selectedHistory = this.linkHistory;
          })
        )
        .subscribe()
    );
  }

  private subscribeToMapDataProperties(): void {
    this.masterSub.add(
      this.mapDataProperties$
        .pipe(
          takeUntil(this._unsubscribe),
          tap((m) => {
            this.currentMap = m?.currentMap;
          })
        )
        .subscribe()
    );
  }

  private subscribeToSavingTriggerListener(): void {
    //listen for the event when the "saving" action was triggered.
    this.masterSub.add(
      this.savingTriggerListener$
        .pipe(
          takeUntil(this._unsubscribe),
          tap((saving) => {
            if (saving?.savingMap && !this.savingInProgress) {
              this.savingInProgress = true;

              //prepare all the data for saving
              let newNodes: Node[] = [];

              this.graph.getNodes().forEach((node) => {
                newNodes.push(
                  Object.assign(
                    new Node(node.id),
                    JSON.parse(JSON.stringify(node))
                  )
                );
              });

              let savingPayload: GraphMapV2SaveDto = {
                id: saving.saveMapAsNew ? '' : this.currentMap.graphMapId,
                name: this.currentMap.name,
                description: this.currentMap.description,
                nodes: newNodes.map(
                  (x) =>
                    <NodeV2SaveDto>{
                      id: x.id,
                      fx: Number.parseInt(x.fx!.toFixed(20)),
                      fy: Number.parseInt(x.fy!.toFixed(20))
                    }
                )
              };

              //call new saving method
              this.rrmService
                .saveGraphMap(savingPayload)
                .pipe(takeUntil(this._unsubscribe))
                .subscribe({
                  next: (res: GraphMapV2) => {
                    const map: GraphMapMetadata = {
                      graphMapId: res.id,
                      name: res.name,
                      description: res.description,
                      modifiedBy: res.modifiedBy,
                      modifiedAt: res.modifiedAt,
                      nodesCount: res.nodes.length,
                      browsablePidUri: res.pidUri
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

                    this.dialog.open(MapDetailsDialogComponent, {
                      data: map,
                      minWidth: '60vw',
                      autoFocus: 'dialog'
                    });

                    this.authService.currentEmail$
                      .pipe(takeUntil(this._unsubscribe))
                      .subscribe((email) => {
                        if (email) {
                          this.store.dispatch(new LoadOwnMaps(email));
                        }
                      });
                  },
                  error: (err) => {
                    this.snackBar.open(err.error?.message, 'Dismiss');
                    this.savingInProgress = false;
                    this.store.dispatch(new EndSavingMap());
                  }
                });
            }
          })
        )
        .subscribe()
    );
  }

  private subscribeToGraphDataChanges(): void {
    //listen for data changes and process them accordingly
    this.masterSub.add(
      this.graphDataChanges$
        .pipe(
          takeUntil(this._unsubscribe),
          tap((graphDataInput) => {
            if (!graphDataInput) return;

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

            // refresh data model
            this.links = this.graph.getLinks();
            this.nodes = this.graph.getNodes();
          })
        )
        .subscribe()
    );
  }

  private subscribeToSidebarState(): void {
    this.masterSub.add(
      this.sidebarState$
        .pipe(takeUntil(this._unsubscribe))
        .subscribe((sidebarOpen) => {
          const remainingSpace =
            this.options.width - this.doubleClickXCoordinate;

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

  private subscribeToPidUrisToLoadResources(): void {
    this.rrmService.pidUrisToLoadResources$
      .pipe(takeUntil(this._unsubscribe))
      .subscribe((pidUris) => {
        if (pidUris?.length > 0) {
          this.loadResources(pidUris);
        }
      });
  }

  private loadInitialResourcesAndExpandFirstNode(): void {
    this.route.queryParams
      .pipe(takeUntil(this._unsubscribe))
      .subscribe((params) => {
        const startURI: string = params.baseNode;

        if (startURI && startURI.length > 0) {
          setTimeout(() => {
            this.loadResources([startURI], true);
          });
        }
      });
  }

  private loadStoredSelectedResources(): void {
    this.route.queryParams
      .pipe(takeUntil(this._unsubscribe))
      .subscribe((params) => {
        const viewSelectedResources: boolean = params.viewSelectedResources;

        let selectedResources = this.cookieService.getObject(
          'selectedResources'
        ) as string[];

        if (selectedResources != null && viewSelectedResources) {
          setTimeout(() => this.loadResources(selectedResources), 0);
        }
      });
  }

  private getMultiSelectedNodes() {
    const multiSelectedPidUris: string[] = this.store.selectSnapshot(
      GraphVisualisationState.getMultiSelectedPidUris
    );

    const nodes = this.nodes.filter((n) => multiSelectedPidUris.includes(n.id));

    return nodes;
  }

  // TODO: Refactor
  private setInboundOutboundNodesPosition(
    nodes: Node[],
    originNode: Node
  ): void {
    // filter out inbound and outbound nodes
    let inboundNodes: Node[] = [];
    let outboundNodes: Node[] = [];

    nodes.forEach((n) => {
      n.links.forEach((link) => {
        if (link.targetName == originNode.name && link.outbound) {
          inboundNodes.push(n);
        } else if (link.targetName == originNode.name && !link.outbound) {
          outboundNodes.push(n);
        }
      });
    });

    // sort outbound nodes by resource type
    const partitionedOutboundNodes = outboundNodes.reduce(
      (resultObject, item) => {
        const resourceType = item.resourceType.key;
        if (!resultObject[resourceType]) {
          resultObject[resourceType] = [];
        }

        resultObject[resourceType].push(item);

        return resultObject;
      },
      {}
    );

    const orderedOutboundNodes = Object.keys(partitionedOutboundNodes).reduce(
      (resultArray, key) => {
        return resultArray.concat(partitionedOutboundNodes[key]);
      },
      []
    );

    // set coordinates for outbound nodes
    console.log(
      'amount of elements to distribute ',
      orderedOutboundNodes.length
    );

    let currentOutboundXPosition = originNode.fx + this.graph.GRID_SIZE.xWidth;

    this.arrangeNodesInColumns(
      orderedOutboundNodes,
      currentOutboundXPosition,
      originNode.fy,
      true
    );

    // sort outbound nodes by resource type
    const partitionedInboundNodes = inboundNodes.reduce(
      (resultObject, item) => {
        const resourceType = item.resourceType.key;

        if (!resultObject[resourceType]) {
          resultObject[resourceType] = [];
        }

        resultObject[resourceType].push(item);

        return resultObject;
      },
      {}
    );

    const orderedInboundNodes = Object.keys(partitionedInboundNodes).reduce(
      (resultArray, key) => {
        return resultArray.concat(partitionedInboundNodes[key]);
      },
      []
    );

    // set coordinates for inbound nodes
    console.log(
      'amount of elements to distribute ',
      orderedInboundNodes.length
    );

    let currentInboundXPosition = originNode.fx - this.graph.GRID_SIZE.xWidth;

    this.arrangeNodesInColumns(
      orderedInboundNodes,
      currentInboundXPosition,
      originNode.fy,
      false
    );
  }

  /**
   * Takes a list of PID URIs, loads them from the DB and places them on the graph.
   * If optional flag is set, it will expand the first node.
   *
   * @param pidUris list of PID URIs
   * @param expandFirstNode optional boolean flag to expand the first node
   * @param originNode optional origin node to calculate the position
   *                   of inbound and outbound nodes around
   */
  private loadResources(
    pidUris: string[],
    expandFirstNode?: boolean,
    originNode?: Node
  ): void {
    this.store.dispatch(new StartLoading());

    this.rrmService
      .getResources(pidUris)
      .pipe(takeUntil(this._unsubscribe))
      .subscribe((nodesToAdd: Node[]) => {
        if (originNode) {
          this.setInboundOutboundNodesPosition(nodesToAdd, originNode);
        }

        let linksToAdd: Array<Link> = this.extractLinks(nodesToAdd);
        linksToAdd = this.linkPreviousVersions(nodesToAdd, linksToAdd);

        this.store.dispatch(new AddNodes(nodesToAdd));
        this.store.dispatch(new AddLinks(linksToAdd));

        if (expandFirstNode) {
          const nodes = this.graph.getNodes();

          if (nodes.length > 0) {
            this.expand(nodes[0]);
          }
        }

        this.store.dispatch(new EndLoading());
      });
  }

  /**
   * If the loaded node has version links and is in the middle of the
   * version chain (e.g. we had v1 and v3 on the graph, and now render v2),
   * we need to draw a link from the previous version to the added node.
   * As this link is not present in the added node itself,
   * we gotta go fishing for it in the existing nodes.
   *
   * @param nodesToAdd all Nodes to be added to the graph
   * @param linksToAdd all Links to be added to the graph
   */
  private linkPreviousVersions(nodesToAdd: Node[], linksToAdd: Link[]): Link[] {
    nodesToAdd.forEach((node) => {
      node.links.forEach((link) => {
        if (link.isVersionLink && !link.outbound) {
          const previousNode = this.nodes.find(
            (n) => n.id === link.target && n.laterVersion === link.source
          );

          if (previousNode) {
            const linkToAddedNode = previousNode.links.find(
              (l) => l.isVersionLink && l.outbound && l.target === link.source
            );

            linksToAdd.push(
              Object.assign(
                new Link(),
                JSON.parse(JSON.stringify(linkToAddedNode))
              )
            );
          }
        }
      });
    });

    return linksToAdd;
  }

  private getIncomingOutgoingLinks(node: Node): LinkDto[] {
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

  private isLinkDuplicate(
    links: LinkDto[],
    source: any,
    target: any,
    type: string
  ): boolean {
    let result =
      links.findIndex(
        (l) =>
          l.source == source && l.target == target && l.linkType.key == type
      ) > -1;

    return result;
  }

  private openNodeContextMenu(event: MouseEvent, node: Node): void {
    this.rrmService
      .getGraphMapsByResource(node.id)
      .pipe(takeUntil(this._unsubscribe))
      .subscribe({
        next: (res: GraphMapInfo[]) => {
          this.overlapMaps = res;
        },
        error: () => {
          this.overlapMaps = [];
        }
      });

    this.extractLinkProperties(node);

    this.nodeContextMenuPosition.x = event.clientX + 'px';
    this.nodeContextMenuPosition.y = event.clientY + 'px';
    this.nodeContextMenu.menuData = { item: node };
    this.nodeContextMenu.menu.focusFirstItem('mouse');
    this.nodeContextMenu.openMenu();
  }

  private openMultiselectContextMenu(event: MouseEvent): void {
    this.mainContextMenuPosition.x = event.clientX + 'px';
    this.mainContextMenuPosition.y = event.clientY + 'px';
    this.mainContextMenu.openMenu();
  }

  private arrangeNodesInColumns(
    nodes: Node[],
    initialXPosition: number,
    initialYPosition: number,
    isOutbound: boolean
  ) {
    let currentXPosition = initialXPosition;

    while (nodes.length > 0) {
      let nodesCount = nodes.length;
      let currentYPosition = initialYPosition;
      let {
        upperAvailablePositions,
        lowerAvailablePositions,
        spaceToShiftUp,
        spaceToShiftDown
      } = this.graph.checkAvailablePositions(
        currentXPosition,
        currentYPosition,
        ITEMS_PER_COLUMN,
        SHIFT
      );

      // place last elements
      if (
        upperAvailablePositions + lowerAvailablePositions >= nodes.length &&
        lowerAvailablePositions >= Math.floor(nodesCount / 2) &&
        upperAvailablePositions > Math.floor(nodesCount / 2)
      ) {
        console.log('place remaining elements');

        const split = Math.floor(nodes.length / 2);

        for (let i = 0; i < split; i++) {
          nodes[i].fx = currentXPosition - 40;
          nodes[i].fy =
            currentYPosition - (split - i) * this.graph.GRID_SIZE.yHeight - 20;
        }

        for (
          let i = 0;
          i < lowerAvailablePositions && i < nodesCount - split;
          i++
        ) {
          nodes[i + split].fx = currentXPosition - 40;
          nodes[i + split].fy =
            currentYPosition + i * this.graph.GRID_SIZE.yHeight - 20;
        }

        nodes.splice(0, nodes.length);
      }
      // items need to be shifted up
      else if (
        spaceToShiftUp > 0 &&
        (spaceToShiftUp >=
          Math.floor(MINIMUM_ITEMS_PER_COLUMN / 2) - lowerAvailablePositions ||
          lowerAvailablePositions + upperAvailablePositions >=
            MINIMUM_ITEMS_PER_COLUMN)
      ) {
        console.log(
          'items will be shifted up',
          spaceToShiftUp,
          lowerAvailablePositions
        );

        if (nodes.length >= ITEMS_PER_COLUMN) {
          console.log('amount of elements is greater than ITEMS_PER_COLUMN');

          const totalItems =
            upperAvailablePositions + lowerAvailablePositions + spaceToShiftUp >
            ITEMS_PER_COLUMN
              ? ITEMS_PER_COLUMN
              : upperAvailablePositions +
                lowerAvailablePositions +
                spaceToShiftUp;

          const split = totalItems - lowerAvailablePositions;

          for (let i = 0; i < split; i++) {
            nodes[i].fx = currentXPosition - 40;
            nodes[i].fy =
              currentYPosition -
              (split - i - 1) * this.graph.GRID_SIZE.yHeight -
              20;
          }

          for (let i = 0; i <= lowerAvailablePositions; i++) {
            nodes[i + split].fx = currentXPosition - 40;
            nodes[i + split].fy =
              currentYPosition + (i + 1) * this.graph.GRID_SIZE.yHeight - 20;
          }

          nodes.splice(0, totalItems);
        } else {
          const split = nodes.length - lowerAvailablePositions;

          console.log('amount of elements is less than ITEMS_PER_COLUMN');

          for (let i = 0; i < split; i++) {
            nodes[i].fx = currentXPosition - 40;
            nodes[i].fy =
              currentYPosition -
              (split - i - 1) * this.graph.GRID_SIZE.yHeight -
              20;
          }

          for (let i = 0; i < lowerAvailablePositions; i++) {
            nodes[i + split].fx = currentXPosition - 40;
            nodes[i + split].fy =
              currentYPosition + (i + 1) * this.graph.GRID_SIZE.yHeight - 20;
          }

          nodes.splice(0, nodes.length);
        }
      }
      // items need to be shifted down
      else if (
        spaceToShiftDown > 0 &&
        (spaceToShiftDown >=
          Math.floor(MINIMUM_ITEMS_PER_COLUMN / 2) - upperAvailablePositions ||
          upperAvailablePositions + lowerAvailablePositions >=
            MINIMUM_ITEMS_PER_COLUMN)
      ) {
        console.log(
          'items will be shifted down',
          spaceToShiftUp,
          lowerAvailablePositions
        );

        if (nodes.length >= ITEMS_PER_COLUMN) {
          console.log('amount of elements is greater than ITEMS_PER_COLUMN');
          const totalItems =
            upperAvailablePositions +
              lowerAvailablePositions +
              spaceToShiftDown >
            ITEMS_PER_COLUMN
              ? ITEMS_PER_COLUMN
              : upperAvailablePositions +
                lowerAvailablePositions +
                spaceToShiftDown;
          console.log('totalItems', totalItems);

          for (let i = 0; i < upperAvailablePositions; i++) {
            nodes[i].fx = currentXPosition - 40;
            nodes[i].fy =
              currentYPosition -
              (upperAvailablePositions - i - 1) * this.graph.GRID_SIZE.yHeight -
              20;
          }

          for (let i = 0; i < totalItems - upperAvailablePositions; i++) {
            nodes[i + upperAvailablePositions].fx = currentXPosition - 40;
            nodes[i + upperAvailablePositions].fy =
              currentYPosition + (i + 1) * this.graph.GRID_SIZE.yHeight - 20;
          }
          nodes.splice(0, totalItems);
        } else {
          console.log('amount of elements is less than ITEMS_PER_COLUMN');

          const split = upperAvailablePositions;

          for (let i = 0; i < split && i < nodes.length; i++) {
            nodes[i].fx = currentXPosition - 40;
            nodes[i].fy =
              currentYPosition -
              (split - 1 - i) * this.graph.GRID_SIZE.yHeight -
              20;
          }

          for (
            let i = 0;
            i <= lowerAvailablePositions + spaceToShiftDown &&
            i < nodes.length - split;
            i++
          ) {
            nodes[i + split].fx = currentXPosition - 40;
            nodes[i + split].fy =
              currentYPosition + (i + 1) * this.graph.GRID_SIZE.yHeight - 20;
          }

          nodes.splice(0, nodes.length);
        }
      }
      // gap between two nodes is enough to fit MIN_ITEMS_PER_COLUMN
      else if (
        upperAvailablePositions + lowerAvailablePositions >=
        MINIMUM_ITEMS_PER_COLUMN
      ) {
        console.log(
          'fit elements between two nodes',
          upperAvailablePositions,
          lowerAvailablePositions
        );

        const amountOfElements =
          upperAvailablePositions + lowerAvailablePositions;

        for (let i = 0; i < upperAvailablePositions; i++) {
          nodes[i].fx = currentXPosition - 40;
          nodes[i].fy =
            currentYPosition -
            (upperAvailablePositions - 1 - i) * this.graph.GRID_SIZE.yHeight -
            20;
        }

        for (let i = 0; i < lowerAvailablePositions; i++) {
          nodes[i + upperAvailablePositions].fx = currentXPosition - 40;
          nodes[i + upperAvailablePositions].fy =
            currentYPosition + (i + 1) * this.graph.GRID_SIZE.yHeight - 20;
        }

        nodes.splice(0, amountOfElements);
      }

      if (isOutbound) {
        currentXPosition += this.graph.GRID_SIZE.xWidth;
      } else {
        currentXPosition -= this.graph.GRID_SIZE.xWidth;
      }
    }
  }
}
