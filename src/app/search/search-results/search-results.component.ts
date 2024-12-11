import {
  Component,
  OnInit,
  EventEmitter,
  Output,
  ViewChild,
  ElementRef
} from '@angular/core';
import { SearchResult } from '../../shared/models/search-result';
import { Select, Store } from '@ngxs/store';
import {
  SearchState,
  ChangeSearchText,
  FetchNextSearchResult
} from '../../state/search.state';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { MetadataState } from '../../state/metadata.state';
import { ErrorCode } from '../../shared/models/dmp-exception';
import { map } from 'rxjs/operators';
import { LogService } from '../../shared/services/log.service';
import { MatCheckboxChange } from '@angular/material/checkbox';

@Component({
  selector: 'app-search-results',
  templateUrl: './search-results.component.html',
  styleUrls: ['./search-results.component.scss']
})
export class SearchResultsComponent implements OnInit {
  @Select(SearchState.getSearchResult) searchResult$: Observable<SearchResult>;
  @Select(SearchState.getSearchText) searchTextObservable$: Observable<string>;
  @Select(SearchState.getCorrectedSearchText)
  correctedSearchText$: Observable<string>;
  @Select(SearchState.getDidYouMean) didYouMean$: Observable<string>;
  @Select(SearchState.getPage) page$: Observable<number>;
  @Select(SearchState.getSearching) searching$: Observable<boolean>;
  @Select(MetadataState.getMetadata) metadata$: Observable<any>;
  @Select(SearchState.getErrorCode) errorCode$: Observable<ErrorCode>;
  isInvalidSearchQuery: Observable<boolean>;
  currentPage = 1;
  itemsPerPage = environment.pageSize;
  searchResult: SearchResult;
  didYouMean: string = null;
  metadata: any = null;
  loadingBatch = false;
  showCheckbox: boolean = false;
  selectedPIDURIs: string[] = [];
  activeTablist: any[] = [];

  @ViewChild('searchResults', { static: false }) searchResults: ElementRef;

  @Output() changePage = new EventEmitter<number>();
  @Output() selectionChange = new EventEmitter<string[]>();

  constructor(
    private store: Store,
    private logger: LogService
  ) {
    this.isInvalidSearchQuery = this.errorCode$.pipe(
      map((e) => e === ErrorCode.INVALID_SEARCH_TERM)
    );
  }

  onCheckboxChange(event: MatCheckboxChange) {
    if (event.checked) {
      this.selectedPIDURIs.push(decodeURIComponent(event.source.id));
      this.selectionChange.emit(this.selectedPIDURIs);
    } else {
      this.selectedPIDURIs = this.selectedPIDURIs.filter(
        (pidUri) => pidUri !== decodeURIComponent(event.source.id)
      );
      this.selectionChange.emit(this.selectedPIDURIs);
    }
  }

  ngOnInit() {
    // this.store.dispatch(new FetchMetadata()).subscribe();
    this.logger.info('DMP_RESULT_PAGE_OPENED');
    this.metadata$.subscribe((met) => {
      this.metadata = met;
    });
    //s is null when it arrives
    this.searchResult$.subscribe((s: SearchResult) => {
      this.searchResult = s;
      this.setDidYouMean(s);
      this.loadingBatch = false;

      setTimeout(() => {
        if (
          this.searchResult != null &&
          this.searchResults != null &&
          this.searchResults.nativeElement.scrollHeight <=
            this.searchResults.nativeElement.offsetHeight &&
          this.searchResults.nativeElement.offsetHeight > 0
        ) {
          this.nextBatch(this.searchResult.hits.total);
        }
      }, 100);
    });
  }

  pageChanged(page: any) {
    this.changePage.emit(page.page);
  }

  setDidYouMean(searchResult: SearchResult) {
    try {
      const firstSuggest = Object.values(searchResult.suggest)[0][0];
      if (firstSuggest && firstSuggest.options && firstSuggest.options.length) {
        this.didYouMean = firstSuggest.options[0].text;
      }
    } catch {
      this.didYouMean = null;
    }
  }

  nextBatch(maxRecordCount: number) {
    if (this.loadingBatch) return;

    if (this.searchResult.hits.hits.length >= maxRecordCount) return;

    this.loadingBatch = true;
    this.store.dispatch(new FetchNextSearchResult(true));
  }

  acceptDidYouMean(dym: string) {
    this.store.dispatch(new ChangeSearchText(dym, false)).subscribe();
  }

  schemeUi(event) {
    if (!this.activeTablist.includes(event.activetabList) && event.isAdd) {
      this.activeTablist.push(event.activetabList);
    } else {
      if (!event.isAdd) {
        this.activeTablist.splice(
          this.activeTablist.indexOf(event.activetabList),
          1
        );
      }
    }
  }
}
