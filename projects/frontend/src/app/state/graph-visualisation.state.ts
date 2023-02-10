import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';

export class SetDetailedResourceUri {
  static readonly type = '[Graph] Set PID Uri for detail view';
  constructor(public pidUri: string) {}
}

export class ShowLongNames {
  static readonly type = '[Graph] Toggle show long names';
  constructor(public showLongNames: boolean) {}
}

export class ShowConnectionNames {
  static readonly type = '[Graph] Toggle show link names';
  constructor(public showConnectionNames: boolean) {}
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

export class UpdateZoomScale {
  static readonly type = '[Graph] Update zoom scale';
  constructor(public scale: number) {}
}

export class ZoomIn {
  static readonly type = '[Graph] Zoom in';
}

export class ZoomOut {
  static readonly type = '[Graph] Zoom out';
}

export class ResetTransform {
  static readonly type = '[Graph] Reset transform';
  constructor(public reset: boolean) {}
}

export class StartLoading {
  static readonly type = '[Graph] Loading of resources started';
}

export class EndLoading {
  static readonly type = '[Graph] Loading of resources ended';
}

export class ToggleFilterView {
  static readonly type = '[Graph] Toggle Filter view';
  constructor(public filterView: boolean) {}
}

export class SetFilter {
  static readonly type = '[Graph] set Filter';
  constructor(public pidUris: string[]) {}
}

export class ClearFilter {
  static readonly type = '[Graph] clear Filter';
}

export class ClearFilteredNodes {
  static readonly type = '[Graph] clear Filtered Nodes';
}

export class ToggleDragging {
  static readonly type = '[Graph] Toggle Dragging';
  constructor(public draggingActive: boolean) {}
}

export class ToggleCtrlPressed {
  static readonly type = '[Graph] Toggle ctrl';
}

export class SetCtrlPressed {
  static readonly type = '[Graph] Set ctrl';
  constructor(public ctrl: boolean) {}
}

export class SetMultiSelectedPidUris {
  static readonly type = '[Graph] Set multiselected PID URIs';
  constructor(public selectedPidUris: string[]) {}
}

export class UpdateMultiSelectedPidUris {
  static readonly type = '[Graph] Update multiselected PID URIs';
  constructor(public selectedPidUris: string[]) {}
}

export class ResetMultiSelectedPidUris {
  static readonly type = '[Graph] Reset multiselected PID URIs';
}

export interface GraphProperties extends StateMeta {
  showLongNames: boolean;
  showConnectionNames: boolean;
  showDetailSidebar: boolean;
  zoomScale: number;
  resetTransform: boolean;
  loadingResources: boolean;
  detailedResource: string;
  filteredNodes: Array<{}>;
  multiSelectedPidUris: Array<string>;
  schemaFilterUris: string[];
  filterViewEnabled: boolean;
  draggingActive: boolean;
  ctrlPressed: boolean;
}

export type StateMeta = {
  loading?: boolean;
  error?: boolean;
};

@State({
  name: 'graphVisualisation',
  defaults: {
    showLongNames: true,
    showConnectionNames: true,
    showDetailSidebar: false,
    zoomScale: 1,
    resetTransform: false,
    detailedResource: '',
    loadingResources: false,
    filteredNodes: [],
    schemaFilterUris: [],
    multiSelectedPidUris: [],
    filterViewEnabled: false,
    draggingActive: false,
    ctrlPressed: false,
  },
})
@Injectable()
export class GraphVisualisationState {
  @Selector()
  public static getGraphVisualisationState(state: GraphProperties) {
    return state;
  }

  @Selector()
  public static getZoomDeepValue(state: GraphProperties) {
    return Math.round(state.zoomScale * 100);
  }

  @Selector()
  public static getSelectedPidUri(state: GraphProperties) {
    return state.detailedResource;
  }

  @Selector()
  public static getSidebarState(state: GraphProperties) {
    return state.showDetailSidebar;
  }

  @Selector()
  public static getLoadingResourcesStatus(state: GraphProperties) {
    return state.loadingResources;
  }

  @Selector()
  public static getMultiSelectedPidUris(state: GraphProperties) {
    return state.multiSelectedPidUris;
  }

  @Action(ToggleDetailSidebar)
  toggleDetailsSidebar({
    patchState,
    getState,
  }: StateContext<GraphProperties>) {
    const currentToggle = getState().showDetailSidebar;
    patchState({
      showDetailSidebar: !currentToggle,
    });
  }

  @Action(ShowDetailSidebar)
  showDetailsSidebar({ patchState }: StateContext<GraphProperties>) {
    patchState({
      showDetailSidebar: true,
    });
  }

  @Action(HideDetailSidebar)
  hideDetailsSidebar({ patchState }: StateContext<GraphProperties>) {
    patchState({
      showDetailSidebar: false,
    });
  }

  @Action(UpdateZoomScale)
  updateZoomScale({ patchState }: StateContext<GraphProperties>, { scale }) {
    patchState({
      zoomScale: scale,
    });
  }

  @Action(ZoomOut)
  zoomOut({ patchState, getState }: StateContext<GraphProperties>) {
    const zoomScale = getState().zoomScale;
    patchState({
      zoomScale:
        zoomScale + 0.1 > 2 ? 2 : Math.round((zoomScale + 0.1) * 10) / 10,
    });
  }

  @Action(ZoomIn)
  zoomIn({ patchState, getState }: StateContext<GraphProperties>) {
    const zoomScale = getState().zoomScale;
    patchState({
      zoomScale:
        zoomScale - 0.1 < 0.1 ? 0.1 : Math.round((zoomScale - 0.1) * 10) / 10,
    });
  }

  @Action(ShowLongNames)
  showLongNames(
    { patchState }: StateContext<GraphProperties>,
    action: ShowLongNames
  ) {
    patchState({
      showLongNames: action.showLongNames,
    });
  }

  @Action(ShowConnectionNames)
  showConnectionNames(
    { patchState }: StateContext<GraphProperties>,
    action: ShowConnectionNames
  ) {
    patchState({
      showConnectionNames: action.showConnectionNames,
    });
  }

  @Action(SetDetailedResourceUri)
  setDetailedResourceUri(
    { patchState }: StateContext<GraphProperties>,
    { pidUri }
  ) {
    patchState({
      detailedResource: pidUri,
    });
  }

  @Action(StartLoading)
  startLoading({ patchState }: StateContext<GraphProperties>) {
    patchState({
      loadingResources: true,
    });
  }

  @Action(EndLoading)
  endLoading({ patchState }: StateContext<GraphProperties>) {
    patchState({
      loadingResources: false,
    });
  }

  @Action(ResetTransform)
  resetTransform(
    { patchState }: StateContext<GraphProperties>,
    action: ResetTransform
  ) {
    patchState({
      resetTransform: action.reset,
    });
  }

  @Action(ToggleFilterView)
  toggleFilterView(
    { patchState }: StateContext<GraphProperties>,
    action: ToggleFilterView
  ) {
    patchState({
      filterViewEnabled: action.filterView,
    });
  }

  @Action(SetFilter)
  setFilter({ patchState }: StateContext<GraphProperties>, action: SetFilter) {
    patchState({
      schemaFilterUris: action.pidUris,
    });
  }

  @Action(ClearFilter)
  clearFilter({ patchState }: StateContext<GraphProperties>) {
    patchState({
      schemaFilterUris: [],
    });
  }

  @Action(ClearFilteredNodes)
  clearFilteredNodes({ patchState }: StateContext<GraphProperties>) {
    patchState({
      filteredNodes: [],
    });
  }

  @Action(ToggleDragging)
  toggleDragging(
    { patchState }: StateContext<GraphProperties>,
    action: ToggleDragging
  ) {
    patchState({
      draggingActive: action.draggingActive,
    });
  }

  @Action(ToggleCtrlPressed)
  toggleCtrlPressed({ patchState, getState }: StateContext<GraphProperties>) {
    const currToggle = getState().ctrlPressed;
    patchState({
      ctrlPressed: !currToggle,
    });
  }

  @Action(SetCtrlPressed)
  setCtrlPressed(
    { patchState }: StateContext<GraphProperties>,
    action: SetCtrlPressed
  ) {
    patchState({
      ctrlPressed: action.ctrl,
    });
  }

  @Action(SetMultiSelectedPidUris)
  setMultiSelectedPidUris(
    { patchState }: StateContext<GraphProperties>,
    action: SetMultiSelectedPidUris
  ) {
    patchState({
      multiSelectedPidUris: [...action.selectedPidUris],
    });
  }

  @Action(UpdateMultiSelectedPidUris)
  updateMultiSelectedPidUris(
    { patchState, getState }: StateContext<GraphProperties>,
    action: SetMultiSelectedPidUris
  ) {
    const selectedPidUris: Set<string> = new Set(
      getState().multiSelectedPidUris
    );
    action.selectedPidUris.forEach((pidUri) => selectedPidUris.add(pidUri));
    patchState({
      multiSelectedPidUris: [...selectedPidUris],
    });
  }

  @Action(ResetMultiSelectedPidUris)
  resetMultiSelectedPidUris({ patchState }: StateContext<GraphProperties>) {
    patchState({
      multiSelectedPidUris: [],
    });
  }
}
