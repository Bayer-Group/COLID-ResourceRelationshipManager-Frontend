import { Component, OnInit, EventEmitter, Output, ViewChild, ElementRef } from '@angular/core';
import { SearchResult } from '../../shared/search-result';
import { Select, Store } from '@ngxs/store';
import { SearchState, ChangeSearchText, FetchNextSearchResult } from '../../state/search.state';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { FetchMetadata, MetadataState } from '../../state/metadata.state';
import { ErrorCode } from '../../shared/dmp-exception';
import { map, take, tap } from 'rxjs/operators';
import { LogService } from '../../shared/log.service';
import { ActivatedRoute } from '@angular/router';
import { RRMState, SetFromRRM } from '../../state/rrm.state';
import { Constants } from '../../shared/constants';

@Component({
  selector: 'app-search-results',
  templateUrl: './search-results.component.html',
  styleUrls: ['./search-results.component.scss']
})
export class SearchResultsComponent implements OnInit {
  @Select(SearchState.getSearchResult) searchResult$: Observable<SearchResult>;
  @Select(SearchState.getSearchText) searchTextObservable$: Observable<string>;
  @Select(SearchState.getCorrectedSearchText) correctedSearchText$: Observable<string>;
  @Select(SearchState.getDidYouMean) didYouMean$: Observable<string>;
  @Select(SearchState.getPage) page$: Observable<number>;
  @Select(SearchState.getSearching) searching$: Observable<boolean>;
  @Select(MetadataState.getMetadata) metadata$: Observable<any>;
  @Select(SearchState.getErrorCode) errorCode$: Observable<ErrorCode>;
  @Select(RRMState.getFromRRM) showCheckbox$: Observable<boolean>;
  @Select(RRMState.getFilterMode) filterMode$: Observable<boolean>;
  @Select(RRMState.getSourceDialog) sourceDialog$: Observable<string>;
  isInvalidSearchQuery: Observable<boolean>;
  currentPage = 1;
  itemsPerPage = environment.pageSize;
  searchResult: SearchResult;
  didYouMean: string = null;
  metadata: any = null;
  loadingBatch = false;
  skipResult = []
  sourceDialog: string = "addResource";
  filterInfo = {
    filterMode: false,
    sourceDialog: "addResource"
  }
  showCheckbox: boolean = false;
  selectedPIDURIs: string[] = [];
  activeTablist: any[] = [];
  // option:any=[];
  // id: string[];

  // checkId:string=null;

  @ViewChild('searchResults', { static: false }) searchResults: ElementRef;

  @Output() changePage = new EventEmitter<number>();

  constructor(private store: Store, private logger: LogService, private route: ActivatedRoute) {
    this.isInvalidSearchQuery = this.errorCode$.pipe(map(e => e === ErrorCode.INVALID_SEARCH_TERM));

    var state = JSON.parse(this.route.snapshot.queryParamMap.get('fromRRM'));
    // this.store.dispatch(new SetFromRRM(state))
    this.sourceDialog$.pipe(tap(s => { this.filterInfo.sourceDialog = s; })).subscribe();
    this.showCheckbox$.pipe(
      tap(
        s => {

          this.showCheckbox = s;
        }
      )
    ).subscribe();

  }

  checkboxChanged(event: any) {
    if (event.target.checked) {
      this.selectedPIDURIs.push(event.target.id);
      window.parent.postMessage({ message: "selectedPidURIs", value: this.selectedPIDURIs }, "*");

    }
    else {
      this.selectedPIDURIs.splice(event.target.id, 1);
      window.parent.postMessage({ message: "selectedPidURIs", value: this.selectedPIDURIs }, "*");
    }
  }

  ngOnInit() {
    this.store.dispatch(new FetchMetadata()).subscribe();
    this.logger.info("DMP_RESULT_PAGE_OPENED");
    this.filterInfo.filterMode = JSON.parse(this.route.snapshot.queryParamMap.get('filterView'));
    this.metadata$.subscribe(met => {
      this.metadata = met;
    });
    //s is null when it arrives
    this.searchResult$.subscribe((s: SearchResult) => {
      // this.activeTablist = [] // resize to orginal width;
      //so undefined is being written into searchResult
      this.searchResult = s;
      this.setDidYouMean(s);
      this.loadingBatch = false;

      setTimeout(() => {
        if (this.searchResult != null && this.searchResults != null && this.searchResults.nativeElement.scrollHeight <= this.searchResults.nativeElement.offsetHeight
          && this.searchResults.nativeElement.offsetHeight > 0) {
          this.nextBatch(this.searchResult.hits.total)
        }
        if (this.filterInfo.filterMode && this.filterInfo.sourceDialog == 'addResource') {
          let filterOutTypes: string[] = [
            "https://pid.bayer.com/kos/19050/444586",
            "https://pid.bayer.com/kos/19050/444582"
          ]
          this.searchResult.hits.hits.forEach(hit => {
            let hitResourceType = hit.source[Constants.Metadata.EntityType].outbound.map(t => t.uri)
            if (filterOutTypes.includes(hitResourceType[0])) {
              this.skipResult.push(hit.id)
            }
          })
        }
      }, 100)
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
        this.activeTablist.splice(this.activeTablist.indexOf(event.activetabList), 1);
      }
    }

  }
  getActiveTab(piduri) {
    var id = decodeURIComponent(piduri)
    return this.activeTablist.includes(id)
  }
}
