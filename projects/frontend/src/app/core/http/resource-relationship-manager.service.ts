import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'projects/frontend/src/environments/environment';
import { Observable } from 'rxjs';
import { GraphMapDTO } from '../../shared/models/graph-map';
import { LinkEditHistoryDto } from '../../shared/models/link-editing-history';
import { LinkTypesDto } from '../../shared/models/link-types-dto';
import { NodeLinkContainer } from '../../shared/models/node-link-container';
import { Link, Node } from '../d3';
import Resource from '../d3/models/resource';
import { GraphMapInfo } from '../../shared/models/graph-map-info';
import { GraphMapSearchDTO } from '../../shared/models/graph-map-search-dto';
import { GraphMapV2 } from '../../shared/models/graph-map-v2';
import { GraphMapV2SaveDto } from '../../shared/models/gaph-map-v2-save-dto';
import { Store } from '@ngxs/store';
import { AddLinks, AddNodes } from '../../state/graph-data.state';
import {
  EndLoading,
  StartLoading,
} from '../../state/graph-visualisation.state';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class ResourceRelationshipManagerService {
  private readonly baseUrl = environment.resourceRelationshipManagerApi;

  constructor(private httpClient: HttpClient, private store: Store) {}

  getResource(): Observable<Resource> {
    return this.httpClient.get<Resource>('../../core/Resource.json');
  }
  getLinkTypes(pidUris: string[]): Observable<LinkTypesDto[]> {
    const url =
      environment.resourceRelationshipManagerApi +
      '/api/GraphMap/LinkResourceTypes';
    return this.httpClient.post<LinkTypesDto[]>(url, {
      sourceUri: pidUris[0],
      targetUri: pidUris[1],
    });
  }

  /**
   * Extracts all link and node objects from a list of Resource DTOs. Used to prepare the data coming from the
   * API for insertion into the graph map
   *
   * @param resources A container object containing the links and nodes extracted from the list of resource DTOs
   */
  convertResourceDtoToLinksAndNodes(resources: Node[]): NodeLinkContainer {
    let versionLinkNodes = resources
      .filter((node) => node.laterVersion != '')
      .reduce((map, obj) => {
        map[obj.id] = obj.laterVersion;
        return map;
      }, {});
    let newLinks: Link[] = [];

    resources.forEach((n) => {
      n.links.forEach((l) => {
        //if (l.outbound) {
        let link = Object.assign(new Link(), JSON.parse(JSON.stringify(l)));
        if (
          link.isVersionLink &&
          (!(link.source in versionLinkNodes) ||
            link.target != versionLinkNodes[link.source])
        ) {
          link.display = false;
        }
        newLinks.push(link);
        //}
      });
    });

    let response: NodeLinkContainer = new NodeLinkContainer();

    response.links = newLinks.filter(
      (link, index, self) =>
        index ===
        self.findIndex(
          (t) =>
            t.source === link.source &&
            t.target === link.target &&
            t.linkTypeId === link.linkTypeId
        )
    );
    response.nodes = resources;

    return response;
  }

  saveLinks(items: LinkEditHistoryDto[]): Observable<any> {
    try {
      const url: string = this.baseUrl + '/api/GraphMap/ManageResourceLinking';
      return this.httpClient.post<any>(url, items);
    } catch (e) {
      console.log('this is and error', e);
    }
  }

  deleteLink(
    linkStart: string,
    linkType: string,
    linkEnd: string
  ): Observable<any> {
    const url = this.baseUrl + '/api/GraphMap/UnlinkResource';
    const payload = {
      pidUri: linkStart,
      linkType: linkType,
      pidUriToUnLink: linkEnd,
    };
    return this.httpClient.post<any>(url, payload);
  }

  getCheckedResources(resourceSearchObject: string[]): Observable<any[]> {
    const url =
      environment.resourceRelationshipManagerApi +
      '/api/GraphMap/FetchResources';
    return this.httpClient.post<Node[]>(url, resourceSearchObject);
  }

  /**
   * Takes a list of PID URIs, loads them from the DB and places them on the graph
   * @param pidUris list of PID URIs
   */
  async loadResources(pidUris: string[]) {
    this.store.dispatch(new StartLoading());
    await this.getCheckedResources(pidUris)
      .pipe(
        tap((res: Node[]) => {
          let converted: NodeLinkContainer =
            this.convertResourceDtoToLinksAndNodes(res);
          this.store.dispatch(new AddNodes(converted.nodes));
          this.store.dispatch(new AddLinks(converted.links));
          this.store.dispatch(new EndLoading());
        })
      )
      .toPromise();
  }

  removeNullProperties(obj: any): object {
    const outParams: any = {};
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

  getGraphs(): Observable<GraphMapInfo[]> {
    const url =
      environment.resourceRelationshipManagerApi + '/api/GraphMap/All';
    return this.httpClient.get<GraphMapInfo[]>(url);
  }

  getGraphsPage(
    offset: number,
    currentSearchParam: GraphMapSearchDTO
  ): Observable<GraphMapInfo[]> {
    const url =
      environment.resourceRelationshipManagerApi + '/api/GraphMap/Page';
    let params: HttpParams = new HttpParams();
    params = params.append('offset', offset.toString());
    return this.httpClient.post<GraphMapInfo[]>(url, currentSearchParam, {
      params: params,
    });
  }

  getGraph(graphMapId: string): Observable<GraphMapDTO> {
    const url = environment.resourceRelationshipManagerApi + '/api/GraphMap';
    let params: HttpParams = new HttpParams();
    params = params.append('id', graphMapId);
    return this.httpClient.get<GraphMapDTO>(url, { params: params });
  }

  /** New API Endpoint for retrieving a single map
   *
   * @param graphId ID of the map
   * @returns
   */
  getGraphv2(graphId: string): Observable<any> {
    const url =
      environment.resourceRelationshipManagerApi +
      '/api/GraphMap/GetRelationMapById';
    let params: HttpParams = new HttpParams();
    params = params.append('relationMapId', graphId);
    return this.httpClient.get<any>(url, { params: params });
  }

  getGraphsForUser(
    userName: string,
    limit: number = 10,
    offset: number = 0
  ): Observable<GraphMapInfo[]> {
    const url =
      environment.resourceRelationshipManagerApi +
      '/api/GraphMap/GraphsForUser?userName=' +
      userName;
    return this.httpClient.get<GraphMapInfo[]>(url);
  }

  saveGraphMap(map: GraphMapDTO): Observable<GraphMapDTO> {
    const url = environment.resourceRelationshipManagerApi + '/api/GraphMap';
    return this.httpClient.put<GraphMapDTO>(url, map);
  }

  saveGraphMapV2(map: GraphMapV2SaveDto): Observable<GraphMapV2> {
    const url =
      environment.resourceRelationshipManagerApi +
      '/api/GraphMap/SaveRelationMap';
    return this.httpClient.put<GraphMapV2>(url, map);
  }

  deleteGraphMap(graphMapId: string): Observable<unknown> {
    const url =
      environment.resourceRelationshipManagerApi +
      '/api/GraphMap/DeleteRelationMap';
    let params: HttpParams = new HttpParams();
    params = params.append('relationMapId', graphMapId);
    return this.httpClient.delete(url, { params: params });
  }

  deleteGraphMapAsSuperAdmin(graphMapId: string) {
    const url =
      environment.resourceRelationshipManagerApi +
      '/api/GraphMap/DeleteRelationMapAsSuperAdmin';
    let params: HttpParams = new HttpParams().set('relationMapId', graphMapId);
    return this.httpClient.delete(url, { params });
  }

  getGraphsForResource(resourceIdentifier: string): Observable<GraphMapInfo[]> {
    const url =
      environment.resourceRelationshipManagerApi +
      '/api/GraphMap/GraphsForResource';
    let params: HttpParams = new HttpParams();
    params = params.append('pidUri', resourceIdentifier);
    return this.httpClient.get<GraphMapInfo[]>(url, { params: params });
  }
}
