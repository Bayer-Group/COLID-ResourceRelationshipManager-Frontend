import { Action, createReducer, on } from '@ngrx/store';
import { LinkEditHistory } from '../../shared/models/link-editing-history';
import * as graphLinkingActions from './graph-linking.actions';
import { defaultGraphLinking } from './graph-linking.default';
import { GraphLinkingData } from './graph-linking.model';

const _graphLinkingReducer = createReducer(
    defaultGraphLinking,
    on(
        graphLinkingActions.EnableLinkingMode,
        (state: GraphLinkingData) => ({
            ...state,
            linkingModeEnabled: true
        })
    ),
    on(
        graphLinkingActions.DisableLinkingMode,
        (state: GraphLinkingData) => ({
            ...state,
            linkingModeEnabled: false
        })
    ),
    on(
        graphLinkingActions.AddLinkableNode,
        (state: GraphLinkingData, { node }) => ({
            ...state,
            linkingModeEnabled: true,
            linkNodes: [...state.linkNodes, node]
        })
    ),
    on(
        graphLinkingActions.ResetLinking,
        (state: GraphLinkingData) => ({
            ...state,
            linkingModeEnabled: false,
            linkNodes: []
        })
    ),
    on(
        graphLinkingActions.AddToLinkEditHistory,
        (state: GraphLinkingData, { link, action }) => {
            //verify if this same item does not yet exist
            let duplicate: number = state.linkEditHistory.findIndex(hi =>
                hi.action == action
                && hi.linkType.value == link.linkType.value
                && hi.source.uri == link.source.uri
                && hi.target.uri == link.target.uri
            );

            //there is a duplicate, so do nothing
            if (duplicate > -1) {
                return state;
            }

            //check for a "manual undo"
            let undo: number = state.linkEditHistory.findIndex(hi =>
                hi.linkType.value == link.linkType.value
                && hi.source.uri == link.source.uri
                && hi.target.uri == link.target.uri
            );
            if (undo > -1) {
                if (action != state.linkEditHistory[undo].action) {
                    let history: LinkEditHistory[] = JSON.parse(JSON.stringify(state.linkEditHistory));
                    history.splice(undo, 1);
                    return {
                        ...state,
                        linkEditHistory: history
                    };
                }
            }
            return {
                ...state,
                linkEditHistory: [...state.linkEditHistory, { action: action, source: link.source, target: link.target, linkType: link.linkType }]
            };
        }
    ),
    on(
        graphLinkingActions.ResetLinkEditHistory,
        (state: GraphLinkingData) => ({
            ...state,
            linkEditHistory: []
        })
    ),
    on(
        graphLinkingActions.RemoveFromHistory,
        (state: GraphLinkingData, { item }) => {
            //find item to delete
            let cleanedItems: LinkEditHistory[] = JSON.parse(JSON.stringify(state.linkEditHistory));
            let ind: number = cleanedItems.findIndex(i =>
                i.action == item.action
                && i.linkType.value == item.linkType.value
                && i.source.uri == item.source.uri
                && i.target.uri == item.target.uri
            );
            if (ind > -1) {
                cleanedItems.splice(ind, 1);
            }
            return {
                ...state,
                linkEditHistory: cleanedItems
            };
        }
    )
);

export function graphLinkingReducer(
    state: GraphLinkingData = defaultGraphLinking,
    action: Action
): GraphLinkingData {
    return _graphLinkingReducer(state, action);
}