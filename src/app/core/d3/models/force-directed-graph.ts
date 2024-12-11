import { EventEmitter } from '@angular/core';
import { Link } from './link';
import { LinkProxy } from './LinkProxy';
import { Node } from './node';
import * as d3 from 'd3';
import { Observable } from 'rxjs';
import { Select, Store } from '@ngxs/store';
import {
  GraphProperties,
  GraphVisualisationState,
  ResetMultiSelectedPidUris,
  SetMultiSelectedPidUris
} from '../../../state/graph-visualisation.state';
import { LinkDto } from '../../../shared/models/link-dto';
import { Constants } from '../../../shared/constants';

export class ForceDirectedGraph {
  @Select(GraphVisualisationState.getGraphVisualisationState)
  private graphData$: Observable<GraphProperties>;

  public ticker: EventEmitter<d3.Simulation<Node, Link>> = new EventEmitter();

  public simulation!: d3.Simulation<any, any>;

  public GRID_SIZE = {
    xWidth: 300,
    yHeight: 60,
    leftGridBoundary: -6000,
    rightGridBoundary: 6000,
    upperGridBoundary: 3000,
    lowerGridBoundary: -3000
  };

  public grid = new Map<string, { x: number; y: number; occupied: boolean }>();
  public nodes: Node[] = [];
  public links: Link[] = [];

  public filterInfo: any = {
    filterViewEnabled: false,
    filteredNodes: []
  };

  public draggingActive: boolean = false;

  tableType = Constants.ResourceTypes.Table;
  columnType = Constants.ResourceTypes.Column;

  constructor(
    nodes: any,
    links: any,
    options: { width: any; height: any },
    private store: Store
  ) {
    this.nodes = nodes;
    this.links = links;
    this.initSimulation(options);

    this.graphData$.subscribe((r) => {
      this.simulation = this.simulation.alphaTarget(0.3).restart();

      this.filterInfo.filterViewEnabled = r?.filterViewEnabled;
      this.filterInfo.filteredNodes = r?.filteredNodes;

      this.draggingActive = r?.draggingActive;

      if (r?.filterViewEnabled) {
        this.simulation.restart();
      }

      this.updateUnrenderedNodeCounts();
    });
  }

  initNodes() {
    if (!this.simulation) {
      throw new Error('simulation was not initialized yet');
    }

    this.simulation.nodes(this.nodes);
  }

  initLinks() {
    if (!this.simulation) {
      throw new Error('simulation was not initialized yet');
    }

    this.simulation.force(
      'links',
      d3
        .forceLink(this.links)
        .id((d: any) => d.id)
        .distance(1.5)
        .strength(1.5)
    );
  }

  linkCurveWithOffset(
    s: { x: number; y: number },
    e: { x: number; y: number },
    connectionPointSource: string,
    offsetCount: number
  ) {
    let p1x: number = s.x;
    let p1y: number = s.y;
    let p2x: number = e.x;
    let p2y: number = e.y;
    let offset: number = 20;

    if (
      (this.coordinatesWithinRange(p1x, p2x, 20) ||
        this.coordinatesWithinRange(p1y, p2y, 20)) &&
      offsetCount === 0
    ) {
      // if the nodes are vertically or horizontally aligned and it is the first link no curve is needed
      return `M ${p1x} ${p1y} L ${p2x} ${p2y}`;
    } else if (this.coordinatesWithinRange(p1y, p2y, 20)) {
      // nodes are horizontally aligned and it is not the first link
      let mpx = (p2x + p1x) * 0.5;

      // links with odd index will be drawn as a downwards opened curve
      if (offsetCount % 2 != 0) {
        let totalOffset = (0.5 * offsetCount + 0.5) * (2 * offset);

        return `M ${p1x} ${p1y} Q ${mpx} ${p1y + totalOffset} ${p2x} ${p2y}`;
      }
      // links with even index will be drawn as a upwards opened curve
      else {
        let totalOffset = -0.5 * offsetCount * 2 * offset;

        return `M ${p1x} ${p1y} Q ${mpx} ${p1y + totalOffset} ${p2x} ${p2y}`;
      }
    } else {
      // mid-point of line:
      let mpx = (p2x + p1x) * 0.5;
      let mpy = (p2y + p1y) * 0.5;

      //control points
      let c1x;

      if (connectionPointSource == 'left' || connectionPointSource == 'right') {
        c1x = mpx;
      } else {
        c1x = p1x;
      }

      let c1y = p1y;

      let c2x = c1x;
      let c2y = mpy;

      let c3x;

      if (connectionPointSource == 'left' || connectionPointSource == 'right') {
        c3x = mpx;
      } else {
        c3x = mpx + (p2x - mpx) * 1;
      }

      let c3y = p2y;

      // String used to render the link with the curves as a SVG
      // first link can be drawn as a curve without moving the control points of the curve
      if (offsetCount == 0) {
        return `
                M ${p1x} ${p1y}
                C ${c1x} ${c1y} ${c2x} ${c2y} ${mpx} ${mpy}
                S ${c3x} ${c3y} ${p2x} ${p2y}
                `;
      }
      // all other links with odd index need to adjust the position of the control points in the positive x and y direction
      else if (offsetCount % 2 != 0) {
        let totalOffset = (0.5 * offsetCount + 0.5) * offset;

        return `
                M ${p1x} ${p1y}
                C ${c1x + totalOffset} ${c1y} ${c2x + totalOffset} ${c2y + totalOffset} ${mpx + totalOffset} ${mpy + totalOffset}
                S ${c3x + totalOffset} ${c3y} ${p2x} ${p2y}
                `;
      }
      // all other links with even index need to adjust the position of the control points in the negative x and y direction
      else {
        let totalOffset = -0.5 * offsetCount * offset;

        return `
                M ${p1x} ${p1y}
                C ${c1x + totalOffset} ${c1y} ${c2x + totalOffset} ${c2y + totalOffset} ${mpx + totalOffset} ${mpy + totalOffset}
                S ${c3x + totalOffset} ${c3y} ${p2x} ${p2y}
                `;
      }
    }
  }

  initSimulation(options: any) {
    if (!options || !options.width || !options.height) {
      throw new Error('missing options when initializing simulation');
    }

    /** Creating the simulation */
    if (!this.simulation) {
      const ticker = this.ticker;

      this.simulation = d3.forceSimulation();

      var that = this;

      // Connecting the d3 ticker to an angular event emitter that ticks, function below is run on every tick
      this.simulation
        .on('tick', function () {
          // Reset and initialize the grid
          that.grid.clear();
          that.setGridSize(that.nodes);
          that.initGrid();

          // Nodes should only move themself to a grid position if user is not currently dragging nodes
          if (!that.draggingActive) {
            that.nodes.forEach((node) => {
              // Decide which gridpoint to use for the node
              let gridpoint = that.occupyNearest(node);

              if (gridpoint) {
                // Newly loaded nodes can jump to position, existing nodes should move smooth to position
                if (!node.fx && !node.fy) {
                  node.fx = gridpoint.x;
                  node.fy = gridpoint.y;
                } else {
                  node.fx! += (gridpoint.x - node.x!) * 0.05;
                  node.fy! += (gridpoint.y - node.y!) * 0.05;
                }
              }
            });

            that.initNodes();
          }

          // group the links by source and target node, so multiple links between two nodes can be drawn
          let groupedLinks = that.links.reduce((result, link) => {
            let key = `${link.source.id}${link.target.id}`;
            let reversedKey = link.target.id + link.source.id;

            if (!result[key] && !result[reversedKey]) {
              result[key] = [];
            }

            if (key in result) {
              result[key].push(link);
            }

            if (reversedKey in result) {
              result[reversedKey].push(link);
            }

            return result;
          }, {});

          for (const key in groupedLinks) {
            groupedLinks[key].forEach((l, index) => {
              l.display = true;

              // linkOffset is used to move the textbox of a link, if there are multiple links between two nodes
              if (index == 0) {
                l.linkOffset = 0;
              } else if (index % 2 != 0) {
                let totalOffset = (0.5 * index + 0.5) * 20;
                l.linkOffset = totalOffset;
              } else {
                let totalOffset = -0.5 * index * 20;
                l.linkOffset = totalOffset;
              }

              // When filterview is enabled the links need a different calculation so the attachemnt is still right
              let sourceFilter: number = 0;
              let targetFilter: number = 0;

              // Depending on resource types, certain links don't have to be displayed since there nodes also wont be displayed
              let filterSkip = that.filterOutLinks([
                l.source.resourceTypeId,
                l.target.resourceTypeId
              ]);

              if (that.filterInfo?.filterViewEnabled == true) {
                if (filterSkip) {
                  l.display = false;

                  return;
                }

                that.filterInfo.filteredNodes.forEach((item: any) => {
                  if (item.nodeuri === l.source.id) {
                    sourceFilter++;
                  }

                  if (item.nodeuri === l.target.id) {
                    targetFilter++;
                  }
                });
              }

              //Calculate attachements points for links on the nodes
              const sourceWidth: number = isNaN(l.source.width)
                ? 0
                : l.source.width;

              const targetWidth: number = isNaN(l.target.width)
                ? 0
                : l.target.width;

              const CONNECTION_POINTS_SOURCE = {
                LEFT: { x: 0, y: 20 },
                RIGHT: { x: sourceWidth, y: 20 },
                TOP: { x: sourceWidth / 2, y: 0 },
                BOTTOM: { x: sourceWidth / 2, y: 40 }
              };

              const CONNECTION_POINTS_TARGET = {
                LEFT: { x: 0, y: 20 },
                RIGHT: { x: targetWidth, y: 20 },
                TOP: { x: targetWidth / 2, y: 0 },
                BOTTOM: { x: targetWidth / 2, y: 40 }
              };

              let endPoint: { x: number; y: number } = {
                x: Math.round(l.target.x!),
                y: Math.round(l.target.y! + 20)
              };

              let startPoint: { x: number; y: number } = {
                x: Math.round(l.source.x!),
                y: Math.round(l.source.y! + 20)
              };

              //decide which endpoint to use
              //TODO: Change so that the calculation is done using the center point of each node
              let dY: number = l.target.y! - l.source.y!;
              let dX: number = l.target.x! - l.source.x!;
              let sourcefiltercount = sourceFilter ? sourceFilter * 20 + 20 : 0;
              let targetfiltercount = targetFilter ? sourceFilter * 20 + 20 : 0;
              let connectionPointSource: string = '';

              if (!(dX >= -175 && dX <= 175)) {
                //target point is either the leftmost or rightmost
                if (dX >= 0) {
                  //its the left connection point
                  endPoint.x =
                    Math.round(l.target.x!) + CONNECTION_POINTS_TARGET.LEFT.x;
                  endPoint.y =
                    Math.round(l.target.y!) + CONNECTION_POINTS_TARGET.LEFT.y;
                  startPoint.x =
                    Math.round(l.source.x!) + CONNECTION_POINTS_SOURCE.RIGHT.x;
                  startPoint.y =
                    Math.round(l.source.y!) + CONNECTION_POINTS_SOURCE.RIGHT.y;
                  connectionPointSource = 'right';
                } else {
                  //its the right connection point
                  endPoint.x =
                    Math.round(l.target.x!) + CONNECTION_POINTS_TARGET.RIGHT.x;
                  endPoint.y =
                    Math.round(l.target.y!) + CONNECTION_POINTS_TARGET.RIGHT.y;
                  startPoint.x =
                    Math.round(l.source.x!) + CONNECTION_POINTS_SOURCE.LEFT.x;
                  startPoint.y =
                    Math.round(l.source.y!) + CONNECTION_POINTS_SOURCE.LEFT.y;
                  connectionPointSource = 'left';
                }
              } else {
                if (dY >= 0) {
                  //its the upper connection point
                  endPoint.x =
                    Math.round(l.target.x!) + CONNECTION_POINTS_TARGET.TOP.x;
                  endPoint.y =
                    Math.round(l.target.y!) + CONNECTION_POINTS_TARGET.TOP.y;
                  startPoint.x =
                    Math.round(l.source.x!) + CONNECTION_POINTS_SOURCE.BOTTOM.x;
                  startPoint.y =
                    Math.round(l.source.y!) +
                    CONNECTION_POINTS_SOURCE.BOTTOM.y +
                    sourcefiltercount;
                  connectionPointSource = 'bottom';
                } else {
                  //its the lower connection point
                  endPoint.x =
                    Math.round(l.target.x!) +
                    CONNECTION_POINTS_TARGET.BOTTOM.x +
                    targetfiltercount;
                  endPoint.y =
                    Math.round(l.target.y!) +
                    CONNECTION_POINTS_TARGET.BOTTOM.y +
                    targetfiltercount;
                  startPoint.x =
                    Math.round(l.source.x!) + CONNECTION_POINTS_SOURCE.TOP.x;
                  startPoint.y =
                    Math.round(l.source.y!) + CONNECTION_POINTS_SOURCE.TOP.y;
                  connectionPointSource = 'top';
                }
              }

              l.startPoint = startPoint;
              l.endPoint = endPoint;
              l.d = that.linkCurveWithOffset(
                startPoint,
                endPoint,
                connectionPointSource,
                index
              );
            });
          }
          ticker.emit(this);
        })
        .on('end', function () {
          for (let node of that.nodes) {
            node.fx = node.x;
            node.fy = node.y;
          }
        });
    }

    this.initNodes();
    this.initLinks();

    /** Restarting the simulation internal timer */
    this.simulation.restart();
  }

  resetGraph() {
    this.simulation.stop();

    this.nodes = [];
    this.links = [];

    this.initNodes();
    this.initLinks();

    this.simulation.restart();
  }

  addNodes(nodes: Node[]) {
    let checkedNodes: Node[] = [];

    nodes.forEach((n) => {
      if (this.nodes.findIndex((cn) => cn.id == n.id) > -1) {
      } else {
        checkedNodes.push(
          Object.assign(new Node(n.id), JSON.parse(JSON.stringify(n)))
        );
      }
    });

    this.nodes = this.nodes.concat(checkedNodes);

    this.initNodes();

    this.simulation = this.simulation.tick(50);

    this.updateUnrenderedNodeCounts();
  }

  setNodes(nodes: Node[]) {
    //TODO: Check the nodes array for duplicate nodes. If there are duplicates, remove one of them
    let newNodes: Node[] = [];

    nodes.forEach((node) => {
      newNodes.push(
        Object.assign(new Node(node.id), JSON.parse(JSON.stringify(node)))
      );
    });

    this.nodes = newNodes;

    this.initNodes();

    this.simulation.restart();
    this.updateUnrenderedNodeCounts();
  }

  removeNodes(nodes: Node[]) {
    nodes.forEach((n) => {
      this.nodes = this.nodes.filter((no) => {
        return no.id != n.id;
      });
    });

    //TODO: Remove links related to that node to prevent errors
    this.links = this.links.filter(
      (l) =>
        this.nodes.some((n) => n.id == l.target.id, this) &&
        this.nodes.some((n) => n.id == l.source.id, this)
    );

    this.initNodes();
    this.initLinks();

    this.simulation.restart();
    this.updateUnrenderedNodeCounts();
  }

  /**
   * check if the node with a given ID exists in the current simulation
   * @param nodeId ID of the node to be checked
   */
  validateNodeExists(nodeId: any): boolean {
    const index = this.nodes.findIndex((n) => n.id == nodeId);

    return index > -1;
  }

  /**
   * Add provided Links to the graph, keeping already existing links.
   * Target Nodes should exist in the graph, so call AddNodes() / SetNodes() first if necessary.
   *
   * @param linksToAdd array of Links to be added to the graph
   */
  addLinks(linksToAdd: Link[]) {
    const validatedLinksToAdd: Array<Link> = [];

    const existingUniqueLinkProxys: Set<LinkProxy> =
      this.convertToUniqueLinkProxys(this.links);

    const incomingUniqueLinkProxys: Set<LinkProxy> =
      this.convertToUniqueLinkProxys(linksToAdd);

    const incomingLinksToExistingNodes: Set<LinkProxy> =
      this.findLinksToExistingNodes(incomingUniqueLinkProxys);

    this.convertLinkProxysToUniqueLinks(
      existingUniqueLinkProxys,
      incomingLinksToExistingNodes
    ).forEach((incomingLink: Link) => {
      incomingLink.display = true;
      incomingLink.isRendered = true;

      if (!incomingLink.isVersionLink) {
        validatedLinksToAdd.push(
          // Need to parse this to JSON to avoid issues with the object references
          // and issues with drawing the links in the graph
          Object.assign(new Link(), JSON.parse(JSON.stringify(incomingLink)))
        );
      } else {
        const source = this.nodes.find(
          (n) => n?.id === this.getPid(incomingLink.source)
        );

        // Version links exist between all version,
        // but we only want to draw a simplified representation:
        // single path from earliest, to next, to latest version
        if (
          source.laterVersion !== '' &&
          this.getPid(incomingLink.target) === source.laterVersion
        ) {
          validatedLinksToAdd.push(
            // Need to parse this to JSON to avoid issues with the object references
            // and issues with drawing the links in the graph
            Object.assign(new Link(), JSON.parse(JSON.stringify(incomingLink)))
          );
        }
      }
    });

    this.links = this.links.concat(validatedLinksToAdd);

    this.initLinks();

    this.simulation.restart();
    this.updateUnrenderedNodeCounts();
  }

  /**
   * Nodes can have sources and targets in a form of a Node object or as a direct PID link string.
   * This method always returns the PID link, so it doesn't matter if source/target
   * is a Node or the PID string itself.
   *
   * @param target a link's target, which can be a Node or a PID as a string
   * @returns true if target is a Node, false if it is a string
   */
  getPid(target: Node | string): string {
    return this.isNode(target) ? target.id : target;
  }

  private isNode(target: Node | string): target is Node {
    return (target as Node)?.id !== undefined;
  }

  /**
   * Verifies that the links in the provided set have both source and target nodes existing in the graph.
   *
   * @param incomingLinkProxys Set of incoming LinkProxys to be checked against existing nodes
   * @returns Set of LinkProxys that have both source and target nodes existing in the graph
   */
  private findLinksToExistingNodes(
    incomingLinkProxys: Set<LinkProxy>
  ): Set<LinkProxy> {
    const result: Set<LinkProxy> = new Set();

    incomingLinkProxys.forEach((linkProxy) => {
      if (
        this.validateNodeExists(linkProxy.outboundTargetId) &&
        this.validateNodeExists(linkProxy.outboundSourceId)
      ) {
        result.add(linkProxy);
      }
    });

    return result;
  }

  /**
   * Normalizes the links array by converting to LinkProxys and removing duplicates.
   *
   * @param links Array of Links to be checked for duplicates
   * @returns Array of LinkProxys without duplicates
   */
  private convertToUniqueLinkProxys(links: Array<Link>): Set<LinkProxy> {
    let result: Set<LinkProxy> = new Set();

    const linkProxys: Array<LinkProxy> = links.map(
      (link) => new LinkProxy(link)
    );

    linkProxys.forEach((linkProxy) => {
      let isInSet = false;

      result.forEach((existingLink) => {
        if (linkProxy.isSameByValue(existingLink)) {
          isInSet = true;
          return;
        }
      });

      // Version links exist between all version,
      // but we only want to draw a simplified representation:
      // from earliest to next to latest version, always outbound.
      // So any INBOUND version link can be ignored at this point.
      if (
        !isInSet &&
        !(
          linkProxy.originalLink.isVersionLink &&
          !linkProxy.originalLink.outbound
        )
      ) {
        result.add(linkProxy);
      }
    });

    return result;
  }

  /**
   * Converts a set of LinkProxys to an array of unique Links,
   * avoiding duplicates with existing LinkProxys.
   *
   * @param existingLinkProxys Set of existing LinkProxys
   * @param incomingLinkProxys Set of incoming LinkProxys
   * @returns Array of unique Links
   */
  private convertLinkProxysToUniqueLinks(
    existingLinkProxys: Set<LinkProxy>,
    incomingLinkProxys: Set<LinkProxy>
  ): Array<Link> {
    const uniqueLinks = new Set<LinkProxy>();

    incomingLinkProxys.forEach((incomingLink) => {
      let isDuplicate = false;

      existingLinkProxys.forEach((existingLink) => {
        if (incomingLink.isSameByValue(existingLink)) {
          isDuplicate = true;
          return;
        }
      });

      if (!isDuplicate) {
        uniqueLinks.add(incomingLink);
      }
    });

    return Array.from(uniqueLinks).map((link) =>
      this.convertToOutboundLink(link.originalLink)
    );
  }

  /**
   * We only draw outbound links, so we need to rotate the incoming links before rendering them.
   *
   * @param link any Link, inbound or outbound
   * @returns either the original Link if it is outbound,
   *          or a new Link with reversed source and target properties
   */
  private convertToOutboundLink(link: Link): Link {
    if (!link.outbound) {
      const originalSource = link.source;
      const originalSourceName = link.sourceName;
      const originalSourceType = link.sourceType;

      link.source = link.target;
      link.sourceName = link.targetName;
      link.sourceType = link.targetType;

      link.target = originalSource;
      link.targetName = originalSourceName;
      link.targetType = originalSourceType;

      link.outbound = true;
    }

    return link;
  }

  /**
   * Set provided Links to the graph, overwrting/removing any existing links.
   *
   * (Legacy implementation)
   *
   * @param links Array of Links to be added to the graph
   */
  setLinks(links: Link[]) {
    let checkedLinks: Link[] = this.getValidatedLinks(
      links.map((link) =>
        Object.assign(new Link(), this.convertToOutboundLink(link))
      )
    );

    let newLinks: Link[] = [];

    checkedLinks.forEach((l) => {
      newLinks.push(Object.assign(new Link(), JSON.parse(JSON.stringify(l))));
    });

    this.links = newLinks;

    this.initLinks();

    this.simulation.restart();
    this.updateUnrenderedNodeCounts();
  }

  toggleNode(id: string) {
    const ind = this.nodes.findIndex((n) => n.id == id);

    if (ind > -1) {
      this.nodes[ind].selected = !this.nodes[ind].selected;
    }

    const selectedNodesPidUris = this.nodes
      .filter((n) => n.selected)
      .map((n) => n.id);

    this.store.dispatch(new SetMultiSelectedPidUris(selectedNodesPidUris));
  }

  toggleExclusive(id: string) {
    this.nodes.forEach((n) => {
      if (n.id != id) {
        n.selected = false;
      } else {
        n.selected = !n.selected;
      }
    });

    this.store.dispatch(new ResetMultiSelectedPidUris());
  }

  selectNodes(ids: string[]) {
    this.nodes.forEach((n) => {
      if (ids.includes(n.id)) {
        n.selected = true;
      }
    });
  }

  updateUnrenderedNodeCounts() {
    this.nodes
      .filter((n) => n.links.length > 0)
      .forEach((node: Node) => {
        node.links.forEach((link: LinkDto) => {
          var isSchemaResource = this.filterOutNodes([
            link.sourceType,
            link.targetType
          ]);

          var targetExists = this.validateNodeExists(link.target);
          var sourceExists = this.validateNodeExists(link.source);

          link.display = this.filterInfo?.filterViewEnabled
            ? !isSchemaResource
            : true;

          link.isRendered = link.display && targetExists && sourceExists;
        });
      });
  }

  /**
   * Check whether the source and target nodes for each link in a list of links exist and return only the links, where source and target node exist in the simulation
   *
   * If either source or target node do not exist,
   * @param links List of links to be checked
   */
  getValidatedLinks(links: Link[]) {
    let checkedLinks: Link[] = [];

    links.forEach((l) => {
      if (!l.isRendered) {
        if (
          this.validateNodeExists(l.source) &&
          this.validateNodeExists(l.target)
        ) {
          l.isRendered = true;
          //Reverse source and target in accordance to outbound parameter for the duplicate check

          var trueSource = l.outbound ? l.source : l.target;
          var trueTarget = l.outbound ? l.target : l.source;

          //do not add duplicates
          if (!this.isLinkDuplicate(trueSource, trueTarget, l.linkTypeId)) {
            const ind = checkedLinks.findIndex(
              (chl) =>
                chl.target === l.source &&
                chl.source === l.target &&
                !chl.outbound == l.outbound
            );

            if (ind === -1) {
              checkedLinks.push(l);
            }
          }
        }
      }
    });

    let sanitizedList: Link[] = [];

    //check if there are duplicates in the list
    sanitizedList = checkedLinks.filter(function (item, index) {
      var ind = checkedLinks.findIndex(
        (l) =>
          l.source == item.source &&
          l.target == item.target &&
          item.linkTypeId == l.linkTypeId
      );

      return ind == index;
    });

    return sanitizedList;
  }

  isLinkDuplicate(source: any, target: any, type: string) {
    return (
      this.links.findIndex(
        (l) =>
          (l.source == source && l.target == target && l.linkTypeId == type) ||
          (l.source.id == source &&
            l.target.id == target &&
            l.linkTypeId == type)
      ) > -1
    );
  }

  removeLinks(links: Link[]) {
    links.forEach((l) => {
      let linkIndex: number = -1;

      if (l.source.id) {
        linkIndex = this.links.findIndex(
          (x) =>
            x.source.id == l.source.id &&
            x.target.id == l.target.id &&
            x.linkType.key == l.linkType.key
        );
      } else {
        linkIndex = this.links.findIndex(
          (x) =>
            x.source.id == (l.source as any) &&
            x.target.id == (l.target as any) &&
            x.linkType.key == l.linkType.key
        );
      }

      if (linkIndex > -1) {
        this.links.splice(linkIndex, 1);
      }
    });

    this.initLinks();

    this.simulation.restart();
  }

  getNodes(): Node[] {
    return this.nodes;
  }

  getLinks(): Link[] {
    return this.links;
  }

  generateShortName(longName: string) {
    let segments: string[] = longName.split(' ');
    for (var i = 0; i < segments.length; i++) {
      if (segments[i].length > 3) {
        segments[i] = segments[i].substring(0, 3);
      }
    }

    return segments.join('-');
  }

  filterOutLinks(resourceTypes: string[]) {
    let value: Boolean = false;

    if (resourceTypes.includes(this.tableType)) {
      value = true;
    } else if (resourceTypes.includes(this.columnType)) {
      value = true;
    }

    return value;
  }

  filterOutNodes(types: string[]) {
    if (types.includes(this.tableType) || types.includes(this.columnType)) {
      return true;
    }

    return false;
  }

  initGrid() {
    for (
      let i = this.GRID_SIZE.leftGridBoundary;
      i <= this.GRID_SIZE.rightGridBoundary;
      i += this.GRID_SIZE.xWidth
    ) {
      for (
        let j = this.GRID_SIZE.lowerGridBoundary;
        j <= this.GRID_SIZE.upperGridBoundary;
        j += this.GRID_SIZE.yHeight
      ) {
        this.grid.set(`x:${i}-y:${j}`, { x: i, y: j, occupied: false });
      }
    }
  }

  occupyNearest(n: Node) {
    const x = Math.round(n.x / this.GRID_SIZE.xWidth) * this.GRID_SIZE.xWidth;
    let y = Math.round(n.y / this.GRID_SIZE.yHeight) * this.GRID_SIZE.yHeight;

    let gridPosition = this.grid.get(`x:${x}-y:${y}`);

    if (gridPosition == null) {
      return null;
    }

    let positionOccupied = gridPosition.occupied;

    while (positionOccupied && y < this.GRID_SIZE.upperGridBoundary) {
      y += this.GRID_SIZE.yHeight;
      gridPosition = this.grid.get(`x:${x}-y:${y}`);
      positionOccupied = gridPosition.occupied;
    }

    gridPosition.occupied = true;

    return gridPosition;
  }

  setGridSize(nodes: Node[]) {
    let xValues = nodes.map((node) => node.fx);
    let minXPosition = xValues.length ? Math.min(...xValues) : 0;
    let maxXPosition = xValues.length ? Math.max(...xValues) : 0;

    let yValues = nodes.map((node) => node.fy);
    let minYPosition = yValues.length ? Math.min(...yValues) : 0;
    let maxYPosition = yValues.length ? Math.min(...yValues) : 0;

    if (minXPosition < this.GRID_SIZE.leftGridBoundary) {
      this.GRID_SIZE.leftGridBoundary =
        Math.ceil(minXPosition / this.GRID_SIZE.xWidth) *
          this.GRID_SIZE.xWidth +
        20 * this.GRID_SIZE.xWidth;
    }

    if (maxXPosition > this.GRID_SIZE.rightGridBoundary) {
      this.GRID_SIZE.rightGridBoundary =
        Math.ceil(maxXPosition / this.GRID_SIZE.xWidth) *
          this.GRID_SIZE.xWidth +
        20 * this.GRID_SIZE.xWidth;
    }

    if (minYPosition < this.GRID_SIZE.lowerGridBoundary) {
      this.GRID_SIZE.lowerGridBoundary =
        Math.ceil(minYPosition / this.GRID_SIZE.yHeight) *
          this.GRID_SIZE.yHeight +
        20 * this.GRID_SIZE.yHeight;
    }

    if (maxYPosition > this.GRID_SIZE.upperGridBoundary) {
      this.GRID_SIZE.upperGridBoundary =
        Math.ceil(maxYPosition / this.GRID_SIZE.yHeight) *
          this.GRID_SIZE.yHeight +
        20 * this.GRID_SIZE.yHeight;
    }
  }

  checkAvailablePositions(
    xCoordinate: number,
    yCoordinate: number,
    columnHeight: number,
    shift: number
  ) {
    let availablePositions = {
      upperAvailablePositions: -1,
      lowerAvailablePositions: -1,
      spaceToShiftUp: 0,
      spaceToShiftDown: 0
    };

    xCoordinate = Math.round(xCoordinate);
    yCoordinate = Math.round(yCoordinate);

    let upperYCoordinate = yCoordinate;
    let lowerYCoordinate = yCoordinate + this.GRID_SIZE.yHeight;

    // loopBound = half of columHeight + 1 spacer + shift
    const loopBound = Math.floor(columnHeight / 2) + 1 + shift;

    for (let i = 0; i <= loopBound; i++) {
      const mapKey = `x:${xCoordinate}-y:${upperYCoordinate}`;

      const gridPosition = this.grid.get(mapKey);

      if (gridPosition.occupied && (i == 0 || i == 1)) {
        return availablePositions;
      } else {
        if (gridPosition.occupied) break;

        if (
          availablePositions.upperAvailablePositions <
          Math.floor(columnHeight / 2) + 1
        ) {
          availablePositions.upperAvailablePositions++;
        } else {
          availablePositions.spaceToShiftUp++;
        }
      }
      upperYCoordinate -= this.GRID_SIZE.yHeight;
    }

    for (let i = 1; i <= loopBound; i++) {
      const mapKey = `x:${xCoordinate}-y:${lowerYCoordinate}`;

      const gridPosition = this.grid.get(mapKey);

      if (gridPosition.occupied && i == 1) {
        return availablePositions;
      } else {
        if (gridPosition.occupied) {
          break;
        }

        if (
          availablePositions.lowerAvailablePositions <
          Math.floor(columnHeight / 2)
        ) {
          availablePositions.lowerAvailablePositions++;
        } else {
          availablePositions.spaceToShiftDown++;
        }
      }

      lowerYCoordinate += this.GRID_SIZE.yHeight;
    }

    return availablePositions;
  }

  coordinatesWithinRange(number, target, range) {
    return number >= target - range && number <= target + range;
  }
}
