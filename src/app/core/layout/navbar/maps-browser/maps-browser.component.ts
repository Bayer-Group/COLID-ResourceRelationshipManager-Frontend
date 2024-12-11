import { ModuleRegistry } from '@ag-grid-community/core';
import { AgGridAngular } from '@ag-grid-community/angular';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import {
  ColDef,
  GridApi,
  GridOptions,
  GridReadyEvent,
  ITooltipParams
} from '@ag-grid-community/core';
import {
  ChangeDetectionStrategy,
  Component,
  Inject,
  OnDestroy,
  OnInit
} from '@angular/core';
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogModule
} from '@angular/material/dialog';
import { GraphMapInfo } from 'src/app/shared/models/graph-map-info';
import { Observable, Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { Select, Store } from '@ngxs/store';
import {
  GraphMapData,
  LoadAllMaps,
  LoadMap,
  LoadOwnMaps,
  LoadSecondMap,
  MapDataState,
  SetCurrentMap,
  SetIsOwner
} from 'src/app/state/map-data.state';
import {
  ResetLinkEditHistory,
  ResetLinking
} from 'src/app/state/graph-linking.state';
import { AuthService } from 'src/app/modules/authentication/services/auth.service';
import { ConfirmationDialogComponent } from 'src/app/shared/components/confirmation-dialog/confirmation-dialog.component';
import { NotificationService } from 'src/app/shared/services/notification.service';
import { ResourceRelationshipManagerService } from '../../../../shared/services/resource-relationship-manager.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ResetAll } from 'src/app/state/graph-data.state';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CdkTrapFocus } from '@angular/cdk/a11y';
import { CdkCopyToClipboard } from '@angular/cdk/clipboard';
import { CommonModule } from '@angular/common';
import { DEFAULT_GRID_OPTIONS } from 'src/app/shared/ag-grid/default-grid-options';
import { AgGridFilteringBarComponent } from '../../../../shared/ag-grid/ag-grid-filtering-bar/ag-grid-filtering-bar.component';
import { AgGridStatusBarComponent } from '../../../../shared/ag-grid/ag-grid-status-bar/ag-grid-status-bar.component';
import { IconButtonsCellRendererComponent } from 'src/app/shared/ag-grid/icon-buttons-cell-renderer/icon-buttons-cell-renderer.component';
import { PidWithCopyButtonCellRendererComponent } from 'src/app/shared/ag-grid/pid-with-copy-button-cell-renderer/pid-with-copy-button-cell-renderer.component';
import moment from 'moment';

// AG-Grid module registration
ModuleRegistry.registerModules([ClientSideRowModelModule]);

@Component({
  selector: 'colid-maps-browser',
  templateUrl: './maps-browser.component.html',
  styleUrls: ['./maps-browser.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    AgGridAngular,
    AgGridFilteringBarComponent,
    AgGridStatusBarComponent,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatSnackBarModule,
    CdkTrapFocus,
    CdkCopyToClipboard
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MapsBrowserComponent implements OnInit, OnDestroy {
  @Select(MapDataState.getMapDataState) mapsStore$: Observable<GraphMapData>;
  @Select(MapDataState.getCurrentUser) currentUser$: Observable<string>;
  @Select(MapDataState.getIsLoadingAllMaps) loading$: Observable<boolean>;

  allMaps: Array<GraphMapInfo> = [];
  private mapsSubscription: Subscription;
  private userSubscription: Subscription;
  private superAdminSubscription: Subscription;

  colDefs: Array<ColDef> = [
    {
      pinned: 'left',
      headerName: '',
      width: 50,
      flex: 0,
      resizable: false,
      sortable: false,
      suppressColumnsToolPanel: true,
      suppressHeaderMenuButton: true,
      suppressHeaderFilterButton: true,
      cellRenderer: 'iconButtonsCellRendererComponent',
      cellRendererParams: () => this.getOpenMapButtonParams()
    },
    {
      pinned: 'left',
      headerName: 'Name',
      field: 'name',
      minWidth: 200
    },
    {
      headerName: 'Description',
      field: 'description',
      minWidth: 200,
      flex: 1,
      tooltipValueGetter: (params: ITooltipParams) => params.value
    },
    {
      headerName: 'Nodes',
      field: 'nodeCount',
      width: 120
    },
    {
      headerName: 'Last changed',
      field: 'modifiedAt',
      width: 140,
      cellDataType: 'date',
      filter: 'agDateColumnFilter',
      valueGetter: (params: any) =>
        params.data.modifiedAt ? new Date(params.data.modifiedAt) : '',
      valueFormatter: (params) =>
        params.value ? moment(params.value).format('DD MMM YYYY') : ''
    },
    {
      headerName: 'Created by',
      field: 'modifiedBy',
      minWidth: 200
    },
    {
      headerName: 'Browsable URI',
      field: 'browsableUri',
      minWidth: 200,
      flex: 1,
      cellRenderer: 'pidWithCopyButtonCellRendererComponent'
    },
    {
      pinned: 'right',
      headerName: '',
      width: 50,
      flex: 0,
      resizable: false,
      sortable: false,
      suppressColumnsToolPanel: true,
      suppressHeaderMenuButton: true,
      suppressHeaderFilterButton: true,
      cellRenderer: 'iconButtonsCellRendererComponent',
      cellRendererParams: (params) =>
        this.getDeleteMapButtonParams(params.data.originalMap.modifiedBy)
    }
  ];

  gridApi: GridApi;

  gridOptions: GridOptions = {
    ...DEFAULT_GRID_OPTIONS,

    components: {
      iconButtonsCellRendererComponent: IconButtonsCellRendererComponent,
      pidWithCopyButtonCellRendererComponent:
        PidWithCopyButtonCellRendererComponent
    }
  };

  rowData = [];
  selectedRows = [];
  filteredRowsCount = 0;

  currentUser: string;
  isSuperAdmin = false;

  get dialogTitle(): string {
    return this.data?.secondMap ? 'Load map in current map' : 'Browse all maps';
  }

  constructor(
    public dialogRef: MatDialogRef<MapsBrowserComponent>,
    private store: Store,
    private auth: AuthService,
    private dialog: MatDialog,
    private notificationService: NotificationService,
    private resourceRelationshipManagerApiService: ResourceRelationshipManagerService,
    private snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {
    this.mapsSubscription = this.mapsStore$.subscribe((maps) => {
      this.allMaps = maps?.allMaps;
      this.rowData = this.generateRows(this.allMaps);
      this.filteredRowsCount = this.rowData.length;
    });

    this.userSubscription = this.currentUser$.subscribe((user) => {
      this.currentUser = user;
    });

    this.superAdminSubscription = this.auth.hasSuperAdminPrivilege$.subscribe(
      (isSuperAdmin) => {
        this.isSuperAdmin = isSuperAdmin;
      }
    );

    this.store.dispatch(new LoadAllMaps());
  }

  ngOnDestroy() {
    if (this.mapsSubscription) {
      this.mapsSubscription.unsubscribe();
    }

    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }

    if (this.superAdminSubscription) {
      this.superAdminSubscription.unsubscribe();
    }
  }

  cancel() {
    this.dialogRef.close();
  }

  onGridReady(params: GridReadyEvent): void {
    this.gridApi = params.api;
  }

  onFilterChanged(): void {
    let counter = 0;

    if (this?.gridApi) {
      this.gridApi.forEachNodeAfterFilter(() => {
        counter++;
      });
    }

    this.filteredRowsCount = counter;
  }

  private openMap(map: GraphMapInfo): void {
    if (this.data?.secondMap) {
      this.store.dispatch(new LoadSecondMap(map.id));
    } else {
      this.store.dispatch(new ResetLinkEditHistory());
      this.store.dispatch(new LoadMap(map.id));
      this.store.dispatch(new SetIsOwner(this.currentUser === map.modifiedBy));
    }

    this.dialogRef.close();
  }

  private deleteMapWithConfirmationDialog(selectedMap: GraphMapInfo) {
    const { id: graphMapId, name, modifiedBy } = selectedMap;
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: {
        header: 'Confirm deletion',
        body: `
            <p>Are you sure you want to delete the following map:</p>
            <b>${name}</b>
            <br />
            <br />
            <p>Created by:</p>
            <b>${modifiedBy}</b>
          `
      },
      width: 'auto',
      disableClose: true
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.auth.hasSuperAdminPrivilege$
          .pipe(take(1))
          .subscribe((isSuperAdmin) => {
            if (isSuperAdmin) {
              this.resourceRelationshipManagerApiService
                .deleteGraphMapAsSuperAdmin(graphMapId)
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
                .deleteGraphMap(graphMapId)
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

  private generateRows(data: Array<GraphMapInfo>): Array<any> {
    var rows: Array<any> = [];

    data?.forEach((map) => {
      const row = {
        name: map.name,
        description: map.description,
        nodeCount: map.nodeCount,
        modifiedAt: map.modifiedAt,
        modifiedBy: map.modifiedBy,
        browsableUri: map.pidUri,
        originalMap: map
      };

      rows.push(row);
    });

    return rows;
  }

  private getOpenMapButtonParams(): any {
    return {
      actions: [
        {
          fontIcon: 'open_in_browser',
          tooltipText: this.data?.secondMap
            ? 'Load map in current map'
            : 'Open map',
          actionFunction: (params) => this.openMap(params.data.originalMap)
        }
      ]
    };
  }

  private getDeleteMapButtonParams(mapOwner: string): any {
    return {
      actions:
        this.isSuperAdmin || this.currentUser === mapOwner
          ? [
              {
                fontIcon: 'delete_forever',
                tooltipText: 'Delete map',
                actionFunction: (params) =>
                  this.deleteMapWithConfirmationDialog(params.data.originalMap)
              }
            ]
          : []
    };
  }

  private mapDeletionHandler() {
    this.store.dispatch(new LoadOwnMaps(this.auth.currentUserEmailAddress));

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
