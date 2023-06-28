import { Component, OnDestroy, OnInit } from '@angular/core';
import { ResourceRelationshipManagerService } from '../../../http/resource-relationship-manager.service';
import { take, tap } from 'rxjs/operators';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { SaveMapDialogComponent } from '../save-map-dialog/save-map-dialog.component';
import { Observable, Subscription } from 'rxjs';
import { GraphMapMetadata } from 'src/app/shared/models/graph-map-metadata';
import { LinkEditHistory } from 'src/app/shared/models/link-editing-history';
import { SaveConfirmationDialogComponent } from '../save-confirmation-dialog/save-confirmation-dialog.component';
import { MapsBrowserComponent } from '../maps-browser/maps-browser.component';
import { GraphMapInfo } from 'src/app/shared/models/graph-map-info';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NotificationService } from 'src/app/shared/services/notification.service';
import { ConfirmationDialogComponent } from 'src/app/shared/components/confirmation-dialog/confirmation-dialog.component';
import { Select, Store } from '@ngxs/store';
import {
  GraphMapData,
  LoadMap,
  LoadOwnMaps,
  MapDataState,
  SetIsOwner,
  SetCurrentMap,
} from 'src/app/state/map-data.state';
import { ResetAll } from 'src/app/state/graph-data.state';
import {
  GraphLinkingData,
  GraphLinkingDataState,
  RemoveFromHistory,
  ResetLinkEditHistory,
  ResetLinking,
} from 'src/app/state/graph-linking.state';
import {
  SetSaveAsNew,
  StartSavingMap,
} from 'src/app/state/saving-trigger.state';
import { AuthService } from 'src/app/modules/authentication/services/auth.service';
import { HideDetailSidebar } from 'src/app/state/graph-visualisation.state';
declare const saveSvgAsPng: any;

@Component({
  selector: 'colid-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
})
export class MapComponent implements OnInit, OnDestroy {
  maps: GraphMapInfo[] = [];
  loadingOwnMaps: boolean = true;
  currentMap: GraphMapMetadata | null = null;
  linkEditHistory: LinkEditHistory[] = [];
  @Select(MapDataState.getMapDataState) mapsStore$: Observable<GraphMapData>;
  @Select(GraphLinkingDataState.getGraphLinkingState)
  graphLinking$: Observable<GraphLinkingData>;
  @Select(MapDataState.getIsOwner) userIsMapOwner$: Observable<boolean>;
  isSuperAdmin$: Observable<boolean>;
  userIsOwner: boolean = false;
  masterSub: Subscription = new Subscription();

  constructor(
    private store: Store,
    private resourceRelationshipManagerApiService: ResourceRelationshipManagerService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private notificationService: NotificationService,
    private auth: AuthService
  ) {
    this.isSuperAdmin$ = auth.hasSuperAdminPrivilege$;
  }

  /**
   * Initialize the component and listen for data changes of data required for the menu actions
   */
  ngOnInit() {
    //react to changes regarding the map in the store and write them into the local var
    this.masterSub.add(
      this.mapsStore$
        .pipe(
          tap((maps) => {
            this.maps = maps.ownMaps;
            this.currentMap = maps.currentMap;
            this.loadingOwnMaps = maps.loadingOwnMaps;
            this.userIsOwner = maps.isOwner;
          })
        )
        .subscribe()
    );

    //always store the links which are not persisted yet locally
    this.masterSub.add(
      this.graphLinking$
        .pipe(
          tap((gl) => {
            this.linkEditHistory = gl.linkEditHistory;
          })
        )
        .subscribe()
    );
  }

  ngOnDestroy(): void {
    this.masterSub.unsubscribe();
  }

  /**
   * empty the current map and start a new one
   */
  initNewMap() {
    this.store.dispatch(new SetCurrentMap(null));
    this.store.dispatch(new ResetAll());
    this.store.dispatch(new ResetLinking());
    this.store.dispatch(new ResetLinkEditHistory());
  }

  /**
   * empty the current map and load the selected map
   * @param map ID of the map to load
   */
  loadMap(map: string) {
    this.store.dispatch(new LoadMap(map));
    this.store.dispatch(new HideDetailSidebar());
    if (this.maps.some((maps) => maps.id === map)) {
      this.store.dispatch(new SetIsOwner(true));
    } else {
      this.store.dispatch(new SetIsOwner(false));
    }
  }

  /**
   * Exports the current map viewport as png
   */
  exportPng() {
    saveSvgAsPng(
      document.getElementById('graphSvgElement'),
      'resource-map.png'
    );
  }

  /**
   * Handle saving workflow
   */
  saveAs() {
    this.openSaveAsDialog();
  }

  private saveMap(mapName: string, mapDescription: string, isNewMap: boolean) {
    if (mapName != null && mapName != '') {
      this.store.dispatch(
        new SetCurrentMap(<GraphMapMetadata>{
          graphMapId: this.currentMap?.graphMapId ?? null,
          name: mapName,
          description: mapDescription,
          modifiedBy: null,
        })
      );
      this.store.dispatch(new SetSaveAsNew(isNewMap));
      this.store.dispatch(new StartSavingMap(isNewMap));
    } else {
      //save As
      this.openSaveAsDialog();
    }
  }
  save() {
    //before saving, make sure that all link edits are persisted
    if (this.linkEditHistory.length > 0) {
      let confirmDialogRef: MatDialogRef<SaveConfirmationDialogComponent> =
        this.dialog.open(SaveConfirmationDialogComponent, {
          width: '40vw',
          disableClose: true,
        });

      confirmDialogRef.afterClosed().subscribe((result: string) => {
        //Revert all changes if the user clicked on "revert"
        if (result == 'discard') {
          let linkEditHistorySnapshot: LinkEditHistory[] = JSON.parse(
            JSON.stringify(this.linkEditHistory)
          );

          //undo all unpersisted links
          linkEditHistorySnapshot.forEach((le) => {
            this.store.dispatch(new RemoveFromHistory(le));
          });

          this.openNamingDialog();
        }
      });
    } else {
      //save existing map with popup after clicking save button.
      this.openNamingDialog();
    }
  }

  /**
   * opens the dialog where a user can enter a name and finalize map saving
   */
  openNamingDialog() {
    //open dialog to confirm saving
    let dialogRef: MatDialogRef<SaveMapDialogComponent> = this.dialog.open(
      SaveMapDialogComponent,
      {
        width: '40vw',
        height: 'auto',
        disableClose: true,
        data: {
          name: this.currentMap?.name,
          description: this.currentMap?.description,
          id: this.currentMap?.graphMapId,
        },
      }
    );

    dialogRef
      .afterClosed()
      .subscribe(
        (result: { name: string; description: string; saveAsNew: boolean }) => {
          if (result) {
            this.saveMap(result.name, result.description, result.saveAsNew);
          }
        }
      );
  }

  /**
   * opens the SaveAs dialog where a user can Create New map saving
   * PID1744
   */
  openSaveAsDialog() {
    //open dialog to confirm saving
    let dialogRef: MatDialogRef<SaveMapDialogComponent> = this.dialog.open(
      SaveMapDialogComponent,
      {
        width: '40vw',
        height: 'auto',
        disableClose: true,
        data: {
          name: this.currentMap.name,
          description: this.currentMap.description,
          isSaveAs: true,
        },
      }
    );

    dialogRef
      .afterClosed()
      .subscribe(
        (result: { name: string; description: string; saveAsNew: boolean }) => {
          if (result) {
            this.saveMap(result.name, result.description, true);
          }
        }
      );
  }

  allMaps() {
    let dialogRef: MatDialogRef<MapsBrowserComponent> = this.dialog.open(
      MapsBrowserComponent,
      {
        height: 'auto',
        width: 'auto',
        data: {
          secondMap: false,
        },
      }
    );

    dialogRef.afterClosed().subscribe((result: string) => {
      if (result != null && result != '') {
        //Todo: Open map by ID
      }
    });
  }

  cancelLinking() {
    this.store.dispatch(new ResetLinking());
  }

  extraMap() {
    this.dialog.open(MapsBrowserComponent, {
      height: 'auto',
      width: 'auto',
      data: {
        secondMap: true,
      },
    });
  }

  deleteMap() {
    const isUserAdmin = this.isSuperAdmin$.pipe(take(1)).subscribe();
    if (this.userIsOwner || isUserAdmin) {
      const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
        data: {
          header: 'Confirm deletion',
          body: `
            <p>Are you sure you want to delete the following map:</p>
            <b>${this.currentMap.name}</b>
            <br />
            <br />
            <p>Created by:</p>
            <b>${this.currentMap.modifiedBy}</b>
          `,
        },
        width: 'auto',
        disableClose: true,
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
    } else {
      this.snackBar.open(
        "You don't have the rights to delete this map",
        'Dismiss',
        { duration: 5000 }
      );
    }
  }

  private mapDeletionHandler() {
    this.auth.currentEmail$.pipe(take(1)).subscribe((userEmail) => {
      this.store.dispatch(new LoadOwnMaps(userEmail));
      this.initNewMap();
      this.snackBar.open('Map has been successfully deleted', 'Dismiss', {
        duration: 3000,
        panelClass: 'success-snackbar',
      });
    });
  }
}
