import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { EMPTY, Observable } from 'rxjs';
import { catchError, exhaustMap, map, mergeMap, tap } from 'rxjs/operators';
import { ResourceRelationshipManagerService } from '../../core/http/resource-relationship-manager.service';
import * as mapDataActions from './map-data.actions';
import * as graphDataActions from '../graph-data/graph-data.actions';
import * as savingTriggerActions from '../saving-trigger/saving-trigger.actions';
import * as graphVisualisationActions from '../graph-visualisation/graph-visualisation.actions';
import { GraphState } from '../store-items';
import { Store } from '@ngrx/store';
import { Link, Node } from '../../core/d3';
import { GraphMapDTO } from '../../shared/models/graph-map';
import { GraphMapData } from './map-data.model';
import { GraphMapSearchDTO } from '../../shared/models/graph-map-search-dto';
import { NotificationService } from '../../shared/services/notification.service';
import { GraphLinkingData } from '../graph-linking/graph-linking.model';
import { LinkEditHistory, LinkHistoryAction } from '../../shared/models/link-editing-history';
import { ResourceLinkDto } from '../../shared/models/resource-dto';

@Injectable()
export class MapEffects {
  mapsStore$: Observable<GraphMapData>;
  linkingProperties$: Observable<GraphLinkingData>;

  constructor(
    private actions$: Actions,
    private rrmService: ResourceRelationshipManagerService,
    private store: Store<GraphState>,
    private notificationService: NotificationService
  ) {
    this.mapsStore$ = this.store.select('mapData');
    this.linkingProperties$ = this.store.select('graphLinking');
  }

  savingMaps$ = createEffect(() =>
    this.actions$.pipe(
      ofType(mapDataActions.StartSaving),
      map(action =>
        savingTriggerActions.StartSavingMap({ asNew: action.saveAsNew })
      )
    )
  );

  loadOwnMaps$ = createEffect(() =>
    this.actions$.pipe(
      ofType(mapDataActions.LoadOwnMaps),
      exhaustMap(action =>
        this.rrmService.getGraphsForUser(action.email).pipe(
          map(
            response => mapDataActions.SetOwnMaps({ maps: response })
          ),
          catchError(() => EMPTY)
        )
      )
    )
  );

  loadAllMaps$ = createEffect(() =>
    this.actions$.pipe(
      ofType(mapDataActions.LoadAllMaps),
      exhaustMap(action => {
        this.store.dispatch(mapDataActions.SetLoadingAllMapsState({ loading: true }));
        return this.rrmService.getGraphs().pipe(
          tap(
            response => {
              this.store.dispatch(mapDataActions.SetAllMaps({ maps: response }));

            }
          ),
          map(response => mapDataActions.SetLoadingAllMapsState({ loading: false })),
          catchError(() => {
            this.notificationService.notification$.next("Something went wrong while loading the maps")
            this.store.dispatch(mapDataActions.SetLoadingAllMapsState({ loading: false }))
            return EMPTY
          })
        )
      }
      )
    )
  );

  loadMapsNextBatch$ = createEffect(() =>
    this.actions$.pipe(
      ofType(mapDataActions.LoadMapsNextBatch),
      exhaustMap(action => {
        this.store.dispatch(mapDataActions.SetLoadingAllMapsState({ loading: true }));
        let currentSearchParam: GraphMapSearchDTO = new GraphMapSearchDTO();
        this.mapsStore$.pipe(
          tap(
            maps => {
              currentSearchParam = maps.searchParams
            }
          )
        ).subscribe();

        return this.rrmService.getGraphsPage(action.offset, currentSearchParam).pipe(
          tap(
            response => {
              this.store.dispatch(mapDataActions.AppendNewMaps({ maps: response }));
            }
          ),
          map(response => mapDataActions.SetLoadingAllMapsState({ loading: false })),
          catchError(() => EMPTY)
        )
      }
      )
    )
  );

  setCurrentMapSearchParams$ = createEffect(() =>
    this.actions$.pipe(
      ofType(mapDataActions.SetCurrentMapSearchParams),
      exhaustMap(action => {
        this.store.dispatch(mapDataActions.SetLoadingAllMapsState({ loading: true }));

        return this.rrmService.getGraphsPage(0, action.searchData).pipe(
          tap(
            response => {
              this.store.dispatch(mapDataActions.SetAllMaps({ maps: response }));
            }
          ),
          map(response => mapDataActions.SetLoadingAllMapsState({ loading: false })),
          catchError(() => EMPTY)
        )
      })
    ))

  loadMap$ = createEffect(() =>
    this.actions$.pipe(
      ofType(mapDataActions.LoadMap),
      exhaustMap(action => {
        this.store.dispatch(graphVisualisationActions.StartLoading());
        return this.rrmService.getGraph(action.mapId).pipe(
          tap(
            (response: GraphMapDTO) => {
              this.store.dispatch(mapDataActions.RenderMap({ map: response }))
            }
          ),
          map(
            response => mapDataActions.SetCurrentMapData({ mapId: response.graphMapId, mapName: response.name, modifiedBy: response.modifiedBy })
          ),
          catchError((err) => {
            this.notificationService.notification$.next("something went wrong while trying to load the map")
            this.store.dispatch(graphVisualisationActions.EndLoading());
            return EMPTY
          }
          )
        )
      })
    )
  );

  renderMap$ = createEffect(() =>
    this.actions$.pipe(
      ofType(mapDataActions.RenderMap),
      tap(action => {
        let links: Link[] = [];
        action.map.mapLinks.forEach(l => {
          let link: Link = new Link(l.source, l.target, l.name);
          link.mapLinkId = l.mapLinkId;
          links.push(link);
        });
        this.store.dispatch(mapDataActions.SetCurrentMapData({ mapId: action.map.graphMapId, mapName: action.map.name, modifiedBy: action.map.modifiedBy }));
        this.store.dispatch(graphDataActions.ResetAll());

        let nodes: Node[] = []
        action.map.mapNodes.map(n => {
          let node: Node = new Node(n.id);
          let missingLinks: Link[] = []
          Object.assign(node, n);
          this.rrmService.getCheckedResources([n.pidUri!]).subscribe(res => {
            if (res[0].links.length != n.links.length) {
              let linkIds: (string | null | undefined)[] = []
              n.links.forEach(l => linkIds.push(l.mapLinkInfoId))
              res[0].links.forEach(link => {
                if (!linkIds.includes(link.mapLinkInfoId)) {
                  let newLink: Link = new Link(link.startNode.value, link.endNode.value, link.type);
                  newLink.sourceName = link.startNode.name;
                  newLink.targetName = link.endNode.name;
                  newLink.mapLinkInfoId = link.mapLinkInfoId;
                  newLink.nameValuePairSourceId = link.startNode.nameValuePairId;
                  newLink.nameValuePairTargetId = link.endNode.nameValuePairId;
                  missingLinks.push(newLink)
                }
              })
            }

            let allLinks = n.links.map(l => {
              let newLink: Link = new Link(l.startNode.value, l.endNode.value, l.type);
              newLink.sourceName = l.startNode.name;
              newLink.targetName = l.endNode.name;
              newLink.mapLinkInfoId = l.mapLinkInfoId;
              newLink.nameValuePairSourceId = l.startNode.nameValuePairId;
              newLink.nameValuePairTargetId = l.endNode.nameValuePairId;
              return newLink;
            });

            missingLinks.forEach(l => allLinks.push(l))

            node = Object.assign({}, node, {
              links: allLinks
            });

            nodes = [...nodes, (JSON.parse(JSON.stringify(node)))]

            this.store.dispatch(graphDataActions.AddNodes({ nodes: [node] }))
            this.store.dispatch(graphDataActions.AddLinks({ links: allLinks }))
            this.store.dispatch(graphVisualisationActions.EndLoading());
          })
        })
      }),
      map(a => graphVisualisationActions.EndLoading())
    )
  )

  loadSecondMap$ = createEffect(() =>
    this.actions$.pipe(
      ofType(mapDataActions.LoadSecondMap),
      exhaustMap(action => {
        this.store.dispatch(graphVisualisationActions.StartLoading());
        return this.rrmService.getGraph(action.mapId).pipe(
          tap(
            (response: GraphMapDTO) => {
              this.store.dispatch(mapDataActions.RenderSecondMap({ map: response }))
            }
          ),
          map(
            response => graphVisualisationActions.EndLoading()
          )
        )
      })
    )
  );

  renderSecondMap$ = createEffect(() =>
    this.actions$.pipe(
      ofType(mapDataActions.RenderSecondMap),
      tap(action => {
        // find highest fy value so new map can be placed under current one
        let highFy: number = 0
        let currentMapId: string = ""
        this.mapsStore$.pipe(
          tap(
            maps => {
              currentMapId = maps.currentMap.graphMapId
            }
          )
        ).subscribe();

        this.rrmService.getGraph(currentMapId).pipe(
          tap(
            (response: GraphMapDTO) => {
              let nodeValues: number[] = []
              response.mapNodes.forEach(node => {
                nodeValues.push(node.fx!);
              })
              highFy = (Math.max(...nodeValues))
            })
        ).subscribe()

        // Create array of links to add
        let linkEditHistory: LinkEditHistory[] = [];
        this.linkingProperties$.pipe(
          tap(
            linking => {
              linkEditHistory = linking.linkEditHistory;
            }
          )).subscribe();

        let links: Link[] = [];

        action.map.mapLinks.forEach(l => {
          let foundHistory = linkEditHistory
            .find(lhist => lhist.source.uri === l.source && lhist.target.uri === l.target && lhist.linkType.name === l.name.name);
          if (!foundHistory) {
            let link: Link = new Link(l.source, l.target, l.name);
            link.mapLinkId = l.mapLinkId;
            links.push(link);
          }
        });

        // Create array of nodes to add
        let nodes: Node[] = []
        action.map.mapNodes.map(n => {
          let node: Node = new Node(n.id);
          Object.assign(node, n);
          node.links = n.links.map(l => {
            let newLink: Link = new Link(l.startNode.value, l.endNode.value, l.type);
            newLink.sourceName = l.startNode.name;
            newLink.targetName = l.endNode.name;
            newLink.mapLinkInfoId = l.mapLinkInfoId;
            newLink.nameValuePairSourceId = l.startNode.nameValuePairId;
            newLink.nameValuePairTargetId = l.endNode.nameValuePairId;
            return newLink;
          });
          node.fy! += highFy
          nodes.push(node);
        })

        this.store.dispatch(graphDataActions.AddNodes({ nodes: nodes }))
        this.store.dispatch(graphDataActions.AddLinks({ links: links }));
        this.store.dispatch(graphVisualisationActions.EndLoading());
      }),
      map(a => graphVisualisationActions.EndLoading())
    )
  )
}


