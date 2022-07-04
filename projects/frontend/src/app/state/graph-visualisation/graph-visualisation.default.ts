import { GraphProperties, Viewbox } from './graph-visualisation.model';

export const defaultGraph: GraphProperties = {
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
  draggingActive: false
};
