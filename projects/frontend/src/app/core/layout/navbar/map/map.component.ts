import { resultMemoize, Store } from '@ngrx/store';
import { Component, OnInit } from '@angular/core';
import { ResourceRelationshipManagerService } from '../../../http/resource-relationship-manager.service';
import { GraphState } from 'projects/frontend/src/app/state/store-items';
import * as mapDataActions from '../../../../state/map-data/map-data.actions';
import * as graphDataActions from '../../../../state/graph-data/graph-data.actions';
import * as savingTriggerActions from '../../../../state/saving-trigger/saving-trigger.actions';
import * as graphLinkingActions from '../../../../state/graph-linking/graph-linking.actions';
import { AuthService } from 'projects/frontend/src/app/modules/authentication/services/auth.service';
import { tap } from 'rxjs/operators';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { SaveMapDialogComponent } from '../save-map-dialog/save-map-dialog.component';
import { GraphMapDTO } from 'projects/frontend/src/app/shared/models/graph-map';
import { Observable } from 'rxjs';
import { GraphMapData } from 'projects/frontend/src/app/state/map-data/map-data.model';
import { Link, Node } from '../../../d3';
import { GraphMapMetadata } from 'projects/frontend/src/app/shared/models/graph-map-metadata';
import { GraphLinkingData } from 'projects/frontend/src/app/state/graph-linking/graph-linking.model';
import { LinkEditHistory } from 'projects/frontend/src/app/shared/models/link-editing-history';
import { SaveConfirmationDialogComponent } from '../save-confirmation-dialog/save-confirmation-dialog.component';
import { color } from 'd3';
import { MapsBrowserComponent } from '../maps-browser/maps-browser.component';
import { GraphMapInfo } from 'projects/frontend/src/app/shared/models/graph-map-info';
import { MatSnackBar } from '@angular/material/snack-bar'
import { NotificationService } from 'projects/frontend/src/app/shared/services/notification.service';
import { ConfirmationDialogComponent } from 'projects/frontend/src/app/shared/components/confirmation-dialog/confirmation-dialog.component';
declare const saveSvgAsPng: any;

@Component({
  selector: 'colid-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnInit {

  maps: GraphMapInfo[] = [];
  loadingOwnMaps: boolean = true;
  currentMap: GraphMapMetadata = {
    graphMapId: "",
    name: "",
    modifiedBy: ""
  };
  linkEditHistory: LinkEditHistory[] = [];
  mapsStore$: Observable<GraphMapData>;
  graphLinking$: Observable<GraphLinkingData>;
  userIsOwner: boolean = false


  constructor(
    private store: Store<GraphState>,
    private resourceRelationshipManagerApiService: ResourceRelationshipManagerService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private authService: AuthService,
    private notificationService: NotificationService
  ) {
    this.mapsStore$ = this.store.select('mapData');
    this.graphLinking$ = this.store.select('graphLinking');
  }

  /**
   * Initialize the component and listen for data changes of data required for the menu actions
   */
  ngOnInit() {
    //react to changes regarding the map in the store and write them into the local var
    this.mapsStore$.pipe(
      tap(
        maps => {
          this.maps = maps.ownMaps;
          this.currentMap = maps.currentMap;
          this.loadingOwnMaps = maps.loadingOwnMaps;
          this.userIsOwner = maps.isOwner
        }
      )
    ).subscribe();

    //always store the links which are not persisted yet locally
    this.graphLinking$.pipe(
      tap(
        gl => {
          this.linkEditHistory = gl.linkEditHistory;
        }
      )
    ).subscribe();
  }

  /**
   * empty the current map and start a new one
   */
  newMap() {
    this.store.dispatch(mapDataActions.SetCurrentId({ id: "" }));
    this.store.dispatch(mapDataActions.SetCurrentName({ name: "" }));
    this.store.dispatch(mapDataActions.SetCurrentModifiedBy({ modifiedBy: "" }));
    this.store.dispatch(graphDataActions.ResetAll());
    this.store.dispatch(graphLinkingActions.ResetLinking());
    this.store.dispatch(graphLinkingActions.ResetLinkEditHistory());
  }

  /**
   * empty the current map and load the selected map
   * @param map ID of the map to load
   */
  loadMap(map: string) {
    this.store.dispatch(mapDataActions.LoadMap({ mapId: map }));
    if (this.maps.some(maps => maps.graphMapId === map)) {
      this.store.dispatch(mapDataActions.setIsOwner({ isOwner: true }))
    } else {
      this.store.dispatch(mapDataActions.setIsOwner({ isOwner: false }))
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
    this.openNamingDialog();
  }

  private saveMap(mapName: string, isNewMap: boolean) {
    if (mapName != null && mapName != '') {
      this.store.dispatch(mapDataActions.SetCurrentName({ name: mapName }));
      this.store.dispatch(savingTriggerActions.SetSaveAsNew({ asNew: isNewMap }));
      this.store.dispatch(savingTriggerActions.StartSavingMap({ asNew: isNewMap }));
    }
    else {
      //save As
      this.openNamingDialog();
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
            this.store.dispatch(graphLinkingActions.RemoveFromHistory({ item: le }));
          });

          this.openNamingDialog();
        }
      });
    } else {
      //this.openNamingDialog();
      //save existing map
      this.saveMap(this.currentMap.name, false);
    }
  }

  /**
   * opens the dialog where a user can enter a name and finalize map saving
   */
  openNamingDialog() {
    //open dialog to confirm saving
    let dialogRef: MatDialogRef<SaveMapDialogComponent> = this.dialog.open(SaveMapDialogComponent, {
      height: '200',
      width: '500px',
      disableClose: true,
      data: {
        name: this.currentMap.name
      }
    });

    dialogRef.afterClosed().subscribe((result: { name: string, saveAsNew: boolean }) => {
      if (result) {
        this.saveMap(result.name, result.saveAsNew);
      }
    });
  }

  allMaps() {
    let dialogRef: MatDialogRef<MapsBrowserComponent> = this.dialog.open(MapsBrowserComponent, {
      height: '561px',
      width: '777px',
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
    this.store.dispatch(graphLinkingActions.ResetLinking());
  }

  extraMap() {
    let dialogRef: MatDialogRef<MapsBrowserComponent> = this.dialog.open(MapsBrowserComponent, {
      height: '561px',
      width: '777px',
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
                    this.store.dispatch(mapDataActions.LoadOwnMaps({ email: email }));
                  }
                }
              )
              this.newMap()
            }
            this.snackBar.open("Deleted!", 'Dismiss', { duration: 3000 })
          },
            err => {
              this.notificationService.notification$.next("Something went wrong while deleting the map")
            });
        }
      });
    } else {
      this.snackBar.open("You don't have the rights to delete this map", 'Dismiss', { duration: 5000 })
    }


  }
}
