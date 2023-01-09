import { Selector, State, StateContext, Action, Store } from '@ngxs/store';
import { tap, catchError } from 'rxjs/operators';
import { UserDto } from '../shared/user-dto';
import { of } from 'rxjs';
import { ColidEntrySubscriptionDto } from '../shared/colid-entry-subscription-dto';
import { UserInfoApiService } from '../shared/user-info.api.service';
import { Injectable } from '@angular/core';

export class FetchUser {
    static readonly type = '[User] Fetch User';
    constructor(public id: string, public emailAddress: string) { }
}

export class ReloadUser {
    static readonly type = '[User] Reload User';
    constructor() { }
}

export class UserInfoStateModel {
    user: UserDto;
}

@State<UserInfoStateModel>({
    name: 'UserInfo',
    defaults: {
        user: null
    }
})
@Injectable()
export class UserInfoState {
    constructor(private store: Store, private userInfoApiService: UserInfoApiService) { }

    @Selector()
    public static getUserEmail(state: UserInfoStateModel) {
        return state.user.emailAddress;
    }

    @Selector()
    public static getMessageConfig(state: UserInfoStateModel) {
        return state.user.messageConfig;
    }

    @Selector()
    public static getUserSearchFilters(state: UserInfoStateModel) {
        if (state.user.searchFiltersDataMarketplace != null) {
            return state.user.searchFiltersDataMarketplace;
        }

        return null;
    }
    @Action(FetchUser)
    fetchUser({ patchState }: StateContext<UserInfoStateModel>, { id, emailAddress }: FetchUser) {
        return this.userInfoApiService.getUser(id)
            .pipe(
                tap((res: UserDto) => {
                    patchState({
                        user: res
                    });
                }),
                catchError(err => {
                    if (err.status === 404) {
                        return this.userInfoApiService.createUser(id, emailAddress).pipe(tap((res: UserDto) => {
                            patchState({
                                user: res
                            });
                        }))
                    }
                    return of(null);
                })
            );
    }

    @Action(ReloadUser)
    reloadUser(ctx: StateContext<UserInfoStateModel>, action: ReloadUser) {
        const user = ctx.getState().user;
        ctx.dispatch(new FetchUser(user.id, user.emailAddress)).subscribe();
    }
}
