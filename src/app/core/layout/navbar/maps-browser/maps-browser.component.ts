import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { GraphMapInfo } from 'src/app/shared/models/graph-map-info';
import { GraphMapSearchDTO } from 'src/app/shared/models/graph-map-search-dto';
import { Observable, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, take, tap } from 'rxjs/operators';
import { Select, Store } from '@ngxs/store';
import {
  GraphMapData,
  LoadMap,
  LoadMapsNextBatch,
  LoadOwnMaps,
  LoadSecondMap,
  MapDataState,
  SetCurrentMap,
  SetCurrentMapSearchParams,
  SetIsOwner,
} from 'src/app/state/map-data.state';
import {
  ResetLinkEditHistory,
  ResetLinking,
} from 'src/app/state/graph-linking.state';
import { AuthService } from 'src/app/modules/authentication/services/auth.service';
import { ConfirmationDialogComponent } from 'src/app/shared/components/confirmation-dialog/confirmation-dialog.component';
import { NotificationService } from 'src/app/shared/services/notification.service';
import { ResourceRelationshipManagerService } from '../../../http/resource-relationship-manager.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ResetAll } from 'src/app/state/graph-data.state';
import { Sort } from '@angular/material/sort';

@Component({
  selector: 'colid-maps-browser',
  templateUrl: './maps-browser.component.html',
  styleUrls: ['./maps-browser.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MapsBrowserComponent implements OnInit {
  @Select(MapDataState.getMapDataState) mapsStore$: Observable<GraphMapData>;
  @Select(MapDataState.getCurrentUser) currentUser$: Observable<string>;
  dataSource: MatTableDataSource<GraphMapInfo> =
    new MatTableDataSource<GraphMapInfo>();
  @Select(MapDataState.getIsLoadingAllMaps) loading$: Observable<boolean>;
  nameHeaderClicked: boolean = false;
  searchParams: GraphMapSearchDTO = new GraphMapSearchDTO();
  mapPageSize: number = 12;
  checkScroll: boolean = false;
  userMaps: GraphMapInfo[] = [];
  displayedColumns = [
    'name',
    'description',
    'nodeCount',
    'date',
    'creator',
    'pidUri',
    'actions',
  ];
  searchInput$ = new Subject<string>();
  isSuperAdmin$: Observable<boolean>;

  @ViewChild('infiniteScroller', { static: false })
  infiniteScroller!: ElementRef;

  constructor(
    public dialogRef: MatDialogRef<MapsBrowserComponent>,
    private store: Store,
    private auth: AuthService,
    private dialog: MatDialog,
    private notificationService: NotificationService,
    private resourceRelationshipManagerApiService: ResourceRelationshipManagerService,
    private snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.isSuperAdmin$ = auth.hasSuperAdminPrivilege$;
  }

  ngOnInit(): void {
    this.searchParams = {
      ...new GraphMapSearchDTO(),
      batchSize: this.mapPageSize,
    };
    this.setSearchParams(this.searchParams);

    this.mapsStore$
      .pipe(
        tap((maps) => {
          this.dataSource.data = maps.allMaps;
          this.searchParams = maps.searchParams;
          this.userMaps = maps.ownMaps;
        })
      )
      .subscribe();

    this.searchInput$
      .pipe(debounceTime(500), distinctUntilChanged())
      .subscribe((searchTerm) =>
        this.setSearchParams({ ...this.searchParams, nameFilter: searchTerm })
      );
  }

  applyFilter(event: Event) {
    this.searchInput$.next((event.target as HTMLInputElement).value);
    const filterValue: string = (event.target as HTMLInputElement).value;
    if (filterValue.length == 0) this.nameHeaderClicked = false;
  }

  onSortChange(sort: Sort) {
    const { active, direction } = sort;
    this.setSearchParams({
      ...this.searchParams,
      sortKey: active,
      sortType: direction,
    });
  }

  isOverflow(el: HTMLElement): boolean {
    let curOverflow = el.style.overflow;
    if (!curOverflow || curOverflow === 'visible') el.style.overflow = 'hidden';
    let isOverflowing =
      el.clientWidth < el.scrollWidth || el.clientHeight < el.scrollHeight;
    el.style.overflow = curOverflow;
    return isOverflowing;
  }

  private setSearchParams(searchParams: GraphMapSearchDTO) {
    this.searchParams = searchParams;
    if (!!this.infiniteScroller) {
      this.infiniteScroller.nativeElement.scrollTop = 0;
    }
    this.store.dispatch(new SetCurrentMapSearchParams(searchParams));
  }

  onScrolled(_) {
    this.store.dispatch(new LoadMapsNextBatch(this.dataSource.data.length));
  }

  loadMap(row: GraphMapInfo) {
    this.store.dispatch(new ResetLinkEditHistory());
    this.store.dispatch(new LoadMap(row.id));
    if (this.userMaps.some((maps) => maps.id === row.id)) {
      this.store.dispatch(new SetIsOwner(true));
    } else {
      this.store.dispatch(new SetIsOwner(false));
    }
    this.dialogRef.close();
  }

  loadSecondMap(row: GraphMapInfo) {
    this.store.dispatch(new LoadSecondMap(row.id));
    this.dialogRef.close();
  }

  showConfirmationDialog(ev: Event, selectedMap: GraphMapInfo) {
    ev.stopPropagation();
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
          `,
      },
      width: 'auto',
      disableClose: true,
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
                    this.setSearchParams(this.searchParams);
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
                    this.setSearchParams(this.searchParams);
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

  cancel() {
    this.dialogRef.close();
  }

  private mapDeletionHandler() {
    const userEmail = this.auth.currentUserEmailAddress;
    this.store.dispatch(new LoadOwnMaps(userEmail));
    this.initNewMap();
    this.snackBar.open('Map has been successfully deleted', 'Dismiss', {
      duration: 3000,
      panelClass: 'success-snackbar',
    });
  }

  private initNewMap() {
    this.store.dispatch(new SetCurrentMap(null));
    this.store.dispatch(new ResetAll());
    this.store.dispatch(new ResetLinking());
    this.store.dispatch(new ResetLinkEditHistory());
  }
}
