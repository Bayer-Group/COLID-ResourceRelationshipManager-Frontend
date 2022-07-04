import { GraphMapData } from "./map-data.model";

export const defaultMapData: GraphMapData = {
  ownMaps: [],
  loadingOwnMaps: false,
  loadingAllMaps: false,
  currentMap: {
    graphMapId: "",
    name: "",
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
