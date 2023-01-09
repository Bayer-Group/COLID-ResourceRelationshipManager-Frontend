import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'projects/frontend/src/environments/environment';
import { Observable, of } from 'rxjs';
import { GraphMapDTO } from '../../shared/models/graph-map';
import { LinkEditHistoryDto } from '../../shared/models/link-editing-history';
import { LinkTypesDto } from '../../shared/models/link-types-dto';
import { NodeLinkContainer } from '../../shared/models/node-link-container';
import { Link, Node } from '../d3';
import Resource from '../d3/models/resource';
import { GraphMapInfo } from '../../shared/models/graph-map-info';
import { allMaps, linkTypesFixture, userMaps } from './fixtures/maps-fixture';
import { GraphMapSearchDTO } from '../../shared/models/graph-map-search-dto';
import { GraphMapV2 } from '../../shared/models/graph-map-v2';
import { GraphMapV2SaveDto } from '../../shared/models/gaph-map-v2-save-dto';
import { Store } from '@ngxs/store';
import { AddLinks, AddNodes } from '../../state/graph-data.state';
import { EndLoading, StartLoading } from '../../state/graph-visualisation.state';


@Injectable({
  providedIn: 'root'
})
export class ResourceRelationshipManagerService {

  private readonly baseUrl = environment.resourceRelationshipManagerApi;

  constructor(
    private httpClient: HttpClient,
    private store: Store) { }

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
  convertResourceDtoToLinksAndNodes(resources: Node[]): NodeLinkContainer {
    let newLinks: Link[] = [];

    resources.forEach(n => {
      n.links.forEach(l => {
        //if (l.outbound) {
        newLinks.push(Object.assign(new Link, JSON.parse(JSON.stringify(l))));
        //}
      });
    });

    let response: NodeLinkContainer = new NodeLinkContainer();

    response.links = newLinks.filter((link, index, self) => index === self.findIndex((t) => (
      t.source === link.source && t.target === link.target && t.linkTypeId === link.linkTypeId
    )));
    response.nodes = resources;

    return response;
  }

  saveLinks(items: LinkEditHistoryDto[]): Observable<any> {
    try {
      const url: string = this.baseUrl + '/api/GraphMap/ManageResourceLinking';
      return this.httpClient.post<any>(url, items);
    } catch (e) {
      console.log("this is and error", e);

    }
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
  ): Observable<any[]> {
    const url = environment.resourceRelationshipManagerApi + '/api/GraphMap/FetchResources';
    /*if (environment.environment == 'local') {
      return of([
        {
          "id": "https://dev-pid.bayer.com/00d17c57-416f-4f30-9f23-c2a30012f9b8/",
          "shortName": "pur",
          "name": "purch_ord_line",
          "resourceType": {
            "key": "https://pid.bayer.com/kos/19050/444586",
            "value": "Table"
          },
          "links": [
            {
              "source": "https://dev-pid.bayer.com/00d17c57-416f-4f30-9f23-c2a30012f9b8/",
              "target": "https://dev-pid.bayer.com/02e581d4-f6b0-4f7c-8635-c5c90624bbb2/",
              "linkType": {
                "key": "https://pid.bayer.com/kos/19050/GenericDataset",
                "value": "Generic Dataset"
              },
              "outbound": true,
              "isVersionLink": false
            },
            {
              "source": "https://dev-pid.bayer.com/00d17c57-416f-4f30-9f23-c2a30012f9b8/",
              "target": "https://dev-pid.bayer.com/73a10e57-59eb-4475-ab3c-b51248d06f9a/",
              "linkType": {
                "key": "https://pid.bayer.com/kos/19050/CropScienceDataset",
                "value": "Crop Science Dataset"
              },
              "outbound": true,
              "isVersionLink": false
            },
            {
              "source": "https://dev-pid.bayer.com/00d17c57-416f-4f30-9f23-c2a30012f9b8/",
              "target": "https://dev-pid.bayer.com/9f250072-c5f9-4afd-b83e-22e75a62837c/",
              "linkType": {
                "key": "https://pid.bayer.com/kos/19050/444582",
                "value": "Column"
              },
              "outbound": false,
              "isVersionLink": false
            },
            {
              "source": "https://dev-pid.bayer.com/00d17c57-416f-4f30-9f23-c2a30012f9b8/",
              "target": "https://dev-pid.bayer.com/cfc96354-b5d2-4f77-bb00-c684fcdd01ec/",
              "linkType": {
                "key": "https://pid.bayer.com/kos/19050/444582",
                "value": "Column"
              },
              "outbound": false,
              "isVersionLink": false
            },
            {
              "source": "https://dev-pid.bayer.com/00d17c57-416f-4f30-9f23-c2a30012f9b8/",
              "target": "https://dev-pid.bayer.com/9db0313d-96d2-41e6-b9f4-003b10112d77/",
              "linkType": {
                "key": "https://pid.bayer.com/kos/19050/444582",
                "value": "Column"
              },
              "outbound": false,
              "isVersionLink": false
            },
            {
              "source": "https://dev-pid.bayer.com/00d17c57-416f-4f30-9f23-c2a30012f9b8/",
              "target": "https://dev-pid.bayer.com/7b510be4-dcfb-4051-87cf-9271c1844ebd/",
              "linkType": {
                "key": "https://pid.bayer.com/kos/19050/444582",
                "value": "Column"
              },
              "outbound": false,
              "isVersionLink": false
            },
            {
              "source": "https://dev-pid.bayer.com/00d17c57-416f-4f30-9f23-c2a30012f9b8/",
              "target": "https://dev-pid.bayer.com/dbdbaa60-2c2d-4cf0-906c-0c940e0db391/",
              "linkType": {
                "key": "https://pid.bayer.com/kos/19050/444582",
                "value": "Column"
              },
              "outbound": false,
              "isVersionLink": false
            },
            {
              "source": "https://dev-pid.bayer.com/00d17c57-416f-4f30-9f23-c2a30012f9b8/",
              "target": "https://dev-pid.bayer.com/3fdbdc3b-e87c-42bc-8de4-104392ca29f1/",
              "linkType": {
                "key": "https://pid.bayer.com/kos/19050/444582",
                "value": "Column"
              },
              "outbound": false,
              "isVersionLink": false
            },
            {
              "source": "https://dev-pid.bayer.com/00d17c57-416f-4f30-9f23-c2a30012f9b8/",
              "target": "https://dev-pid.bayer.com/615d65ac-4e69-409b-8f84-e6d9b96226e1/",
              "linkType": {
                "key": "https://pid.bayer.com/kos/19050/444582",
                "value": "Column"
              },
              "outbound": false,
              "isVersionLink": false
            },
            {
              "source": "https://dev-pid.bayer.com/00d17c57-416f-4f30-9f23-c2a30012f9b8/",
              "target": "https://dev-pid.bayer.com/4d987503-7158-4a44-b595-8139d68cc81f/",
              "linkType": {
                "key": "https://pid.bayer.com/kos/19050/444582",
                "value": "Column"
              },
              "outbound": false,
              "isVersionLink": false
            },
            {
              "source": "https://dev-pid.bayer.com/00d17c57-416f-4f30-9f23-c2a30012f9b8/",
              "target": "https://dev-pid.bayer.com/c2b8b625-e7d8-4d27-8830-4b5dd532c516/",
              "linkType": {
                "key": "https://pid.bayer.com/kos/19050/444582",
                "value": "Column"
              },
              "outbound": false,
              "isVersionLink": false
            },
            {
              "source": "https://dev-pid.bayer.com/00d17c57-416f-4f30-9f23-c2a30012f9b8/",
              "target": "https://dev-pid.bayer.com/a2eaabda-f8fd-4b33-bff3-36a25e2149ff/",
              "linkType": {
                "key": "https://pid.bayer.com/kos/19050/444582",
                "value": "Column"
              },
              "outbound": false,
              "isVersionLink": false
            },
            {
              "source": "https://dev-pid.bayer.com/00d17c57-416f-4f30-9f23-c2a30012f9b8/",
              "target": "https://dev-pid.bayer.com/f8928ccb-b270-4041-bd57-fb5aee8d68e3/",
              "linkType": {
                "key": "https://pid.bayer.com/kos/19050/444582",
                "value": "Column"
              },
              "outbound": false,
              "isVersionLink": false
            },
            {
              "source": "https://dev-pid.bayer.com/00d17c57-416f-4f30-9f23-c2a30012f9b8/",
              "target": "https://dev-pid.bayer.com/443d5bef-cb62-48af-8536-24f726cdd2d2/",
              "linkType": {
                "key": "https://pid.bayer.com/kos/19050/444582",
                "value": "Column"
              },
              "outbound": false,
              "isVersionLink": false
            },
            {
              "source": "https://dev-pid.bayer.com/00d17c57-416f-4f30-9f23-c2a30012f9b8/",
              "target": "https://dev-pid.bayer.com/251e08bc-b2f0-487c-97d4-11b52a6f92b9/",
              "linkType": {
                "key": "https://pid.bayer.com/kos/19050/444582",
                "value": "Column"
              },
              "outbound": false,
              "isVersionLink": false
            },
            {
              "source": "https://dev-pid.bayer.com/00d17c57-416f-4f30-9f23-c2a30012f9b8/",
              "target": "https://dev-pid.bayer.com/e2c2ad59-c510-429b-beff-b1614c200604/",
              "linkType": {
                "key": "https://pid.bayer.com/kos/19050/444582",
                "value": "Column"
              },
              "outbound": false,
              "isVersionLink": false
            },
            {
              "source": "https://dev-pid.bayer.com/00d17c57-416f-4f30-9f23-c2a30012f9b8/",
              "target": "https://dev-pid.bayer.com/57e74723-df4d-494e-86d0-ef081c314d8a/",
              "linkType": {
                "key": "https://pid.bayer.com/kos/19050/444582",
                "value": "Column"
              },
              "outbound": false,
              "isVersionLink": false
            },
            {
              "source": "https://dev-pid.bayer.com/00d17c57-416f-4f30-9f23-c2a30012f9b8/",
              "target": "https://dev-pid.bayer.com/30176769-c7ef-4613-9c59-9c30dbca4f10/",
              "linkType": {
                "key": "https://pid.bayer.com/kos/19050/444582",
                "value": "Column"
              },
              "outbound": false,
              "isVersionLink": false
            },
            {
              "source": "https://dev-pid.bayer.com/00d17c57-416f-4f30-9f23-c2a30012f9b8/",
              "target": "https://dev-pid.bayer.com/532299f0-e2a9-4d17-a193-b44b07fb8651/",
              "linkType": {
                "key": "https://pid.bayer.com/kos/19050/444582",
                "value": "Column"
              },
              "outbound": false,
              "isVersionLink": false
            },
            {
              "source": "https://dev-pid.bayer.com/00d17c57-416f-4f30-9f23-c2a30012f9b8/",
              "target": "https://dev-pid.bayer.com/db917724-4e99-4a04-ab45-394942cf08e3/",
              "linkType": {
                "key": "https://pid.bayer.com/kos/19050/444582",
                "value": "Column"
              },
              "outbound": false,
              "isVersionLink": false
            },
            {
              "source": "https://dev-pid.bayer.com/00d17c57-416f-4f30-9f23-c2a30012f9b8/",
              "target": "https://dev-pid.bayer.com/16c13cbe-c9e6-45ba-be21-4290054e17e1/",
              "linkType": {
                "key": "https://pid.bayer.com/kos/19050/444582",
                "value": "Column"
              },
              "outbound": false,
              "isVersionLink": false
            },
            {
              "source": "https://dev-pid.bayer.com/00d17c57-416f-4f30-9f23-c2a30012f9b8/",
              "target": "https://dev-pid.bayer.com/f745e16f-e733-4f28-94e2-4c131fc3137b/",
              "linkType": {
                "key": "https://pid.bayer.com/kos/19050/444582",
                "value": "Column"
              },
              "outbound": false,
              "isVersionLink": false
            },
            {
              "source": "https://dev-pid.bayer.com/00d17c57-416f-4f30-9f23-c2a30012f9b8/",
              "target": "https://dev-pid.bayer.com/c4db21f5-884e-4e90-b64a-c339d8e00085/",
              "linkType": {
                "key": "https://pid.bayer.com/kos/19050/444582",
                "value": "Column"
              },
              "outbound": false,
              "isVersionLink": false
            },
            {
              "source": "https://dev-pid.bayer.com/00d17c57-416f-4f30-9f23-c2a30012f9b8/",
              "target": "https://dev-pid.bayer.com/73baec1c-9073-4da7-a342-0935f9ed9400/",
              "linkType": {
                "key": "https://pid.bayer.com/kos/19050/444582",
                "value": "Column"
              },
              "outbound": false,
              "isVersionLink": false
            },
            {
              "source": "https://dev-pid.bayer.com/00d17c57-416f-4f30-9f23-c2a30012f9b8/",
              "target": "https://dev-pid.bayer.com/59deacc5-215a-42cd-9f1c-10c7b34f9487/",
              "linkType": {
                "key": "https://pid.bayer.com/kos/19050/444582",
                "value": "Column"
              },
              "outbound": false,
              "isVersionLink": false
            },
            {
              "source": "https://dev-pid.bayer.com/00d17c57-416f-4f30-9f23-c2a30012f9b8/",
              "target": "https://dev-pid.bayer.com/e9be32df-2257-4e38-a276-e4df8ea9ea27/",
              "linkType": {
                "key": "https://pid.bayer.com/kos/19050/444582",
                "value": "Column"
              },
              "outbound": false,
              "isVersionLink": false
            },
            {
              "source": "https://dev-pid.bayer.com/00d17c57-416f-4f30-9f23-c2a30012f9b8/",
              "target": "https://dev-pid.bayer.com/8aa30178-56d2-44ee-b75e-b220d1f442ad/",
              "linkType": {
                "key": "https://pid.bayer.com/kos/19050/444582",
                "value": "Column"
              },
              "outbound": false,
              "isVersionLink": false
            },
            {
              "source": "https://dev-pid.bayer.com/00d17c57-416f-4f30-9f23-c2a30012f9b8/",
              "target": "https://dev-pid.bayer.com/64bdae2f-d89b-4510-b443-550a377960b3/",
              "linkType": {
                "key": "https://pid.bayer.com/kos/19050/444582",
                "value": "Column"
              },
              "outbound": false,
              "isVersionLink": false
            },
            {
              "source": "https://dev-pid.bayer.com/00d17c57-416f-4f30-9f23-c2a30012f9b8/",
              "target": "https://dev-pid.bayer.com/b2e51e3d-cb6c-4bff-b98d-fb49b6700cc5/",
              "linkType": {
                "key": "https://pid.bayer.com/kos/19050/444582",
                "value": "Column"
              },
              "outbound": false,
              "isVersionLink": false
            },
            {
              "source": "https://dev-pid.bayer.com/00d17c57-416f-4f30-9f23-c2a30012f9b8/",
              "target": "https://dev-pid.bayer.com/8e366612-2bce-455f-8d74-7f697755d777/",
              "linkType": {
                "key": "https://pid.bayer.com/kos/19050/444582",
                "value": "Column"
              },
              "outbound": false,
              "isVersionLink": false
            },
            {
              "source": "https://dev-pid.bayer.com/00d17c57-416f-4f30-9f23-c2a30012f9b8/",
              "target": "https://dev-pid.bayer.com/4916b95f-c5a1-43c2-8d75-2c01b7a0e780/",
              "linkType": {
                "key": "https://pid.bayer.com/kos/19050/444582",
                "value": "Column"
              },
              "outbound": false,
              "isVersionLink": false
            },
            {
              "source": "https://dev-pid.bayer.com/00d17c57-416f-4f30-9f23-c2a30012f9b8/",
              "target": "https://dev-pid.bayer.com/c500a86b-5442-4aad-8d2f-a450a58f5c00/",
              "linkType": {
                "key": "https://pid.bayer.com/kos/19050/444582",
                "value": "Column"
              },
              "outbound": false,
              "isVersionLink": false
            },
            {
              "source": "https://dev-pid.bayer.com/00d17c57-416f-4f30-9f23-c2a30012f9b8/",
              "target": "https://dev-pid.bayer.com/b3eb6e52-455a-4f9b-80f8-96a7c6da5533/",
              "linkType": {
                "key": "https://pid.bayer.com/kos/19050/444582",
                "value": "Column"
              },
              "outbound": false,
              "isVersionLink": false
            },
            {
              "source": "https://dev-pid.bayer.com/00d17c57-416f-4f30-9f23-c2a30012f9b8/",
              "target": "https://dev-pid.bayer.com/54abe137-5f02-4cbe-aa52-f998a71a6197/",
              "linkType": {
                "key": "https://pid.bayer.com/kos/19050/444582",
                "value": "Column"
              },
              "outbound": false,
              "isVersionLink": false
            },
            {
              "source": "https://dev-pid.bayer.com/00d17c57-416f-4f30-9f23-c2a30012f9b8/",
              "target": "https://dev-pid.bayer.com/98548745-d8a2-426a-9ed5-c5b9b3961fbc/",
              "linkType": {
                "key": "https://pid.bayer.com/kos/19050/444582",
                "value": "Column"
              },
              "outbound": false,
              "isVersionLink": false
            },
            {
              "source": "https://dev-pid.bayer.com/00d17c57-416f-4f30-9f23-c2a30012f9b8/",
              "target": "https://dev-pid.bayer.com/63084011-9b1f-47db-aec9-e50e362fb55d/",
              "linkType": {
                "key": "https://pid.bayer.com/kos/19050/444582",
                "value": "Column"
              },
              "outbound": false,
              "isVersionLink": false
            },
            {
              "source": "https://dev-pid.bayer.com/00d17c57-416f-4f30-9f23-c2a30012f9b8/",
              "target": "https://dev-pid.bayer.com/82f3f2ab-af8c-4c1d-a0ba-a65b901b71e5/",
              "linkType": {
                "key": "https://pid.bayer.com/kos/19050/444582",
                "value": "Column"
              },
              "outbound": false,
              "isVersionLink": false
            },
            {
              "source": "https://dev-pid.bayer.com/00d17c57-416f-4f30-9f23-c2a30012f9b8/",
              "target": "https://dev-pid.bayer.com/44e5e36c-2185-4ba5-b91d-426017a939df/",
              "linkType": {
                "key": "https://pid.bayer.com/kos/19050/444582",
                "value": "Column"
              },
              "outbound": false,
              "isVersionLink": false
            },
            {
              "source": "https://dev-pid.bayer.com/00d17c57-416f-4f30-9f23-c2a30012f9b8/",
              "target": "https://dev-pid.bayer.com/dd9ab762-a8b6-497c-8015-827e8c6ff8f2/",
              "linkType": {
                "key": "https://pid.bayer.com/kos/19050/444582",
                "value": "Column"
              },
              "outbound": false,
              "isVersionLink": false
            },
            {
              "source": "https://dev-pid.bayer.com/00d17c57-416f-4f30-9f23-c2a30012f9b8/",
              "target": "https://dev-pid.bayer.com/5f829a3c-f8a2-4371-b265-9762db3d52d1/",
              "linkType": {
                "key": "https://pid.bayer.com/kos/19050/444582",
                "value": "Column"
              },
              "outbound": false,
              "isVersionLink": false
            },
            {
              "source": "https://dev-pid.bayer.com/00d17c57-416f-4f30-9f23-c2a30012f9b8/",
              "target": "https://dev-pid.bayer.com/9c37444b-ca19-4497-a260-865646cce042/",
              "linkType": {
                "key": "https://pid.bayer.com/kos/19050/444582",
                "value": "Column"
              },
              "outbound": false,
              "isVersionLink": false
            },
            {
              "source": "https://dev-pid.bayer.com/00d17c57-416f-4f30-9f23-c2a30012f9b8/",
              "target": "https://dev-pid.bayer.com/5ba88a55-fb43-47ba-8fa2-b48e91112cd9/",
              "linkType": {
                "key": "https://pid.bayer.com/kos/19050/444582",
                "value": "Column"
              },
              "outbound": false,
              "isVersionLink": false
            },
            {
              "source": "https://dev-pid.bayer.com/00d17c57-416f-4f30-9f23-c2a30012f9b8/",
              "target": "https://dev-pid.bayer.com/e35e0df8-5ab7-437a-8100-5e6252a060fc/",
              "linkType": {
                "key": "https://pid.bayer.com/kos/19050/444582",
                "value": "Column"
              },
              "outbound": false,
              "isVersionLink": false
            },
            {
              "source": "https://dev-pid.bayer.com/00d17c57-416f-4f30-9f23-c2a30012f9b8/",
              "target": "https://dev-pid.bayer.com/bc60bd58-9569-48f9-bdae-ef0cc6305245/",
              "linkType": {
                "key": "https://pid.bayer.com/kos/19050/444582",
                "value": "Column"
              },
              "outbound": false,
              "isVersionLink": false
            },
            {
              "source": "https://dev-pid.bayer.com/00d17c57-416f-4f30-9f23-c2a30012f9b8/",
              "target": "https://dev-pid.bayer.com/2cab0b02-686a-4d96-9460-d6f89da11974/",
              "linkType": {
                "key": "https://pid.bayer.com/kos/19050/444582",
                "value": "Column"
              },
              "outbound": false,
              "isVersionLink": false
            },
            {
              "source": "https://dev-pid.bayer.com/00d17c57-416f-4f30-9f23-c2a30012f9b8/",
              "target": "https://dev-pid.bayer.com/7c2f0585-e4d2-4689-a5e2-d8c60be0799c/",
              "linkType": {
                "key": "https://pid.bayer.com/kos/19050/444582",
                "value": "Column"
              },
              "outbound": false,
              "isVersionLink": false
            }
          ],
          "fx": 5,
          "fy": 6
        },
        {
          "id": "https://dev-pid.bayer.com/02e581d4-f6b0-4f7c-8635-c5c90624bbb2/",
          "shortName": "ZZZ-tes-QA2",
          "name": "ZZZ test QA2",
          "resourceType": {
            "key": "https://pid.bayer.com/kos/19050/GenericDataset",
            "value": "Generic Dataset"
          },
          "links": [
            {
              "source": "https://dev-pid.bayer.com/02e581d4-f6b0-4f7c-8635-c5c90624bbb2/",
              "target": "https://dev-pid.bayer.com/00d17c57-416f-4f30-9f23-c2a30012f9b8/",
              "linkType": {
                "key": "https://pid.bayer.com/kos/19050/444586",
                "value": "Table"
              },
              "outbound": false,
              "isVersionLink": false
            },
            {
              "source": "https://dev-pid.bayer.com/02e581d4-f6b0-4f7c-8635-c5c90624bbb2/",
              "target": "https://dev-pid.bayer.com/408d096e-06de-4997-8d3a-77d12cef502f/",
              "linkType": {
                "key": "https://pid.bayer.com/kos/19050/GenericDataset",
                "value": "Generic Dataset"
              },
              "outbound": false,
              "isVersionLink": false
            }
          ],
          "fx": 9,
          "fy": 8
        }
      ]);
    }*/
    return this.httpClient.post<Node[]>(
      url,
      resourceSearchObject
    );
  }

  /**
   * Takes a list of PID URIs, loads them from the DB and places them on the graph
   * @param pidUris list of PID URIs
   */
  loadResources(pidUris: string[]) {
    console.log("loadresources: ", pidUris);
    this.store.dispatch(new StartLoading());
    this.getCheckedResources(pidUris).subscribe(
      (res: Node[]) => {
        let converted: NodeLinkContainer = this.convertResourceDtoToLinksAndNodes(res);
        this.store.dispatch(new AddNodes(converted.nodes));
        this.store.dispatch(new AddLinks(converted.links));
        this.store.dispatch(new EndLoading());
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
      return of(sortFct([...allMaps, ...allMaps, ...allMaps].filter(str => str.name.toLowerCase().includes(currentSearchParam.nameFilter.trim().toLowerCase()))).slice(offset, offset + currentSearchParam.batchSize));
    }
    const url = environment.resourceRelationshipManagerApi + '/api/GraphMap/Page';
    let params: HttpParams = new HttpParams();
    params = params.append('offset', offset.toString());
    return this.httpClient.post<GraphMapInfo[]>(url, currentSearchParam, { params: params });
  }

  getGraph(graphMapId: string): Observable<GraphMapDTO> {
    // if (environment.environment == 'local') {
    //   //return of(mapFixture);
    // } else {
    const url = environment.resourceRelationshipManagerApi + '/api/GraphMap';
    let params: HttpParams = new HttpParams();
    params = params.append('id', graphMapId);
    return this.httpClient.get<GraphMapDTO>(url, { params: params });
    //}

  }

  /** New API Endpoint for retrieving a single map
   * 
   * @param graphId ID of the map
   * @returns 
   */
  getGraphv2(graphId: string): Observable<any> {
    // var test = {
    //   "id": "08d98968-1d5d-4f2d-8ff2-3a95a52ab078",
    //   "name": "test9",
    //   "nodes": [
    //     {
    //       "id": "https://dev-pid.bayer.com/7418030b-c498-468d-937c-c34876cdb4d5/",
    //       "shortName": "Pro",
    //       "name": "Protocol",
    //       "resourceType": {
    //         "key": "https://pid.bayer.com/kos/19050/444586",
    //         "value": "Table"
    //       },
    //       "links": [
    //         {
    //           "source": "https://dev-pid.bayer.com/7418030b-c498-468d-937c-c34876cdb4d5/",
    //           "target": "https://dev-pid.bayer.com/4f5e4a9f-53e9-4547-92fb-2c46912bf19a/",
    //           "sourceName": "Protocol",
    //           "sourceType": "https://pid.bayer.com/kos/19050/444586",
    //           "targetName": "Dataset Two with Schema Information",
    //           "targetType": "https://pid.bayer.com/kos/19050/CropScienceDataset",
    //           "linkType": {
    //             "key": "https://pid.bayer.com/kos/19050/444501",
    //             "value": "Link to Dataset"
    //           },
    //           "outbound": true,
    //           "isVersionLink": false
    //         },
    //         {
    //           "source": "https://dev-pid.bayer.com/7418030b-c498-468d-937c-c34876cdb4d5/",
    //           "target": "https://dev-pid.bayer.com/93e99dac-c3e8-4c71-9478-d13194f51997/",
    //           "sourceName": "Protocol",
    //           "sourceType": "https://pid.bayer.com/kos/19050/444586",
    //           "targetName": "ID",
    //           "targetType": "https://pid.bayer.com/kos/19050/444582",
    //           "linkType": {
    //             "key": "https://pid.bayer.com/kos/19050/444622",
    //             "value": "Is part of table"
    //           },
    //           "outbound": false,
    //           "isVersionLink": false
    //         },
    //         {
    //           "source": "https://dev-pid.bayer.com/7418030b-c498-468d-937c-c34876cdb4d5/",
    //           "target": "https://dev-pid.bayer.com/0d492d8d-51a3-469f-a9c5-c51559625f30/",
    //           "sourceName": "Protocol",
    //           "sourceType": "https://pid.bayer.com/kos/19050/444586",
    //           "targetName": "Name",
    //           "targetType": "https://pid.bayer.com/kos/19050/444582",
    //           "linkType": {
    //             "key": "https://pid.bayer.com/kos/19050/444622",
    //             "value": "Is part of table"
    //           },
    //           "outbound": false,
    //           "isVersionLink": false
    //         }
    //       ],
    //       "fx": 300,
    //       "fy": -60
    //     },
    //     {
    //       "id": "https://dev-pid.bayer.com/7aecff0d-f051-4970-8522-9359bb2d3fb6/",
    //       "shortName": "Cap-Req-Tab",
    //       "name": "Capacity Request Table",
    //       "resourceType": {
    //         "key": "https://pid.bayer.com/kos/19050/444586",
    //         "value": "Table"
    //       },
    //       "links": [
    //         {
    //           "source": "https://dev-pid.bayer.com/7aecff0d-f051-4970-8522-9359bb2d3fb6/",
    //           "target": "https://dev-pid.bayer.com/efd5af17-19ca-4e38-8ba9-3d366e014f39/",
    //           "sourceName": "Capacity Request Table",
    //           "sourceType": "https://pid.bayer.com/kos/19050/444586",
    //           "targetName": "Dataset One with Schema Information",
    //           "targetType": "https://pid.bayer.com/kos/19050/CropScienceDataset",
    //           "linkType": {
    //             "key": "https://pid.bayer.com/kos/19050/444501",
    //             "value": "Link to Dataset"
    //           },
    //           "outbound": true,
    //           "isVersionLink": false
    //         },
    //         {
    //           "source": "https://dev-pid.bayer.com/7aecff0d-f051-4970-8522-9359bb2d3fb6/",
    //           "target": "https://dev-pid.bayer.com/e98b7031-1b95-4789-8aed-7cda26654fdd/",
    //           "sourceName": "Capacity Request Table",
    //           "sourceType": "https://pid.bayer.com/kos/19050/444586",
    //           "targetName": "Harvest_Type",
    //           "targetType": "https://pid.bayer.com/kos/19050/444582",
    //           "linkType": {
    //             "key": "https://pid.bayer.com/kos/19050/444622",
    //             "value": "Is part of table"
    //           },
    //           "outbound": false,
    //           "isVersionLink": false
    //         },
    //         {
    //           "source": "https://dev-pid.bayer.com/7aecff0d-f051-4970-8522-9359bb2d3fb6/",
    //           "target": "https://dev-pid.bayer.com/9f1b4fc1-8779-401b-b458-60b60dac80ff/",
    //           "sourceName": "Capacity Request Table",
    //           "sourceType": "https://pid.bayer.com/kos/19050/444586",
    //           "targetName": "Organization",
    //           "targetType": "https://pid.bayer.com/kos/19050/444582",
    //           "linkType": {
    //             "key": "https://pid.bayer.com/kos/19050/444622",
    //             "value": "Is part of table"
    //           },
    //           "outbound": false,
    //           "isVersionLink": false
    //         },
    //         {
    //           "source": "https://dev-pid.bayer.com/7aecff0d-f051-4970-8522-9359bb2d3fb6/",
    //           "target": "https://dev-pid.bayer.com/d9d0b550-e260-431a-a8e7-d5558db11bfe/",
    //           "sourceName": "Capacity Request Table",
    //           "sourceType": "https://pid.bayer.com/kos/19050/444586",
    //           "targetName": "Trial_type",
    //           "targetType": "https://pid.bayer.com/kos/19050/444582",
    //           "linkType": {
    //             "key": "https://pid.bayer.com/kos/19050/444622",
    //             "value": "Is part of table"
    //           },
    //           "outbound": false,
    //           "isVersionLink": false
    //         },
    //         {
    //           "source": "https://dev-pid.bayer.com/7aecff0d-f051-4970-8522-9359bb2d3fb6/",
    //           "target": "https://dev-pid.bayer.com/630e54ca-16fb-405e-8f11-f9a6b6133582/",
    //           "sourceName": "Capacity Request Table",
    //           "sourceType": "https://pid.bayer.com/kos/19050/444586",
    //           "targetName": "Previous_crop",
    //           "targetType": "https://pid.bayer.com/kos/19050/444582",
    //           "linkType": {
    //             "key": "https://pid.bayer.com/kos/19050/444622",
    //             "value": "Is part of table"
    //           },
    //           "outbound": false,
    //           "isVersionLink": false
    //         },
    //         {
    //           "source": "https://dev-pid.bayer.com/7aecff0d-f051-4970-8522-9359bb2d3fb6/",
    //           "target": "https://dev-pid.bayer.com/1c9672fc-a439-4ebb-8461-3209e9274271/",
    //           "sourceName": "Capacity Request Table",
    //           "sourceType": "https://pid.bayer.com/kos/19050/444586",
    //           "targetName": "Protocol_Number",
    //           "targetType": "https://pid.bayer.com/kos/19050/444582",
    //           "linkType": {
    //             "key": "https://pid.bayer.com/kos/19050/444622",
    //             "value": "Is part of table"
    //           },
    //           "outbound": false,
    //           "isVersionLink": false
    //         }
    //       ],
    //       "fx": -299,
    //       "fy": -240
    //     },
    //     {
    //       "id": "https://dev-pid.bayer.com/efd5af17-19ca-4e38-8ba9-3d366e014f39/",
    //       "shortName": "Dat-One-wit-Sch-Inf",
    //       "name": "Dataset One with Schema Information",
    //       "resourceType": {
    //         "key": "https://pid.bayer.com/kos/19050/CropScienceDataset",
    //         "value": "Crop Science Dataset"
    //       },
    //       "links": [
    //         {
    //           "source": "https://dev-pid.bayer.com/efd5af17-19ca-4e38-8ba9-3d366e014f39/",
    //           "target": "https://dev-pid.bayer.com/4f5e4a9f-53e9-4547-92fb-2c46912bf19a/",
    //           "sourceName": "Dataset One with Schema Information",
    //           "sourceType": "https://pid.bayer.com/kos/19050/CropScienceDataset",
    //           "targetName": "Dataset Two with Schema Information",
    //           "targetType": "https://pid.bayer.com/kos/19050/CropScienceDataset",
    //           "linkType": {
    //             "key": "https://pid.bayer.com/kos/19050/hasComplementaryInformation",
    //             "value": "Contains complementary information"
    //           },
    //           "outbound": true,
    //           "isVersionLink": false
    //         },
    //         {
    //           "source": "https://dev-pid.bayer.com/efd5af17-19ca-4e38-8ba9-3d366e014f39/",
    //           "target": "https://dev-pid.bayer.com/c5c8c041-24c6-4df8-a089-e24f8bc22093/",
    //           "sourceName": "Dataset One with Schema Information",
    //           "sourceType": "https://pid.bayer.com/kos/19050/CropScienceDataset",
    //           "targetName": "Location360 Yield Tool",
    //           "targetType": "https://pid.bayer.com/kos/19050/Application",
    //           "linkType": {
    //             "key": "https://pid.bayer.com/kos/19050/IsManagedIn",
    //             "value": "Is managed in"
    //           },
    //           "outbound": true,
    //           "isVersionLink": false
    //         },
    //         {
    //           "source": "https://dev-pid.bayer.com/efd5af17-19ca-4e38-8ba9-3d366e014f39/",
    //           "target": "https://dev-pid.bayer.com/eabc7566-dde2-43b8-b0bd-cd0f97fb2130/",
    //           "sourceName": "Dataset One with Schema Information",
    //           "sourceType": "https://pid.bayer.com/kos/19050/CropScienceDataset",
    //           "targetName": "Location360 Imagine",
    //           "targetType": "https://pid.bayer.com/kos/19050/Application",
    //           "linkType": {
    //             "key": "https://pid.bayer.com/kos/19050/IsConsumedIn",
    //             "value": "Is consumed in"
    //           },
    //           "outbound": true,
    //           "isVersionLink": false
    //         },
    //         {
    //           "source": "https://dev-pid.bayer.com/efd5af17-19ca-4e38-8ba9-3d366e014f39/",
    //           "target": "https://dev-pid.bayer.com/0cd7afec-5740-47ca-8227-3df4cbb0cc39/",
    //           "sourceName": "Dataset One with Schema Information",
    //           "sourceType": "https://pid.bayer.com/kos/19050/CropScienceDataset",
    //           "targetName": "Place Plots Table-1",
    //           "targetType": "https://pid.bayer.com/kos/19050/444586",
    //           "linkType": {
    //             "key": "https://pid.bayer.com/kos/19050/444501",
    //             "value": "Link to Dataset"
    //           },
    //           "outbound": false,
    //           "isVersionLink": false
    //         },
    //         {
    //           "source": "https://dev-pid.bayer.com/efd5af17-19ca-4e38-8ba9-3d366e014f39/",
    //           "target": "https://dev-pid.bayer.com/7aecff0d-f051-4970-8522-9359bb2d3fb6/",
    //           "sourceName": "Dataset One with Schema Information",
    //           "sourceType": "https://pid.bayer.com/kos/19050/CropScienceDataset",
    //           "targetName": "Capacity Request Table",
    //           "targetType": "https://pid.bayer.com/kos/19050/444586",
    //           "linkType": {
    //             "key": "https://pid.bayer.com/kos/19050/444501",
    //             "value": "Link to Dataset"
    //           },
    //           "outbound": false,
    //           "isVersionLink": false
    //         }
    //       ],
    //       "fx": 0,
    //       "fy": 480
    //     },
    //     {
    //       "id": "https://dev-pid.bayer.com/e98b7031-1b95-4789-8aed-7cda26654fdd/",
    //       "shortName": "Har",
    //       "name": "Harvest_Type",
    //       "resourceType": {
    //         "key": "https://pid.bayer.com/kos/19050/444582",
    //         "value": "Column"
    //       },
    //       "links": [
    //         {
    //           "source": "https://dev-pid.bayer.com/e98b7031-1b95-4789-8aed-7cda26654fdd/",
    //           "target": "https://dev-pid.bayer.com/7aecff0d-f051-4970-8522-9359bb2d3fb6/",
    //           "sourceName": "Harvest_Type",
    //           "sourceType": "https://pid.bayer.com/kos/19050/444582",
    //           "targetName": "Capacity Request Table",
    //           "targetType": "https://pid.bayer.com/kos/19050/444586",
    //           "linkType": {
    //             "key": "https://pid.bayer.com/kos/19050/444622",
    //             "value": "Is part of table"
    //           },
    //           "outbound": true,
    //           "isVersionLink": false
    //         }
    //       ],
    //       "fx": -899,
    //       "fy": 180
    //     },
    //     {
    //       "id": "https://dev-pid.bayer.com/9f1b4fc1-8779-401b-b458-60b60dac80ff/",
    //       "shortName": "Org",
    //       "name": "Organization",
    //       "resourceType": {
    //         "key": "https://pid.bayer.com/kos/19050/444582",
    //         "value": "Column"
    //       },
    //       "links": [
    //         {
    //           "source": "https://dev-pid.bayer.com/9f1b4fc1-8779-401b-b458-60b60dac80ff/",
    //           "target": "https://dev-pid.bayer.com/7aecff0d-f051-4970-8522-9359bb2d3fb6/",
    //           "sourceName": "Organization",
    //           "sourceType": "https://pid.bayer.com/kos/19050/444582",
    //           "targetName": "Capacity Request Table",
    //           "targetType": "https://pid.bayer.com/kos/19050/444586",
    //           "linkType": {
    //             "key": "https://pid.bayer.com/kos/19050/444622",
    //             "value": "Is part of table"
    //           },
    //           "outbound": true,
    //           "isVersionLink": false
    //         }
    //       ],
    //       "fx": -899,
    //       "fy": 0
    //     },
    //     {
    //       "id": "https://dev-pid.bayer.com/d9d0b550-e260-431a-a8e7-d5558db11bfe/",
    //       "shortName": "Tri",
    //       "name": "Trial_type",
    //       "resourceType": {
    //         "key": "https://pid.bayer.com/kos/19050/444582",
    //         "value": "Column"
    //       },
    //       "links": [
    //         {
    //           "source": "https://dev-pid.bayer.com/d9d0b550-e260-431a-a8e7-d5558db11bfe/",
    //           "target": "https://dev-pid.bayer.com/7aecff0d-f051-4970-8522-9359bb2d3fb6/",
    //           "sourceName": "Trial_type",
    //           "sourceType": "https://pid.bayer.com/kos/19050/444582",
    //           "targetName": "Capacity Request Table",
    //           "targetType": "https://pid.bayer.com/kos/19050/444586",
    //           "linkType": {
    //             "key": "https://pid.bayer.com/kos/19050/444622",
    //             "value": "Is part of table"
    //           },
    //           "outbound": true,
    //           "isVersionLink": false
    //         }
    //       ],
    //       "fx": -300,
    //       "fy": 180
    //     },
    //     {
    //       "id": "https://dev-pid.bayer.com/630e54ca-16fb-405e-8f11-f9a6b6133582/",
    //       "shortName": "Pre",
    //       "name": "Previous_crop",
    //       "resourceType": {
    //         "key": "https://pid.bayer.com/kos/19050/444582",
    //         "value": "Column"
    //       },
    //       "links": [
    //         {
    //           "source": "https://dev-pid.bayer.com/630e54ca-16fb-405e-8f11-f9a6b6133582/",
    //           "target": "https://dev-pid.bayer.com/7aecff0d-f051-4970-8522-9359bb2d3fb6/",
    //           "sourceName": "Previous_crop",
    //           "sourceType": "https://pid.bayer.com/kos/19050/444582",
    //           "targetName": "Capacity Request Table",
    //           "targetType": "https://pid.bayer.com/kos/19050/444586",
    //           "linkType": {
    //             "key": "https://pid.bayer.com/kos/19050/444622",
    //             "value": "Is part of table"
    //           },
    //           "outbound": true,
    //           "isVersionLink": false
    //         },
    //         {
    //           "source": "https://dev-pid.bayer.com/630e54ca-16fb-405e-8f11-f9a6b6133582/",
    //           "target": "https://dev-pid.bayer.com/f681540f-6fd9-4534-99c8-d96cebc357a4/",
    //           "sourceName": "Previous_crop",
    //           "sourceType": "https://pid.bayer.com/kos/19050/444582",
    //           "targetName": "core_temp_t",
    //           "targetType": "https://pid.bayer.com/kos/19050/CropScienceDataset",
    //           "linkType": {
    //             "key": "https://pid.bayer.com/kos/19050/444501",
    //             "value": "Link to Dataset"
    //           },
    //           "outbound": true,
    //           "isVersionLink": false
    //         }
    //       ],
    //       "fx": -899,
    //       "fy": 60
    //     },
    //     {
    //       "id": "https://dev-pid.bayer.com/1c9672fc-a439-4ebb-8461-3209e9274271/",
    //       "shortName": "Pro",
    //       "name": "Protocol_Number",
    //       "resourceType": {
    //         "key": "https://pid.bayer.com/kos/19050/444582",
    //         "value": "Column"
    //       },
    //       "links": [
    //         {
    //           "source": "https://dev-pid.bayer.com/1c9672fc-a439-4ebb-8461-3209e9274271/",
    //           "target": "https://dev-pid.bayer.com/7aecff0d-f051-4970-8522-9359bb2d3fb6/",
    //           "sourceName": "Protocol_Number",
    //           "sourceType": "https://pid.bayer.com/kos/19050/444582",
    //           "targetName": "Capacity Request Table",
    //           "targetType": "https://pid.bayer.com/kos/19050/444586",
    //           "linkType": {
    //             "key": "https://pid.bayer.com/kos/19050/444622",
    //             "value": "Is part of table"
    //           },
    //           "outbound": true,
    //           "isVersionLink": false
    //         },
    //         {
    //           "source": "https://dev-pid.bayer.com/1c9672fc-a439-4ebb-8461-3209e9274271/",
    //           "target": "https://dev-pid.bayer.com/66c189ff-2533-432f-8b73-b5fe5a5df1eb/",
    //           "sourceName": "Protocol_Number",
    //           "sourceType": "https://pid.bayer.com/kos/19050/444582",
    //           "targetName": "yse",
    //           "targetType": "https://pid.bayer.com/kos/19050/444582",
    //           "linkType": {
    //             "key": "https://pid.bayer.com/kos/19050/444505",
    //             "value": "Is nested column of"
    //           },
    //           "outbound": true,
    //           "isVersionLink": false
    //         }
    //       ],
    //       "fx": 0,
    //       "fy": -60
    //     },
    //     {
    //       "id": "https://dev-pid.bayer.com/4f5e4a9f-53e9-4547-92fb-2c46912bf19a/",
    //       "shortName": "Dat-Two-wit-Sch-Inf",
    //       "name": "Dataset Two with Schema Information",
    //       "resourceType": {
    //         "key": "https://pid.bayer.com/kos/19050/CropScienceDataset",
    //         "value": "Crop Science Dataset"
    //       },
    //       "links": [
    //         {
    //           "source": "https://dev-pid.bayer.com/4f5e4a9f-53e9-4547-92fb-2c46912bf19a/",
    //           "target": "https://dev-pid.bayer.com/2e131f70-c061-4919-9b29-45e23524b84f/",
    //           "sourceName": "Dataset Two with Schema Information",
    //           "sourceType": "https://pid.bayer.com/kos/19050/CropScienceDataset",
    //           "targetName": "zzz Neue Resourc",
    //           "targetType": "https://pid.bayer.com/kos/19050/GenericDataset",
    //           "linkType": {
    //             "key": "https://pid.bayer.com/kos/19050/isCopyOfDataset",
    //             "value": "Is Copy Of Dataset"
    //           },
    //           "outbound": true,
    //           "isVersionLink": false
    //         },
    //         {
    //           "source": "https://dev-pid.bayer.com/4f5e4a9f-53e9-4547-92fb-2c46912bf19a/",
    //           "target": "https://dev-pid.bayer.com/eabc7566-dde2-43b8-b0bd-cd0f97fb2130/",
    //           "sourceName": "Dataset Two with Schema Information",
    //           "sourceType": "https://pid.bayer.com/kos/19050/CropScienceDataset",
    //           "targetName": "Location360 Imagine",
    //           "targetType": "https://pid.bayer.com/kos/19050/Application",
    //           "linkType": {
    //             "key": "https://pid.bayer.com/kos/19050/IsConsumedIn",
    //             "value": "Is consumed in"
    //           },
    //           "outbound": true,
    //           "isVersionLink": false
    //         },
    //         {
    //           "source": "https://dev-pid.bayer.com/4f5e4a9f-53e9-4547-92fb-2c46912bf19a/",
    //           "target": "https://dev-pid.bayer.com/efd5af17-19ca-4e38-8ba9-3d366e014f39/",
    //           "sourceName": "Dataset Two with Schema Information",
    //           "sourceType": "https://pid.bayer.com/kos/19050/CropScienceDataset",
    //           "targetName": "Dataset One with Schema Information",
    //           "targetType": "https://pid.bayer.com/kos/19050/CropScienceDataset",
    //           "linkType": {
    //             "key": "https://pid.bayer.com/kos/19050/hasComplementaryInformation",
    //             "value": "Contains complementary information"
    //           },
    //           "outbound": false,
    //           "isVersionLink": false
    //         },
    //         {
    //           "source": "https://dev-pid.bayer.com/4f5e4a9f-53e9-4547-92fb-2c46912bf19a/",
    //           "target": "https://dev-pid.bayer.com/7418030b-c498-468d-937c-c34876cdb4d5/",
    //           "sourceName": "Dataset Two with Schema Information",
    //           "sourceType": "https://pid.bayer.com/kos/19050/CropScienceDataset",
    //           "targetName": "Protocol",
    //           "targetType": "https://pid.bayer.com/kos/19050/444586",
    //           "linkType": {
    //             "key": "https://pid.bayer.com/kos/19050/444501",
    //             "value": "Link to Dataset"
    //           },
    //           "outbound": false,
    //           "isVersionLink": false
    //         }
    //       ],
    //       "fx": 0,
    //       "fy": 59
    //     },
    //     {
    //       "id": "https://dev-pid.bayer.com/0cd7afec-5740-47ca-8227-3df4cbb0cc39/",
    //       "shortName": "Pla-Plo-Tab",
    //       "name": "Place Plots Table-1",
    //       "resourceType": {
    //         "key": "https://pid.bayer.com/kos/19050/444586",
    //         "value": "Table"
    //       },
    //       "links": [
    //         {
    //           "source": "https://dev-pid.bayer.com/0cd7afec-5740-47ca-8227-3df4cbb0cc39/",
    //           "target": "https://dev-pid.bayer.com/efd5af17-19ca-4e38-8ba9-3d366e014f39/",
    //           "sourceName": "Place Plots Table-1",
    //           "sourceType": "https://pid.bayer.com/kos/19050/444586",
    //           "targetName": "Dataset One with Schema Information",
    //           "targetType": "https://pid.bayer.com/kos/19050/CropScienceDataset",
    //           "linkType": {
    //             "key": "https://pid.bayer.com/kos/19050/444501",
    //             "value": "Link to Dataset"
    //           },
    //           "outbound": true,
    //           "isVersionLink": false
    //         },
    //         {
    //           "source": "https://dev-pid.bayer.com/0cd7afec-5740-47ca-8227-3df4cbb0cc39/",
    //           "target": "https://dev-pid.bayer.com/066eb4cd-3bef-40fe-a675-477f7c65929c/",
    //           "sourceName": "Place Plots Table-1",
    //           "sourceType": "https://pid.bayer.com/kos/19050/444586",
    //           "targetName": "Coordinates",
    //           "targetType": "https://pid.bayer.com/kos/19050/444582",
    //           "linkType": {
    //             "key": "https://pid.bayer.com/kos/19050/444622",
    //             "value": "Is part of table"
    //           },
    //           "outbound": false,
    //           "isVersionLink": false
    //         },
    //         {
    //           "source": "https://dev-pid.bayer.com/0cd7afec-5740-47ca-8227-3df4cbb0cc39/",
    //           "target": "https://dev-pid.bayer.com/55609532-732b-4945-85fe-cfe1da81af8a/",
    //           "sourceName": "Place Plots Table-1",
    //           "sourceType": "https://pid.bayer.com/kos/19050/444586",
    //           "targetName": "Entry_ID",
    //           "targetType": "https://pid.bayer.com/kos/19050/444582",
    //           "linkType": {
    //             "key": "https://pid.bayer.com/kos/19050/444622",
    //             "value": "Is part of table"
    //           },
    //           "outbound": false,
    //           "isVersionLink": false
    //         },
    //         {
    //           "source": "https://dev-pid.bayer.com/0cd7afec-5740-47ca-8227-3df4cbb0cc39/",
    //           "target": "https://dev-pid.bayer.com/bde43fea-73be-4f2a-bba6-06821a877309/",
    //           "sourceName": "Place Plots Table-1",
    //           "sourceType": "https://pid.bayer.com/kos/19050/444586",
    //           "targetName": "Plot_ID",
    //           "targetType": "https://pid.bayer.com/kos/19050/444582",
    //           "linkType": {
    //             "key": "https://pid.bayer.com/kos/19050/444622",
    //             "value": "Is part of table"
    //           },
    //           "outbound": false,
    //           "isVersionLink": false
    //         },
    //         {
    //           "source": "https://dev-pid.bayer.com/0cd7afec-5740-47ca-8227-3df4cbb0cc39/",
    //           "target": "https://dev-pid.bayer.com/07b2ed4b-63df-4a83-bb7c-edc7a5ea6ee6/",
    //           "sourceName": "Place Plots Table-1",
    //           "sourceType": "https://pid.bayer.com/kos/19050/444586",
    //           "targetName": "Plot_Length",
    //           "targetType": "https://pid.bayer.com/kos/19050/444582",
    //           "linkType": {
    //             "key": "https://pid.bayer.com/kos/19050/444622",
    //             "value": "Is part of table"
    //           },
    //           "outbound": false,
    //           "isVersionLink": false
    //         },
    //         {
    //           "source": "https://dev-pid.bayer.com/0cd7afec-5740-47ca-8227-3df4cbb0cc39/",
    //           "target": "https://dev-pid.bayer.com/3f3c2864-826d-4570-81d8-7e0241e60e09/",
    //           "sourceName": "Place Plots Table-1",
    //           "sourceType": "https://pid.bayer.com/kos/19050/444586",
    //           "targetName": "Plot_Width",
    //           "targetType": "https://pid.bayer.com/kos/19050/444582",
    //           "linkType": {
    //             "key": "https://pid.bayer.com/kos/19050/444622",
    //             "value": "Is part of table"
    //           },
    //           "outbound": false,
    //           "isVersionLink": false
    //         },
    //         {
    //           "source": "https://dev-pid.bayer.com/0cd7afec-5740-47ca-8227-3df4cbb0cc39/",
    //           "target": "https://dev-pid.bayer.com/d7a8c2b1-9293-4bf3-b110-4de5e1397092/",
    //           "sourceName": "Place Plots Table-1",
    //           "sourceType": "https://pid.bayer.com/kos/19050/444586",
    //           "targetName": "Seedcount",
    //           "targetType": "https://pid.bayer.com/kos/19050/444582",
    //           "linkType": {
    //             "key": "https://pid.bayer.com/kos/19050/444622",
    //             "value": "Is part of table"
    //           },
    //           "outbound": false,
    //           "isVersionLink": false
    //         },
    //         {
    //           "source": "https://dev-pid.bayer.com/0cd7afec-5740-47ca-8227-3df4cbb0cc39/",
    //           "target": "https://dev-pid.bayer.com/884f2e59-b0a9-4f9b-b012-54ef212c3717/",
    //           "sourceName": "Place Plots Table-1",
    //           "sourceType": "https://pid.bayer.com/kos/19050/444586",
    //           "targetName": "Treatment_number",
    //           "targetType": "https://pid.bayer.com/kos/19050/444582",
    //           "linkType": {
    //             "key": "https://pid.bayer.com/kos/19050/444622",
    //             "value": "Is part of table"
    //           },
    //           "outbound": false,
    //           "isVersionLink": false
    //         },
    //         {
    //           "source": "https://dev-pid.bayer.com/0cd7afec-5740-47ca-8227-3df4cbb0cc39/",
    //           "target": "https://dev-pid.bayer.com/70f25eba-78c6-4d1b-a9e8-ee95e67a2af4/",
    //           "sourceName": "Place Plots Table-1",
    //           "sourceType": "https://pid.bayer.com/kos/19050/444586",
    //           "targetName": "Year",
    //           "targetType": "https://pid.bayer.com/kos/19050/444582",
    //           "linkType": {
    //             "key": "https://pid.bayer.com/kos/19050/444622",
    //             "value": "Is part of table"
    //           },
    //           "outbound": false,
    //           "isVersionLink": false
    //         },
    //         {
    //           "source": "https://dev-pid.bayer.com/0cd7afec-5740-47ca-8227-3df4cbb0cc39/",
    //           "target": "https://dev-pid.bayer.com/eaa9f080-2dc6-4796-a0e3-2b7b25ecba8f/",
    //           "sourceName": "Place Plots Table-1",
    //           "sourceType": "https://pid.bayer.com/kos/19050/444586",
    //           "targetName": "Range",
    //           "targetType": "https://pid.bayer.com/kos/19050/444582",
    //           "linkType": {
    //             "key": "https://pid.bayer.com/kos/19050/444622",
    //             "value": "Is part of table"
    //           },
    //           "outbound": false,
    //           "isVersionLink": false
    //         }
    //       ],
    //       "fx": 0,
    //       "fy": 179
    //     }
    //   ],
    //   "modifiedBy": "sebastian.sell.ext@bayer.com",
    //   "modifiedAt": "2022-08-16T06:20:28.08421"
    // };
    // return of(test);
    const url = environment.resourceRelationshipManagerApi + '/api/GraphMap/GetRelationMapById';
    let params: HttpParams = new HttpParams();
    params = params.append('relationMapId', graphId);
    return this.httpClient.get<any>(url, { params: params });
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

  saveGraphMapV2(map: GraphMapV2SaveDto): Observable<GraphMapV2> {
    const url = environment.resourceRelationshipManagerApi + '/api/GraphMap/SaveRelationMap'
    return this.httpClient.put<GraphMapV2>(url, map);
  }

  deleteGraphMap(graphMapId: string): Observable<unknown> {
    if (environment.environment == 'local') {
      return of(null)
    } else {
      const url = environment.resourceRelationshipManagerApi + '/api/GraphMap/DeleteRelationMap';
      let params: HttpParams = new HttpParams();
      params = params.append('relationMapId', graphMapId);
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
