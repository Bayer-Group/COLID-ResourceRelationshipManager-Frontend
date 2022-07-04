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
  draggingActive: boolean
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
