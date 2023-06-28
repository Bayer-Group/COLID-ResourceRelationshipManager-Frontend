import { Component, OnInit, OnDestroy } from '@angular/core';
import { FetchFilter, FilterState } from '../../state/filter.state';
import { Observable, Subscription } from 'rxjs';
import { Select, Store } from '@ngxs/store';
import { Aggregation } from '../../shared/models/aggregation';
import {
  ResetActiveAggregationBuckets,
  SearchState,
  SearchStateModel,
} from '../../state/search.state';
import { RangeFilter } from '../../shared/models/range-filter';
import { ActiveRangeFilters } from '../../shared/models/active-range-filters';
import { FilterGroupingOrder } from '../../shared/models/filter-grouping-order';
import { FilterGroupingOrderRaw } from '../../shared/models/filter-grouping-order-raw';
import { Constants } from '../../shared/constants';
import {
  ClearResourceTypeItem,
  FetchResourceTypeHierarchy,
} from '../../state/metadata.state';
import { MetadataState } from '../../state/metadata.state';
import { ActivatedRoute } from '@angular/router';

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
  @Select(FilterState.getFilterOrder) filterOrder$: Observable<
    FilterGroupingOrderRaw[]
  >;
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
  aggregationFilterGroups: FilterGroupingOrder[];
  mainAggregationFilters: Aggregation[];
  rangeFilters: RangeFilter[];

  mainAggregationFilterKeys: string[] = [Constants.Metadata.EntityType];

  activeAggregations: Map<string, string[]>;
  activeRangeFilters: ActiveRangeFilters;
  searchText: string;

  @Select(SearchState) searchState: Observable<SearchStateModel>;

  masterSub: Subscription = new Subscription();

  constructor(private store: Store, private route: ActivatedRoute) {}

  ngOnInit() {
    this.store.dispatch(new FetchResourceTypeHierarchy());

    this.masterSub.add(
      this.aggregationFilters$.subscribe((aggregationFilters) => {
        const queryParams = this.route.snapshot.queryParams;
        if (
          aggregationFilters == null &&
          Object.keys(queryParams).length === 0
        ) {
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
      const filterGroupingOrder = this.store.selectSnapshot(
        FilterState.getFilterOrder
      );
      let aggregationFilterGroupsHelper = filterGroupingOrder.map((group) => {
        const filters = group.filters.map((filter) => {
          return {
            ...filter,
            aggregation: null,
          };
        });
        return {
          ...group,
          filters,
        };
      });
      aggregationFilters.forEach((aggregationFilter) => {
        aggregationFilterGroupsHelper.forEach((group) => {
          const filterGroupItemIndex = group.filters.findIndex(
            (groupFilter) => groupFilter.propertyUri === aggregationFilter.key
          );
          if (filterGroupItemIndex > -1) {
            group.filters[filterGroupItemIndex].aggregation = aggregationFilter;
          }
        });
      });
      aggregationFilterGroupsHelper.forEach((group) => {
        group.filters = group.filters.filter(
          (filter) =>
            filter.aggregation != null &&
            !this.mainAggregationFilterKeys.includes(filter.propertyUri)
        );
      });
      aggregationFilterGroupsHelper = aggregationFilterGroupsHelper.filter(
        (group) => group.filters.length > 0
      );

      this.aggregationFilterGroups = aggregationFilterGroupsHelper;

      this.mainAggregationFilters = aggregationFilters.filter((a) =>
        this.isMainAggFilter(a)
      );
    }
  }

  filterGroupTrackBy(index: number, filterGroup: FilterGroupingOrder) {
    return filterGroup.groupName;
  }

  isMainAggFilter(aggregation: Aggregation) {
    return this.mainAggregationFilterKeys.includes(aggregation.key);
  }

  resetActiveAggregation() {
    this.store.dispatch(new ClearResourceTypeItem());
    this.store.dispatch(new ResetActiveAggregationBuckets(true));
  }
}
