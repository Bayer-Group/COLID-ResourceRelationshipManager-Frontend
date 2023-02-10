import { Link, NodeSaveDto } from '../../core/d3';
import { GraphMapMetadata } from './graph-map-metadata';

export class GraphMapDTO extends GraphMapMetadata {
  mapNodes: NodeSaveDto[] = [];
  mapLinks: Link[] = [];
}
