import { Component, OnInit, ViewChild } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { SearchResult } from '../../shared/models/search-result';
import { FetchMetadata, MetadataState } from '../../state/metadata.state';

import { SearchByPidUri, SearchState } from '../../state/search.state';
import { SearchResultsComponent } from '../search-results/search-results.component';
import { GraphVisualisationState } from '../../state/graph-visualisation.state';

@Component({
  selector: 'app-search-result-standalone-container',
  templateUrl: './search-result-standalone-container.component.html',
  styleUrls: ['./search-result-standalone-container.component.scss'],
})
export class SearchResultStandaloneContainerComponent implements OnInit {
  @Select(GraphVisualisationState.getSelectedPidUri)
  selectedPidUri$: Observable<string>;
  @Select(MetadataState.getMetadata) metadata$: Observable<any>;
  @Select(SearchState.getDocumentResult)
  searchResult$: Observable<SearchResult>;

  @ViewChild('res')
  searchResultComponent: SearchResultsComponent;

  pidUri: string = '';
  metadata: any;
  searchResult: any;
  loading: boolean = true;
  filterView: boolean = true;

  _store: Store;
  constructor(private store: Store) {
    this._store = store;
  }

  ngOnInit(): void {
    this.metadata$.subscribe((met) => {
      this.metadata = met;
      if (this.searchResult != null) {
        this.loading = false;
      }
    });
    this.loading = true;
    this.selectedPidUri$.subscribe((pidUri) => {
      if (pidUri) {
        this.store.dispatch(new SearchByPidUri(pidUri));
      }
    });
    this.searchResult$.subscribe((s) => {
      if (s != null) {
        if (this.metadata == null) {
          this._store.dispatch(new FetchMetadata());
        } else {
          this.loading = false;
        }
        this.searchResult = s;
      }
    });
    this.loading = false;
  }
}
