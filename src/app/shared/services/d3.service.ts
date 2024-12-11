import { Injectable } from '@angular/core';
import { Node, ForceDirectedGraph } from '../../core/d3/models';
import * as d3 from 'd3';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Select, Store } from '@ngxs/store';
import {
  GraphProperties,
  GraphVisualisationState,
  ResetMultiSelectedPidUris,
  ResetTransform,
  SetCtrlPressed,
  SetMultiSelectedPidUris,
  ToggleDragging,
  UpdateZoomScale
} from '../../state/graph-visualisation.state';

/** This service will provide methods to enable user interaction with elements
 *   while maintaining the d3 simulations physics
 */
@Injectable()
export class D3Service {
  @Select(GraphVisualisationState.getGraphVisualisationState)
  graphProperties$: Observable<GraphProperties>;

  brush: any;
  brushArea: any;

  nodes: any[] = [];

  shiftKey = false;
  ctrlKey = false;

  translatedX: number = 0;
  translatedY: number = 0;

  private container: any = null;
  private svg: any = null;

  private zoomObject!: d3.ZoomBehavior<Element, unknown>;
  private zoomScale: number = 1;

  constructor(private store: Store) {}

  setContainer(containerElement: any, translateX: number, translateY: number) {
    if (this.container == null) {
      this.container = d3.select(containerElement);
    }
    this.translatedX = translateX;
    this.translatedY = translateY;
    this.graphProperties$
      .pipe(
        tap((gp) => {
          if (this.zoomScale != gp.zoomScale) {
            this.zoomObject.scaleTo(this.svg, gp.zoomScale);
          }
          if (gp.resetTransform) {
            this.zoomObject.translateTo(
              this.svg,
              window.innerWidth / 1.7,
              window.innerHeight / 1.7
            );
            this.store.dispatch(new ResetTransform(false));
          }
        })
      )
      .subscribe();
  }

  /** A method to bind a pan and zoom behaviour to an svg element */
  applyZoomableBehaviour(svgElement: any, containerElement: any) {
    this.svg = d3.select(svgElement.nativeElement);
    this.container = d3.select(containerElement);
    this.zoomObject = d3
      .zoom()
      .filter((event) => {
        return !event.shiftKey;
      })
      .scaleExtent([0.1, 4])
      .on('zoom', this.zoomed);
    this.svg.call(this.zoomObject).on('dblclick.zoom', null); //the last part prevents double clicks to happen
  }

  applyBrush() {
    var that = this;
    this.brush = d3
      .brush()
      .filter((event) => {
        return event.shiftKey;
      })
      .extent([
        [-100_000, -100_000],
        [100_000, 100_000]
      ])
      .on('start', this.brushStart)
      .on('brush', this.brushed)
      .on('end', function (event: any) {
        // Reset styles and pointer events after brushing
        if (!event.sourceEvent) return;
        d3.select(this).call(event.target.move, null);
        d3.select('.overlay')
          .attr('cursor', 'default')
          .attr('pointer-events', 'none');
      });
    this.brush.keyModifiers(false);

    // d3.selectAll(".node").on("click", onNodeClick)

    // function onNodeClick() {
    //   let target = d3.select(d3.event.target);
    //   let color = d3.color(target.attr("fill"));
    //  target.attr("stroke", "blue")
    // }

    // When shift is pressed pointer events need to be turned on for brush
    d3.select(window)
      .on('keydown', function (event: any) {
        // If shift key is pressed multiselect changes are triggered
        let changed =
          that.shiftKey != event.shiftKey || that.ctrlKey != event.ctrlKey;
        that.shiftKey = event.shiftKey;
        that.ctrlKey = event.ctrlKey;

        if (changed) {
          if (that.shiftKey) {
            d3.select('.overlay').attr('pointer-events', 'all');
            d3.select('.overlay').attr('cursor', 'crosshair');
            d3.select('body').style('cursor', '');
            that.store.dispatch(new SetCtrlPressed(false));
          } else if (that.ctrlKey) {
            d3.select('.overlay').attr('pointer-events', 'none');
            d3.select('body').style('cursor', 'copy');
            that.store.dispatch(new SetCtrlPressed(true));
          } else {
            d3.select('.overlay').attr('pointer-events', 'none');
            d3.select('body').style('cursor', '');
            that.store.dispatch(new SetCtrlPressed(false));
          }
        }
      })
      .on('keyup', function (event: any) {
        that.shiftKey = event.shiftKey;
        that.ctrlKey = event.ctrlKey;
        d3.select('.overlay').attr('pointer-events', 'none');
        d3.select('.overlay').attr('cursor', 'default');
        d3.select('body').style('cursor', '');
        that.store.dispatch(new SetCtrlPressed(false));
      })
      .on('click', function (event: any) {
        // if clicked on the background but a node the selection should clear
        if (event.srcElement.localName == 'rect') {
          that.nodes.forEach((node) => (node.selected = false));
          that.store.dispatch(new ResetMultiSelectedPidUris());
        }
      });

    this.brushArea = this.container
      .append('g')
      .attr('class', 'brush')
      .attr('cursor', 'default')
      .call(this.brush);

    // Reset styles to default when first applying
    d3.select('.overlay')
      .attr('cursor', 'default')
      .attr('pointer-events', 'none');
  }

  brushStart = (_) => {
    d3.select('.overlay').attr('pointer-events', 'all');
  };

  brushed = (event: any) => {
    // Get selection x,y cord's
    var selection: any = event.selection;
    if (selection != null) {
      const x1 = selection[0][0] - this.translatedX;
      const x2 = selection[1][0] - this.translatedX;
      const y1 = selection[0][1] - this.translatedY;
      const y2 = selection[1][1] - this.translatedY;
      const selectedNodes: string[] = [];
      this.nodes.forEach((node) => {
        // Calculate if node is in the selection or not
        if (x1 <= node.fx && node.fx < x2 && y1 <= node.fy && node.fy < y2) {
          node.selected = true;
          selectedNodes.push(node.id);
        } else {
          node.selected = false;
        }
      });
      this.store.dispatch(new SetMultiSelectedPidUris(selectedNodes));
    }
  };

  /** A method to bind a draggable behaviour to an svg element */
  applyDraggableBehaviour(element: any, node: Node, graph: ForceDirectedGraph) {
    const d3element = d3.select(element);
    var that = this;

    function started(event: any) {
      /** Preventing propagation of dragstart to parent elements */
      event.sourceEvent.stopPropagation();
      that.store.dispatch(new ToggleDragging(true));

      if (!event.active) {
        graph.simulation.alphaTarget(0.3).restart();
      }
      event.on('drag', dragged).on('end', ended);

      function dragged(event: any) {
        // If node being dragged is selected, all selected ndoes should move
        if (node.selected) {
          that.nodes.forEach((node) => {
            if (node.selected) {
              node.fx += event.dx;
              node.fy += event.dy;
            }
          });
        } else {
          that.nodes.forEach((node) => (node.selected = false));
          node.fx += event.dx;
          node.fy += event.dy;
        }
      }

      function ended(event: any) {
        that.store.dispatch(new ToggleDragging(false));
        if (!event.active) {
          graph.simulation.alphaTarget(0);
        }
      }
    }

    d3element.call(d3.drag().on('start', started));
  }

  gatherNodes(node: Node) {
    this.nodes.push(node);
  }

  removeNode(node: Node) {
    const index = this.nodes.findIndex((n) => n.id == node.id);
    if (index === -1) {
      return;
    }
    this.nodes.splice(index, 1);
  }

  /**
   * Handle zoom event
   * @param event zoom event which contains transform parameters for x and y pan as well as k zoom scale
   */
  private zoomed = (event: any) => {
    const transform = event.transform;

    this.container.attr(
      'transform',
      'translate(' +
        transform.x +
        ',' +
        transform.y +
        ') scale(' +
        transform.k +
        ')'
    );
    this.zoomScale = transform.k;
    this.store.dispatch(new UpdateZoomScale(transform.k));
  };
}
