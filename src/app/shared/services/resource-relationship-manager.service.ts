import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { BehaviorSubject, Observable } from 'rxjs';
import { LinkEditHistoryDto } from '../models/link-editing-history';
import { LinkTypesDto } from '../models/link-types-dto';
import { Node } from '../../core/d3';
import { GraphMapInfo } from '../models/graph-map-info';
import { GraphMapSearchDTO } from '../models/graph-map-search-dto';
import { GraphMapV2 } from '../models/graph-map-v2';
import { GraphMapV2SaveDto } from '../models/gaph-map-v2-save-dto';
import { Store } from '@ngxs/store';

@Injectable({
  providedIn: 'root'
})
export class ResourceRelationshipManagerService {
  private readonly baseUrl = environment.resourceRelationshipManagerApi;

  private _pidUrisToLoadResources$: BehaviorSubject<string[]> =
    new BehaviorSubject<string[]>([]);

  public get pidUrisToLoadResources$(): Observable<string[]> {
    return this._pidUrisToLoadResources$.asObservable();
  }

  public set pidUrisToLoadResources$(value: string[]) {
    this._pidUrisToLoadResources$.next(value);
  }

  constructor(
    private httpClient: HttpClient,
    private store: Store
  ) {}

  /*****************
   *   Resources   *
   *****************/

  getResources(pidUris: string[]): Observable<Node[]> {
    const url = '/api/GraphMap/FetchResources';

    return this.httpClient.post<Node[]>(this.baseUrl + url, pidUris);
  }

  /*************
   *   Links   *
   *************/

  getLinkTypes(pidUris: string[]): Observable<LinkTypesDto[]> {
    const url = '/api/GraphMap/LinkResourceTypes';

    return this.httpClient.post<LinkTypesDto[]>(this.baseUrl + url, {
      sourceUri: pidUris[0],
      targetUri: pidUris[1]
    });
  }

  saveLinks(items: LinkEditHistoryDto[]): Observable<any> {
    const url = '/api/GraphMap/ManageResourceLinking';

    return this.httpClient.post<any>(this.baseUrl + url, items);
  }

  /******************
   *   Graph Maps   *
   ******************/

  getGraphMap(graphId: string): Observable<GraphMapV2> {
    const url = '/api/GraphMap/GetRelationMapById';
    const params: HttpParams = new HttpParams().set('relationMapId', graphId);

    return this.httpClient.get<any>(this.baseUrl + url, { params: params });
  }

  getAllGraphMaps(): Observable<GraphMapInfo[]> {
    const url = '/api/GraphMap/All';
    const params: HttpParams = new HttpParams().set('limit', 9999);

    return this.httpClient.get<GraphMapInfo[]>(this.baseUrl + url, {
      params: params
    });
  }

  getGraphMapsPage(
    offset: number,
    currentSearchParam: GraphMapSearchDTO
  ): Observable<GraphMapInfo[]> {
    const url = '/api/GraphMap/Page';
    const params: HttpParams = new HttpParams().set(
      'offset',
      offset.toString()
    );

    return this.httpClient.post<GraphMapInfo[]>(
      this.baseUrl + url,
      currentSearchParam,
      {
        params: params
      }
    );
  }

  getGraphMapsByUser(userName: string): Observable<GraphMapInfo[]> {
    const url = '/api/GraphMap/GraphsForUser';
    const params: HttpParams = new HttpParams().set('userName', userName);

    return this.httpClient.get<GraphMapInfo[]>(this.baseUrl + url, {
      params: params
    });
  }

  getGraphMapsByResource(pidUri: string): Observable<GraphMapInfo[]> {
    const url = '/api/GraphMap/GraphsForResource';
    const params: HttpParams = new HttpParams().set('pidUri', pidUri);

    return this.httpClient.get<GraphMapInfo[]>(this.baseUrl + url, {
      params: params
    });
  }

  saveGraphMap(map: GraphMapV2SaveDto): Observable<GraphMapV2> {
    const url = '/api/GraphMap/SaveRelationMap';

    return this.httpClient.put<GraphMapV2>(this.baseUrl + url, map);
  }

  deleteGraphMap(graphMapId: string): Observable<unknown> {
    const url = '/api/GraphMap/DeleteRelationMap';
    const params: HttpParams = new HttpParams().set(
      'relationMapId',
      graphMapId
    );

    return this.httpClient.delete(this.baseUrl + url, { params: params });
  }

  deleteGraphMapAsSuperAdmin(graphMapId: string) {
    const url = '/api/GraphMap/DeleteRelationMapAsSuperAdmin';
    const params: HttpParams = new HttpParams().set(
      'relationMapId',
      graphMapId
    );

    return this.httpClient.delete(this.baseUrl + url, { params: params });
  }
}
