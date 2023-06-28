import { LinkDto } from '../../../shared/models/link-dto';
import { ResourceLinkDto } from '../../../shared/models/resource-dto';
import { Constants } from '../../../shared/constants';

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
  resourceIdentifier: string = '';
  shortName: string = '';
  name: string = '';
  status?: string = '';
  resourceType: string = '';
  mapNodeId: string | null = '';
  pidUri: string | null = '';

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
  links: LinkDto[] = [];
  shortName: string = '';
  name: string = '';
  laterVersion: string = '';
  resourceType: any;

  selected: boolean = false;

  filterOutTypes: string[] = [
    Constants.ResourceTypes.Table,
    Constants.ResourceTypes.Column,
  ];

  constructor(id: any) {
    this.id = id;
  }

  get linkCount(): number {
    return this.links.filter((l) => l.display && !l.isRendered).length;
  }

  get resourceTypeId(): string {
    return this.resourceType.key;
  }

  get resourceTypeName(): string {
    return this.resourceType.value;
  }
}
