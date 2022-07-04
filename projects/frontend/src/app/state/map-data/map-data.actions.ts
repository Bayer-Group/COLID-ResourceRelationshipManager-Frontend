import { createAction, props } from "@ngrx/store";
import { GraphMapDTO } from "../../shared/models/graph-map";
import { GraphMapInfo } from "../../shared/models/graph-map-info";
import { GraphMapSearchDTO } from "../../shared/models/graph-map-search-dto";
import { UriName } from "../../shared/models/link-types-dto";

export const LoadOwnMaps = createAction(
  '[Map Data] Load own user maps',
  props<{ email: string }>()
);

export const StartLoadOwnMaps = createAction(
  '[Map Data] Start load own maps'
);

export const EndLoadOwnMaps = createAction(
  '[Map Data] End load own maps'
);

export const SetLoadingAllMapsState = createAction(
  '[Map Data] Set loading state',
  props<{ loading: boolean }>()
);

export const StartSaving = createAction(
  '[Map Data] Start saving map',
  props<{ saveAsNew: boolean }>()
);

export const SetOwnMaps = createAction(
  '[Map Data] Set own user maps',
  props<{ maps: GraphMapInfo[] }>()
);

export const SetCurrentId = createAction(
  '[Map Data] Set current ID',
  props<{ id: string }>()
);

export const SetCurrentName = createAction(
  '[Map Data] Set current map name',
  props<{ name: string }>()
);

export const SetCurrentModifiedBy = createAction(
  '[Map Data] Set current modifiedby user ID',
  props<{ modifiedBy: string }>()
);

export const LoadAllMaps = createAction(
  '[Map Data] Load all maps'
)

export const LoadMapsNextBatch = createAction(
  '[Map Data] Load maps next batch',
  props<{ offset: number }>()
)

export const SetAllMaps = createAction(
  '[Map Data] Set all maps',
  props<{ maps: GraphMapInfo[] }>()
)

export const AppendNewMaps = createAction(
  '[Map Data] Append all maps',
  props<{ maps: GraphMapInfo[] }>()
)

export const LoadMap = createAction(
  '[Map Data] Load map',
  props<{ mapId: string }>()
)

export const SetCurrentMapData = createAction(
  '[Map Data] Set current map data',
  props<{ mapId: string, mapName: string, modifiedBy: string }>()
)

export const SetCurrentMapSearchParams = createAction(
  '[Map Data] Set current map search params',
  props<{ searchData: GraphMapSearchDTO }>()
)

export const RenderMap = createAction(
  '[Map Data] Render map',
  props<{ map: GraphMapDTO }>()
)

export const RenderSecondMap = createAction(
  '[Map Data] Render second maps',
  props<{ map: GraphMapDTO }>()
)

export const LoadSecondMap = createAction(
  '[Map Data] Load second map',
  props<{ mapId: string }>()
)

export const setIsOwner = createAction(
  '[Map Data] set is owner',
  props<{ isOwner: boolean }>()
)
