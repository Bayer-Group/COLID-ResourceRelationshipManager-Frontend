import { Component, OnDestroy, OnInit } from '@angular/core';
import { Observable, of, Subscription } from 'rxjs';
import { Select, Store } from '@ngxs/store';
import { FetchMetadata, MetadataState } from './state/metadata.state';
import { ColidIconsService } from './shared/icons/services/colid-icons.service';
import { CustomMaterialIcon } from './shared/icons/models/custom-material-icon';
import { AuthService } from './modules/authentication/services/auth.service';
import { switchMap, tap } from 'rxjs/operators';
import { NotificationService } from './shared/services/notification.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { LoadOwnMaps } from './state/map-data.state';
import { FetchUser } from './state/user-info.state';
import { FetchFavorites } from './state/favorites.state';

@Component({
  selector: 'colid-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, OnDestroy {
  @Select(MetadataState.getMetadataTypes) metadataTypes$!: Observable<any>;
  masterSub: Subscription = new Subscription();
  constructor(
    private iconService: ColidIconsService,
    private store: Store,
    public authService: AuthService,
    private notificationService: NotificationService,
    private snackBar: MatSnackBar
  ) {
    this.masterSub.add(
      this.notificationService.notification$.subscribe((message) => {
        this.snackBar.open(message, 'Dismiss');
      })
    );
  }

  ngOnInit() {
    this.masterSub.add(
      this.authService.isLoggedIn$.subscribe((isAuth) => {
        if (isAuth) {
          this.store.dispatch(new FetchMetadata()).subscribe();
        }
      })
    );

    this.masterSub.add(
      this.authService.isLoggedIn$
        .pipe(
          switchMap((isAuth) => {
            return isAuth ? this.authService.currentIdentity$ : of(null);
          })
        )
        .pipe(
          tap((identity) => {
            if (identity) {
              this.store.dispatch([
                new FetchUser(identity.accountIdentifier),
                new FetchFavorites(identity.accountIdentifier),
              ]);
              console.log('Account identifier is', identity.accountIdentifier);
            }
          })
        )
        .subscribe()
    );

    this.masterSub.add(
      this.authService.currentEmail$
        .pipe(
          tap((r) => {
            if (r) {
              this.store.dispatch(new LoadOwnMaps(r));
            }
          })
        )
        .subscribe()
    );

    this.masterSub.add(
      this.metadataTypes$.subscribe((metadataTypes) => {
        if (metadataTypes) {
          var icons = metadataTypes.map(
            (metadataType: { id: any; name: any }) => {
              const key = metadataType.id;
              const url = metadataType.id;
              const toolTip = metadataType.name;
              return new CustomMaterialIcon(key, url, toolTip);
            }
          );
          this.iconService.registerColidIcons(icons);
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.masterSub.unsubscribe();
  }
}
