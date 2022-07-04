import { GraphMapInfo } from "../../shared/models/graph-map-info";
import { GraphMapMetadata } from "../../shared/models/graph-map-metadata";
import { GraphMapSearchDTO } from "../../shared/models/graph-map-search-dto";

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
