import { createAction, props } from "@ngrx/store";
import { Link, Node } from "../../core/d3";

export const SetGraphContent = createAction(
    '[GraphData] Set nodes and links in graph state',
    props<{ nodes: Node[], links: Link[] }>()
);

export const AddNodes = createAction(
    '[GraphData] Add nodes to the graph',
    props<{ nodes: Node[] }>()
);

export const AddLinks = createAction(
    '[GraphData] Add links to the graph',
    props<{ links: Link[] }>()
);

export const RemoveNodes = createAction(
    '[GraphData] Remove nodes from the graph',
    props<{ nodes: Node[] }>()
)

export const RemoveLinks = createAction(
    '[GraphData] Remove links from the graph',
    props<{ links: Link[] }>()
)

export const SetLinks = createAction(
    '[GraphData] Set links to the graph',
    props<{ links: Link[] }>()
)

export const SetNodes = createAction(
    '[GraphData] Set nodes to the graph',
    props<{ nodes: Node[] }>()
)

export const ResetAll = createAction(
    '[GraphData] Reset graph data'
)