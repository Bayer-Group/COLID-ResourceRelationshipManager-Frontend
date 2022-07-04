import { Action, createReducer, on } from "@ngrx/store";
import * as savingTriggerActions from "./saving-trigger.actions";
import { defaultSavingTriggerData } from "./saving-trigger.default";
import { SavingTrigger } from "./saving-trigger.model";

const _savingTriggerReducer = createReducer(
    defaultSavingTriggerData,
    on(
        savingTriggerActions.StartSavingMap,
        (state: SavingTrigger) => ({
            ...state,
            savingMap: true
        })
    ),
    on(
        savingTriggerActions.EndSavingMap,
        (state: SavingTrigger) => ({
            ...state,
            savingMap: false
        })
    ),
    on(
        savingTriggerActions.SetSaveAsNew,
        (state: SavingTrigger, { asNew }) => ({
            ...state,
            saveMapAsNew: asNew
        })
    )
);

export function savingTriggerReducer(
    state: SavingTrigger = defaultSavingTriggerData,
    action: Action
): SavingTrigger {
    return _savingTriggerReducer(state, action);
}