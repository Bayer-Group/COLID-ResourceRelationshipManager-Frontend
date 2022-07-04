
import { createAction, props } from "@ngrx/store";
import { Link, Node } from "../../core/d3";
import { LinkEditHistory, LinkHistoryAction } from "../../shared/models/link-editing-history";
import { LinkTypeContainer } from "../../shared/models/link-types-dto";
import { ItemDescriptor } from "../../shared/models/resource-descriptor-mini";

export const EnableLinkingMode = createAction(
    '[Linking] Enable the graph linking mode'
);

export const DisableLinkingMode = createAction(
    '[Linking] Disable the graph linking mode'
);

export const AddLinkableNode = createAction(
    '[Linking] Add node to be linked',
    props<{ node: Node }>()
);

export const ResetLinking = createAction(
    '[Linking] Reset linking mode'
);

export const AddToLinkEditHistory = createAction(
    '[Linking] Add to link edit history',
    props<{ link: LinkTypeContainer, action: LinkHistoryAction }>()
);

export const ResetLinkEditHistory = createAction(
    '[Linking] Reset link edit history'
);

export const RemoveFromHistory = createAction(
    '[Linking] Remove from history',
    props<{ item: LinkEditHistory }>()
)