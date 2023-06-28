import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { Select, Store } from '@ngxs/store';
import { Observable, Subscription } from 'rxjs';
import { AuthService } from '../../modules/authentication/services/auth.service';
import { ColidMatSnackBarService } from '../../shared/colid-mat-snack-bar/colid-mat-snack-bar.service';
import { FavoriteListMetadata } from '../../shared/models/favorites';
import { FavoritesState, FetchFavorites } from '../../state/favorites.state';
import { FavoritesService } from '../../shared/services/favorites.service';
import { CreateFavoriteListComponent } from '../create-favorite-list/create-favorite-list.component';

@Component({
  selector: 'colid-add-favorite-dialog',
  templateUrl: './add-favorite-dialog.component.html',
  styleUrls: ['./add-favorite-dialog.component.scss'],
})
export class AddFavoriteDialogComponent implements OnInit, OnDestroy {
  @Select(FavoritesState.getFavorites) favorites$: Observable<
    FavoriteListMetadata[]
  >;
  @Select(FavoritesState.getFavoriteUrisToListMapping)
  uriMappings$: Observable<{ [pidUri: string]: string[] }>;

  sub: Subscription = new Subscription();
  userId: string;
  favorites: FavoriteListMetadata[] = [];
  selectedFavoriteListIds: string[] = [];
  previousFavoriteListIds: string[] = [];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialog: MatDialog,
    private favoritesService: FavoritesService,
    private dialogRef: MatDialogRef<AddFavoriteDialogComponent>,
    private authService: AuthService,
    private snackBar: ColidMatSnackBarService,
    private store: Store
  ) {}

  ngOnInit(): void {
    this.sub.add(
      this.authService.currentUserId$.subscribe(
        (userId) => (this.userId = userId)
      )
    );
    this.sub.add(
      this.favorites$.subscribe((favorites) => {
        this.favorites = favorites;
      })
    );
    if (this.data.pidUri) {
      this.sub.add(
        this.uriMappings$.subscribe((m) => {
          if (m[this.data.pidUri] != null) {
            this.previousFavoriteListIds = m[this.data.pidUri];
          }
        })
      );
    }
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  checkboxChanged(event, id: string) {
    event.checked
      ? this.selectedFavoriteListIds.push(id)
      : (this.selectedFavoriteListIds = this.selectedFavoriteListIds.filter(
          (x) => x !== id
        ));
  }

  createFavoriteList() {
    this.dialog.open(CreateFavoriteListComponent);
  }

  addFavorite() {
    let favoriteListPayload: any[] = [];
    for (let i = 0; i < this.selectedFavoriteListIds.length; i++) {
      const favoriteListEntries = this.favorites.find(
        (fav) => fav.id === this.selectedFavoriteListIds[i]
      );
      if (
        favoriteListEntries.favoritesListEntries.every(
          (entry) => entry.pidUri !== this.data.pidUri
        )
      ) {
        favoriteListPayload.push({
          favoritesListId: this.selectedFavoriteListIds[i],
          pidUri: this.data.pidUri,
          personalNote: '',
        });
      }
    }

    if (favoriteListPayload.length === 0) {
      this.snackBar.info(
        'Favorites already added',
        'This resource has been already added to the selected favorite lists'
      );
      this.dialogRef.close;
      return;
    }

    this.favoritesService
      .addFavoriteEntries(this.userId, favoriteListPayload)
      .subscribe(() => {
        this.snackBar.success(
          'Favorite added',
          'This resource has been mark as favorite.'
        );
        this.store.dispatch(new FetchFavorites(this.userId));
        this.dialogRef.close;
      });
  }
}
