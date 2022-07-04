import { Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { Store } from '@ngrx/store';
import { GraphMapInfo } from 'projects/frontend/src/app/shared/models/graph-map-info';
import { GraphMapSearchDTO } from 'projects/frontend/src/app/shared/models/graph-map-search-dto';
import { GraphMapData } from 'projects/frontend/src/app/state/map-data/map-data.model';
import { GraphState } from 'projects/frontend/src/app/state/store-items';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import * as mapDataActions from '../../../../state/map-data/map-data.actions';
import * as graphLinkingActions from '../../../../state/graph-linking/graph-linking.actions';

@Component({
  selector: 'colid-maps-browser',
  templateUrl: './maps-browser.component.html',
  styleUrls: ['./maps-browser.component.scss']
})
export class MapsBrowserComponent implements OnInit {

  mapsStore$: Observable<GraphMapData>;
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
    private store: Store<GraphState>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.mapsStore$ = this.store.select('mapData');
    this.mapsStore$.pipe(
      tap(
        maps => {
          this.dataSource.data = maps.allMaps;
          this.loading = maps.loadingAllMaps;
          this.searchParams = maps.searchParams;
          this.userMaps = maps.ownMaps
        }
      )
    ).subscribe();
  }

  ngOnInit(): void {
    this.searchParams = { ...new GraphMapSearchDTO(), batchSize: this.mapPageSize }
    this.setSearchParams(this.searchParams);
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

  private setSearchParams(searchParams: GraphMapSearchDTO) {
    if (!!this.infiniteScroller) {
      this.infiniteScroller.nativeElement.scrollTop = 0;
    }
    this.store.dispatch(mapDataActions.SetCurrentMapSearchParams({ searchData: searchParams }));
  }

  onScrolled($event: any) {
    this.store.dispatch(mapDataActions.LoadMapsNextBatch({ offset: this.dataSource.data.length }))
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
          this.store.dispatch(mapDataActions.LoadMapsNextBatch({ offset: this.dataSource.data.length }))
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
    this.store.dispatch(graphLinkingActions.ResetLinkEditHistory());
    this.store.dispatch(mapDataActions.LoadMap({ mapId: row.graphMapId }));
    if (this.userMaps.some(maps => maps.graphMapId === row.graphMapId)) {
      this.store.dispatch(mapDataActions.setIsOwner({ isOwner: true }))
    } else {
      this.store.dispatch(mapDataActions.setIsOwner({ isOwner: false }))
    }
    this.dialogRef.close();
  }
  loadSecondMap(row: GraphMapInfo) {
    this.store.dispatch(mapDataActions.LoadSecondMap({ mapId: row.graphMapId }))
    this.dialogRef.close();
  }

}
