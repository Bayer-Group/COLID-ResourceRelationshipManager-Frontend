import { ChangeDetectionStrategy, Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { GraphMapInfo } from 'projects/frontend/src/app/shared/models/graph-map-info';
import { GraphMapSearchDTO } from 'projects/frontend/src/app/shared/models/graph-map-search-dto';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Select, Store } from '@ngxs/store';
import { GraphMapData, LoadMap, LoadMapsNextBatch, LoadSecondMap, MapDataState, SetCurrentMapSearchParams, SetIsOwner } from 'projects/frontend/src/app/state/map-data.state';
import { ResetLinkEditHistory } from 'projects/frontend/src/app/state/graph-linking.state';

@Component({
  selector: 'colid-maps-browser',
  templateUrl: './maps-browser.component.html',
  styleUrls: ['./maps-browser.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MapsBrowserComponent implements OnInit {

  @Select(MapDataState.getMapDataState) mapsStore$: Observable<GraphMapData>;
  dataSource: MatTableDataSource<GraphMapInfo> = new MatTableDataSource<GraphMapInfo>();
  loading: boolean = false;
  nameHeaderClicked: boolean = false;
  hoveredKey: string = "";
  searchParams: GraphMapSearchDTO = new GraphMapSearchDTO();
  mapPageSize: number = 12;
  checkScroll: boolean = false;
  userMaps: GraphMapInfo[] = [];

  @ViewChild('infiniteScroller', { static: false }) infiniteScroller!: ElementRef;

  constructor(
    public dialogRef: MatDialogRef<MapsBrowserComponent>,
    private store: Store,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {

  }

  ngOnInit(): void {
    this.searchParams = { ...new GraphMapSearchDTO(), batchSize: this.mapPageSize }
    this.setSearchParams(this.searchParams);
    setTimeout(() => {
      this.mapsStore$.pipe(
        tap(
          maps => {
            this.dataSource.data = maps.allMaps;
            this.loading = maps.loadingAllMaps;
            this.searchParams = maps.searchParams;
            this.userMaps = maps.ownMaps;
          }
        )
      ).subscribe();
    }, 0);
  }

  applyFilter(event: Event) {
    const filterValue: string = (event.target as HTMLInputElement).value;
    this.setSearchParams({ ...this.searchParams, nameFilter: filterValue });
    if (filterValue.length == 0)
      this.nameHeaderClicked = false;
  }


  changeSorting(attribute: string) {
    if (this.searchParams.sortKey !== attribute) {
      this.setSearchParams({ ...this.searchParams, sortType: 'asc', sortKey: attribute });
    } else {
      this.setSearchParams({ ...this.searchParams, sortType: this.searchParams.sortType !== 'asc' ? 'asc' : 'des' });
    }
  }

  isOverflow(el: HTMLElement): boolean {
    let curOverflow = el.style.overflow;
    if (!curOverflow || curOverflow === "visible")
      el.style.overflow = "hidden";
    let isOverflowing = el.clientWidth < el.scrollWidth
      || el.clientHeight < el.scrollHeight;
    el.style.overflow = curOverflow;
    return isOverflowing;
  }

  private setSearchParams(searchParams: GraphMapSearchDTO) {
    if (!!this.infiniteScroller) {
      this.infiniteScroller.nativeElement.scrollTop = 0;
    }
    this.store.dispatch(new SetCurrentMapSearchParams(searchParams));
  }

  onScrolled($event: any) {
    this.store.dispatch(new LoadMapsNextBatch(this.dataSource.data.length));
  }

  /**
   * @summary scroll event callback for unblocking (scrolled) event by detecting the blocking and fetching a new batch
   */
  //
  onScroll($event: any) {
    if (this.checkScroll) return;

    if (this.dataSource.data.length == this.mapPageSize && !!this.infiniteScroller && this.infiniteScroller.nativeElement.scrollTop != 0) {
      this.checkScroll = true;

      setTimeout(() => {
        if (this.dataSource.data.length == this.mapPageSize) {
          this.store.dispatch(new LoadMapsNextBatch(this.dataSource.data.length));
        }
        this.checkScroll = false;
      }, 200);
    }
  }

  getSortIconCode() {
    return this.searchParams.sortType == 'asc' ? 'arrow_upward' : (this.searchParams.sortType == 'des' ? 'arrow_downward' : 'swap_vert');
  }

  canDisplayIcon(name: string): boolean {
    return (this.searchParams.sortKey == name && this.searchParams.sortType != '') || this.hoveredKey == name;
  }

  loadMap(row: GraphMapInfo) {
    this.store.dispatch(new ResetLinkEditHistory());
    this.store.dispatch(new LoadMap(row.id));
    if (this.userMaps.some(maps => maps.id === row.id)) {
      this.store.dispatch(new SetIsOwner(true))
    } else {
      this.store.dispatch(new SetIsOwner(false))
    }
    this.dialogRef.close();
  }

  loadSecondMap(row: GraphMapInfo) {
    this.store.dispatch(new LoadSecondMap(row.id))
    this.dialogRef.close();
  }

  // getToolTipdata(column: any) {
  //   return column;
  // }

  cancel() {
    this.dialogRef.close();
  }

}
