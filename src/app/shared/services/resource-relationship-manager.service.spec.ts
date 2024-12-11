import { TestBed } from '@angular/core/testing';

import {
  HttpClientTestingModule,
  HttpTestingController
} from '@angular/common/http/testing';
import { NgxsModule } from '@ngxs/store';
import { ResourceRelationshipManagerService } from './resource-relationship-manager.service';
import { environment } from 'src/environments/environment';
import { GraphMapV2 } from '../models/graph-map-v2';
import { LinkEditHistoryDto } from '../models/link-editing-history';
import { LinkTypesDto } from '../models/link-types-dto';
import { Node } from '../../core/d3';
import { GraphMapInfo } from '../models/graph-map-info';
import { GraphMapSearchDTO } from '../models/graph-map-search-dto';
import { GraphMapV2SaveDto } from '../models/gaph-map-v2-save-dto';

describe('ResourceRelationshipManagerService', () => {
  let service: ResourceRelationshipManagerService;
  let httpTestingController: HttpTestingController;

  const baseUrl = environment.resourceRelationshipManagerApi;
  const mockPidUris = ['pidUri0', 'pidUri1'];

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, NgxsModule.forRoot()],
      providers: [ResourceRelationshipManagerService]
    });

    service = TestBed.inject(ResourceRelationshipManagerService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should set and get PID URIs for loading resources sent from dialog');

  it('should call BE to get resources by PID URI', (done) => {
    const expectedMethod = 'POST';
    const targetUrl = '/api/GraphMap/FetchResources';
    const mockParams = '';
    const mockPayload = mockPidUris;
    const mockResponse = [{} as Node];

    service.getResources(mockPidUris).subscribe((response) => {
      expect(response).toBe(mockResponse);
      done();
    });

    const req = httpTestingController.expectOne(
      baseUrl + targetUrl + mockParams
    );
    expect(req.request.method).toEqual(expectedMethod);
    expect(req.request.body).toEqual(mockPayload);

    req.flush(mockResponse);
  });

  it('should call BE to get link types by PID URI', (done) => {
    const expectedMethod = 'POST';
    const targetUrl = '/api/GraphMap/LinkResourceTypes';
    const mockParams = '';
    const mockPayload = {
      sourceUri: mockPidUris[0],
      targetUri: mockPidUris[1]
    };
    const mockResponse = [{} as LinkTypesDto];

    service.getLinkTypes(mockPidUris).subscribe((response) => {
      expect(response).toBe(mockResponse);
      done();
    });

    const req = httpTestingController.expectOne(
      baseUrl + targetUrl + mockParams
    );
    expect(req.request.method).toEqual(expectedMethod);
    expect(req.request.body).toEqual(mockPayload);

    req.flush(mockResponse);
  });

  it('should call BE to save links', (done) => {
    const expectedMethod = 'POST';
    const targetUrl = '/api/GraphMap/ManageResourceLinking';
    const mockParams = '';
    const mockPayload = [{} as LinkEditHistoryDto];
    const mockResponse = true;

    service.saveLinks(mockPayload).subscribe((response) => {
      expect(response).toBe(mockResponse);
      done();
    });

    const req = httpTestingController.expectOne(
      baseUrl + targetUrl + mockParams
    );
    expect(req.request.method).toEqual(expectedMethod);
    expect(req.request.body).toEqual(mockPayload);

    req.flush(mockResponse);
  });

  it('should call BE to get a graph map by id', (done) => {
    const expectedMethod = 'GET';
    const targetUrl = '/api/GraphMap/GetRelationMapById';
    const mockParam = '?relationMapId=mockId';
    const mockResponse = { id: 'test' } as GraphMapV2;

    service.getGraphMap('mockId').subscribe((response) => {
      expect(response).toBe(mockResponse);
      done();
    });

    const req = httpTestingController.expectOne(
      baseUrl + targetUrl + mockParam
    );
    expect(req.request.method).toEqual(expectedMethod);

    req.flush(mockResponse);
  });

  it('should call BE to get all graph maps', (done) => {
    const expectedMethod = 'GET';
    const targetUrl = '/api/GraphMap/All';
    const mockParam = '?limit=9999';
    const mockResponse = [{} as GraphMapInfo];

    service.getAllGraphMaps().subscribe((response) => {
      expect(response).toBe(mockResponse);
      done();
    });

    const req = httpTestingController.expectOne(
      baseUrl + targetUrl + mockParam
    );
    expect(req.request.method).toEqual(expectedMethod);

    req.flush(mockResponse);
  });

  it('should call BE to get a page of graph maps', (done) => {
    const mockSearchDto = {
      batchSize: 100,
      nameFilter: 'name filter',
      sortKey: 'sort key',
      sortType: 'asc'
    } as GraphMapSearchDTO;

    const expectedMethod = 'POST';
    const targetUrl = '/api/GraphMap/Page';
    const mockParam = '?offset=1';
    const mockResponse = [{} as GraphMapInfo];

    service.getGraphMapsPage(1, mockSearchDto).subscribe((response) => {
      expect(response).toBe(mockResponse);
      done();
    });

    const req = httpTestingController.expectOne(
      baseUrl + targetUrl + mockParam
    );
    expect(req.request.method).toEqual(expectedMethod);

    req.flush(mockResponse);
  });

  it('should call BE to get graph maps by user', (done) => {
    const expectedMethod = 'GET';
    const targetUrl = '/api/GraphMap/GraphsForUser';
    const mockParam = '?userName=mock.name@some.url';
    const mockResponse = [{} as GraphMapInfo];

    service.getGraphMapsByUser('mock.name@some.url').subscribe((response) => {
      expect(response).toBe(mockResponse);
      done();
    });

    const req = httpTestingController.expectOne(
      baseUrl + targetUrl + mockParam
    );
    expect(req.request.method).toEqual(expectedMethod);

    req.flush(mockResponse);
  });

  it('should call BE to get graph maps by resource id', (done) => {
    const expectedMethod = 'GET';
    const targetUrl = '/api/GraphMap/GraphsForResource';
    const mockParam = '?pidUri=pidUri0';
    const mockResponse = [{} as GraphMapInfo];

    service.getGraphMapsByResource(mockPidUris[0]).subscribe((response) => {
      expect(response).toBe(mockResponse);
      done();
    });

    const req = httpTestingController.expectOne(
      baseUrl + targetUrl + mockParam
    );
    expect(req.request.method).toEqual(expectedMethod);

    req.flush(mockResponse);
  });

  it('should call BE to save a graph map', (done) => {
    const mockSaveDto = { id: 'test' } as GraphMapV2SaveDto;

    const expectedMethod = 'PUT';
    const targetUrl = '/api/GraphMap/SaveRelationMap';
    const mockParam = '';
    const mockResponse = { id: 'test' } as GraphMapV2;

    service.saveGraphMap(mockSaveDto).subscribe((response) => {
      expect(response).toBe(mockResponse);
      done();
    });

    const req = httpTestingController.expectOne(
      baseUrl + targetUrl + mockParam
    );
    expect(req.request.method).toEqual(expectedMethod);

    req.flush(mockResponse);
  });

  it('should call BE to delete a graph map', (done) => {
    const expectedMethod = 'DELETE';
    const targetUrl = '/api/GraphMap/DeleteRelationMap';
    const mockParam = '?relationMapId=pidUri0';
    const mockResponse = [{} as GraphMapInfo];

    service.deleteGraphMap(mockPidUris[0]).subscribe((response) => {
      expect(response).toBe(mockResponse);
      done();
    });

    const req = httpTestingController.expectOne(
      baseUrl + targetUrl + mockParam
    );
    expect(req.request.method).toEqual(expectedMethod);

    req.flush(mockResponse);
  });

  it('should call BE to delete a graph map as superadmin', (done) => {
    const expectedMethod = 'DELETE';
    const targetUrl = '/api/GraphMap/DeleteRelationMapAsSuperAdmin';
    const mockParam = '?relationMapId=pidUri0';
    const mockResponse = [{} as GraphMapInfo];

    service.deleteGraphMapAsSuperAdmin(mockPidUris[0]).subscribe((response) => {
      expect(response).toBe(mockResponse);
      done();
    });

    const req = httpTestingController.expectOne(
      baseUrl + targetUrl + mockParam
    );
    expect(req.request.method).toEqual(expectedMethod);

    req.flush(mockResponse);
  });
});
