import { Node } from "../../core/d3";
import { LinkEditHistory } from "../../shared/models/link-editing-history";

export interface GraphLinkingData {
    linkingModeEnabled: boolean;
    linkNodes: Node[];
    linkEditHistory: LinkEditHistory[];
}