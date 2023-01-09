import { Injectable } from "@angular/core";
import { Action, Selector, State, StateContext, Store } from "@ngxs/store";
import { EMPTY } from "rxjs";
import { catchError, finalize, switchMap, tap } from "rxjs/operators";
import { Link, Node } from "../core/d3";
import { ResourceRelationshipManagerService } from "../core/http/resource-relationship-manager.service";
import { GraphMapInfo } from "../shared/models/graph-map-info";
import { GraphMapMetadata } from "../shared/models/graph-map-metadata";
import { GraphMapSearchDTO } from "../shared/models/graph-map-search-dto";
import { GraphMapV2 } from "../shared/models/graph-map-v2";
import { NotificationService } from "../shared/services/notification.service";
import { AddLinks, AddNodes, ResetAll, SetLinks, SetNodes } from "./graph-data.state";
import { GraphLinkingData, GraphLinkingDataState } from "./graph-linking.state";
import { EndLoading, StartLoading } from "./graph-visualisation.state";
import { StartSavingMap } from "./saving-trigger.state";
import { UserInfoState } from "./user-info.state";

export class LoadOwnMaps {
    static readonly type = '[Map Data] Load own user maps';
    constructor(public email: string) { }
}

export class StartLoadOwnMaps {
    static readonly type = '[Map Data] Start load own maps';
}

export class EndLoadOwnMaps {
    static readonly type = '[Map Data] End load own maps';
}

export class SetLoadingAllMapsState {
    static readonly type = '[Map Data] Set loading state';
    constructor(public loading: boolean) { }
}

export class StartSaving {
    static readonly type = '[Map Data] Start saving map';
    constructor(public saveAsNew: boolean) { }
}

export class SetOwnMaps {
    static readonly type = '[Map Data] Set own user maps';
    constructor(public maps: GraphMapInfo[]) { }
}

export class SetCurrentId {
    static readonly type = '[Map Data] Set current ID';
    constructor(public id: string) { }
}

export class SetCurrentName {
    static readonly type = '[Map Data] Set current map name';
    constructor(public name: string) { }
}

export class SetDescription {
    static readonly type = '[Map Data] Set current map description'
    constructor(public description: string) { }
}

export class SetCurrentModifiedBy {
    static readonly type = '[Map Data] Set current modifiedby user ID';
    constructor(public modifiedBy: string) { }
}

export class LoadAllMaps {
    static readonly type = '[Map Data] Load all maps';
}

export class LoadMapsNextBatch {
    static readonly type = '[Map Data] Load maps next batch';
    constructor(public offset: number) { }
}

export class SetAllMaps {
    static readonly type = '[Map Data] Set all maps';
    constructor(public maps: GraphMapInfo[]) { }
}

export class AppendNewMaps {
    static readonly type = '[Map Data] Append all maps';
    constructor(public maps: GraphMapInfo[]) { }
}

export class LoadMap {
    static readonly type = '[Map Data] Load map';
    constructor(public mapId: string) { }
}

export class SetCurrentMapData {
    static readonly type = '[Map Data] Set current map data';
    constructor(public mapId: string, public mapName: string, public mapDescription: string, public modifiedBy: string, public currentUser: string) { }
}

export class SetCurrentMapSearchParams {
    static readonly type = '[Map Data] Set current map search params';
    constructor(public searchData: GraphMapSearchDTO) { }
}

export class RenderMap {
    static readonly type = '[Map Data] Render map';
    constructor(public map: GraphMapV2) { }
}

export class RenderSecondMap {
    static readonly type = '[Map Data] Render second maps';
    constructor(public map: GraphMapV2, public oldMapId: string) { }
}

export class LoadSecondMap {
    static readonly type = '[Map Data] Load second map';
    constructor(public mapId: string) { }
}

export class SetIsOwner {
    static readonly type = '[Map Data] set is owner'
    constructor(public isOwner: boolean) { }
}

export interface GraphMapData {
    ownMaps: GraphMapInfo[];
    loadingOwnMaps: boolean;
    loadingAllMaps: boolean;
    currentMap: GraphMapMetadata;
    currentUser: string;
    allMaps: GraphMapInfo[];
    searchParams: GraphMapSearchDTO;
    isOwner: boolean;
}

@State<GraphMapData>({
    name: 'mapData',
    defaults: {
        ownMaps: [],
        loadingOwnMaps: false,
        loadingAllMaps: false,
        currentMap: {
            graphMapId: "",
            name: "",
            description: "",
            modifiedBy: ""
        },
        currentUser: "",
        allMaps: [],
        searchParams: {
            batchSize: 0,
            nameFilter: '',
            sortKey: '',
            sortType: ''
        },
        isOwner: false
    }
})
@Injectable()
export class MapDataState {

    constructor(
        private rrmService: ResourceRelationshipManagerService,
        private notificationService: NotificationService,
        private store: Store
    ) { }

    @Selector()
    public static getMapDataState(state: GraphMapData) {
        return state;
    }

    @Action(StartSaving)
    startSaving(ctx: StateContext<GraphMapData>, action: StartSaving) {
        ctx.dispatch(new StartSavingMap(action.saveAsNew))
    }

    @Action(SetOwnMaps)
    setOwnMaps({ patchState }: StateContext<GraphMapData>, action: SetOwnMaps) {
        patchState({
            ownMaps: action.maps
        });
    }

    @Action(SetCurrentId)
    setCurrentId({ getState, patchState }: StateContext<GraphMapData>, action: SetCurrentId) {
        const currMap = getState().currentMap;
        patchState({
            currentMap: {
                ...currMap,
                graphMapId: action.id
            }
        });
    }

    @Action(SetCurrentName)
    setCurrentName({ getState, patchState }: StateContext<GraphMapData>, action: SetCurrentName) {
        const currMap = getState().currentMap;
        patchState({
            currentMap: {
                ...currMap,
                name: action.name
            }
        });
    }

    @Action(SetDescription)
    setDescription({ getState, patchState }: StateContext<GraphMapData>, action: SetDescription) {
        const currMap = getState().currentMap;
        patchState({
            currentMap: {
                ...currMap,
                description: action.description
            }
        });
    }

    @Action(SetCurrentModifiedBy)
    setCurrentModifiedBy({ getState, patchState }: StateContext<GraphMapData>, action: SetCurrentModifiedBy) {
        const currMap = getState().currentMap;
        patchState({
            currentMap: {
                ...currMap,
                modifiedBy: action.modifiedBy
            }
        });
    }

    @Action(SetAllMaps)
    setAllMaps({ patchState }: StateContext<GraphMapData>, action: SetAllMaps) {
        patchState({
            allMaps: action.maps
        });
    }

    @Action(AppendNewMaps)
    appendNewMaps({ getState, patchState }: StateContext<GraphMapData>, action: AppendNewMaps) {
        const allMaps = getState().allMaps;
        patchState({
            allMaps: [...allMaps, ...action.maps]
        });
    }

    @Action(SetCurrentMapData)
    setCurrentMapData({ patchState }: StateContext<GraphMapData>, action: SetCurrentMapData) {
        const { mapId, mapName, mapDescription, modifiedBy, currentUser } = action
        patchState({
            currentMap: {
                graphMapId: mapId,
                name: mapName,
                description: mapDescription,
                modifiedBy: modifiedBy
            },
            isOwner: modifiedBy == currentUser
        });
    }

    @Action(StartLoadOwnMaps)
    startLoadOwnMaps({ patchState }: StateContext<GraphMapData>) {
        patchState({
            loadingOwnMaps: true
        });
    }

    @Action(EndLoadOwnMaps)
    endLoadOwnMaps({ patchState }: StateContext<GraphMapData>) {
        patchState({
            loadingOwnMaps: false
        });
    }

    @Action(SetLoadingAllMapsState)
    setLoadingAllMapsState({ patchState }: StateContext<GraphMapData>, action: SetLoadingAllMapsState) {
        patchState({
            loadingAllMaps: action.loading
        });
    }

    @Action(SetIsOwner)
    setIsOwner({ patchState }: StateContext<GraphMapData>, action: SetIsOwner) {
        patchState({
            isOwner: action.isOwner
        });
    }

    @Action(LoadOwnMaps)
    loadOwnMaps(ctx: StateContext<GraphMapData>, action: LoadOwnMaps) {
        ctx.patchState({
            currentUser: action.email
        });
        return this.rrmService.getGraphsForUser(action.email).pipe(
            switchMap(maps => ctx.dispatch(new SetOwnMaps(maps))),
            catchError(() => EMPTY)
        )
    }

    @Action(LoadAllMaps)
    loadAllMaps(ctx: StateContext<GraphMapData>) {
        ctx.dispatch(new SetLoadingAllMapsState(true));
        return this.rrmService.getGraphs().pipe(
            tap(response => ctx.dispatch(new SetAllMaps(response))),
            catchError(_ => {
                this.notificationService.notification$.next("Something went wrong while loading the maps");
                return EMPTY;
            }),
            finalize(() => ctx.dispatch(new SetLoadingAllMapsState(false)))
        )
    }

    @Action(LoadMapsNextBatch)
    loadMapsNextBatch(ctx: StateContext<GraphMapData>, action: LoadMapsNextBatch) {
        ctx.dispatch(new SetLoadingAllMapsState(true));
        const currentSearchParam: GraphMapSearchDTO = ctx.getState().searchParams;
        return this.rrmService.getGraphsPage(action.offset, currentSearchParam).pipe(
            tap(response => ctx.dispatch(new AppendNewMaps(response))),
            catchError(() => EMPTY),
            finalize(() => ctx.dispatch(new SetLoadingAllMapsState(false)))
        )
    }

    @Action(SetCurrentMapSearchParams)
    setCurrentMapSearchParams(ctx: StateContext<GraphMapData>, action: SetCurrentMapSearchParams) {
        ctx.patchState({
            searchParams: action.searchData
        });
        ctx.dispatch(new SetLoadingAllMapsState(true));
        return this.rrmService.getGraphsPage(0, action.searchData).pipe(
            tap(response => ctx.dispatch(new SetAllMaps(response))),
            catchError(() => EMPTY),
            finalize(() => ctx.dispatch(new SetLoadingAllMapsState(false)))
        );
    }

    @Action(LoadMap)
    loadMap(ctx: StateContext<GraphMapData>, action: LoadMap) {
        ctx.dispatch(new StartLoading());
        const userEmail = this.store.selectSnapshot(UserInfoState.getUserEmail);
        return this.rrmService.getGraphv2(action.mapId).pipe(
            tap(response => {
                const { id, name, description, modifiedBy } = response;
                ctx.dispatch(new SetCurrentMapData(id, name, description, modifiedBy, userEmail))
            }),
            switchMap(response => ctx.dispatch(new RenderMap(response))),
            catchError(() => {
                this.notificationService.notification$.next("Something went wrong while trying to load the map.");
                return EMPTY;
            }),
            finalize(() => new EndLoading())
        )
    }

    @Action(RenderMap)
    renderMap(ctx: StateContext<GraphMapData>, action: RenderMap) {
        const { id, name, description, modifiedBy } = action.map;
        const userEmail = this.store.selectSnapshot(UserInfoState.getUserEmail);
        ctx.dispatch(new ResetAll());
        ctx.dispatch(new SetCurrentMapData(id, name, description, modifiedBy, userEmail));

        if (!(typeof action.map.nodes === 'undefined')) {
            let links: Link[] = [];
            let nodes: Node[] = [];

            action.map.nodes.forEach(n => {
                var tmpNode = Object.assign(new Node(n.id), n);
                tmpNode.x = tmpNode.fx ? tmpNode.fx : 0;
                tmpNode.fx = undefined;
                tmpNode.y = tmpNode.fy ? tmpNode.fy : 0;
                tmpNode.fy = undefined;

                nodes.push(Object.assign(new Node(tmpNode.id), JSON.parse(JSON.stringify(n))));

                n.links.forEach(l => {
                    links.push(Object.assign(new Link, JSON.parse(JSON.stringify(l))));
                })
            });
            this.store.dispatch(new SetNodes(nodes));
            this.store.dispatch(new SetLinks(links));
            this.store.dispatch(new EndLoading());
        }
    }

    @Action(LoadSecondMap)
    loadSecondMap(ctx: StateContext<GraphMapData>, action: LoadSecondMap) {
        const currentState = ctx.getState();
        this.store.dispatch(new StartLoading());
        return this.rrmService.getGraphv2(action.mapId).pipe(
            tap(
                (response: GraphMapV2) => {
                    //TODO: pre-load table and column informatino using pid-api.service (to reduce the number of single requests being done)
                    this.store.dispatch(new RenderSecondMap(response, currentState.currentMap.graphMapId))
                }
            ),
            catchError(() => EMPTY),
            finalize(() => this.store.dispatch(new EndLoading()))
        )
    }

    @Action(RenderSecondMap)
    renderSecondMap(ctx: StateContext<GraphMapData>, action: RenderSecondMap) {
        const graphLinking = this.store.selectSnapshot(GraphLinkingDataState.getGraphLinkingState);
        // find highest fy value so new map can be placed under current one
        let highFy: number = 0
        if (action.oldMapId != "") {
            this.rrmService.getGraphv2(action.oldMapId).subscribe(
                (cm: GraphMapV2) => {
                    //find out max fx value
                    let posValues: number[] = [];
                    cm.nodes.forEach(n => {
                        posValues.push(n.fx!);
                    });
                    highFy = (Math.max(...posValues));

                    this.processSecondMap(JSON.parse(JSON.stringify(action.map)), highFy, graphLinking, this.store);
                }
            );
        } else {
            this.processSecondMap(JSON.parse(JSON.stringify(action.map)), highFy, graphLinking, this.store);
        }
        ctx.dispatch(new EndLoading());
    }

    processSecondMap = function (map: GraphMapV2, highFy: number = 0, graphLinking: GraphLinkingData, store: Store) {
        let links: Link[] = [];
        let nodes: Node[] = [];

        var tmpMap: GraphMapV2 = JSON.parse(JSON.stringify(map));

        tmpMap.nodes.forEach(mn => {

            nodes.push(Object.assign(new Node(mn.id), mn))
            mn.links.forEach(li => {
                let foundHistory = graphLinking.linkEditHistory.find(history =>
                    history.source.uri === li.source.id &&
                    history.target.uri === li.target.id &&
                    history.linkType.name === li.linkType);
                if (!foundHistory) {
                    let link: Link = new Link(li.source, li.target, li.linkType);
                    link.outbound = li.outbound;
                    link.isVersionLink = li.isVersionLink;
                    links.push(link);
                }
            });
            mn.fy! += highFy;
        });

        store.dispatch(new AddNodes(nodes))
        store.dispatch(new AddLinks(links));
        store.dispatch(new EndLoading());
    };
}