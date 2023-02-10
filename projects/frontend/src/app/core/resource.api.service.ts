import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { ResourceOverviewCTO } from './../shared/resource-overview-cto';
import { Observable } from 'rxjs';
import { ResourceSearchDTO } from './../shared/resource-search-dto';
import { CheckboxHierarchyDTO } from './../shared/checkboxHierarchy-dto';
import { LinkHistoryDto } from '../shared/models/link-history-dto';

@Injectable({
  providedIn: 'root',
})
export class ResourceApiService {
  constructor(private httpClient: HttpClient) {}

  createNewLink(
    sourcePidUri: string,
    linkType: string,
    targetPidUri: string,
    requester: string
  ) {
    const url = `${environment.colidApiUrl}resource/addLink`;
    const params = new HttpParams()
      .set('pidUri', sourcePidUri)
      .set('linkType', linkType)
      .set('pidUriToLink', targetPidUri)
      .set('requester', requester);

    return this.httpClient.post(url, {}, { params: params });
  }

  getLinkHistory(resourcePidUri: string): Observable<LinkHistoryDto[]> {
    const url = `${environment.colidApiUrl}resource/linkHistory`;
    const params = new HttpParams().set(
      'pidUri',
      decodeURIComponent(resourcePidUri)
    );

    return this.httpClient.get<LinkHistoryDto[]>(url, { params });
  }

  getFilteredResources(
    resourceSearchObject: ResourceSearchDTO
  ): Observable<ResourceOverviewCTO> {
    const url = environment.colidApiUrl + '/resource/search';

    const params = this.removeNullProperties(resourceSearchObject);
    return this.httpClient.post<ResourceOverviewCTO>(
      url,
      JSON.stringify(params)
    );
  }

  getHierarchy(): Observable<CheckboxHierarchyDTO[]> {
    return this.httpClient.get<CheckboxHierarchyDTO[]>(
      environment.colidApiUrl + 'metadata/hierarchyDmp'
    );
  }

  toHttpParams(obj: Object): HttpParams {
    return Object.getOwnPropertyNames(obj).reduce((p, key) => {
      const value = obj[key];
      if (Array.isArray(value)) {
        value.forEach((_value) => {
          p = p.append(key, _value);
        });
      } else {
        if (value != null) {
          p = p.set(key, value);
        }
      }
      return p;
    }, new HttpParams());
  }
  removeNullProperties(obj: object): object {
    const outParams = {};
    return Object.getOwnPropertyNames(obj).reduce((p, key) => {
      const value = obj[key];
      if (value == null || value == '') {
        outParams[key] = undefined;
      } else {
        outParams[key] = value;
      }
      return outParams;
    }, outParams);
  }
}
