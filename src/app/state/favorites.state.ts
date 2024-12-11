import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { ColidMatSnackBarService } from '../shared/colid-mat-snack-bar/colid-mat-snack-bar.service';
import { FavoritesService } from '../shared/services/favorites.service';
import { FavoriteListMetadata } from '../shared/models/favorites';
import { tap } from 'rxjs/operators';

export class FetchFavorites {
  static readonly type = '[Favorite] Fetch favorites';
  constructor(public userId: string) {}
}

export class FavoritesStateModel {
  favorites: FavoriteListMetadata[];
}

@State<FavoritesStateModel>({
  name: 'Favorites',
  defaults: {
    favorites: []
  }
})
@Injectable()
export class FavoritesState {
  constructor(
    private favoritesApiService: FavoritesService,
    private snackbar: ColidMatSnackBarService
  ) {}

  @Selector()
  public static getFavorites(state: FavoritesStateModel) {
    return state.favorites;
  }

  @Selector()
  public static getFavoriteUrisToListMapping(state: FavoritesStateModel): {
    [pidUri: string]: string[];
  } {
    let mapping: { [pidUri: string]: string[] } = {};
    var uris = this.getUriList(state.favorites);
    uris.forEach((u) => {
      mapping[u] = state.favorites
        .filter(
          (f) => f.favoritesListEntries.findIndex((e) => e.pidUri == u) > -1
        )
        .map((f) => f.id);
    });

    return mapping;
  }

  @Selector()
  public static getFavoriteUriList(state: FavoritesStateModel): string[] {
    return this.getUriList(state.favorites);
  }

  private static getUriList(listMetadata: FavoriteListMetadata[]): string[] {
    let uris: string[] = [];
    listMetadata.forEach((f) => {
      f.favoritesListEntries.forEach((e) => {
        uris.push(e.pidUri);
      });
    });
    return [...new Set(uris)]; //remove duplicates
  }

  @Action(FetchFavorites)
  fetchFavorites(
    { patchState }: StateContext<FavoritesStateModel>,
    action: FetchFavorites
  ) {
    return this.favoritesApiService.getFavorites(action.userId).pipe(
      tap((res: FavoriteListMetadata[]) => {
        patchState({ favorites: res });
      })
    );
  }
}
