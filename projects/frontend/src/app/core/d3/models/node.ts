import APP_CONFIG from '../../../app.config';
import { ResourceLinkDto } from '../../../shared/models/resource-dto';
import { Link } from './link';

export class NodeSaveDto implements d3.SimulationNodeDatum {
  index?: number;
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

  id: string;
  links: Link[] = [];
  linkCount: number = 0;
  resourceIdentifier: string = "";
  shortName: string = "";
  name: string = "";
  status: string = "";
  resourceType: string = "";
  mapNodeId: string | null = "";
  pidUri: string | null = "";
  selected: boolean = false;

  constructor(id: any) {
    this.id = id;
  }

  normal = () => {
    return Math.sqrt(this.linkCount / APP_CONFIG.N);
  }

  get r() {
    return 50 * this.normal() + 10;
  }

  get fontSize() {
    return (30 * this.normal() + 10) + 'px';
  }

  get color() {
    let index = Math.floor(APP_CONFIG.SPECTRUM.length * this.normal());
    return APP_CONFIG.SPECTRUM[index];
  }

  set color(rectColor: string) {
    this.color = rectColor;
  }
}
