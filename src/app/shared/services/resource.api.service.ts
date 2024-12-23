import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { ResourceOverviewCTO } from '../models/resource-overview-cto';
import { Observable } from 'rxjs';
import { ResourceSearchDTO } from '../models/dto/resource-search-dto';
import { CheckboxHierarchyDTO } from '../models/dto/checkboxHierarchy-dto';
import { LinkHistoryDto } from '../models/link-history-dto';
import { ResourceRevisionHistory } from '../models/dto/historic-resource-overview-dto';

@Injectable({
  providedIn: 'root'
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

  getLinkHistory(
    startPidUri: string,
    endPidUri?: string
  ): Observable<LinkHistoryDto[]> {
    const url = `${environment.colidApiUrl}resource/linkHistory`;
    const params = endPidUri
      ? new HttpParams()
          .set('startPidUri', decodeURIComponent(startPidUri))
          .set('endPidUri', decodeURIComponent(endPidUri))
      : new HttpParams().set('startPidUri', decodeURIComponent(startPidUri));

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

  getResourceRevisionHistory(
    resourcePidUri: string
  ): Observable<ResourceRevisionHistory[]> {
    const url = `${environment.colidApiUrl}resource/resourcerevisionshistory`;
    let params = new HttpParams().set('pidUri', resourcePidUri);
    return this.httpClient.get<ResourceRevisionHistory[]>(url, { params });
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

  rejectResourcesMarkedDeleted(resourcePidUris: string[]): Observable<any> {
    const url = environment.colidApiUrl + '/resource/resourceList/reject';
    return this.httpClient.put(url, resourcePidUris);
  }

  deleteResource(resourcePidUri: string, requester: string): Observable<any> {
    const url = environment.colidApiUrl + '/resource';
    let params = new HttpParams();
    params = params.append('pidUri', resourcePidUri);
    params = params.append('requester', requester);
    return this.httpClient.delete(url, { params });
  }

  deleteResources(
    resourcePidUris: string[],
    requester: string
  ): Observable<any> {
    const url = environment.colidApiUrl + '/resource/resourceList';
    let params = new HttpParams();
    params = params.append('requester', requester);

    return this.httpClient.put(url, resourcePidUris, { params });
  }

  markResourceAsDeleted(
    resourcePidUri: string,
    requester: string
  ): Observable<any> {
    const url = environment.colidApiUrl + '/resource/markForDeletion';
    let params = new HttpParams();
    params = params.append('pidUri', resourcePidUri);
    params = params.append('requester', requester);

    return this.httpClient.put(url, null, { params });
  }

  unlinkResource(pidUri: string): Observable<string> {
    const url = environment.colidApiUrl + '/resource/version/unlink';
    let params = new HttpParams();
    params = params.append('pidUri', pidUri);
    return this.httpClient.put<string>(url, null, { params });
  }
}
