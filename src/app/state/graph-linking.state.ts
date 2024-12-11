import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { Node } from '../core/d3';
import {
  LinkEditHistory,
  LinkHistoryAction
} from '../shared/models/link-editing-history';
import { LinkTypeContainer } from '../shared/models/link-types-dto';

export class EnableLinkingMode {
  static readonly type = '[Linking] Enable the graph linking mode';
}

export class DisableLinkingMode {
  static readonly type = '[Linking] Disable the graph linking mode';
}

export class AddLinkableNode {
  static readonly type = '[Linking] Add node to be linked';
  constructor(public node: Node) {}
}

export class ResetLinking {
  static readonly type = '[Linking] Reset linking mode';
}

export class AddToLinkEditHistory {
  static readonly type = '[Linking] Add to link edit history';
  constructor(
    public link: LinkTypeContainer,
    public action: LinkHistoryAction
  ) {}
}

export class ResetLinkEditHistory {
  static readonly type = '[Linking] Reset link edit history';
}

export class RemoveFromHistory {
  static readonly type = '[Linking] Remove from history';
  constructor(public item: LinkEditHistory) {}
}

export class ClearHistory {
  static readonly type = '[Linking] Clear history';
}

export interface GraphLinkingData {
  linkingModeEnabled: boolean;
  linkNodes: Node[];
  linkEditHistory: LinkEditHistory[];
}

export type DistributionData1 = {
  distributionData: any[];
  nested?: any;
};

@State({
  name: 'graphLinking',
  defaults: {
    linkNodes: [],
    linkingModeEnabled: false,
    linkEditHistory: []
  }
})
@Injectable()
export class GraphLinkingDataState {
  @Selector()
  public static getGraphLinkingState(state: GraphLinkingData) {
    return state;
  }

  @Action(EnableLinkingMode)
  enableLinkingMode({ patchState }: StateContext<GraphLinkingData>) {
    patchState({
      linkingModeEnabled: true
    });
  }

  @Action(DisableLinkingMode)
  disableLinkingMode({ patchState }: StateContext<GraphLinkingData>) {
    patchState({
      linkingModeEnabled: false
    });
  }

  @Action(AddLinkableNode)
  addLinkableNode(
    { patchState, getState }: StateContext<GraphLinkingData>,
    action: AddLinkableNode
  ) {
    const linkNodes = getState().linkNodes;
    patchState({
      linkingModeEnabled: true,
      linkNodes: [...linkNodes, action.node]
    });
  }

  @Action(ResetLinking)
  resetLinking({ patchState }: StateContext<GraphLinkingData>) {
    patchState({
      linkingModeEnabled: false,
      linkNodes: []
    });
  }

  @Action(AddToLinkEditHistory)
  addToLinkHistory(
    { patchState, getState }: StateContext<GraphLinkingData>,
    { action, link }: AddToLinkEditHistory
  ) {
    const linkEditHistory = getState().linkEditHistory;
    //verify if this same item does not yet exist
    let duplicate: number = linkEditHistory.findIndex(
      (hi) =>
        hi.action == action &&
        hi.linkType.value == link.linkType.value &&
        hi.source.uri == link.source.uri &&
        hi.target.uri == link.target.uri
    );

    //there is a duplicate, so do nothing
    if (duplicate > -1) {
      return;
    }

    patchState({
      linkEditHistory: [
        ...linkEditHistory,
        {
          action,
          source: link.source,
          target: link.target,
          linkType: link.linkType
        }
      ]
    });
  }

  @Action(ResetLinkEditHistory)
  resetLinkEditHistory({ patchState }: StateContext<GraphLinkingData>) {
    patchState({
      linkEditHistory: []
    });
  }

  @Action(RemoveFromHistory)
  removeFromHistory(
    { patchState, getState }: StateContext<GraphLinkingData>,
    { item }: RemoveFromHistory
  ) {
    //find item to delete
    const linkEditHistory = getState().linkEditHistory;
    let cleanedItems: LinkEditHistory[] = JSON.parse(
      JSON.stringify(linkEditHistory)
    );
    let ind: number = cleanedItems.findIndex(
      (i) =>
        i.action == item.action &&
        i.linkType.value == item.linkType.value &&
        i.source.uri == item.source.uri &&
        i.target.uri == item.target.uri
    );
    if (ind > -1) {
      cleanedItems.splice(ind, 1);
    }

    patchState({
      linkEditHistory: cleanedItems
    });
  }

  @Action(ClearHistory)
  clearHistory({ patchState }: StateContext<GraphLinkingData>) {
    patchState({
      linkEditHistory: []
    });
  }
}
