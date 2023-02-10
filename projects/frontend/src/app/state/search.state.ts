import {
  Action,
  Selector,
  State,
  StateContext,
  Actions,
  ofActionDispatched,
  Store,
} from '@ngxs/store';
import { SearchService } from 'projects/frontend/src/app/shared/search.service';
import { SearchResult } from 'projects/frontend/src/app/shared/search-result';
import {
  Aggregation,
  AggregationType,
} from 'projects/frontend/src/app/shared/aggregation';
import { AggregationBucket } from 'projects/frontend/src/app/shared/aggregation-bucket';
import { ActivatedRoute } from '@angular/router';
import { finalize, tap, mergeMap, catchError, takeUntil } from 'rxjs/operators';
import { SetFilterItems } from 'projects/frontend/src/app/shared/filter.state';
import { RangeFilterSelection } from 'projects/frontend/src/app/shared/range-filter';
import { ActiveRangeFilters } from 'projects/frontend/src/app/shared/active-range-filters';
import {
  DmpException,
  ErrorCode,
} from 'projects/frontend/src/app/shared/dmp-exception';
import { of } from 'rxjs';
import { SchemeUi } from '../shared/schemeUI';
import { Injectable } from '@angular/core';

export class PerformInitialSearch {
  static readonly type = '[Search] PerformInitialSearch';

  constructor(public searchTerm: string, public route: ActivatedRoute) {}
}

export class FetchAutocompleteResults {
  static readonly type = '[Search] FetchAutocompleteResults';

  constructor(public searchText: string) {}
}

export class FetchSearchResult {
  static readonly type = '[Search] FetchSearchResult';

  constructor(public route: ActivatedRoute) {}
}

export class FetchSearchResults {
  static readonly type = '[Search] FetchSearchResults';

  constructor() {}
}

export class FetchNextSearchResult {
  static readonly type = '[Search] FetchNextSearchResult';

  constructor(public scrollingMainView: boolean) {}
}

export class ChangeSearchText {
  static readonly type = '[Search] ChangeSearchText';

  constructor(public searchText: string, public initialChange: boolean) {}
}

export class SearchByPidUri {
  static readonly type = '[Search] Search by PID URI';
  constructor(public pidUri: string) {}
}

export class ChangeActiveRangeFilter {
  static readonly type = '[Search] ChangeActiveRangeFilter';

  constructor(
    public key: string,
    public selection: RangeFilterSelection,
    public initialChange: boolean
  ) {}
}

export class OverwriteActiveRangeFilters {
  static readonly type = '[Search] OverwriteActiveRangeFilters';

  constructor(
    public activeRangeFilters: ActiveRangeFilters,
    public initialChange: boolean
  ) {}
}

export class OverwriteActiveAggregationBuckets {
  static readonly type = '[Search] OverwriteActiveAggregationBuckets';

  constructor(
    public activeAggregationBuckets: Map<string, string[]>,
    public initialChange: boolean
  ) {}
}

export class ChangePage {
  static readonly type = '[Search] ChangePage';

  constructor(public page: number, public initialChange: boolean) {}
}

export class ChangeActiveAggregationBuckets {
  static readonly type = '[Search] ChangeActiveAggregationBuckets';

  constructor(
    public aggregation: Aggregation,
    public aggregationBucket: AggregationBucket,
    public value: any
  ) {}
}

export class ChangeActiveAggregationBucketList {
  static readonly type = '[Search] ChangeActiveAggregationBucketList';

  constructor(
    public aggregation: Aggregation,
    public aggregationBuckets: string[]
  ) {}
}

export class ResetActiveAggregationBuckets {
  static readonly type = '[Search] ResetActiveAggregationBuckets';

  constructor(public fetchSearchResults: boolean) {}
}

export class FetchLinkedTableandColumnResults {
  static readonly type = '[Search] FetchLinkedTableandColumnResults';

  constructor(public id: string) {}
}

export class FetchSchemaUIResults {
  static readonly type = '[Search] FetchSchemaUIResults';

  constructor(public displayTableAndColumn: SchemeUi) {}
}

export interface SearchStateModel {
  searching: boolean;
  autoCompleteResults: string[];
  searchText: string;
  searchTimestamp: Date;
  correctedSearchText: string;
  didYouMean: string;
  searchResult: SearchResult;
  aggregations: Aggregation[];
  activeAggregationBuckets: Map<string, string[]>;
  activeRangeFilters: ActiveRangeFilters;
  page: number;
  errorCode: ErrorCode;
  linkedTableAndcolumnResource: any;
  loading: boolean;
  errorSchema: any;
  schemaUIDetail: any;
}

@State<SearchStateModel>({
  name: 'search',
  defaults: {
    searching: false,
    autoCompleteResults: null,
    searchText: null,
    searchTimestamp: null,
    searchResult: null,
    didYouMean: null,
    correctedSearchText: null,
    aggregations: null,
    activeAggregationBuckets: new Map<string, string[]>(),
    activeRangeFilters: {},
    page: 1,
    errorCode: null,
    linkedTableAndcolumnResource: null,
    loading: false,
    errorSchema: null,
    schemaUIDetail: null,
  },
})
@Injectable()
export class SearchState {
  constructor(
    private store: Store,
    private searchService: SearchService,
    private actions$: Actions
  ) {}

  @Selector()
  public static getErrorCode(state: SearchStateModel) {
    return state.errorCode;
  }

  @Selector()
  public static getErrorSchema(state: SearchStateModel) {
    return state.errorSchema;
  }

  @Selector()
  public static getSearching(state: SearchStateModel) {
    return state.searching;
  }

  @Selector()
  public static getSearchText(state: SearchStateModel) {
    return state.searchText;
  }

  @Selector()
  public static getSearchTimestamp(state: SearchStateModel) {
    return state.searchTimestamp;
  }

  @Selector()
  public static getCorrectedSearchText(state: SearchStateModel) {
    return state.correctedSearchText;
  }

  @Selector()
  public static getDidYouMean(state: SearchStateModel) {
    return state.didYouMean;
  }

  @Selector()
  public static getSearchResult(state: SearchStateModel) {
    return state.searchResult;
  }

  @Selector()
  public static getDocumentResult(state: SearchStateModel) {
    return state.searchResult;
  }

  @Selector()
  public static getAutoCompleteResults(state: SearchStateModel) {
    return state.autoCompleteResults;
  }

  @Selector()
  public static getPage(state: SearchStateModel) {
    return state.page;
  }

  @Selector()
  public static getAggregations(state: SearchStateModel) {
    return state.aggregations;
  }

  @Selector()
  public static getActiveRangeFilters(state: SearchStateModel) {
    return state.activeRangeFilters;
  }

  @Selector()
  public static getActiveAggregations(state: SearchStateModel) {
    return state.activeAggregationBuckets;
  }

  @Selector()
  public static getLinkedTableAndColumnResource(state: SearchStateModel) {
    return state.linkedTableAndcolumnResource;
  }

  @Selector()
  public static getschemaUIDetailResource(state: SearchStateModel) {
    return state.schemaUIDetail;
  }

  @Selector()
  public static getLoading(state: SearchStateModel) {
    return state.loading;
  }

  @Action(ResetActiveAggregationBuckets)
  resetActiveAggregationBuckets(
    ctx: StateContext<SearchStateModel>,
    action: ResetActiveAggregationBuckets
  ) {
    ctx.patchState({
      activeAggregationBuckets: new Map<string, string[]>(),
      activeRangeFilters: {},
    });
    if (action.fetchSearchResults) {
      this.store.dispatch(new FetchSearchResults());
    }
  }

  @Action(ChangeActiveRangeFilter)
  changeActiveRangeFilter(
    ctx: StateContext<SearchStateModel>,
    action: ChangeActiveRangeFilter
  ) {
    const newActiveRangeFilters = { ...ctx.getState().activeRangeFilters };
    newActiveRangeFilters[action.key] = action.selection;

    ctx.patchState({
      activeRangeFilters: newActiveRangeFilters,
    });

    return ctx.dispatch(new FetchSearchResults());
  }

  @Action(OverwriteActiveRangeFilters)
  overwriteActiveRangeFilters(
    ctx: StateContext<SearchStateModel>,
    action: OverwriteActiveRangeFilters
  ) {
    ctx.patchState({
      activeRangeFilters: action.activeRangeFilters,
    });
  }

  @Action(OverwriteActiveAggregationBuckets)
  overwriteActiveAggregationBuckets(
    ctx: StateContext<SearchStateModel>,
    action: OverwriteActiveAggregationBuckets
  ) {
    ctx.patchState({
      activeAggregationBuckets: action.activeAggregationBuckets,
    });
  }

  @Action(ChangeActiveAggregationBuckets)
  changeActiveAggregationBuckets(
    ctx: StateContext<SearchStateModel>,
    action: ChangeActiveAggregationBuckets
  ) {
    const key = action.aggregation.key;
    let activeAggregationBuckets = new Map<string, string[]>(
      ctx.getState().activeAggregationBuckets
    );
    const bucketKey = action.aggregationBucket.key;

    // Check if some active aggregation exists
    if (activeAggregationBuckets) {
      const activeAggregations = activeAggregationBuckets.get(
        action.aggregation.key
      );
      // Check if aggregations already exist for the current filter that was changed.
      if (activeAggregations) {
        // If the changed filter (bucket) is  in the list, it will be removed.
        if (activeAggregations.some((r) => r === bucketKey)) {
          const filteredActiveAggregations = activeAggregations.filter(
            (r) => r !== bucketKey
          );

          if (filteredActiveAggregations.length !== 0) {
            activeAggregationBuckets.set(key, filteredActiveAggregations);
          }
          // If no active aggregations exists, the empty aggregation list is completely deleted
          else {
            activeAggregationBuckets.delete(key);
          }
        }
        // Otherwise, if the changed filter is not in the list, it will be added to the active buckets.
        else {
          activeAggregations.push(bucketKey);
          activeAggregationBuckets.set(key, activeAggregations);
        }
      } else {
        activeAggregationBuckets.set(key, [bucketKey]);
      }
    } else {
      activeAggregationBuckets = new Map<string, string[]>();
      activeAggregationBuckets.set(key, [bucketKey]);
    }

    ctx.patchState({
      activeAggregationBuckets: activeAggregationBuckets,
    });
  }

  @Action(ChangeActiveAggregationBucketList)
  changeActiveAggregationBucketList(
    ctx: StateContext<SearchStateModel>,
    action: ChangeActiveAggregationBucketList
  ) {
    const key = action.aggregation.key;
    let activeAggregationBuckets = new Map<string, string[]>(
      ctx.getState().activeAggregationBuckets
    );

    if (activeAggregationBuckets) {
      const activeAggregation = activeAggregationBuckets.get(
        action.aggregation.key
      );
      if (activeAggregation) {
        if (action.aggregationBuckets.length !== 0) {
          activeAggregationBuckets.set(key, action.aggregationBuckets);
        } else {
          activeAggregationBuckets.delete(key);
        }
      } else {
        activeAggregationBuckets.set(key, action.aggregationBuckets);
      }
    } else {
      activeAggregationBuckets = new Map<string, string[]>();
      activeAggregationBuckets.set(key, action.aggregationBuckets);
    }
    ctx.patchState({
      activeAggregationBuckets: activeAggregationBuckets,
    });

    return ctx.dispatch(new FetchSearchResults());
  }

  @Action(ChangeSearchText)
  changeSearchText(
    ctx: StateContext<SearchStateModel>,
    action: ChangeSearchText
  ) {
    ctx.patchState({
      searchText: action.searchText,
      searchTimestamp: new Date(),
      page: 1,
    });

    if (!action.initialChange) {
      return ctx.dispatch(new FetchSearchResults());
    }
  }

  @Action(ChangePage)
  changePage(ctx: StateContext<SearchStateModel>, action: ChangePage) {
    ctx.patchState({
      page: action.page,
    });
  }

  @Action(FetchSearchResults, { cancelUncompleted: true })
  fetchSearchResults(
    { getState, patchState, dispatch }: StateContext<SearchStateModel>,
    {}: FetchSearchResults
  ) {
    patchState({
      loading: true,
      searching: true,
      didYouMean: null,
    });
    const statenow = getState();
    const searchTerm = statenow.searchText;
    const page = 1;
    let activeAggregationBuckets: Map<string, string[]> =
      statenow.activeAggregationBuckets;
    let activeRangeFilters: ActiveRangeFilters = statenow.activeRangeFilters;

    return this.searchService
      .search(searchTerm, page, activeAggregationBuckets, activeRangeFilters)
      .pipe(
        tap((s) => {
          let didYouMean = null;
          try {
            const firstSuggest = Object.values(s.suggest)[0][0];
            if (
              firstSuggest &&
              firstSuggest.options &&
              firstSuggest.options.length
            ) {
              didYouMean = firstSuggest.options[0].text;
            }
          } catch (e) {
            console.log('Could not get dym', e);
          }
          const stateUpdates = {
            searchResult: s,
            aggregations: s.aggregations,
            activeAggregationBuckets: activeAggregationBuckets,
            correctedSearchText: s.suggestedSearchTerm,
            didYouMean: didYouMean,
            errorCode: null,
            page,
          };
          patchState(stateUpdates);
        }),
        mergeMap((s) =>
          dispatch(new SetFilterItems(s.aggregations, s.rangeFilters))
        ),
        catchError((err) => {
          const dmpEx = err.error as DmpException;
          patchState({ errorCode: dmpEx.errorCode });
          return of(err);
        }),
        finalize(() => {
          patchState({ searching: false });
        })
      );
  }

  @Action(SearchByPidUri)
  fetchSearchResultByPidUri(
    { patchState }: StateContext<SearchStateModel>,
    action: SearchByPidUri
  ) {
    patchState({
      searchResult: null,
      searching: true,
      didYouMean: null,
    });

    return this.searchService.searchDocument(action.pidUri).pipe(
      tap((s) => {
        patchState({
          searchResult: s,
          aggregations: s.aggregations,
          correctedSearchText: s.suggestedSearchTerm,
          didYouMean: s.suggestedSearchTerm,
          errorCode: null,
          searching: false,
        });
      }),
      finalize(() => {
        patchState({ searching: false });
      })
    );
  }

  @Action(FetchSearchResult)
  fetchSearchResult(
    { getState, patchState, dispatch }: StateContext<SearchStateModel>,
    action: FetchSearchResult
  ) {
    patchState({
      searchResult: null,
      searching: true,
      didYouMean: null,
    });

    const queryParams = action.route.snapshot.queryParams;
    var searchTerm: string = queryParams['q'];
    if (searchTerm == undefined) {
      searchTerm = '*';
    }
    const page = queryParams['p'] == null ? 1 : queryParams['p'];
    const activeAggergationBuckets =
      queryParams['f'] == null
        ? queryParams['f']
        : JSON.parse(queryParams['f']);
    const activeRangeFilters =
      queryParams['r'] == null
        ? queryParams['r']
        : JSON.parse(queryParams['r']);

    return this.searchService
      .search(searchTerm, page, activeAggergationBuckets, activeRangeFilters)
      .pipe(
        tap((s) => {
          let didYouMean = null;
          try {
            const firstSuggest = Object.values(s.suggest)[0][0];
            if (
              firstSuggest &&
              firstSuggest.options &&
              firstSuggest.options.length
            ) {
              didYouMean = firstSuggest.options[0].text;
            }
          } catch (e) {
            console.log('Could not get dym', e);
          }
          const stateUpdates = {
            searchResult: s,
            aggregations: s.aggregations,
            correctedSearchText: s.suggestedSearchTerm,
            didYouMean: didYouMean,
            errorCode: null,
          };
          patchState(stateUpdates);
        }),
        mergeMap((s) =>
          dispatch(new SetFilterItems(s.aggregations, s.rangeFilters))
        ),
        catchError((err) => {
          const dmpEx = err.error as DmpException;
          patchState({ errorCode: dmpEx.errorCode });
          return of(err);
        }),
        finalize(() => {
          patchState({ searching: false });
        })
      );
  }

  @Action(FetchNextSearchResult)
  fetchNextSearchResult(
    { getState, patchState, dispatch }: StateContext<SearchStateModel>,
    action: FetchNextSearchResult
  ) {
    const state = getState();
    const newPage = action.scrollingMainView ? state.page + 1 : 0;
    const currentState = getState();
    const searchTerm: string = currentState.searchText;
    const activeAggergationBuckets: Map<string, string[]> =
      currentState.activeAggregationBuckets;
    const activeRangeFilters: ActiveRangeFilters =
      currentState.activeRangeFilters;
    return this.searchService
      .search(searchTerm, newPage, activeAggergationBuckets, activeRangeFilters)
      .pipe(
        tap((s) => {
          let didYouMean = null;
          try {
            const firstSuggest = Object.values(s.suggest)[0][0];
            if (
              firstSuggest &&
              firstSuggest.options &&
              firstSuggest.options.length
            ) {
              didYouMean = firstSuggest.options[0].text;
            }
          } catch (e) {}
          const oldResult = getState().searchResult;

          const mergedResult = [...oldResult.hits.hits, ...s.hits.hits];
          s.hits.hits = mergedResult;

          patchState({
            searchResult: { ...s },
            didYouMean: didYouMean,
            page: newPage,
          });
        }),
        catchError((err) => {
          const dmpEx = err.error as DmpException;
          patchState({ errorCode: dmpEx.errorCode });
          return of(err);
        })
      );
  }

  @Action(FetchAutocompleteResults)
  fetchAutocompleteResults(
    { getState, patchState }: StateContext<SearchStateModel>,
    { searchText }: FetchAutocompleteResults
  ) {
    if (searchText) {
      return this.searchService.fetchAutoCompleteResults(searchText).pipe(
        tap((result) => {
          patchState({
            autoCompleteResults: result,
          });
        }),
        takeUntil(
          this.actions$.pipe(
            ofActionDispatched(FetchAutocompleteResults, FetchSearchResult)
          )
        )
      );
    } else {
      patchState({
        autoCompleteResults: null,
      });
    }
  }

  @Action(FetchLinkedTableandColumnResults)
  fetchLinkedTableandColumnResults(
    { getState, patchState }: StateContext<SearchStateModel>,
    requesturl: { id: any }
  ) {
    patchState({
      loading: true,
    });
    if (requesturl) {
      return this.searchService
        .fetchLinkedTableandColumnResourceById(requesturl.id)
        .pipe(
          tap((result) => {
            patchState({
              loading: false,
              linkedTableAndcolumnResource: result,
            });
          }),
          catchError((err) => {
            patchState({ errorSchema: err, loading: true });
            return of(err);
          })
          //takeUntil(this.actions$.pipe(ofActionDispatched(FetchAutocompleteResults, FetchSearchResult)))
        );
    } else {
      patchState({
        loading: false,
        linkedTableAndcolumnResource: null,
      });
    }
  }

  @Action(FetchSchemaUIResults)
  fetchSchemaUIResults(
    { getState, patchState }: StateContext<SearchStateModel>,
    requesturls: { displayTableAndColumn: any }
  ) {
    var detail = getState().schemaUIDetail;

    patchState({
      loading: true,
    });
    if (requesturls.displayTableAndColumn) {
      return this.searchService
        .fetchSchemaUIItems(requesturls.displayTableAndColumn)
        .pipe(
          tap((result) => {
            patchState({
              loading: false,
              schemaUIDetail: result,
            });
          }),
          catchError((err) => {
            patchState({ errorSchema: err, loading: true });
            return of(err);
          })
          //takeUntil(this.actions$.pipe(ofActionDispatched(FetchAutocompleteResults, FetchSearchResult)))
        );
    } else {
      patchState({
        loading: false,
        schemaUIDetail: null,
      });
    }
  }
}
