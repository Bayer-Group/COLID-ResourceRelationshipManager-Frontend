import { ResourceLinkDto } from '../../../shared/models/resource-dto';
import { Link } from './link';

//TODO EUCAV: Delete this and replace with simpler logic
export class NodeSaveDto implements d3.SimulationNodeDatum {
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
  fx?: number | null;
  fy?: number | null;

  width?: number = 0;
  height?: number = 0;

  id: string;
  links: ResourceLinkDto[] = [];
  linkCount: number = 0;
  resourceIdentifier: string = "";
  shortName: string = "";
  name: string = "";
  status?: string = "";
  resourceType: string = "";
  mapNodeId: string | null = "";
  pidUri: string | null = "";

  constructor(id: any) {
    this.id = id;
  }
}

export class Node implements d3.SimulationNodeDatum {
  // optional - defining optional implementation properties - required for relevant typing assistance
  index?: number;
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
  fx?: number | null;
  fy?: number | null;

  width: number = 0;
  height: number = 0;

  id: string; //this should be PID URI
  links: Link[] = [];
  shortName: string = "";
  name: string = "";
  resourceType: any;

  selected: boolean = false;

  filterModeEnabled: boolean = false;
  filterOutTypes: string[] = ["https://pid.bayer.com/kos/19050/444586", "https://pid.bayer.com/kos/19050/444582"]

  constructor(id: any) {
    this.id = id;
  }

  get linkCount(): number {
    if (this.filterModeEnabled) {
      return this.links.filter(l => !l.display && !l.isRendered && !(this.filterOutTypes.includes(l.source.resourceTypeId) || this.filterOutTypes.includes(l.target.resourceTypeId))).length;
    } else {
      return this.links.filter(l => l.display && !l.isRendered).length;
    }
  }

  get resourceTypeId(): string {
    return this.resourceType.key;
  }

  get resourceTypeName(): string {
    return this.resourceType.value;
  }
}
