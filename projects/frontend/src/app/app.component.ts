import { Component, OnInit } from '@angular/core';
import { identity, Observable, of } from 'rxjs';
import { Select, Store } from '@ngxs/store';
import { Store as ngrxStore } from '@ngrx/store';
import { FetchMetadata, MetadataState } from './state/metadata.state';
import { ColidIconsService } from './shared/icons/services/colid-icons.service';
import { CustomMaterialIcon } from './shared/icons/models/custom-material-icon';
import { AuthService } from './modules/authentication/services/auth.service';
import { switchMap, tap } from 'rxjs/operators';
import * as mapDataActions from '../app/state/map-data/map-data.actions';
import { GraphState } from './state/store-items';
import { NotificationService } from './shared/services/notification.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MetadataService } from './core/metadata.service';
import { Constants } from './shared/constants';

@Component({
  selector: 'colid-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  @Select(MetadataState.getMetadataTypes) metadataTypes$!: Observable<any>;
  constructor(
    private iconService: ColidIconsService,
    private store: Store,
    private storeApp: ngrxStore<GraphState>,
    public authService: AuthService,
    private metadataService: MetadataService,
    private notificationService: NotificationService, private snackBar: MatSnackBar) {
    this.notificationService.notification$.subscribe(message => {
      this.snackBar.open(message, "Dismiss");
    })
  }

  ngOnInit() {
    this.authService.isLoggedIn$.subscribe(isAuth => {
      if (isAuth) {
        this.store.dispatch(new FetchMetadata).subscribe();
      }
    });

    this.authService.isLoggedIn$.pipe(switchMap(isAuth => {
      return isAuth ? this.authService.currentIdentity$ : of(null)
    }));
    this.authService.currentEmail$.pipe(
      tap(
        r => {
          if (r) {
            this.storeApp.dispatch(mapDataActions.LoadOwnMaps({ email: r }));
          }
        }
      )
    ).subscribe();

    this.metadataTypes$.subscribe(metadataTypes => {
      if (metadataTypes) {
        var icons = metadataTypes.map((metadataType: { id: any; name: any; }) => {
          const key = metadataType.id;
          const url = metadataType.id;
          const toolTip = metadataType.name;
          return new CustomMaterialIcon(key, url, toolTip);
        });
        this.iconService.registerColidIcons(icons);
      }
    });
  }
}
