import { Action, createReducer, on } from "@ngrx/store";
import { defaultMapData } from "./map-data.default";
import * as mapDataActions from "./map-data.actions";
import { GraphMapData } from "./map-data.model";
import { allMaps } from "../../core/http/fixtures/maps-fixture";

const _mapDataReducer = createReducer(
  defaultMapData,
  on(
    mapDataActions.LoadOwnMaps,
    (state: GraphMapData, { email }) => ({
      ...state,
      currentUser: email
    })
  ),
  on(
    mapDataActions.SetOwnMaps,
    (state: GraphMapData, { maps }) => ({
      ...state,
      ownMaps: maps
    })
  ),
  on(
    mapDataActions.SetCurrentId,
    (state: GraphMapData, { id }) => ({
      ...state,
      currentMap: {
        ...state.currentMap,
        graphMapId: id
      }
    })
  ),
  on(
    mapDataActions.SetCurrentName,
    (state: GraphMapData, { name }) => ({
      ...state,
      currentMap: {
        ...state.currentMap,
        name: name
      }
    })
  ),
  on(
    mapDataActions.SetCurrentModifiedBy,
    (state: GraphMapData, { modifiedBy }) => ({
      ...state,
      currentMap: {
        ...state.currentMap,
        modifiedBy: modifiedBy
      }
    })
  ),
  on(
    mapDataActions.SetAllMaps,
    (state: GraphMapData, { maps }) => ({
      ...state,
      allMaps: maps
    })
  ),
  on(
    mapDataActions.AppendNewMaps,
    (state: GraphMapData, { maps }) => ({
      ...state,
      allMaps: [...state.allMaps, ...maps]
    })
  ),
  on(
    mapDataActions.SetCurrentMapData,
    (state: GraphMapData, { mapId, mapName, modifiedBy }) => ({
      ...state,
      currentMap: {
        graphMapId: mapId,
        name: mapName,
        modifiedBy: modifiedBy
      }
    })
  ),
  on(
    mapDataActions.SetCurrentMapSearchParams,
    (state: GraphMapData, { searchData }) => ({
      ...state,
      searchParams: searchData
    })
  ),
  on(
    mapDataActions.StartLoadOwnMaps,
    (state: GraphMapData) => ({
      ...state,
      loadingOwnMaps: true
    })
  ),
  on(
    mapDataActions.EndLoadOwnMaps,
    (state: GraphMapData) => ({
      ...state,
      loadingOwnMaps: false
    })
  ),
  on(
    mapDataActions.SetLoadingAllMapsState,
    (state: GraphMapData, { loading }) => ({
      ...state,
      loadingAllMaps: loading
    })
  ),
  on(
    mapDataActions.setIsOwner,
    (state: GraphMapData, { isOwner }) => ({
      ...state,
      isOwner: isOwner
    })
  )
);

export function mapDataReducer(
  state: GraphMapData = defaultMapData,
  action: Action
): GraphMapData {
  return _mapDataReducer(state, action);
}
