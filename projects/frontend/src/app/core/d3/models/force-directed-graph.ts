import { EventEmitter } from '@angular/core';
import { Link } from './link';
import { Node } from './node';
import * as d3 from 'd3';
import { UriName } from '../../../shared/models/link-types-dto';
import { Observable } from 'rxjs';
import { GraphProperties } from '../../../state/graph-visualisation/graph-visualisation.model';
import { Store } from '@ngrx/store';
import { GraphState } from '../../../state/store-items';
import { ResourceRelationshipManagerService } from '../../http/resource-relationship-manager.service';

const FORCES = {
  LINKS: 1 / 100,
  COLLISION: 1,
  CHARGE: -4000
}


export class ForceDirectedGraph {
  public ticker: EventEmitter<d3.Simulation<Node, Link>> = new EventEmitter();
  public simulation!: d3.Simulation<any, any>;
  private graphData$: Observable<GraphProperties> | undefined;

  public GRID_SIZE = {
    x: 300,
    y: 60
  };
  public grid: any[] = [];
  public nodes: Node[] = [];
  public links: Link[] = [];
  public filterInfo: any = {
    filterViewEnabled: false,
    filteredNodes: []
  }
  public draggingActive: boolean = false
  constructor(
    nodes: any,
    links: any,
    options: { width: any, height: any },
    private store: Store<GraphState>,
    private rrmService: ResourceRelationshipManagerService
  ) {
    this.nodes = nodes;
    this.links = links;
    this.initSimulation(options);

    this.graphData$ = this.store.select('graphVisualisation');
    this.graphData$.subscribe(r => {
      this.simulation = this.simulation.alphaTarget(0.3).restart()
      this.filterInfo.filterViewEnabled = r.filterViewEnabled
      this.filterInfo.filteredNodes = r.filteredNodes
      this.draggingActive = r.draggingActive
      if (r.filterViewEnabled) {
        this.simulation.restart()
        this.updateUnrenderedNodeCounts()
      }
    })
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

    this.simulation.force('links',
      d3.forceLink(this.links)
        .id((d: any) => d.id).distance(1.5).strength(1.5)
    );
  }

  linkCurve(s: { x: number, y: number }, e: { x: number, y: number, }) {
    let p1x: number = s.x
    let p1y: number = s.y
    let p2x: number = e.x
    let p2y: number = e.y
    let returnString = ""

    if (s.x == e.x || s.y == e.y) {
      // if the nodes are vertically or horizontally alligned no curve is needed
      returnString = `M ${p1x} ${p1y} L ${p2x} ${p2y}`
    } else {
      // mid-point of line:
      var mpx = (p2x + p1x) * 0.5;
      var mpy = (p2y + p1y) * 0.5;

      //control points
      var c1x = p1x + ((mpx - p1x) * 0.4)
      var c1y = p1y
      var c2x = c1x
      var c2y = mpy
      var c3x = mpx + ((p2x - mpx) * 0.4)
      var c3y = p2y

      returnString = `
      M ${p1x} ${p1y}
      C ${c1x} ${c1y} ${c2x} ${c2y} ${mpx} ${mpy}
      S ${c3x} ${c3y} ${p2x} ${p2y}
      `
    }
    return returnString
  }

  linkArc(s: {
    x: number
    y: number
  }, e: {
    x: number
    y: number
  }) {
    const r = Math.hypot(e.x - s.x, e.y - s.y);
    return `
      M${s.x},${s.y}
      A${r},${r} 0 0,1 ${e.x},${e.y}
    `;
  }

  initSimulation(options: any) {
    if (!options || !options.width || !options.height) {
      throw new Error('missing options when initializing simulation');
    }


    /** Creating the simulation */
    if (!this.simulation) {
      const ticker = this.ticker;

      this.simulation = d3.forceSimulation()
        .force('charge',
          d3.forceManyBody()
            //.strength(d => FORCES.CHARGE)
            .strength(function (d: any, i) {
              //const strength: number = i == 0 ? -20000 : (d.width * -16);
              const strength: number = i == 0 ? -20000 : -4500;
              return strength;
            })
        )
        .force("x", d3.forceX().strength(1))
        .force("y", d3.forceY().strength(5))
        .force('collide',
          d3.forceCollide()
            .strength(FORCES.COLLISION)
            .radius(d => 140).iterations(1)
        );

      var that = this;
      // Connecting the d3 ticker to an angular event emitter
      this.simulation.on('tick', function () {
        // Create the grid
        that.grid = [];
        that.initGrid()
        if (!that.draggingActive) {
          that.nodes.forEach(node => {
            let gridpoint = that.occupyNearest(node);
            if (gridpoint) {
              // Newly loaded nodes can jump to position
              if (!node.fx || !node.fy) {
                node.fx = (gridpoint.x - node.x!) * .05;
                node.fy = (gridpoint.y - node.y!) * .05;
              } else {
                node.fx! += (gridpoint.x - node.x!) * .05;
                node.fy! += (gridpoint.y - node.y!) * .05;
              }
            }
          })
          that.initNodes()
        }

        that.links.forEach(
          l => {
            l.display = true;
            // When filterview is enabled the links need a different calculation so the attachemnt is still right
            let sourceFilter: number = 0
            let targetFilter: number = 0
            let filterSkip = that.filterOutLinks([l.source.resourceType, l.target.resourceType])
            if (that.filterInfo.filterViewEnabled == true) {
              if (filterSkip) {
                l.display = false;
                return
              }
              that.filterInfo.filteredNodes.forEach((item: any) => {
                if (item.nodeuri === l.source.resourceIdentifier) {
                  sourceFilter++
                }
                if (item.nodeuri === l.target.resourceIdentifier) {
                  targetFilter++
                }
              })
            }

            //calculate arc for each element
            const sourceWidth: number = isNaN(l.source.width) ? 0 : l.source.width;
            const targetWidth: number = isNaN(l.target.width) ? 0 : l.target.width;
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

            let endPoint: { x: number, y: number } = { x: l.target.x!, y: l.target.y! + 20 };
            let startPoint: { x: number, y: number } = { x: l.source.x!, y: l.source.y! + 20 };

            //decide which endpoint to use
            //TODO: Change so that the calculation is done using the center point of each node
            let dY: number = l.target.y! - l.source.y!;
            let dX: number = l.target.x! - l.source.x!;
            let sourcefiltercount = sourceFilter ? sourceFilter * 20 + 20 : 0
            let targetfiltercount = targetFilter ? sourceFilter * 20 + 20 : 0

            if (Math.abs(dX) - 137.5 > Math.abs(dY) + 30) {
              //target point is either the leftmost or rightmost
              if (dX >= 0) {
                //its the left connection point
                endPoint.x = l.target.x! + CONNECTION_POINTS_TARGET.LEFT.x;
                endPoint.y = l.target.y! + CONNECTION_POINTS_TARGET.LEFT.y;
                startPoint.x = l.source.x! + CONNECTION_POINTS_SOURCE.RIGHT.x;
                startPoint.y = l.source.y! + CONNECTION_POINTS_SOURCE.RIGHT.y;
              } else {
                //its the right connection point
                endPoint.x = l.target.x! + CONNECTION_POINTS_TARGET.RIGHT.x;
                endPoint.y = l.target.y! + CONNECTION_POINTS_TARGET.RIGHT.y;
                startPoint.x = l.source.x! + CONNECTION_POINTS_SOURCE.LEFT.x;
                startPoint.y = l.source.y! + CONNECTION_POINTS_SOURCE.LEFT.y;
              }
            } else {
              if (dY >= 0) {
                //its the upper connection point
                endPoint.x = l.target.x! + CONNECTION_POINTS_TARGET.TOP.x;
                endPoint.y = l.target.y! + CONNECTION_POINTS_TARGET.TOP.y;
                startPoint.x = l.source.x! + CONNECTION_POINTS_SOURCE.BOTTOM.x;
                startPoint.y = l.source.y! + CONNECTION_POINTS_SOURCE.BOTTOM.y + sourcefiltercount;
              } else {
                //its the lower connection point
                endPoint.x = l.target.x! + CONNECTION_POINTS_TARGET.BOTTOM.x;
                endPoint.y = l.target.y! + CONNECTION_POINTS_TARGET.BOTTOM.y + targetfiltercount;
                startPoint.x = l.source.x! + CONNECTION_POINTS_SOURCE.TOP.x;
                startPoint.y = l.source.y! + CONNECTION_POINTS_SOURCE.TOP.y;
              }
            }
            l.startPoint = startPoint;
            l.endPoint = endPoint;
            l.d = that.linkCurve(startPoint, endPoint)
          }
        )
        ticker.emit(this);
      })
        .on("end", function () {
          for (let node of that.nodes) {
            node.fx = node.x;
            node.fy = node.y;
          }
        });


    }
    this.initNodes();
    this.initLinks();
    /** Updating the central force of the simulation */
    //this.simulation.force('centers', d3.forceCenter(options.width / 2, options.height / 2).strength(0.02));

    /** Restarting the simulation internal timer */
    this.simulation.restart();
  }

  stopSimulation() {
    if (this.simulation) {
      // this.simulation.stop();
    }
  }

  startSimulation() {
    if (this.simulation) {
      this.simulation.restart();
    }
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
    let node: Node = JSON.parse(JSON.stringify(pNode));
    //dont add node since it is already existing
    if (this.nodes.findIndex(n => n.resourceIdentifier == node.resourceIdentifier) > -1) {

    } else {
      node.shortName = this.generateShortName(node.name);
      //this.stopSimulation();
      this.nodes.push(node);
      this.initNodes();
      this.simulation = this.simulation.tick(50);
      //this.simulation.restart();
      this.updateUnrenderedNodeCounts();
    }
  }
  addNodes(nodes: Node[]) {
    //this.stopSimulation();
    let checkedNodes: Node[] = [];
    nodes.forEach(n => {
      if (this.nodes.findIndex(cn => cn.resourceIdentifier == n.resourceIdentifier) > -1) {
      } else {
        checkedNodes.push(n);
      }
    });
    checkedNodes.forEach(cn => {
      cn.shortName = this.generateShortName(cn.name);
    });
    this.nodes = this.nodes.concat(checkedNodes);
    this.initNodes();
    this.simulation = this.simulation.tick(50);
    //this.simulation.restart();
    this.updateUnrenderedNodeCounts();
  }

  setNodes(nodes: Node[]) {
    //this.stopSimulation();
    //TODO: Check the nodes array for duplicate nodes. If there are duplicates, remove one of them
    this.nodes = JSON.parse(JSON.stringify(nodes));
    this.initNodes();
    this.simulation.restart();
    this.updateUnrenderedNodeCounts();
  }

  removeNodes(nodes: Node[]) {
    this.stopSimulation();
    nodes.forEach(n => {
      this.nodes = this.nodes.filter(no => {
        return no.resourceIdentifier != n.resourceIdentifier;
      });
    });
    //TODO: Remove links related to that node to prevent errors
    this.links = this.links.filter(l => this.nodes.some(n => n.id == l.target.id, this) && this.nodes.some(n => n.id == l.source.id, this));
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
    return (this.nodes.findIndex(n => n.resourceIdentifier == nodeId) > -1);
  }

  /**
   * Add a link to the current simulation
   * @param link Link object to be added
   */
  addLink(link: Link) {
    this.addLinks([link]);
  }

  addLinks(links: Link[]) {
    this.stopSimulation();
    let checkedLinks: Link[] = this.getValidatedLinks(links);
    this.links = this.links.concat(checkedLinks);
    this.initLinks();
    this.simulation.restart();
    this.updateUnrenderedNodeCounts();
  }

  setLinks(links: Link[]) {
    this.stopSimulation();
    let checkedLinks: Link[] = this.getValidatedLinks(links);
    this.links = JSON.parse(JSON.stringify(checkedLinks));
    this.initLinks();
    this.simulation.restart();
    this.updateUnrenderedNodeCounts();
  }

  updateUnrenderedNodeCounts() {
    this.nodes.filter(nf => nf.links.length > 0).forEach((node: Node) => {
      let nodeLinkCount: number = 0
      node.links.forEach((link: Link) => {
        //assume that if a links source and target node exists, it is displayed in the map
        if (this.validateNodeExists(link.source) && this.validateNodeExists(link.target)) {
          link.isRendered = true;
          // if filterview is active and a unredered node is a collumn/table it should not be counted
        } else if (this.filterInfo.filterViewEnabled && this.filterOutNodes([JSON.stringify(link.source), JSON.stringify(link.target)])) {
          return
        } else {
          link.isRendered = false;
          nodeLinkCount++
        }
      });
      node.linkCount = nodeLinkCount
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
    links.forEach(l => {
      if (this.validateNodeExists(l.source) && this.validateNodeExists(l.target)) {
        l.isRendered = true;
        //do not add duplicates
        if (!this.isLinkDuplicate(l.source, l.target, l.name)) {
          checkedLinks.push(l);
        }

      }
    });
    return this.sanitizeLinkList(checkedLinks);
  }

  saveUnrenderedLinkInNode(link: Link) {
    if (this.validateNodeExists(link.source)) {
      this.saveLinkInNode(link, link.source);
    }

    if (this.validateNodeExists(link.target)) {
      this.saveLinkInNode(link, link.target);
    }
  }

  isLinkDuplicate(source: any, target: any, type: UriName) {
    return this.links.findIndex(l => l.source == source && l.target == target && l.name.value == type.value) > -1;
  }

  sanitizeLinkList(links: Link[]): Link[] {
    let sanitizedList: Link[] = [];


    //check if there are duplicates in the list
    sanitizedList = links.filter(function (item, index) {
      var ind = links.findIndex(l => l.source == item.source && l.target == item.target && item.name.value == l.name.value);
      return ind == index;
    });


    return sanitizedList;
  }

  saveLinkInNode(link: Link, node: any) {
    const nodeIndex = this.nodes.findIndex(n => n.id == node);
    if (nodeIndex > -1) {
      let linkDuplicateIndex: number = this.nodes[nodeIndex].links.findIndex(
        l =>
          l.source.id == (link.source as unknown as string) &&
          l.target.id == (link.target as unknown as string) &&
          l.name.value == link.name.value
      );
      if (linkDuplicateIndex == -1) {
        this.nodes[nodeIndex].linkCount++;
        this.nodes[nodeIndex].links.push(link);
      }
    }

  }

  removeLinks(links: Link[]) {
    this.stopSimulation();
    links.forEach(l => {
      let linkIndex: number = -1;
      if (l.source.id) {
        linkIndex = this.links.findIndex(x => x.source.id == l.source.id && x.target.id == l.target.id && x.name.value == l.name.value);
      } else {
        linkIndex = this.links.findIndex(x => x.source.id == l.source as any && x.target.id == l.target as any && x.name.value == l.name.value);
      }

      if (linkIndex > -1) {
        this.links.splice(linkIndex, 1);
      }
      // this.links = this.links.filter(li => {
      //   return li.source != l.source && li.target != l.target;
      // });
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
    let segments: string[] = longName.split(" ");
    for (var i = 0; i < segments.length; i++) {
      if (segments[i].length > 3) {
        segments[i] = segments[i].substring(0, 3);
      }
    }
    return segments.join('-');
  }

  filterOutLinks(resourceTypes: string[]) {
    let value: Boolean = false
    let tableType = "https://pid.bayer.com/kos/19050/444586"
    let columnType = "https://pid.bayer.com/kos/19050/444582"
    if (resourceTypes.includes(tableType)) {
      value = true
    } else if (resourceTypes.includes(columnType)) {
      value = true
    }
    return value
  }

  filterOutNodes(uris: string[]) {
    let value: Boolean = false
    let tableType = "https://pid.bayer.com/kos/19050/444586"
    let columnType = "https://pid.bayer.com/kos/19050/444582"
    let nodesTypes: string[] = []
    this.rrmService.getCheckedResources(uris).subscribe(res => {
      res.forEach(resource => {
        nodesTypes.push(resource.resourceType)
      })
      if (nodesTypes.includes(tableType)) {
        value = true
      } else if (nodesTypes.includes(columnType)) {
        value = true
      }
    })
    return value
  }

  initGrid() {
    let xValues = []
    // Get negative x values
    for (var i = 1; i < 3500 / this.GRID_SIZE.x; i++) {
      let item = -(i * this.GRID_SIZE.x)
      xValues.unshift(item)
    }
    // Get positive X values
    for (var i = 0; i < 3500 / this.GRID_SIZE.x; i++) {
      let item = i * this.GRID_SIZE.x
      xValues.push(item)
    }
    xValues.forEach(x => {
      // Add negative y values
      for (var j = 1; j < 1800 / this.GRID_SIZE.y; j++) {
        let cell = {
          x: x,
          y: -(j * this.GRID_SIZE.y),
          occupied: false
        };
        this.grid.unshift(cell);
      };
      // Add positive y values
      for (var j = 0; j < 1800 / this.GRID_SIZE.y; j++) {
        let cell = {
          x: x,
          y: j * this.GRID_SIZE.y,
          occupied: false
        };
        this.grid.push(cell);
      };
    })
  }
  sqdist(a: any, b: any) {
    let amount = Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2);
    return amount
  }

  occupyNearest(p: any) {
    var minDist = 1000000;
    var d;
    var candidate = null;
    for (var i = 0; i < this.grid.length; i++) {
      if (!this.grid[i].occupied && (d = this.sqdist(p, this.grid[i])) < minDist) {
        minDist = d;
        candidate = this.grid[i];
      }
    }
    if (candidate)
      candidate.occupied = true;
    return candidate;
  }
}
