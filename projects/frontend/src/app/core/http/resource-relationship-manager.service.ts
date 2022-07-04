import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { environment } from 'projects/frontend/src/environments/environment';
import { Observable, of } from 'rxjs';
import { GraphMapDTO } from '../../shared/models/graph-map';
import { LinkEditHistoryDto } from '../../shared/models/link-editing-history';
import { LinkTypesDto, UriName } from '../../shared/models/link-types-dto';
import { NodeLinkContainer } from '../../shared/models/node-link-container';
import { ResourceDto } from '../../shared/models/resource-dto';
import { GraphState } from '../../state/store-items';
import { Link, Node } from '../d3';
import Resource from '../d3/models/resource';
import * as graphVisualisationActions from '../../state/graph-visualisation/graph-visualisation.actions';
import * as graphDataActions from '../../state/graph-data/graph-data.actions';
import { GraphMapInfo } from '../../shared/models/graph-map-info';
import { allMaps, linkTypesFixture, mapFixture, userMaps } from './fixtures/maps-fixture';
import { addRecourceFixture } from './fixtures/add-resource-fixture';
import { GraphMapSearchDTO } from '../../shared/models/graph-map-search-dto';


@Injectable({
  providedIn: 'root'
})
export class ResourceRelationshipManagerService {

  private readonly baseUrl = environment.resourceRelationshipManagerApi;

  constructor(
    private httpClient: HttpClient,
    private store: Store<GraphState>) { }

  getResource(): Observable<Resource> {
    return this.httpClient.get<Resource>('../../core/Resource.json');
  }
  getLinkTypes(pidUris: string[]): Observable<LinkTypesDto[]> {
    const url = environment.resourceRelationshipManagerApi + '/api/GraphMap/LinkResourceTypes';
    if (environment.environment == 'local') {
      return of(linkTypesFixture);
    }
    return this.httpClient.post<LinkTypesDto[]>(url, { sourceUri: pidUris[0], targetUri: pidUris[1] });
  }

  /**
   * Extracts all link and node objects from a list of Resource DTOs. Used to prepare the data coming from the
   * API for insertion into the graph map
   *
   * @param resources A container object containing the links and nodes extracted from the list of resource DTOs
   */
  convertResourceDtoToLinksAndNodes(resources: ResourceDto[]): NodeLinkContainer {
    let newNodes: Node[] = [];
    let newLinks: Link[] = [];
    resources.forEach(i => {
      let node: Node = new Node(i.resourceIdentifier);

      //set basic attributes for node
      node.name = i.name;
      node.resourceIdentifier = i.resourceIdentifier;
      node.resourceType = i.resourceType;
      node.pidUri = i.pidUri;


      i.links.forEach(l => {
        let link: Link = new Link(l.startNode.value, l.endNode.value, l.type);
        //TODO: Populate link source name and link target name
        link.sourceName = l.startNode.name;
        link.targetName = l.endNode.name;
        newLinks.push(link);
        node.links.push(link);
      });

      if (i.laterVersion) {
        let versionLink: Link = new Link(i.resourceIdentifier, i.laterVersion.pidUri, {
          name: i.laterVersion.version,
          value: i.laterVersion.id
        });
        versionLink.isVersionLink = true;
        newLinks.push(versionLink);
        node.links.push(versionLink);
      }

      // if (i.previousVersion) {
      //   let versionLink: Link = new Link(i.previousVersion.pidUri, i.resourceIdentifier, {
      //     name: i.previousVersion.version,
      //     value: i.previousVersion.id
      //   });
      //   versionLink.isVersionLink = true;
      //   newLinks.push(versionLink);
      //   node.links.push(versionLink);
      // }

      node.linkCount = node.links.length;
      newNodes.push(node);
    });

    let response: NodeLinkContainer = new NodeLinkContainer();
    //do not have duplicates added
    response.links = newLinks.filter((link, index, self) => index === self.findIndex((t) => (
      t.source === link.source && t.target === link.target && t.name.value === link.name.value
    )));
    response.nodes = newNodes;

    return response;
  }

  saveLinks(items: LinkEditHistoryDto[]): Observable<any> {
    const url: string = this.baseUrl + '/api/GraphMap/ManageResourceLinking';
    return this.httpClient.post<any>(url, items);
  }

  deleteLink(linkStart: string, linkType: string, linkEnd: string): Observable<any> {
    const url = this.baseUrl + '/api/GraphMap/UnlinkResource';
    const payload = {
      pidUri: linkStart,
      linkType: linkType,
      pidUriToUnLink: linkEnd
    };
    return this.httpClient.post<any>(url, payload);
  }

  getCheckedResources(
    resourceSearchObject: string[]
  ): Observable<ResourceDto[]> {
    const url = environment.resourceRelationshipManagerApi + '/api/GraphMap/FetchResources';
    if (environment.environment == 'local') {
      return of(addRecourceFixture);
    }
    return this.httpClient.post<ResourceDto[]>(
      url,
      resourceSearchObject
    );
  }

  /**
   * Takes a list of PID URIs, loads them from the DB and places them on the graph
   * @param pidUris list of PID URIs
   */
  loadResources(pidUris: string[]) {
    this.store.dispatch(graphVisualisationActions.StartLoading());
    this.getCheckedResources(pidUris).subscribe(
      (res: ResourceDto[]) => {
        let converted: NodeLinkContainer = this.convertResourceDtoToLinksAndNodes(res);
        this.store.dispatch(graphDataActions.AddNodes({ nodes: converted.nodes }));
        this.store.dispatch(graphDataActions.AddLinks({ links: converted.links }));
        this.store.dispatch(graphVisualisationActions.EndLoading());
      }
    );
  }

  removeNullProperties(obj: any): object {
    const outParams: any = {};
    return Object.getOwnPropertyNames(obj).reduce((p, key) => {
      const value = obj[key];
      if (value == null || value == "") {
        outParams[key] = undefined;
      } else {
        outParams[key] = value;
      }
      return outParams;
    }, outParams);
  }

  getGraphs(): Observable<GraphMapInfo[]> {
    const url = environment.resourceRelationshipManagerApi + '/api/GraphMap/All';
    if (environment.environment == 'local') {
      return of(allMaps);
    }
    return this.httpClient.get<GraphMapInfo[]>(url);
  }

  getGraphsPage(offset: number, currentSearchParam: GraphMapSearchDTO): Observable<GraphMapInfo[]> {
    if (environment.environment == 'local') {
      let sortFct = (arr: GraphMapInfo[]) => arr;
      if (currentSearchParam.sortType != '') {
        const compareValue = <T>(a: T, b: T) => {
          if (typeof a == 'number' && typeof b == 'number') return a - b;
          if (typeof a == 'string' && typeof b == 'string') return a.localeCompare(b);
          return 0;
        }

        const compareFn = (a: string | number | Date, b: string | number | Date) => (currentSearchParam.sortType == 'asc' ? compareValue(a, b) : compareValue(b, a));
        const compareGraphMapInfo = (a: GraphMapInfo, b: GraphMapInfo) => (currentSearchParam.sortKey == 'name' || currentSearchParam.sortKey == 'modifiedAt' || currentSearchParam.sortKey == 'modifiedBy') ? compareFn(a[currentSearchParam.sortKey], b[currentSearchParam.sortKey]) : 0 // 

        sortFct = (arr: GraphMapInfo[]) => [...arr].sort(compareGraphMapInfo);
      }
      // console.log(currentSearchParam.nameFilter.trim());
      return of(sortFct([...allMaps, ...allMaps, ...allMaps].filter(str => str.name.toLowerCase().includes(currentSearchParam.nameFilter.trim().toLowerCase()))).slice(offset, offset + currentSearchParam.batchSize));
    }
    const url = environment.resourceRelationshipManagerApi + '/api/GraphMap/Page';
    let params: HttpParams = new HttpParams();
    params = params.append('offset', offset.toString());
    return this.httpClient.post<GraphMapInfo[]>(url, currentSearchParam, { params: params });
  }

  getGraph(graphMapId: string): Observable<GraphMapDTO> {
    if (environment.environment == 'local') {
      return of(mapFixture);
    } else {
      const url = environment.resourceRelationshipManagerApi + '/api/GraphMap';
      let params: HttpParams = new HttpParams();
      params = params.append('id', graphMapId);
      return this.httpClient.get<GraphMapDTO>(url, { params: params });
    }

  }

  getGraphsForUser(
    userName: string,
    limit: number = 10,
    offset: number = 0
  ): Observable<GraphMapInfo[]> {
    if (environment.environment == 'local') {
      return of(userMaps);
    }
    const url = environment.resourceRelationshipManagerApi + '/api/GraphMap/GraphsForUser?userName=' + userName;
    return this.httpClient.get<GraphMapInfo[]>(url);
  }

  saveGraphMap(map: GraphMapDTO): Observable<GraphMapDTO> {
    const url = environment.resourceRelationshipManagerApi + '/api/GraphMap';
    return this.httpClient.put<GraphMapDTO>(url, map);
  }

  deleteGraphMap(graphMapId: string): Observable<unknown> {
    if (environment.environment == 'local') {
      return of(null)
    } else {
      const url = environment.resourceRelationshipManagerApi + '/api/GraphMap/Delete';
      let params: HttpParams = new HttpParams();
      params = params.append('id', graphMapId);
      return this.httpClient.delete(url, { params: params });
    }
  }

  getGraphsForResource(resourceIdentifier: string): Observable<GraphMapInfo[]> {
    if (environment.environment == 'local') {
      return of(allMaps);
    } else {
      const url = environment.resourceRelationshipManagerApi + '/api/GraphMap/GraphsForResource';
      let params: HttpParams = new HttpParams();
      params = params.append('pidUri', resourceIdentifier);
      return this.httpClient.get<GraphMapInfo[]>(url, { params: params });
    }
  }
}
