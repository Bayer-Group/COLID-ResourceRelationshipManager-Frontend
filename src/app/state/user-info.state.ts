import { Injectable } from '@angular/core';
import { UserInfoApiService } from '../shared/services/user-info.api.service';
import { State, StateContext, Action, Selector } from '@ngxs/store';
import { UserDto } from '../shared/models/dto/user-dto';
import { ConsumerGroupResultDto } from '../shared/models/dto/consumer-group-result-dto';
import { tap } from 'rxjs/operators';
import { ColidEntrySubscriptionDto } from '../shared/models/dto/colid-entry-subscription-dto';

export class FetchUser {
  static readonly type = '[User] Fetch User';
  constructor(public id: string) {}
}

export class AddColidEntrySubscription {
  static readonly type =
    '[ColidEntrySubscription] Add Colid Entry Subscription';
  constructor(public colidEntrySubscriptionDto: ColidEntrySubscriptionDto) {}
}

export class RemoveColidEntrySubscription {
  static readonly type =
    '[ColidEntrySubscription] Remove Colid Entry Subscription';
  constructor(public colidEntrySubscriptionDto: ColidEntrySubscriptionDto) {}
}

export class UserInfoStateModel {
  user: UserDto;
  consumerGroups: ConsumerGroupResultDto[];
}

@State<UserInfoStateModel>({
  name: 'UserInfo',
  defaults: {
    user: null,
    consumerGroups: null,
  },
})
@Injectable()
export class UserInfoState {
  constructor(private userInfoApiService: UserInfoApiService) {}

  @Selector()
  public static getColidEntrySubscriptions(state: UserInfoStateModel) {
    return state.user?.colidEntrySubscriptions;
  }

  @Selector()
  public static getConsumerGroups(state: UserInfoStateModel) {
    return state.consumerGroups;
  }

  @Action(FetchUser)
  fetchUser(
    { patchState }: StateContext<UserInfoStateModel>,
    { id }: FetchUser
  ) {
    return this.userInfoApiService.getUser(id).pipe(
      tap((res: UserDto) => {
        patchState({ user: res });
      })
    );
  }

  @Action(AddColidEntrySubscription)
  addColidEntrySubscription(
    { getState, patchState }: StateContext<UserInfoStateModel>,
    { colidEntrySubscriptionDto }: AddColidEntrySubscription
  ) {
    const user = getState().user;
    return this.userInfoApiService
      .addColidEntrySubscription(user.id, colidEntrySubscriptionDto)
      .pipe(
        tap((res: UserDto) => {
          patchState({ user: res });
        })
      );
  }

  @Action(RemoveColidEntrySubscription)
  removeColidEntrySubscription(
    { getState, patchState }: StateContext<UserInfoStateModel>,
    { colidEntrySubscriptionDto }: RemoveColidEntrySubscription
  ) {
    const user = getState().user;
    return this.userInfoApiService
      .removeColidEntrySubscription(user.id, colidEntrySubscriptionDto)
      .pipe(
        tap((res: UserDto) => {
          patchState({ user: res });
        })
      );
  }
}
