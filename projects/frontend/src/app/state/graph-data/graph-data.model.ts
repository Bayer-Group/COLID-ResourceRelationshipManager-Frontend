import { Link, Node } from "../../core/d3";

export interface GraphData {
    addNodes: Node[],
    addLinks: Link[],
    removeNodes: Node[],
    removeLinks: Link[]
    setNodes: Node[],
    setLinks: Link[],
    resetAll: boolean
}