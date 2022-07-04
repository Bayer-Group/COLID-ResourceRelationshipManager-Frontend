import { Action, createReducer, on } from "@ngrx/store";
import { defaultGraphData } from "./graph-data.default";
import * as graphDataActions from './graph-data.actions';
import { GraphData } from "./graph-data.model";

const _graphDataReducer = createReducer(
    defaultGraphData,
    on(
        graphDataActions.AddLinks,
        (state: GraphData, { links }) => ({
            ...state,
            addLinks: links,
            addNodes: [],
            removeLinks: [],
            removeNodes: [],
            setLinks: [],
            setNodes: [],
            resetAll: false
        })
    ),
    on(
        graphDataActions.AddNodes,
        (state: GraphData, { nodes }) => ({
            ...state,
            addLinks: [],
            addNodes: nodes,
            removeLinks: [],
            removeNodes: [],
            setLinks: [],
            setNodes: [],
            resetAll: false
        })
    ),
    on(
        graphDataActions.RemoveNodes,
        (state: GraphData, { nodes }) => ({
            ...state,
            addLinks: [],
            addNodes: [],
            removeLinks: [],
            removeNodes: nodes,
            setNodes: [],
            setLinks: [],
            resetAll: false
        })
    ),
    on(
        graphDataActions.RemoveLinks,
        (state: GraphData, { links }) => ({
            ...state,
            addLinks: [],
            addNodes: [],
            removeLinks: links,
            removeNodes: [],
            setLinks: [],
            setNodes: [],
            resetAll: false
        })
    ),
    on(
        graphDataActions.SetLinks,
        (state: GraphData, { links }) => ({
            ...state,
            addLinks: [],
            addNodes: [],
            removeLinks: [],
            removeNodes: [],
            setLinks: links,
            setNodes: [],
            resetAll: false
        })
    ),
    on(
        graphDataActions.SetNodes,
        (state: GraphData, { nodes }) => ({
            ...state,
            addLinks: [],
            addNodes: [],
            removeLinks: [],
            removeNodes: [],
            setLinks: [],
            setNodes: nodes,
            resetAll: false
        })
    ),
    on(
        graphDataActions.ResetAll,
        (state: GraphData) => ({
            ...state,
            addLinks: [],
            addNodes: [],
            removeLinks: [],
            removeNodes: [],
            setLinks: [],
            setNodes: [],
            resetAll: true
        })
    )
)

export function graphDataReducer(
    state: GraphData = defaultGraphData,
    action: Action
): GraphData {
    return _graphDataReducer(state, action);
}