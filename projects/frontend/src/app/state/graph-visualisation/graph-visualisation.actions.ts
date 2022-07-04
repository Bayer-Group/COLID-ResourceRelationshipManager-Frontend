import { createAction, props } from '@ngrx/store';
import { Viewbox } from './graph-visualisation.model';

export const SetDetailedResourceUri = createAction(
  '[Graph] Set PID Uri for detail view',
  props<{ pidUri: string }>()
);

export const SetInitalGraph = createAction(
  '[Graph] Set inital w/h/viewbox',
  props<{ width: number; height: number; viewBox: Viewbox }>()
);

export const ShowLongNames = createAction(
  '[Graph] Toggle show long names',
  props<{ showLongNames: boolean }>()
);

export const ShowConnectionNames = createAction(
  '[Graph] Toggle show link names',
  props<{ showConnectionNames: boolean }>()
);

export const ToggleDetailSidebar = createAction(
  '[UI] Toggle detail sidbar (hide/show)'
);

export const ShowDetailSidebar = createAction(
  '[UI] Show Detail Sidebar'
);

export const HideDetailSidebar = createAction(
  '[UI] Hide Detail Sidebar'
);

export const SetViewBox = createAction(
  '[Graph] Set view box based on movement',
  props<{ movementX: number; movementY: number }>()
);

export const CenterGraph = createAction('[Graph] Reset viewbox to start');

export const UpdateZoomScale = createAction(
  '[Graph] Update zoom scale',
  props<{ scale: number }>()
);

export const ZoomIn = createAction(
  '[Graph] Zoom in'
);
export const ZoomOut = createAction(
  '[Graph] Zoom out'
);

export const ResetTransform = createAction(
  '[Graph] Reset transform',
  props<{ reset: boolean }>()
);

export const StartLoading = createAction(
  '[Graph] Loading of resources started'
);

export const EndLoading = createAction(
  '[Graph] Loading of resources ended'
);

export const toggleFilterView = createAction(
  '[Graph] Toggle Filter view',
  props<{ filterView: boolean }>()
);

export const setFilter = createAction(
  '[Graph] set Filter',
  props<{ pidUris: Array<string> }>()
);

export const clearFilter = createAction(
  '[Graph] clear Filter'
);

export const addFilteredNode = createAction(
  '[Graph] set Filtered Nodes',
  props<{ nodeFilterInfo: {} }>()
);

export const clearFilteredNodes = createAction(
  '[Graph] clear Filtered Nodes'
);

export const toggleDragging = createAction(
  '[Graph] Toggle Dragging',
  props<{ draggingActive: boolean }>()
);
