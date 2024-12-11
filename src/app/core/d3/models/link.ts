import { Node } from './';

export class Link implements d3.SimulationLinkDatum<Node> {
  // optional - defining optional implementation properties - required for relevant typing assistance
  index?: number;
  mapLinkId: string | null = null;
  mapLinkInfoId?: string | null = null;
  // must - defining enforced implementation properties
  source!: Node;
  target!: Node;
  linkType: any;
  id!: string;
  d: string = '';
  isVersionLink: boolean = false;
  outbound: boolean = false;

  sourceName: string = '';
  targetName: string = '';

  sourceType: string = '';
  targetType: string = '';

  isRendered: boolean = false; //indicator whether the link is currently being rendered or not
  display: boolean = true; // indicator whether a link could theoretically be displayed or not, e.g. if it is filtered out

  startPoint: { x: number; y: number } = { x: 0, y: 0 };
  endPoint: { x: number; y: number } = { x: 0, y: 0 };
  linkOffset: number = 0;

  constructor(source?: any, target?: any, linkType?: any) {
    this.source = source;
    this.target = target;
    this.linkType = linkType;
    this.id = source + target;
  }

  get linkTypeId(): string {
    return this.linkType.key;
  }
  get linkTypeName(): string {
    return this.linkType.value;
  }
}
