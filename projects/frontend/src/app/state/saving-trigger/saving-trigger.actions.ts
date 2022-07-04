import { createAction, props } from "@ngrx/store";

export const StartSavingMap = createAction(
    '[Saving] Start saving map',
    props<{ asNew: boolean }>()
);

export const EndSavingMap = createAction(
    '[Saving] Finalize saving map'
)

export const SetSaveAsNew = createAction(
    '[Saving] Save new map',
    props<{ asNew: boolean }>()
)