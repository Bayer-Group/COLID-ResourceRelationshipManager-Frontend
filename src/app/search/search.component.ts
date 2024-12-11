import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { Select, Store } from '@ngxs/store';
import {
  ChangePage,
  ChangeSearchText,
  SearchState,
  ResetActiveAggregationBuckets
} from 'src/app/state/search.state';
import { SidebarState, SetSidebarOpened } from 'src/app/state/sidebar.state';
import { ActiveRangeFilters } from 'src/app/shared/models/active-range-filters';
import { SearchResult } from 'src/app/shared/models/search-result';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit, OnDestroy {
  @Select(SearchState.getActiveAggregations) activeAggregations$: Observable<
    Map<string, string[]>
  >;
  @Select(SearchState.getActiveRangeFilters)
  activeRangeFilters$: Observable<ActiveRangeFilters>;
  @Select(SearchState.getSearchText) searchText$: Observable<string>;
  @Select(SidebarState.sidebarOpened) sidebarOpened$: Observable<any>;
  @Select(SidebarState.sidebarMode) sidebarMode$: Observable<any>;
  @Select(SearchState.getSearchResult) searchResult$: Observable<SearchResult>;

  searchCounter: number = 1;

  activeAggregationsSubscription: Subscription;
  activeRangeFiltersSubscription: Subscription;

  activeAggregations: Map<string, string[]>;
  activeRangeFilters: ActiveRangeFilters;
  searchText: string;
  searchResult: SearchResult;

  masterSub: Subscription = new Subscription();

  constructor(
    private route: ActivatedRoute,
    private store: Store,
    @Inject(MAT_DIALOG_DATA) public anyVariable
  ) {}

  ngOnInit() {
    //this.aggregationFilters$.subscribe(aggregationFilters => this.initializeFilters(aggregationFilters));
    this.masterSub.add(
      this.activeAggregations$.subscribe(
        (activeAggregations) => (this.activeAggregations = activeAggregations)
      )
    );
    this.masterSub.add(
      this.activeRangeFilters$.subscribe((activeRangeFilters) => {
        this.activeRangeFilters = activeRangeFilters;
      })
    );
    this.masterSub.add(
      this.searchText$.subscribe((searchText) => (this.searchText = searchText))
    );
    this.masterSub.add(
      this.searchResult$.subscribe((s) => {
        this.searchResult = s;
      })
    );
  }

  ngOnDestroy() {
    this.store.dispatch(new ResetActiveAggregationBuckets(false));
    this.masterSub.unsubscribe();
  }

  closeSidebar() {
    this.store.dispatch(new SetSidebarOpened(false)).subscribe();
  }

  handleSearchChange(searchText) {
    this.searchCounter++;
    this.store.dispatch(new ChangeSearchText(searchText, false));
  }

  pageChanged(page: any) {
    this.searchCounter++;
    this.store.dispatch(new ChangePage(page, false));
  }

  //Saved search subscription function

  checkSearchText() {
    if (this.searchText == '' || this.searchText == '*') {
      return true;
    } else {
      return false;
    }
  }

  checkNullActiveAggregations() {
    let values = Array.from(this.activeAggregations.values());
    const allUndefined = values.every((v) => v === undefined);
    return allUndefined;
  }
  checkNullActiveRangeFilters() {
    return (
      Object.keys(this.activeRangeFilters).length === 0 &&
      this.activeRangeFilters.constructor === Object
    );
  }
}
