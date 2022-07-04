import { Action, createReducer, on } from '@ngrx/store';
import { defaultGraph } from './graph-visualisation.default';
import { GraphProperties, Viewbox } from './graph-visualisation.model';
import * as graphActions from './graph-visualisation.actions';

const _graphVisualisationReducer = createReducer(
  defaultGraph,
  on(
    graphActions.SetInitalGraph,
    (state: GraphProperties, { width, height, viewBox }) => ({
      ...state,
      width,
      height,
      viewBox,
      initialViewBox: viewBox,
      loading: false
    })
  ),

  on(graphActions.SetViewBox, (state: GraphProperties, { movementX, movementY }) => ({
    ...state,
    viewBox: new Viewbox(
      state.viewBox.x - movementX,
      state.viewBox.y - movementY,
      state.viewBox.width,
      state.viewBox.height
    )
  })),

  on(graphActions.CenterGraph, (state: GraphProperties) => ({
    ...state,
    viewBox: state.initialViewBox
  })),

  on(graphActions.ToggleDetailSidebar, (state: GraphProperties) => ({
    ...state,
    showDetailSidebar: !state.showDetailSidebar
  })),
  on(graphActions.ShowDetailSidebar, (state: GraphProperties) => ({
    ...state,
    showDetailSidebar: true
  })),
  on(graphActions.HideDetailSidebar, (state: GraphProperties) => ({
    ...state,
    showDetailSidebar: false
  })),
  on(graphActions.UpdateZoomScale, (state: GraphProperties, { scale }) => ({
    ...state,
    zoomScale: scale
  })),
  on(graphActions.ZoomOut, (state: GraphProperties) => ({
    ...state,
    zoomScale: state.zoomScale + 0.10 > 2 ? 2 : (Math.round((state.zoomScale + 0.10) * 10) / 10)
  })),
  on(graphActions.ZoomIn, (state: GraphProperties) => ({
    ...state,
    zoomScale: state.zoomScale - 0.10 < 0.10 ? 0.10 : (Math.round((state.zoomScale - 0.10) * 10) / 10)
  })),

  on(graphActions.ShowLongNames, (state: GraphProperties, { showLongNames }) => ({
    ...state,
    showLongNames: showLongNames
  })),

  on(graphActions.ShowConnectionNames, (state: GraphProperties, { showConnectionNames }) => ({
    ...state,
    showConnectionNames: showConnectionNames
  })),
  on(graphActions.SetDetailedResourceUri, (state: GraphProperties, { pidUri }) => ({
    ...state,
    detailedResource: pidUri
  })),
  on(graphActions.StartLoading, (state: GraphProperties) => ({
    ...state,
    loadingResources: true
  })),
  on(graphActions.EndLoading, (state: GraphProperties) => ({
    ...state,
    loadingResources: false
  })),
  on(graphActions.ResetTransform, (state: GraphProperties, { reset }) => ({
    ...state,
    resetTransform: reset
  })),
  on(graphActions.toggleFilterView, (state: GraphProperties, { filterView }) => ({
    ...state,
    filterViewEnabled: filterView
  })),
  on(graphActions.setFilter, (state: GraphProperties, { pidUris }) => ({
    ...state,
    schemaFilterUris: pidUris
  })),
  on(graphActions.clearFilter, (state: GraphProperties) => ({
    ...state,
    schemaFilterUris: []
  })),
  on(graphActions.addFilteredNode, (state: GraphProperties, { nodeFilterInfo }) => ({
    ...state,
    filteredNodes: [...state.filteredNodes, nodeFilterInfo]
  })),
  on(graphActions.clearFilteredNodes, (state: GraphProperties) => ({
    ...state,
    filteredNodes: []
  })),
  on(graphActions.toggleDragging, (state: GraphProperties, { draggingActive }) => ({
    ...state,
    draggingActive: draggingActive
  })),

);

export function graphVisualisationReducer(
  state: GraphProperties = defaultGraph,
  action: Action
): GraphProperties {
  return _graphVisualisationReducer(state, action);
}
