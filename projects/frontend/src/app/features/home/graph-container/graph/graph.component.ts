import { Component, ChangeDetectorRef, HostListener, ChangeDetectionStrategy, OnInit, AfterViewInit, ViewChild, OnDestroy } from '@angular/core';
import { ResourceRelationshipManagerService } from 'projects/frontend/src/app/core/http/resource-relationship-manager.service';
import { LinkEditHistory, LinkHistoryAction } from 'projects/frontend/src/app/shared/models/link-editing-history';
import { Observable, Subscription } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ForceDirectedGraph, Link, Node } from '../../../../core/d3';
import { MatMenuTrigger } from '@angular/material/menu';
import { LinkTypeContainer } from 'projects/frontend/src/app/shared/models/link-types-dto';
import { GraphMapMetadata } from 'projects/frontend/src/app/shared/models/graph-map-metadata';
import { AuthService } from 'projects/frontend/src/app/modules/authentication/services/auth.service';
import { ActivatedRoute } from '@angular/router';
import { GraphMapInfo } from 'projects/frontend/src/app/shared/models/graph-map-info';
import { MatSnackBar } from '@angular/material/snack-bar'
import { NotificationService } from 'projects/frontend/src/app/shared/services/notification.service';
import { GraphMapV2SaveDto, NodeV2SaveDto } from 'projects/frontend/src/app/shared/models/gaph-map-v2-save-dto';
import { MatDialog } from '@angular/material/dialog';
import { GraphDialogComponent } from '../graph-dialog/graph-dialog/graph-dialog.component';
import { CookieService } from 'ngx-cookie';
import { Select, Store } from '@ngxs/store';
import { GraphMapData, LoadMap, LoadOwnMaps, LoadSecondMap, MapDataState, SetCurrentId } from 'projects/frontend/src/app/state/map-data.state';
import { AddLinks, AddNodes, GraphData, GraphDataState, RemoveLinks, RemoveNodes, SelectNodes } from 'projects/frontend/src/app/state/graph-data.state';
import { AddLinkableNode, AddToLinkEditHistory, GraphLinkingData, GraphLinkingDataState } from 'projects/frontend/src/app/state/graph-linking.state';
import { EndSavingMap, SavingTrigger, SavingTriggerState } from 'projects/frontend/src/app/state/saving-trigger.state';
import { EndLoading, GraphProperties, GraphVisualisationState, StartLoading } from 'projects/frontend/src/app/state/graph-visualisation.state';

@Component({
  selector: 'graph',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './graph.component.html',
  styleUrls: ['./graph.component.css']
})
export class GraphComponent implements OnInit, AfterViewInit, OnDestroy {
  /** Insert already initialized nodes and links here */
  currentMap: GraphMapMetadata = { graphMapId: "", name: "", description: "", modifiedBy: "" };
  _nodes: Node[] = [];
  _links: Link[] = [];

  graph!: ForceDirectedGraph;
  @Select(GraphVisualisationState.getGraphVisualisationState) graphProperties$: Observable<GraphProperties>;
  @Select(GraphDataState.getGraphDataState) graphDataChanges$: Observable<GraphData>; // this will not store the actual node data, but only the delta to the current state which needs to be processed
  @Select(GraphLinkingDataState.getGraphLinkingState) linkingProperties$: Observable<GraphLinkingData>;
  @Select(MapDataState.getMapDataState) mapDataProperties$: Observable<GraphMapData>;
  currentUser: string = ''

  @Select(SavingTriggerState.getSavingTriggerState) savingTriggerListener$!: Observable<SavingTrigger>;
  savingInProgress: boolean = false;

  linkingModeEnabled: boolean = false;
  linkingNodesSelected: number = 0;
  linkHistory: LinkEditHistory[] = [];
  selectedHistory: LinkEditHistory[] = [];

  masterSub: Subscription = new Subscription();

  private _options: { width: any, height: any } = { width: window.innerWidth, height: 900 };

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
    private cookieService: CookieService) { }

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
    this.masterSub.add(this.graph.ticker.subscribe((d) => {
      this.ref.markForCheck();
    }));



    this.masterSub.add(this.linkingProperties$.pipe(
      tap(
        linking => {
          this.linkingModeEnabled = linking.linkingModeEnabled;
          this.linkingNodesSelected = linking.linkNodes.length;
          this.linkHistory = linking.linkEditHistory;
          this.selectedHistory = this.linkHistory;
        }
      )
    ).subscribe());

    this.masterSub.add(this.mapDataProperties$.pipe(
      tap(
        m => {
          this.currentMap = m.currentMap;
          this.currentUser = m.currentUser;
        }
      )
    ).subscribe());

    //listen for the event when the "saving" action was triggered.
    this.masterSub.add(this.savingTriggerListener$.pipe(
      tap(
        saving => {
          if (saving.savingMap && !this.savingInProgress) {
            this.savingInProgress = true;

            //prepare all the data for saving
            let nodes: Node[] = this.decoupleNodeList(this.graph.getNodes());

            let savingPayload: GraphMapV2SaveDto = {
              id: (saving.saveMapAsNew ? "" : this.currentMap.graphMapId),
              name: this.currentMap.name,
              description: this.currentMap.description,
              nodes: nodes.map(x => <NodeV2SaveDto>(
                {
                  id: x.id,
                  fx: Number.parseInt(x.fx!.toFixed(20)),
                  fy: Number.parseInt(x.fy!.toFixed(20))
                }
              ))
            };

            //call new saving method
            this.rrmService.saveGraphMapV2(savingPayload).subscribe(
              res => {
                //handle when saving was successful
                this.store.dispatch(new SetCurrentId(res.id));
                this.savingInProgress = false;
                this.store.dispatch(new EndSavingMap());
                this.authService.currentEmail$.subscribe(
                  email => {
                    if (email) {
                      this.store.dispatch(new LoadOwnMaps(email));
                    }
                  }
                )
              },
              err => {
                this.snackBar.open(err.error?.message, "Dismiss");
                this.savingInProgress = false;
                this.store.dispatch(new EndSavingMap());
              }
            );
          }
        }
      )
    ).subscribe());

    //listen for data changes and process them accordingly
    this.masterSub.add(this.graphDataChanges$.pipe(
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
          if (graphData.toggle != "") {
            this.graph.toggleNode(graphData.toggle);
          }
          if (graphData.toggleExclusive != "") {
            this.graph.toggleExclusive(graphData.toggleExclusive);
          }

          if (graphData.selectNodes.length > 0) {
            this.graph.selectNodes(graphData.selectNodes);
          }

          this.refreshDataModel();
        }
      )
    ).subscribe());
  }

  ngOnDestroy(): void {
    this.masterSub.unsubscribe();
  }

  openDialog(node: Node) {
    let linksBackup: Link[] = JSON.parse(JSON.stringify(this.getIncomingOutgoingLinks(node)));
    const dialogRef = this.dialog.open(GraphDialogComponent, {
      height: 'auto',
      width: '980px',
      data: { links: this.getIncomingOutgoingLinks(node) }
    });

    dialogRef.afterClosed().subscribe((result: Link[]) => {

      if (result && Array.isArray(result)) {
        //Loop through results and add/remove links
        let removeLinks: Link[] = [];
        let addLinks: Link[] = [];

        linksBackup.forEach(fl => {
          //scan through all links which were previously rendered and check whether they have been modified
          const index = result.findIndex(r => r.source == fl.source && r.target == fl.target && r.linkType.key == fl.linkType.key);
          if (index > -1) {
            if (result[index].isRendered != fl.isRendered) {
              if (result[index].isRendered) {
                addLinks.push(result[index]);
              } else {
                removeLinks.push(result[index]);
              }
            }
          }
        })

        removeLinks.forEach(r => {
          const currentNodes: Node[] = JSON.parse(JSON.stringify(this.graph.getNodes()));
          this.hideNode(currentNodes.filter(x => x.id == r.target as any)[0]);
        })
        if (addLinks.length > 0) {
          var nodeIds = addLinks.map(a => a.target as any as string);
          this.rrmService.loadResources(nodeIds);
        }
      }


    });
  }

  decoupleLinkList(links: Link[]) {
    let newLinks: Link[] = [];
    links.forEach(l => {
      newLinks.push(Object.assign(new Link, JSON.parse(JSON.stringify(l))));
    });
    return newLinks;
  }
  decoupleNodeList(nodes: Node[]) {
    let newNodes: Node[] = [];
    nodes.forEach(node => {
      newNodes.push(Object.assign(new Node(node.id), JSON.parse(JSON.stringify(node))));
    })
    return newNodes;
  }

  refreshDataModel() {
    this._links = this.graph.getLinks();
    this._nodes = this.graph.getNodes();
  }

  ngAfterViewInit() {
    this.route.queryParams.subscribe(params => {
      const startURI: string = params.baseNode;
      if (startURI && startURI.length > 0) {
        setTimeout(() => this.rrmService.loadResources([startURI]), 0);
      }
      const viewSelectedResources: boolean = params.viewSelectedResources;
      let selectedResources = this.cookieService.getObject("selectedResources") as string[];
      if (selectedResources != null && viewSelectedResources) {
        setTimeout(() => this.rrmService.loadResources(selectedResources), 0);
      }
    });
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
    let linkCopy: Link = Object.assign(new Link, JSON.parse(JSON.stringify(link)));
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

  @ViewChild('nodeMenuTrigger')
  nodeContextMenu!: MatMenuTrigger;
  overlapMaps: GraphMapInfo[] = []
  nodeContextMenuPosition = { x: '0px', y: '0px' };

  onNodeContextMenu(event: MouseEvent, item: Node) {
    event.preventDefault();
    this.rrmService.getGraphsForResource(item.id).subscribe(res => {
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
    this.store.dispatch(new AddLinkableNode(Object.assign(new Node(item.id), JSON.parse(JSON.stringify(item)))));
  }

  expandNodes(item: Node) {
    let pidUris: string[] = [];
    item.links.forEach(link => {
      if (link.display) {
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
      }

    });
    this.store.dispatch(new StartLoading());
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
        this.store.dispatch(new AddNodes(transformedContent.nodes));
        this.store.dispatch(new AddLinks(transformedContent.links));
        this.store.dispatch(new EndLoading());
      },
      err => {
        this.notificationService.notification$.next("Something went wrong with expanding the node")
        this.store.dispatch(new EndLoading());
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

  selectLinkedNodes(item: Node) {
    let nodeURLs: string[] = [];

    item.links.forEach(l => {
      nodeURLs.push(l.target as any);
    });

    nodeURLs.push(item.id);

    this.store.dispatch(new SelectNodes(nodeURLs));
  }

  hideNode(item: Node) {
    this.store.dispatch(new RemoveNodes([item]));
  }

  // added by vidhya...
  getIncomingOutgoingLinks(node: Node): Link[] {
    let links: Link[] = [];
    node.links.filter(l => !l.isVersionLink).forEach(l => {
      var trueSource = l.outbound ? l.source : l.target;
      var trueTarget = l.outbound ? l.target : l.source;

      if (!this.isLinkDuplicate(links, trueSource, trueTarget, l.linkTypeId)) {
        links.push(l);
      }
    });
    return links;
  }


  loadSecondMap(graph: GraphMapInfo) {
    this.store.dispatch(new LoadSecondMap(graph.id))
  }

  loadNewMap(graph: GraphMapInfo) {
    this.store.dispatch(new LoadMap(graph.id))
  }


  isLinkDuplicate(links: Link[], source: any, target: any, type: string) {
    let result = links.findIndex(l => l.source == source && l.target == target && l.linkTypeId == type) > -1;
    return result
  }
}


