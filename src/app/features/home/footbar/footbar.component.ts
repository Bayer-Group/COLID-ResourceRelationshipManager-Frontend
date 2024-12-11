import { Component } from '@angular/core';
import { Select } from '@ngxs/store';
import { Observable } from 'rxjs';
import {
  GraphMapData,
  LoadOwnMaps,
  MapDataState,
  SetCurrentMap
} from 'src/app/state/map-data.state';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NotificationService } from 'src/app/shared/services/notification.service';
import { ConfirmationDialogComponent } from '../../../shared/components/confirmation-dialog/confirmation-dialog.component';
import { ResourceRelationshipManagerService } from '../../../shared/services/resource-relationship-manager.service';
import { Store } from '@ngxs/store';
import { ResetAll } from '../../../state/graph-data.state';
import {
  ResetLinkEditHistory,
  ResetLinking
} from '../../../state/graph-linking.state';
import { AuthService } from '../../../modules/authentication/services/auth.service';
import { take } from 'rxjs/operators';

@Component({
  selector: 'colid-footbar',
  templateUrl: './footbar.component.html',
  styleUrls: ['./footbar.component.scss']
})
export class FootbarComponent {
  @Select(MapDataState.getMapDataState) mapsStore$: Observable<GraphMapData>;
  isSuperAdmin$: Observable<boolean>;

  constructor(
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private notificationService: NotificationService,
    private resourceRelationshipManagerApiService: ResourceRelationshipManagerService,
    private store: Store,
    private auth: AuthService
  ) {
    this.isSuperAdmin$ = this.auth.hasSuperAdminPrivilege$;
  }

  deleteMap() {
    const currentMap = this.store.selectSnapshot(MapDataState.getCurrentMap);

    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: {
        header: 'Confirm deletion',
        body: `
            <p>Are you sure you want to delete the following map:</p>
            <b>${currentMap.name}</b>
            <br />
            <br />
            <p>Created by:</p>
            <b>${currentMap.modifiedBy}</b>
          `
      },
      width: 'auto',
      disableClose: true
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        const mapId = this.store.selectSnapshot(MapDataState.getCurrentMapId);
        this.isSuperAdmin$.pipe(take(1)).subscribe((isSuperAdmin) => {
          if (isSuperAdmin) {
            this.resourceRelationshipManagerApiService
              .deleteGraphMapAsSuperAdmin(mapId)
              .subscribe(
                (_) => {
                  this.mapDeletionHandler();
                },
                (_) => {
                  this.notificationService.notification$.next(
                    'Something went wrong while deleting the map'
                  );
                }
              );
          } else {
            this.resourceRelationshipManagerApiService
              .deleteGraphMap(mapId)
              .subscribe(
                (_) => {
                  this.mapDeletionHandler();
                },
                (err) => {
                  if (err.status == 403) {
                    this.notificationService.notification$.next(err.error);
                  } else {
                    this.notificationService.notification$.next(
                      'Something went wrong while deleting the map'
                    );
                  }
                }
              );
          }
        });
      }
    });
  }

  private mapDeletionHandler() {
    const userEmail = this.auth.currentUserEmailAddress;
    this.store.dispatch(new LoadOwnMaps(userEmail));
    this.initNewMap();
    this.snackBar.open('Map has been successfully deleted', 'Dismiss', {
      duration: 3000,
      panelClass: 'success-snackbar'
    });
  }

  private initNewMap() {
    this.store.dispatch(new SetCurrentMap(null));
    this.store.dispatch(new ResetAll());
    this.store.dispatch(new ResetLinking());
    this.store.dispatch(new ResetLinkEditHistory());
  }
}
