import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { Link, Node } from '../core/d3';

export class SetGraphContent {
  static readonly type = '[GraphData] Set nodes and links in graph state';
  constructor(public nodes: Node[], public links: Link[]) {}
}

export class AddNodes {
  static readonly type = '[GraphData] Add nodes to the graph';
  constructor(public nodes: Node[]) {}
}

export class AddLinks {
  static readonly type = '[GraphData] Add links to the graph';
  constructor(public links: Link[]) {}
}

export class RemoveNodes {
  static readonly type = '[GraphData] Remove nodes from the graph';
  constructor(public nodes: Node[]) {}
}

export class RemoveLinks {
  static readonly type = '[GraphData] Remove links from the graph';
  constructor(public links: Link[]) {}
}

export class SetLinks {
  static readonly type = '[GraphData] Set links to the graph';
  constructor(public links: Link[]) {}
}

export class SetNodes {
  static readonly type = '[GraphData] Set nodes to the graph';
  constructor(public nodes: Node[]) {}
}

export class ResetAll {
  static readonly type = '[GraphData] Reset graph data';
}

export class ToggleSelection {
  static readonly type = '[GraphData] Select Node';
  constructor(public id: string) {}
}

export class ToggleExclusive {
  static readonly type = '[GraphData] Select Node exclusive';
  constructor(public id: string) {}
}

export class SelectNodes {
  static readonly type = '[GraphData] Select Nodes';
  constructor(public ids: string[]) {}
}

export interface GraphData {
  addNodes: Node[];
  addLinks: Link[];
  removeNodes: Node[];
  removeLinks: Link[];
  setNodes: Node[];
  setLinks: Link[];
  resetAll: boolean;
  toggle: string;
  toggleExclusive: string;
  selectNodes: string[];
}

@State<GraphData>({
  name: 'graphData',
  defaults: {
    addLinks: [],
    addNodes: [],
    removeLinks: [],
    removeNodes: [],
    setNodes: [],
    setLinks: [],
    resetAll: false,
    toggle: '',
    toggleExclusive: '',
    selectNodes: [],
  },
})
@Injectable()
export class GraphDataState {
  @Selector()
  public static getGraphDataState(state: GraphData) {
    return state;
  }

  @Selector()
  public static getSelectNodes(state: GraphData) {
    return state.selectNodes;
  }

  @Action(AddLinks)
  addLinks({ patchState }: StateContext<GraphData>, action: AddLinks) {
    patchState({
      addLinks: action.links,
      addNodes: [],
      removeLinks: [],
      removeNodes: [],
      setLinks: [],
      setNodes: [],
      resetAll: false,
      toggle: '',
      toggleExclusive: '',
      selectNodes: [],
    });
  }

  @Action(AddNodes)
  addNodes({ patchState }: StateContext<GraphData>, action: AddNodes) {
    patchState({
      addLinks: [],
      addNodes: action.nodes,
      removeLinks: [],
      removeNodes: [],
      setLinks: [],
      setNodes: [],
      resetAll: false,
      toggle: '',
      toggleExclusive: '',
      selectNodes: [],
    });
  }

  @Action(RemoveNodes)
  removeNodes({ patchState }: StateContext<GraphData>, action: RemoveNodes) {
    patchState({
      addLinks: [],
      addNodes: [],
      removeLinks: [],
      removeNodes: action.nodes,
      setNodes: [],
      setLinks: [],
      resetAll: false,
      toggle: '',
      toggleExclusive: '',
      selectNodes: [],
    });
  }

  @Action(RemoveLinks)
  removeLinks({ patchState }: StateContext<GraphData>, action: RemoveLinks) {
    patchState({
      addLinks: [],
      addNodes: [],
      removeLinks: action.links,
      removeNodes: [],
      setLinks: [],
      setNodes: [],
      resetAll: false,
      toggle: '',
      toggleExclusive: '',
      selectNodes: [],
    });
  }

  @Action(SetLinks)
  setLinks({ patchState }: StateContext<GraphData>, action: SetLinks) {
    patchState({
      addLinks: [],
      addNodes: [],
      removeLinks: [],
      removeNodes: [],
      setLinks: action.links,
      setNodes: [],
      resetAll: false,
      toggle: '',
      toggleExclusive: '',
      selectNodes: [],
    });
  }

  @Action(SetNodes)
  setNodes({ patchState }: StateContext<GraphData>, action: SetNodes) {
    patchState({
      addLinks: [],
      addNodes: [],
      removeLinks: [],
      removeNodes: [],
      setLinks: [],
      setNodes: action.nodes,
      resetAll: false,
      toggle: '',
      toggleExclusive: '',
      selectNodes: [],
    });
  }

  @Action(ResetAll)
  resetAll({ patchState }: StateContext<GraphData>) {
    patchState({
      addLinks: [],
      addNodes: [],
      removeLinks: [],
      removeNodes: [],
      setLinks: [],
      setNodes: [],
      resetAll: true,
      toggle: '',
      toggleExclusive: '',
      selectNodes: [],
    });
  }

  @Action(ToggleSelection)
  toggleSelection(
    { patchState }: StateContext<GraphData>,
    action: ToggleSelection
  ) {
    patchState({
      addLinks: [],
      addNodes: [],
      removeLinks: [],
      removeNodes: [],
      setLinks: [],
      setNodes: [],
      resetAll: false,
      toggle: action.id,
      toggleExclusive: '',
      selectNodes: [],
    });
  }

  @Action(ToggleExclusive)
  toggleExclusive(
    { patchState }: StateContext<GraphData>,
    action: ToggleExclusive
  ) {
    patchState({
      addLinks: [],
      addNodes: [],
      removeLinks: [],
      removeNodes: [],
      setLinks: [],
      setNodes: [],
      resetAll: false,
      toggle: '',
      toggleExclusive: action.id,
      selectNodes: [],
    });
  }

  @Action(SelectNodes)
  selectNodes({ patchState }: StateContext<GraphData>, action: SelectNodes) {
    patchState({
      addLinks: [],
      addNodes: [],
      removeLinks: [],
      removeNodes: [],
      setLinks: [],
      setNodes: [],
      resetAll: false,
      toggle: '',
      toggleExclusive: '',
      selectNodes: action.ids,
    });
  }
}
