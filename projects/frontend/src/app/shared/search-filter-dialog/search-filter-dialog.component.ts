import { Component, OnInit, Inject, EventEmitter, Output } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Select, Store } from '@ngxs/store';
import { ActiveRangeFilters } from 'projects/frontend/src/app/shared/active-range-filters';
import { Observable, Subscription } from 'rxjs';
import { ChangePage, ChangeSearchText, SearchState, ResetActiveAggregationBuckets } from '../../state/search.state';
import { RRMState } from '../../state/rrm.state';
import { SearchResult } from '../search-result';
import { ResourceRelationshipManagerService } from '../../core/http/resource-relationship-manager.service';
import { environment } from 'projects/frontend/src/environments/environment';

export interface DialogData {
  searchText: string;
  activeRangeFilters: ActiveRangeFilters;
  activeAggregationFilters: Map<string, string[]>;
}

@Component({
  selector: 'app-search-filter-dialog',
  templateUrl: './search-filter-dialog.component.html',
  styleUrls: ['./search-filter-dialog.component.scss']
})

export class SearchFilterDialogComponent implements OnInit {
  @Select(SearchState.getSearchText) searchText$: Observable<string>;
  @Select(RRMState.getFromRRM) buttons$: Observable<boolean>;
  @Select(SearchState.getSearchResult) searchResult$: Observable<SearchResult>;
  @Select(SearchState.getActiveAggregations) activeAggregations$: Observable<Map<string, string[]>>;
  @Select(SearchState.getActiveRangeFilters) activeRangeFilters$: Observable<ActiveRangeFilters>;
  @Output() searchChange = new EventEmitter();

  filterData: DialogData;
  searchFilterName;
  searchCounter: number = 1;
  searchResult: SearchResult;
  activeAggregations: Map<string, string[]>;
  activeRangeFilters: ActiveRangeFilters;
  searchText: string = '*';
  dialogRef: MatDialogRef<SearchFilterDialogComponent>;
  pidUris: string[] = [];

  masterSub: Subscription = new Subscription();


  constructor(public dialogRef1: MatDialogRef<SearchFilterDialogComponent>, private resourceRelationshipManagerService: ResourceRelationshipManagerService,
    private store: Store,
    @Inject(MAT_DIALOG_DATA) public data: DialogData) {
    this.dialogRef = dialogRef1;
  }

  pageChanged(page: any) {
    this.searchCounter++;
    this.store.dispatch(new ChangePage(page, false));
  }

  handleSearchChange(searchText: string) {
    this.searchChange.emit(searchText);
    this.store.dispatch(new ChangeSearchText(searchText, false));
  }

  handleInputChange(searchText: string) {
    this.store.dispatch(new ChangeSearchText(searchText, false));
    this.searchText = searchText;
  }

  search() {
    this.searchChange.emit(this.searchText);
  }

  checkNullActiveAggregations() {
    let values = Array.from(this.activeAggregations.values())
    const allUndefined = values.every(v => v === undefined);
    return allUndefined;
  }
  checkNullActiveRangeFilters() {
    return Object.keys(this.activeRangeFilters).length === 0 && this.activeRangeFilters.constructor === Object;
  }

  checkSearchText() {
    if (this.searchText == "" || this.searchText == "*") {
      return true;
    } else {
      return false;
    }
  }

  ngOnInit() {
    this.masterSub.add(this.activeAggregations$.subscribe(activeAggregations => this.activeAggregations = activeAggregations));
    this.masterSub.add(this.activeRangeFilters$.subscribe(activeRangeFilters => {
      this.activeRangeFilters = activeRangeFilters
    }));
    this.masterSub.add(this.searchText$.subscribe((searchText) => {
      this.searchText = searchText;
    }));

    this.masterSub.add(this.searchResult$.subscribe(s => {
      this.searchResult = s;
    }));
    window.addEventListener("message", this.receiveMessage.bind(this), false);
    this.handleSearchChange("*");
  }


  ngOnDestroy() {
    this.store.dispatch(new ResetActiveAggregationBuckets(false));
    this.masterSub.unsubscribe();
  }

  closeDialog(): void {
    this.dialogRef.close();
  }

  //event handler to receive broadcasted message events from the iframe
  //used for communication of PID URIs from DMP to this application
  receiveMessage(event: any) {
    const message = event.data.message;
    const isChecked = event.data.checked;
    if (isChecked) {
      this.pidUris.push(event.data.value);
    }
    else {
      const index = this.pidUris.indexOf(event.data.value)
      if (index > -1) {
        this.pidUris.splice(index, 1)
      }
    }

  }

  ongetPidUri(event: any) {
    this.dialogRef.close();
    if (this.pidUris.length > 0 || environment.environment == 'local') {
      this.resourceRelationshipManagerService.loadResources(this.pidUris);
    }
  }

}

