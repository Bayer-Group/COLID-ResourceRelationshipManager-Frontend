import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { MetaDataProperty } from '../shared/models/meta-data-property';
import { FilterGroupingOrderRaw } from '../shared/models/filter-grouping-order-raw';

@Injectable({
  providedIn: 'root',
})
export class MetadataService {
  private readonly baseUrl = environment.dmpCoreApiUrl;

  constructor(private httpClient: HttpClient) {}

  getMetadata(): Observable<any> {
    return this.httpClient.get<any>(this.baseUrl + 'metadata');
  }

  getEntityMetadata(resourceType: string): Observable<MetaDataProperty[]> {
    const url = `${environment.colidApiUrl}metadata`;
    const params = new HttpParams().set('entityType', resourceType);
    return this.httpClient.get<MetaDataProperty[]>(url, { params });
  }

  getMetadataTypes(): Observable<any> {
    return this.httpClient.get<any>(this.baseUrl + 'metadata/types');
  }

  getFilterGroups() {
    const url = `${environment.dmpCoreApiUrl}Search/filterGroup`;
    return this.httpClient.get<FilterGroupingOrderRaw[]>(url);
  }
}
