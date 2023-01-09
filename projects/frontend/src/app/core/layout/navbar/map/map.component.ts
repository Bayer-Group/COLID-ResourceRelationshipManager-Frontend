import { Component, OnDestroy, OnInit } from '@angular/core';
import { ResourceRelationshipManagerService } from '../../../http/resource-relationship-manager.service';
import { AuthService } from 'projects/frontend/src/app/modules/authentication/services/auth.service';
import { tap } from 'rxjs/operators';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { SaveMapDialogComponent } from '../save-map-dialog/save-map-dialog.component';
import { Observable, Subscription } from 'rxjs';
import { GraphMapMetadata } from 'projects/frontend/src/app/shared/models/graph-map-metadata';
import { LinkEditHistory } from 'projects/frontend/src/app/shared/models/link-editing-history';
import { SaveConfirmationDialogComponent } from '../save-confirmation-dialog/save-confirmation-dialog.component';
import { MapsBrowserComponent } from '../maps-browser/maps-browser.component';
import { GraphMapInfo } from 'projects/frontend/src/app/shared/models/graph-map-info';
import { MatSnackBar } from '@angular/material/snack-bar'
import { NotificationService } from 'projects/frontend/src/app/shared/services/notification.service';
import { ConfirmationDialogComponent } from 'projects/frontend/src/app/shared/components/confirmation-dialog/confirmation-dialog.component';
import { Select, Store } from '@ngxs/store';
import { GraphMapData, LoadMap, LoadOwnMaps, MapDataState, SetCurrentId, SetCurrentModifiedBy, SetCurrentName, SetDescription, SetIsOwner } from 'projects/frontend/src/app/state/map-data.state';
import { ResetAll } from 'projects/frontend/src/app/state/graph-data.state';
import { GraphLinkingData, GraphLinkingDataState, RemoveFromHistory, ResetLinkEditHistory, ResetLinking } from 'projects/frontend/src/app/state/graph-linking.state';
import { SetSaveAsNew, StartSavingMap } from 'projects/frontend/src/app/state/saving-trigger.state';
declare const saveSvgAsPng: any;

@Component({
  selector: 'colid-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnInit, OnDestroy {

  maps: GraphMapInfo[] = [];
  loadingOwnMaps: boolean = true;
  currentMap: GraphMapMetadata = {
    graphMapId: "",
    name: "",
    description: "",
    modifiedBy: ""
  };
  linkEditHistory: LinkEditHistory[] = [];
  @Select(MapDataState.getMapDataState) mapsStore$: Observable<GraphMapData>;
  @Select(GraphLinkingDataState.getGraphLinkingState) graphLinking$: Observable<GraphLinkingData>;
  userIsOwner: boolean = false
  masterSub: Subscription = new Subscription();

  constructor(
    private store: Store,
    private resourceRelationshipManagerApiService: ResourceRelationshipManagerService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private authService: AuthService,
    private notificationService: NotificationService
  ) { }

  /**
   * Initialize the component and listen for data changes of data required for the menu actions
   */
  ngOnInit() {
    //react to changes regarding the map in the store and write them into the local var
    this.masterSub.add(this.mapsStore$.pipe(
      tap(
        maps => {
          this.maps = maps.ownMaps;
          this.currentMap = maps.currentMap;
          this.loadingOwnMaps = maps.loadingOwnMaps;
          this.userIsOwner = maps.isOwner
        }
      )
    ).subscribe());

    //always store the links which are not persisted yet locally
    this.masterSub.add(this.graphLinking$.pipe(
      tap(
        gl => {
          this.linkEditHistory = gl.linkEditHistory;
        }
      )
    ).subscribe());
  }

  ngOnDestroy(): void {
    this.masterSub.unsubscribe();
  }

  /**
   * empty the current map and start a new one
   */
  newMap() {
    this.store.dispatch(new SetCurrentId(""));
    this.store.dispatch(new SetCurrentName(""));
    this.store.dispatch(new SetDescription(""));
    this.store.dispatch(new SetCurrentModifiedBy(""));
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
    if (this.maps.some(maps => maps.id === map)) {
      this.store.dispatch(new SetIsOwner(true))
    } else {
      this.store.dispatch(new SetIsOwner(false))
    }
  }

  /**
   * Exports the current map viewport as png
   */
  exportPng() {
    saveSvgAsPng(document.getElementById('graphSvgElement'), "resource-map.png");
  }

  /**
   * Handle saving workflow
   */
  saveAs() {
    this.openSaveAsDialog()
  }

  private saveMap(mapName: string, mapDescription: string, isNewMap: boolean) {
    if (mapName != null && mapName != '') {
      this.store.dispatch(new SetCurrentName(mapName));
      this.store.dispatch(new SetDescription(mapDescription));
      this.store.dispatch(new SetSaveAsNew(isNewMap));
      this.store.dispatch(new StartSavingMap(isNewMap));
    }
    else {
      //save As
      this.openSaveAsDialog();
    }
  }
  save() {
    //before saving, make sure that all link edits are persisted
    if (this.linkEditHistory.length > 0) {
      let confirmDialogRef: MatDialogRef<SaveConfirmationDialogComponent> = this.dialog.open(SaveConfirmationDialogComponent, {
        height: '190px',
        width: '750px',
        disableClose: true
      });

      confirmDialogRef.afterClosed().subscribe((result: string) => {

        //Revert all changes if the user clicked on "revert"
        if (result == 'discard') {
          let linkEditHistorySnapshot: LinkEditHistory[] = JSON.parse(JSON.stringify(this.linkEditHistory));

          //undo all unpersisted links
          linkEditHistorySnapshot.forEach(le => {
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
    let dialogRef: MatDialogRef<SaveMapDialogComponent> = this.dialog.open(SaveMapDialogComponent, {
      height: '402px',
      width: '800px',
      disableClose: true,
      data: {
        name: this.currentMap.name,
        description: this.currentMap.description,
        id: this.currentMap.graphMapId//Pass Id 
      }
    });

    dialogRef.afterClosed().subscribe((result: { name: string, description: string, saveAsNew: boolean }) => {
      if (result) {
        this.saveMap(result.name, result.description, result.saveAsNew);
      }
    });
  }

  /**
   * opens the SaveAs dialog where a user can Create New map saving
   * PID1744
   */
  openSaveAsDialog() {
    //open dialog to confirm saving
    let dialogRef: MatDialogRef<SaveMapDialogComponent> = this.dialog.open(SaveMapDialogComponent, {
      height: '402px',
      width: '800px',
      disableClose: true,
      data: {
        name: this.currentMap.name,
        description: this.currentMap.description,
        isSaveAs: true
      }
    });

    dialogRef.afterClosed().subscribe((result: { name: string, description: string, saveAsNew: boolean }) => {
      if (result) {
        this.saveMap(result.name, result.description, true);
      }
    });
  }

  allMaps() {
    let dialogRef: MatDialogRef<MapsBrowserComponent> = this.dialog.open(MapsBrowserComponent, {
      height: 'auto',//'661px',
      width: 'auto',
      data: {
        secondMap: false
      }
    });

    dialogRef.afterClosed().subscribe((result: string) => {
      if (result != null && result != '') {
        //Todo: Open map by ID
      }
    })
  }

  cancelLinking() {
    this.store.dispatch(new ResetLinking());
  }

  extraMap() {
    let dialogRef: MatDialogRef<MapsBrowserComponent> = this.dialog.open(MapsBrowserComponent, {
      height: 'auto',
      width: 'auto',
      data: {
        secondMap: true
      }
    });
  }
  deleteMap() {
    if (this.userIsOwner) {
      const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
        data: {
          header: 'Deleting COLID map',
          body: 'Are you sure that you want to delete this COLID map?'
        },
        width: 'auto',
        height: '13em',
        disableClose: true
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result) {

          this.resourceRelationshipManagerApiService.deleteGraphMap(this.currentMap.graphMapId).subscribe(result => {
            if (this.maps.length > 1) {

              this.authService.currentEmail$.subscribe(
                email => {
                  if (email) {
                    this.store.dispatch(new LoadOwnMaps(email));
                  }
                }
              )
              this.newMap()
            }
            this.snackBar.open("Deleted!", 'Dismiss', { duration: 3000 })
          },
            err => {
              this.notificationService.notification$.next("Something went wrong while deleting the map");
            });
        }
      });
    } else {
      this.snackBar.open("You don't have the rights to delete this map", 'Dismiss', { duration: 5000 })
    }


  }
}
