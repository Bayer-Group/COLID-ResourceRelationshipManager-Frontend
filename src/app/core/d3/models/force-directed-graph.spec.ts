import { ForceDirectedGraph } from './force-directed-graph';
import { Node } from './node';
import { Link } from './link';
import { NgxsModule, Store } from '@ngxs/store';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { LinkDto } from 'src/app/shared/models/link-dto';
import { LinkProxy } from './LinkProxy';

describe('ForceDirectedGraph', () => {
  let graph: ForceDirectedGraph;
  let store: Store;

  const mockNodeToExpand: Node = {
    id: 'nodeToExpandUri',
    links: [],
    width: 0,
    height: 0,
    shortName: '',
    name: 'nodeToExpandName',
    laterVersion: '',
    resourceType: 'http://pid.bayer.com/kos/19014/Document',
    selected: false,
    filterOutTypes: [],
    linkCount: 0,
    resourceTypeId: '',
    resourceTypeName: ''
  };

  const mockAnotherNode: Node = {
    id: 'anotherNodeUri',
    links: [],
    width: 0,
    height: 0,
    shortName: '',
    name: 'anotherNodeName',
    laterVersion: '',
    resourceType: 'http://pid.bayer.com/kos/19014/Document',
    selected: false,
    filterOutTypes: [],
    linkCount: 0,
    resourceTypeId: '',
    resourceTypeName: ''
  };

  const mockOneMoreNode: Node = {
    id: 'oneMoreNodeUri',
    links: [],
    width: 0,
    height: 0,
    shortName: '',
    name: 'oneMoreNodeName',
    laterVersion: '',
    resourceType: 'http://pid.bayer.com/kos/19014/Document',
    selected: false,
    filterOutTypes: [],
    linkCount: 0,
    resourceTypeId: '',
    resourceTypeName: ''
  };

  const mockOutboundLink: Link = new Link();
  mockOutboundLink.outbound = true;
  mockOutboundLink.source = mockNodeToExpand;
  mockOutboundLink.target = mockAnotherNode;
  mockOutboundLink.linkType = {
    key: 'https://pid.bayer.com/kos/19050/225896',
    value: 'Is replaced by'
  };

  const mockInboundLink: Link = new Link();
  mockInboundLink.outbound = false;
  mockInboundLink.source = mockAnotherNode;
  mockInboundLink.target = mockNodeToExpand;
  mockInboundLink.linkType = {
    key: 'https://pid.bayer.com/kos/19050/225896',
    value: 'Is replaced by'
  };

  const mockOneMoreLink: Link = new Link();
  mockOneMoreLink.outbound = false;
  mockOneMoreLink.source = mockAnotherNode;
  mockOneMoreLink.target = mockOneMoreNode;
  mockOneMoreLink.linkType = {
    key: 'https://pid.bayer.com/kos/19050/225896',
    value: 'Is replaced by'
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: Store,
          useValue: {
            dispatch: jasmine.createSpy('dispatch'),
            select: jasmine.createSpy('select').and.returnValue(of({}))
          }
        }
      ],
      imports: [NgxsModule.forRoot()]
    });

    store = TestBed.inject(Store);
    graph = new ForceDirectedGraph([], [], { width: 800, height: 600 }, store);
  });

  it('should create', () => {
    expect(graph).toBeTruthy();
  });

  it('should add links to an empty graph, ignoring duplicates', () => {
    // Outbound link from nodeToExpand to anotherNode
    const mockLinkDto1: LinkDto = {
      display: true,
      isRendered: false,
      isVersionLink: false,
      outbound: true,
      source: 'nodeToExpandUri' as any,
      sourceName: 'nodeToExpandName',
      sourceType: 'http://pid.bayer.com/kos/19014/Document',
      linkType: {
        key: 'https://pid.bayer.com/kos/19050/225896',
        value: 'Is replaced by'
      },
      target: 'anotherNodeUri' as any,
      targetName: 'anotherNodeName',
      targetType: 'http://pid.bayer.com/kos/19014/Document'
    };

    const mockLink1: Link = Object.assign(
      new Link(),
      JSON.parse(JSON.stringify(mockLinkDto1))
    );

    // inbound link from anotherNode to nodeToExpand
    const mockLinkDto2: LinkDto = {
      display: true,
      isRendered: true,
      isVersionLink: false,
      outbound: false,
      source: 'anotherNodeUri' as any,
      sourceName: 'anotherNodeName',
      sourceType: 'http://pid.bayer.com/kos/19014/Document',
      linkType: {
        key: 'https://pid.bayer.com/kos/19050/225896',
        value: 'Is replaced by'
      },
      target: 'nodeToExpandUri' as any,
      targetName: 'nodeToExpandName',
      targetType: 'http://pid.bayer.com/kos/19014/Document'
    };

    const mockLink2: Link = Object.assign(
      new Link(),
      JSON.parse(JSON.stringify(mockLinkDto2))
    );

    const mockNodeToExpand: Node = {
      id: 'nodeToExpandUri',
      links: [mockLinkDto1],
      width: 0,
      height: 0,
      shortName: '',
      name: 'nodeToExpandName',
      laterVersion: '',
      resourceType: 'http://pid.bayer.com/kos/19014/Document',
      selected: false,
      filterOutTypes: [],
      linkCount: 0,
      resourceTypeId: '',
      resourceTypeName: ''
    };

    const mockAnotherNode: Node = {
      id: 'anotherNodeUri',
      links: [mockLinkDto2],
      width: 0,
      height: 0,
      shortName: '',
      name: 'anotherNodeName',
      laterVersion: '',
      resourceType: 'http://pid.bayer.com/kos/19014/Document',
      selected: false,
      filterOutTypes: [],
      linkCount: 0,
      resourceTypeId: '',
      resourceTypeName: ''
    };

    spyOn(graph, 'initLinks').and.stub();

    graph.nodes = [mockNodeToExpand, mockAnotherNode];
    graph.links = []; // Note: no links exist yet

    graph.setLinks([mockLink1, mockLink2]);

    expect(graph.getLinks().length).toBe(1);
  });

  it('should add links to the graph, ignoring duplicates', () => {
    // Outbound link from nodeToExpand to anotherNode
    const mockLinkDto1: LinkDto = {
      display: true,
      isRendered: false,
      isVersionLink: false,
      outbound: true,
      source: 'nodeToExpandUri' as any,
      sourceName: 'nodeToExpandName',
      sourceType: 'http://pid.bayer.com/kos/19014/Document',
      linkType: {
        key: 'https://pid.bayer.com/kos/19050/225896',
        value: 'Is replaced by'
      },
      target: 'anotherNodeUri' as any,
      targetName: 'anotherNodeName',
      targetType: 'http://pid.bayer.com/kos/19014/Document'
    };

    const mockLink1: Link = Object.assign(
      new Link(),
      JSON.parse(JSON.stringify(mockLinkDto1))
    );

    // inbound link from anotherNode to nodeToExpand
    const mockLinkDto2: LinkDto = {
      display: true,
      isRendered: true,
      isVersionLink: false,
      outbound: false,
      source: 'anotherNodeUri' as any,
      sourceName: 'anotherNodeName',
      sourceType: 'http://pid.bayer.com/kos/19014/Document',
      linkType: {
        key: 'https://pid.bayer.com/kos/19050/225896',
        value: 'Is replaced by'
      },
      target: 'nodeToExpandUri' as any,
      targetName: 'nodeToExpandName',
      targetType: 'http://pid.bayer.com/kos/19014/Document'
    };

    const mockLink2: Link = Object.assign(
      new Link(),
      JSON.parse(JSON.stringify(mockLinkDto2))
    );

    // one more link from anotherNode to oneMoreNode
    const mockLinkDto3: LinkDto = {
      display: true,
      isRendered: true,
      isVersionLink: false,
      outbound: true, // NOTE: this is an outbound link
      source: 'anotherNodeUri' as any,
      sourceName: 'anotherNodeName',
      sourceType: 'http://pid.bayer.com/kos/19014/Document',
      linkType: {
        key: 'https://pid.bayer.com/kos/19050/225896',
        value: 'Is replaced by'
      },
      target: 'oneMoreNodeUri' as any,
      targetName: 'oneMoreNodeName',
      targetType: 'http://pid.bayer.com/kos/19014/Document'
    };

    const mockLink3: Link = Object.assign(
      new Link(),
      JSON.parse(JSON.stringify(mockLinkDto3))
    );

    const mockNodeToExpand: Node = {
      id: 'nodeToExpandUri',
      links: [mockLinkDto1],
      width: 0,
      height: 0,
      shortName: '',
      name: 'nodeToExpandName',
      laterVersion: '',
      resourceType: 'http://pid.bayer.com/kos/19014/Document',
      selected: false,
      filterOutTypes: [],
      linkCount: 0,
      resourceTypeId: '',
      resourceTypeName: ''
    };

    const mockAnotherNode: Node = {
      id: 'anotherNodeUri',
      links: [mockLinkDto2],
      width: 0,
      height: 0,
      shortName: '',
      name: 'anotherNodeName',
      laterVersion: '',
      resourceType: 'http://pid.bayer.com/kos/19014/Document',
      selected: false,
      filterOutTypes: [],
      linkCount: 0,
      resourceTypeId: '',
      resourceTypeName: ''
    };

    const mockOneMoreNode: Node = {
      id: 'oneMoreNodeUri',
      links: [mockLinkDto2],
      width: 0,
      height: 0,
      shortName: '',
      name: 'oneMoreNodeName',
      laterVersion: '',
      resourceType: 'http://pid.bayer.com/kos/19014/Document',
      selected: false,
      filterOutTypes: [],
      linkCount: 0,
      resourceTypeId: '',
      resourceTypeName: ''
    };

    spyOn(graph, 'initLinks').and.stub();

    graph.nodes = [mockNodeToExpand, mockAnotherNode, mockOneMoreNode];
    graph.links = [mockLink1];
    graph.addLinks([mockLink2, mockLink3]);

    expect(graph.getLinks().length).toBe(2);
  });

  it('should find and remove inbound/outbound duplicates', () => {
    const mockIncomingLinks: Array<Link> = [mockOutboundLink, mockInboundLink];

    const expectedLinkProxys: Set<LinkProxy> = new Set();
    expectedLinkProxys.add(new LinkProxy(mockOutboundLink));

    const result = graph['convertToUniqueLinkProxys'](mockIncomingLinks);

    expect(result).toEqual(expectedLinkProxys);
  });

  it('should find and remove existing duplicates', () => {
    const mockExistingLinkProxys: Set<LinkProxy> = new Set();
    mockExistingLinkProxys.add(new LinkProxy(mockOutboundLink));

    const mockIncomingLinkProxys: Set<LinkProxy> = new Set();
    mockIncomingLinkProxys.add(new LinkProxy(mockOutboundLink));
    mockIncomingLinkProxys.add(new LinkProxy(mockInboundLink));
    mockIncomingLinkProxys.add(new LinkProxy(mockOneMoreLink));

    const expectedLinks: Array<Link> = [mockOneMoreLink];

    const result = graph['convertLinkProxysToUniqueLinks'](
      mockExistingLinkProxys,
      mockIncomingLinkProxys
    );

    expect(result).toEqual(expectedLinks);
  });

  it('should exclude links to unrendered nodes', () => {
    const mockLinkProxy1 = new LinkProxy({
      outbound: true,
      source: '1',
      target: '2',
      linkType: { key: '1', value: '1' }
    } as unknown as Link);

    const mockLinkProxy2 = new LinkProxy({
      outbound: true,
      source: '2',
      target: '3', // NOTE: will be outbound target to an unrendered node 3
      linkType: { key: '1', value: '1' }
    } as unknown as Link);

    const mockLinkProxy3 = new LinkProxy({
      outbound: false,
      source: '1',
      target: '3', // NOTE: will be outbound source to an unrendered node 3
      linkType: { key: '1', value: '1' }
    } as unknown as Link);

    graph.nodes = [
      { id: '1' } as unknown as Node,
      { id: '2' } as unknown as Node
    ];

    const result = graph['findLinksToExistingNodes'](
      new Set([mockLinkProxy1, mockLinkProxy2, mockLinkProxy3])
    );

    expect(result.size).toBe(1);
  });
});
