import { UriName } from '../../../shared/models/link-types-dto';
import { ItemDescriptor } from '../../../shared/models/resource-descriptor-mini';
import { Node } from './';

export class Link implements d3.SimulationLinkDatum<Node> {
  // optional - defining optional implementation properties - required for relevant typing assistance
  index?: number;
  mapLinkId: string | null = null;
  mapLinkInfoId?: string | null = null;

  // must - defining enforced implementation properties
  source!: Node;
  target!: Node;
  name!: UriName;
  id!: string;
  d: string = "";
  isVersionLink: boolean = false;
  isRendered: boolean = false;
  sourceName: string = "";
  display: boolean = true;

  nameValuePairSourceId?: string | null = null;
  nameValuePairTargetId?: string | null = null;
  targetName: string = "";
  startPoint: { x: number, y: number } = { x: 0, y: 0 };
  endPoint: { x: number, y: number } = { x: 0, y: 0 };

  constructor(source?: any, target?: any, linkName: UriName = new UriName()) {
    this.source = source;
    this.target = target;
    this.name = linkName;
    this.id = source + target;
  }
}

/**
 * class used for saving maps
 */
export class LinkDto implements d3.SimulationLinkDatum<Node> {
  // optional - defining optional implementation properties - required for relevant typing assistance
  index?: number;
  mapLinkId: string | null = null;

  // must - defining enforced implementation properties
  source!: string;
  target!: string;
  name!: UriName;
  id!: string;
  d?: string = "";
  startPoint?: { x: number, y: number } = { x: 0, y: 0 };
  endPoint?: { x: number, y: number } = { x: 0, y: 0 };

  constructor(source?: any, target?: any, linkName: UriName = new UriName()) {
    this.source = source;
    this.target = target;
    this.name = linkName;
    this.id = source + target;
  }
}
