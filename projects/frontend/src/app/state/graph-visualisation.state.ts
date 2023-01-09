import { Injectable } from "@angular/core";
import { Action, Selector, State, StateContext } from "@ngxs/store";

export class SetDetailedResourceUri {
    static readonly type = '[Graph] Set PID Uri for detail view';
    constructor(public pidUri: string) { }
}

export class SetInitalGraph {
    static readonly type = '[Graph] Set inital w/h/viewbox';
    constructor(public width: number, public height: number, public viewBox: Viewbox) { }
}

export class ShowLongNames {
    static readonly type = '[Graph] Toggle show long names';
    constructor(public showLongNames: boolean) { }
}

export class ShowConnectionNames {
    static readonly type = '[Graph] Toggle show link names';
    constructor(public showConnectionNames: boolean) { }
}

export class ToggleDetailSidebar {
    static readonly type = '[UI] Toggle detail sidbar (hide/show)';
}

export class ShowDetailSidebar {
    static readonly type = '[UI] Show Detail Sidebar';
}

export class HideDetailSidebar {
    static readonly type = '[UI] Hide Detail Sidebar';
}

export class SetViewBox {
    static readonly type = '[Graph] Set view box based on movement';
    constructor(public movementX: number, public movementY: number) { }
}

export class CenterGraph {
    static readonly type = '[Graph] Reset viewbox to start';
}

export class UpdateZoomScale {
    static readonly type = '[Graph] Update zoom scale';
    constructor(public scale: number) { }
}

export class ZoomIn {
    static readonly type = '[Graph] Zoom in';
}

export class ZoomOut {
    static readonly type = '[Graph] Zoom out';
}

export class ResetTransform {
    static readonly type = '[Graph] Reset transform';
    constructor(public reset: boolean) { }
}

export class StartLoading {
    static readonly type = '[Graph] Loading of resources started';
}

export class EndLoading {
    static readonly type = '[Graph] Loading of resources ended';
}

export class ToggleFilterView {
    static readonly type = '[Graph] Toggle Filter view';
    constructor(public filterView: boolean) { }
}

export class SetFilter {
    static readonly type = '[Graph] set Filter';
    constructor(public pidUris: string[]) { }
}

export class ClearFilter {
    static readonly type = '[Graph] clear Filter';
}

export class ClearFilteredNodes {
    static readonly type = '[Graph] clear Filtered Nodes';
}

export class ToggleDragging {
    static readonly type = '[Graph] Toggle Dragging';
    constructor(public draggingActive: boolean) { }
}

export class ToggleCtrlPressed {
    static readonly type = '[Graph] Toggle ctrl';
}

export class SetCtrlPressed {
    static readonly type = '[Graph] Set ctrl';
    constructor(public ctrl: boolean) { }
}

export interface GraphProperties extends StateMeta {
    width: number;
    height: number;
    showLongNames: boolean;
    showConnectionNames: boolean;
    showDetailSidebar: boolean;
    zoomScale: number;
    resetTransform: boolean;
    viewBox: Viewbox;
    loadingResources: boolean;
    detailedResource: string;
    initialViewBox: Viewbox;
    filteredNodes: Array<{}>;
    schemaFilterUris: string[],
    filterViewEnabled: boolean,
    draggingActive: boolean,
    ctrlPressed: boolean
}

export type StateMeta = {
    loading?: boolean;
    error?: boolean;
};

export class Viewbox {
    x: number;
    y: number;
    width: number;
    height: number;

    constructor(x: number, y: number, width: number, height: number) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

    get text(): string {
        return '' + this.x + ' ' + this.y + ' ' + this.width + ' ' + this.height;
    }
}

@State({
    name: 'graphVisualisation',
    defaults: {
        width: 0,
        height: 0,
        showLongNames: true,
        showConnectionNames: true,
        showDetailSidebar: false,
        zoomScale: 1,
        resetTransform: false,
        detailedResource: "",
        loadingResources: false,
        viewBox: new Viewbox(0, 0, 0, 0),
        initialViewBox: new Viewbox(0, 0, 0, 0),
        filteredNodes: [],
        schemaFilterUris: [],
        filterViewEnabled: false,
        draggingActive: false,
        ctrlPressed: false
    }
})
@Injectable()
export class GraphVisualisationState {

    @Selector()
    public static getGraphVisualisationState(state: GraphProperties) {
        return state;
    }

    @Selector()
    public static getZoomDeepValue(state: GraphProperties) {
        return Math.round(state.zoomScale * 100)
    }

    @Action(SetInitalGraph)
    setInitialGraph({ patchState }: StateContext<GraphProperties>, action: SetInitalGraph) {
        const { width, height, viewBox } = action;
        patchState({
            width,
            height,
            viewBox,
            initialViewBox: viewBox,
            loading: false
        });
    }

    @Action(SetViewBox)
    setViewBox({ patchState, getState }: StateContext<GraphProperties>, action: SetViewBox) {
        const prevViewBox = getState().viewBox;
        const { movementX, movementY } = action;
        patchState({
            viewBox: new Viewbox(
                prevViewBox.x - movementX,
                prevViewBox.y - movementY,
                prevViewBox.width,
                prevViewBox.height
            )
        });
    }

    @Action(CenterGraph)
    centerGraph({ patchState, getState }: StateContext<GraphProperties>) {
        const initialViewBox = getState().initialViewBox;
        patchState({
            viewBox: initialViewBox
        });
    }

    @Action(ToggleDetailSidebar)
    toggleDetailsSidebar({ patchState, getState }: StateContext<GraphProperties>) {
        const currentToggle = getState().showDetailSidebar;
        patchState({
            showDetailSidebar: !currentToggle
        });
    }

    @Action(ShowDetailSidebar)
    showDetailsSidebar({ patchState }: StateContext<GraphProperties>) {
        patchState({
            showDetailSidebar: true
        });
    }

    @Action(HideDetailSidebar)
    hideDetailsSidebar({ patchState }: StateContext<GraphProperties>) {
        patchState({
            showDetailSidebar: false
        });
    }

    @Action(UpdateZoomScale)
    updateZoomScale({ patchState }: StateContext<GraphProperties>, { scale }) {
        patchState({
            zoomScale: scale
        });
    }

    @Action(ZoomOut)
    zoomOut({ patchState, getState }: StateContext<GraphProperties>) {
        const zoomScale = getState().zoomScale;
        patchState({
            zoomScale: zoomScale + 0.10 > 2 ? 2 : (Math.round((zoomScale + 0.10) * 10) / 10)
        })
    }

    @Action(ZoomIn)
    zoomIn({ patchState, getState }: StateContext<GraphProperties>) {
        const zoomScale = getState().zoomScale;
        patchState({
            zoomScale: zoomScale - 0.10 < 0.10 ? 0.10 : (Math.round((zoomScale - 0.10) * 10) / 10)
        })
    }

    @Action(ShowLongNames)
    showLongNames({ patchState }: StateContext<GraphProperties>, action: ShowLongNames) {
        patchState({
            showLongNames: action.showLongNames
        });
    }

    @Action(ShowConnectionNames)
    showConnectionNames({ patchState }: StateContext<GraphProperties>, action: ShowConnectionNames) {
        patchState({
            showConnectionNames: action.showConnectionNames
        });
    }

    @Action(SetDetailedResourceUri)
    setDetailedResourceUri({ patchState }: StateContext<GraphProperties>, { pidUri }) {
        patchState({
            detailedResource: pidUri
        });
    }

    @Action(StartLoading)
    startLoading({ patchState }: StateContext<GraphProperties>) {
        patchState({
            loadingResources: true
        });
    }

    @Action(EndLoading)
    endLoading({ patchState }: StateContext<GraphProperties>) {
        patchState({
            loadingResources: false
        });
    }

    @Action(ResetTransform)
    resetTransform({ patchState }: StateContext<GraphProperties>, action: ResetTransform) {
        patchState({
            resetTransform: action.reset
        });
    }

    @Action(ToggleFilterView)
    toggleFilterView({ patchState }: StateContext<GraphProperties>, action: ToggleFilterView) {
        patchState({
            filterViewEnabled: action.filterView
        });
    }

    @Action(SetFilter)
    setFilter({ patchState }: StateContext<GraphProperties>, action: SetFilter) {
        patchState({
            schemaFilterUris: action.pidUris
        });
    }

    @Action(ClearFilter)
    clearFilter({ patchState }: StateContext<GraphProperties>) {
        patchState({
            schemaFilterUris: []
        })
    }

    @Action(ClearFilteredNodes)
    clearFilteredNodes({ patchState }: StateContext<GraphProperties>) {
        patchState({
            filteredNodes: []
        });
    }

    @Action(ToggleDragging)
    toggleDragging({ patchState }: StateContext<GraphProperties>, action: ToggleDragging) {
        patchState({
            draggingActive: action.draggingActive
        });
    }

    @Action(ToggleCtrlPressed)
    toggleCtrlPressed({ patchState, getState }: StateContext<GraphProperties>) {
        const currToggle = getState().ctrlPressed;
        patchState({
            ctrlPressed: !currToggle
        });
    }

    @Action(SetCtrlPressed)
    setCtrlPressed({ patchState }: StateContext<GraphProperties>, action: SetCtrlPressed) {
        patchState({
            ctrlPressed: action.ctrl
        });
    }
}