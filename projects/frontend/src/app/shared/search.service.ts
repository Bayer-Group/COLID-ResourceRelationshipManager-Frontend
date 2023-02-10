import { DocumentMap } from 'projects/frontend/src/app/shared/search-result';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from 'projects/frontend/src/environments/environment';
import { SearchResult } from '../shared/search-result';
import { map } from 'rxjs/operators';
import { ActiveRangeFilters } from '../shared/active-range-filters';
import { AggregationsResultDto } from '../shared/aggregations-result-dto';

@Injectable({
  providedIn: 'root',
})
export class SearchService {
  private readonly baseUrl = environment.dmpCoreApiUrl;
  private readonly pageSize = environment.pageSize;

  constructor(private httpClient: HttpClient) {}

  search(
    searchTerm: string,
    page: number,
    activeAggergationBuckets: Map<string, string[]>,
    activeRangeFilters: ActiveRangeFilters
  ): Observable<SearchResult> {
    if (page < 1) {
      page = 1;
    }

    const fromCurrent = (page - 1) * this.pageSize;
    const aggJson =
      activeAggergationBuckets === undefined
        ? {}
        : Array.from(activeAggergationBuckets).reduce((obj, [key, value]) => {
            obj[key] = value;

            return obj;
          }, {});

    const searchRequestObject = {
      from: fromCurrent,
      size: this.pageSize,
      searchTerm: searchTerm,
      aggregationFilters: aggJson,
      rangeFilters: activeRangeFilters,
      enableHighlighting: true,
      apiCallTime: new Date().toUTCString(),
    };
    return this.httpClient.post<any>(
      this.baseUrl + 'search',
      searchRequestObject
    );
  }

  fetchAutoCompleteResults(searchTerm: string): Observable<string[]> {
    return this.httpClient
      .get<string[]>(this.baseUrl + 'search/suggest?q=' + searchTerm)
      .pipe(
        map((r) => {
          if (r.length === 0 || searchTerm === r[0]) {
            return r;
          }
          return [searchTerm].concat(r);
        })
      );
  }

  searchDocument(pidUri: any): Observable<SearchResult> {
    return this.httpClient
      .get<DocumentMap>(this.baseUrl + 'document?id=' + pidUri)
      .pipe(
        map((result) => {
          var output = {
            hits: {
              hits: [
                {
                  id: pidUri,
                  score: 0,
                  source: result,
                  highlight: {},
                  index: '',
                  innerHits: {},
                  matchedQueries: [],
                  nested: null,
                  primaryTerm: null,
                  routing: null,
                  sequenceNumber: null,
                  sorts: [],
                  type: '_doc',
                  version: 0,
                },
              ],
              total: 1,
            },
            originalSearchTerm: null,
            suggestedSearchTerm: null,
            aggregations: [], //done
            rangeFilters: [],
            suggest: {},
          };
          return output;
        })
      );
  }

  getFilterItems(): Observable<AggregationsResultDto> {
    return this.httpClient.get<AggregationsResultDto>(
      this.baseUrl + 'search/aggregations'
    );
  }

  fetchLinkedTableandColumnResourceById(id: any) {
    const url =
      environment.colidApiUrl +
      `resource/linkedTableAndColumnResource?pidUri=${id}`;
    return this.httpClient.get<any>(url);
  }

  fetchSchemaUIItems(resourceIdList: any): Observable<any> {
    const uri = this.baseUrl + 'getSchemaUIResource';
    return this.httpClient.post<any>(uri, resourceIdList);
  }
}
