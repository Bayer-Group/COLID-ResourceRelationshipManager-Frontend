import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { FetchFilter, FilterState } from '../../shared/filter.state';
import { Observable, Subscription } from 'rxjs';
import { Select, Store } from '@ngxs/store';
import { Aggregation } from '../../shared/aggregation';
import {
  ResetActiveAggregationBuckets,
  SearchState,
  SearchStateModel,
} from '../../state/search.state';
import { RangeFilter } from '../../shared/range-filter';
import { ActiveRangeFilters } from '../../shared/active-range-filters';
import { Constants } from '../../shared/constants';
import {
  ClearResourceTypeItem,
  FetchResourceTypeHierarchy,
} from '../../state/metadata.state';
import { MetadataState } from '../../state/metadata.state';

@Component({
  selector: 'app-filter-panel',
  templateUrl: './filter-panel.component.html',
  styleUrls: ['./filter-panel.component.scss'],
})
export class FilterPanelComponent implements OnInit, OnDestroy {
  @Select(FilterState.getAggregationFilters) aggregationFilters$: Observable<
    Aggregation[]
  >;
  @Select(FilterState.getRangeFilters) rangeFilters$: Observable<RangeFilter[]>;
  @Select(SearchState.getAggregations) getAggregations$: Observable<
    Aggregation[]
  >;
  @Select(SearchState.getActiveAggregations) activeAggregations$: Observable<
    Map<string, string[]>
  >;
  @Select(SearchState.getActiveRangeFilters)
  activeRangeFilters$: Observable<ActiveRangeFilters>;
  @Select(SearchState.getSearchText) searchText$: Observable<string>;
  @Select(MetadataState.getMetadata) metadata$: Observable<any>;

  aggregationFilters: Aggregation[];
  mainAggregationFilters: Aggregation[];
  rangeFilters: RangeFilter[];

  mainAggregationFilterKeys: string[] = [Constants.Metadata.EntityType];

  activeAggregations: Map<string, string[]>;
  activeRangeFilters: ActiveRangeFilters;
  searchText: string;

  @Select(SearchState) searchState: Observable<SearchStateModel>;

  masterSub: Subscription = new Subscription();

  constructor(private store: Store, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.store.dispatch(new FetchResourceTypeHierarchy());

    this.masterSub.add(
      this.aggregationFilters$.subscribe((aggregationFilters) => {
        if (aggregationFilters == null) {
          this.store.dispatch(new FetchFilter());
        } else {
          this.initializeFilters(aggregationFilters);
        }
      })
    );
    this.masterSub.add(
      this.activeAggregations$.subscribe((activeAggregations) => {
        this.activeAggregations = activeAggregations;
      })
    );
    this.masterSub.add(
      this.activeRangeFilters$.subscribe((activeRangeFilters) => {
        this.activeRangeFilters = activeRangeFilters;
      })
    );
    this.masterSub.add(
      this.searchText$.subscribe((searchText) => (this.searchText = searchText))
    );
  }

  ngOnDestroy() {
    this.masterSub.unsubscribe();
    this.resetActiveAggregation();
  }

  initializeFilters(aggregationFilters: Aggregation[]) {
    if (aggregationFilters != null) {
      const orderedAggFilters = aggregationFilters
        .slice()
        .sort((a, b) => a.order - b.order)
        .sort((a, b) => (b.taxonomy ? -1 : 0));

      this.aggregationFilters = orderedAggFilters.filter(
        (a) => !this.isMainAggFilter(a)
      );
      this.mainAggregationFilters = orderedAggFilters.filter((a) =>
        this.isMainAggFilter(a)
      );
    }
    this.cdr.detectChanges();
  }

  isMainAggFilter(aggregation: Aggregation) {
    return this.mainAggregationFilterKeys.includes(aggregation.key);
  }

  resetActiveAggregation() {
    this.store.dispatch(new ClearResourceTypeItem());
    this.store.dispatch(new ResetActiveAggregationBuckets(true));
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
