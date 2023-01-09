import { Injectable } from "@angular/core";
import { Action, Selector, State, StateContext } from "@ngxs/store";

export class StartSavingMap {
    static readonly type = '[Saving] Start saving map';
    constructor(public asNew: boolean) { }
}

export class EndSavingMap {
    static readonly type = '[Saving] Finalize saving map';
}

export class SetSaveAsNew {
    static readonly type = '[Saving] Save new map';
    constructor(public asNew: boolean) { }
}

export interface SavingTrigger {
    savingMap: boolean;
    saveMapAsNew: boolean;
}

@State({
    name: 'SavingTriggerState',
    defaults: {
        savingMap: false,
        saveMapAsNew: false
    }
})
@Injectable()
export class SavingTriggerState {

    @Selector()
    public static getSavingTriggerState(state: SavingTrigger) {
        return state;
    }

    @Action(StartSavingMap)
    startSavingMap({ patchState }: StateContext<SavingTrigger>) {
        patchState({
            savingMap: true
        });
    }

    @Action(EndSavingMap)
    endSavingMap({ patchState }: StateContext<SavingTrigger>) {
        patchState({
            savingMap: false
        });
    }

    @Action(SetSaveAsNew)
    setSaveAsNew({ patchState }: StateContext<SavingTrigger>, action: SetSaveAsNew) {
        patchState({
            saveMapAsNew: action.asNew
        });
    }
}