import { GraphMapDTO } from './graph-map';
import { MapNodeDTO } from './map-node';
export class Resource implements MapNodeDTO {
  id: string = '';
  resourceIdentifier: string = '';
  shortName: string = '';
  resourceType: string = '';
  fx: number = 0;
  fy: number = 0;
  pidUri: string = '';
  mapId: string = '';
  graphMap: GraphMapDTO = new GraphMapDTO();
  nodeStatus: number = 0;
  name: string = '';
  status: string = '';
  links: Array<string> = [];
}
