import { EventEmitter } from '@angular/core';
import { Link } from './link';
import { Node } from './node';
import * as d3 from 'd3';
import { Observable } from 'rxjs';
import { Select, Store } from '@ngxs/store';
import {
  GraphProperties,
  GraphVisualisationState,
  ResetMultiSelectedPidUris,
  SetMultiSelectedPidUris,
} from '../../../state/graph-visualisation.state';
import { LinkDto } from '../../../shared/models/link-dto';
import { Constants } from '../../../shared/constants';

export class ForceDirectedGraph {
  public ticker: EventEmitter<d3.Simulation<Node, Link>> = new EventEmitter();
  public simulation!: d3.Simulation<any, any>;
  @Select(GraphVisualisationState.getGraphVisualisationState)
  private graphData$: Observable<GraphProperties>;

  public GRID_SIZE = {
    xWidth: 300,
    yHeight: 60,
    leftGridBoundary: -6000,
    rightGridBoundary: 6000,
    upperGridBoundary: 3000,
    lowerGridBoundary: -3000,
  };
  public grid = new Map<string, { x: number; y: number; occupied: boolean }>();
  public nodes: Node[] = [];
  public links: Link[] = [];
  public filterInfo: any = {
    filterViewEnabled: false,
    filteredNodes: [],
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
      this.filterInfo.filterViewEnabled = r.filterViewEnabled;
      this.filterInfo.filteredNodes = r.filteredNodes;
      this.draggingActive = r.draggingActive;
      if (r.filterViewEnabled) {
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

  // Calculate the double curve in the link between nodes
  linkCurve(
    s: { x: number; y: number },
    e: { x: number; y: number },
    connectionPointSource: string
  ) {
    let p1x: number = s.x;
    let p1y: number = s.y;
    let p2x: number = e.x;
    let p2y: number = e.y;
    let returnString = '';

    if (s.x == e.x || s.y == e.y) {
      // if the nodes are vertically or horizontally alligned no curve is needed
      returnString = `M ${p1x} ${p1y} L ${p2x} ${p2y}`;
    } else {
      // mid-point of line:
      var mpx = (p2x + p1x) * 0.5;
      var mpy = (p2y + p1y) * 0.5;

      //control points
      var c1x;
      if (connectionPointSource == 'left' || connectionPointSource == 'right') {
        c1x = p1x + (mpx - p1x) * 1;
      } else {
        c1x = p1x;
      }
      var c1y = p1y;
      var c2x = c1x;
      var c2y = mpy;
      var c3x;
      if (connectionPointSource == 'left' || connectionPointSource == 'right') {
        c3x = mpx + (p2x - mpx) * 0.03;
      } else {
        c3x = mpx + (p2x - mpx) * 1;
      }
      var c3y = p2y;

      // String used to render the link with the curves as a SVG
      returnString = `
      M ${p1x} ${p1y}
      C ${c1x} ${c1y} ${c2x} ${c2y} ${mpx} ${mpy}
      S ${c3x} ${c3y} ${p2x} ${p2y}
      `;
    }
    return returnString;
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

          that.links.forEach((l) => {
            l.display = true;
            // When filterview is enabled the links need a different calculation so the attachemnt is still right
            let sourceFilter: number = 0;
            let targetFilter: number = 0;
            // Depending on resource types, certain links don't have to be displayed since there nodes also wont be displayed
            let filterSkip = that.filterOutLinks([
              l.source.resourceTypeId,
              l.target.resourceTypeId,
            ]);
            if (that.filterInfo.filterViewEnabled == true) {
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
              BOTTOM: { x: sourceWidth / 2, y: 20 },
            };

            const CONNECTION_POINTS_TARGET = {
              LEFT: { x: 0, y: 20 },
              RIGHT: { x: targetWidth, y: 20 },
              TOP: { x: targetWidth / 2, y: 0 },
              BOTTOM: { x: targetWidth / 2, y: 40 },
            };

            let endPoint: { x: number; y: number } = {
              x: l.target.x!,
              y: l.target.y! + 20,
            };
            let startPoint: { x: number; y: number } = {
              x: l.source.x!,
              y: l.source.y! + 20,
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
                endPoint.x = l.target.x! + CONNECTION_POINTS_TARGET.LEFT.x;
                endPoint.y = l.target.y! + CONNECTION_POINTS_TARGET.LEFT.y;
                startPoint.x = l.source.x! + CONNECTION_POINTS_SOURCE.RIGHT.x;
                startPoint.y = l.source.y! + CONNECTION_POINTS_SOURCE.RIGHT.y;
                connectionPointSource = 'right';
              } else {
                //its the right connection point
                endPoint.x = l.target.x! + CONNECTION_POINTS_TARGET.RIGHT.x;
                endPoint.y = l.target.y! + CONNECTION_POINTS_TARGET.RIGHT.y;
                startPoint.x = l.source.x! + CONNECTION_POINTS_SOURCE.LEFT.x;
                startPoint.y = l.source.y! + CONNECTION_POINTS_SOURCE.LEFT.y;
                connectionPointSource = 'left';
              }
            } else {
              if (dY >= 0) {
                //its the upper connection point
                endPoint.x = l.target.x! + CONNECTION_POINTS_TARGET.TOP.x;
                endPoint.y = l.target.y! + CONNECTION_POINTS_TARGET.TOP.y;
                startPoint.x = l.source.x! + CONNECTION_POINTS_SOURCE.BOTTOM.x;
                startPoint.y =
                  l.source.y! +
                  CONNECTION_POINTS_SOURCE.BOTTOM.y +
                  sourcefiltercount;
                connectionPointSource = 'bottom';
              } else {
                //its the lower connection point
                endPoint.x = l.target.x! + CONNECTION_POINTS_TARGET.BOTTOM.x;
                endPoint.y =
                  l.target.y! +
                  CONNECTION_POINTS_TARGET.BOTTOM.y +
                  targetfiltercount;
                startPoint.x = l.source.x! + CONNECTION_POINTS_SOURCE.TOP.x;
                startPoint.y = l.source.y! + CONNECTION_POINTS_SOURCE.TOP.y;
                connectionPointSource = 'top';
              }
            }
            l.startPoint = startPoint;
            l.endPoint = endPoint;
            l.d = that.linkCurve(startPoint, endPoint, connectionPointSource);
          });
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

  addNode(pNode: Node) {
    let node: Node = Object.assign(
      new Node(pNode.id),
      JSON.parse(JSON.stringify(pNode))
    );
    //dont add node since it is already existing
    if (this.nodes.findIndex((n) => n.id == node.id) > -1) {
    } else {
      node.shortName = this.generateShortName(node.name);
      this.nodes.push(node);
      this.initNodes();
      this.simulation = this.simulation.tick(50);
      this.updateUnrenderedNodeCounts();
    }
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
    this.nodes = this.decoupleNodeList(nodes);
    this.initNodes();
    this.simulation.restart();
    this.updateUnrenderedNodeCounts();
  }

  /**Remove a single node by passing its ID */
  removeNodeById(nodeId: string) {
    var nodeToBeDeleted = this.nodes.find((n) => n.id == nodeId);
    if (nodeToBeDeleted) {
      this.removeNodes([nodeToBeDeleted]);
    }
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
   * Add a link to the current simulation
   * @param link Link object to be added
   */
  addLink(link: Link) {
    this.addLinks([link]);
  }

  addLinks(links: Link[]) {
    let checkedLinks: Link[] = this.getValidatedLinks(
      links
        .filter((l) => l.display)
        .map((l) => {
          if (l.outbound) {
            return Object.assign(new Link(), l);
          } else {
            var originalSource = l.source;
            var reversedLink = l;
            reversedLink.source = reversedLink.target;
            reversedLink.target = originalSource;
            return Object.assign(new Link(), reversedLink);
          }
        })
    );
    this.links = this.links.concat(checkedLinks);
    this.initLinks();
    this.simulation.restart();
    this.updateUnrenderedNodeCounts();
  }

  setLinks(links: Link[]) {
    let checkedLinks: Link[] = this.getValidatedLinks(
      links.map((l) => {
        if (l.outbound) {
          return Object.assign(new Link(), l);
        } else {
          var originalSource = l.source;
          var reversedLink = l;
          reversedLink.source = reversedLink.target;
          reversedLink.target = originalSource;
          return Object.assign(new Link(), reversedLink);
        }
      })
    );
    this.links = this.decoupleLinkList(checkedLinks);
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

  decoupleLinkList(links: Link[]) {
    let newLinks: Link[] = [];
    links.forEach((l) => {
      newLinks.push(Object.assign(new Link(), JSON.parse(JSON.stringify(l))));
    });
    return newLinks;
  }
  decoupleNodeList(nodes: Node[]) {
    let newNodes: Node[] = [];
    nodes.forEach((node) => {
      newNodes.push(
        Object.assign(new Node(node.id), JSON.parse(JSON.stringify(node)))
      );
    });
    return newNodes;
  }

  updateUnrenderedNodeCounts() {
    this.nodes
      .filter((n) => n.links.length > 0)
      .forEach((node: Node) => {
        node.links.forEach((link: LinkDto) => {
          var isSchemaResource = this.filterOutNodes([
            link.sourceType,
            link.targetType,
          ]);
          var targetExists = this.validateNodeExists(link.target);
          var sourceExists = this.validateNodeExists(link.source);
          if (this.filterInfo.filterViewEnabled) {
            if (isSchemaResource) {
              link.display = false;
            } else {
              link.display = true;
            }
            if (link.display == true && targetExists && sourceExists) {
              link.isRendered = true;
            } else {
              link.isRendered = false;
            }
          } else {
            link.display = true;
            if (targetExists && sourceExists) {
              link.isRendered = true;
            } else {
              link.isRendered = false;
            }
          }
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
    return this.sanitizeLinkList(checkedLinks);
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

  sanitizeLinkList(links: Link[]): Link[] {
    let sanitizedList: Link[] = [];

    //check if there are duplicates in the list
    sanitizedList = links.filter(function (item, index) {
      var ind = links.findIndex(
        (l) =>
          l.source == item.source &&
          l.target == item.target &&
          item.linkTypeId == l.linkTypeId
      );
      return ind == index;
    });

    return sanitizedList;
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

  getGrid() {
    return this.grid;
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
      spaceToShiftDown: 0,
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
}
