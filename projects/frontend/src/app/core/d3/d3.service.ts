import { Injectable } from '@angular/core';
import { Node, ForceDirectedGraph, NodeSaveDto } from './models';
import * as d3 from 'd3';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { GraphState } from '../../state/store-items';
import * as graphVisualisationActions from '../../state/graph-visualisation/graph-visualisation.actions';
import { tap } from 'rxjs/operators';
import * as graphPropertiesActions from '../../state/graph-visualisation/graph-visualisation.actions'
import { GraphProperties } from '../../state/graph-visualisation/graph-visualisation.model';

@Injectable()
export class D3Service {
  /** This service will provide methods to enable user interaction with elements
  *   while maintaining the d3 simulations physics
  */
  private container: any = null;
  private svg: any = null;
  private zoomObject!: d3.ZoomBehavior<Element, unknown>;
  private zoomScale: number = 1;
  graphProperties$: Observable<GraphProperties>;
  brush: any;
  brushArea: any;
  nodes: any[] = []
  shiftKey = false;

  constructor(private store: Store<GraphState>) {
    this.graphProperties$ = this.store.select('graphVisualisation');
  }

  setContainer(containerElement: any) {
    if (this.container == null) {
      this.container = d3.select(containerElement);
    }
    this.graphProperties$.pipe(
      tap(
        gp => {
          if (this.zoomScale != gp.zoomScale) {
            this.zoomObject.scaleTo(this.svg, gp.zoomScale);
          }
          if (gp.resetTransform) {
            this.zoomObject.translateTo(this.svg, window.innerWidth / 1.7, window.innerHeight / 1.7);
            this.store.dispatch(graphVisualisationActions.ResetTransform({ reset: false }));
          }
        }
      )
    ).subscribe();
  }

  /**
   * Handle zoom event
   * @param event zoom event which contains transform parameters for x and y pan as well as k zoom scale
   */
  zoomed = (event: any) => {
    const transform = event.transform;

    this.container.attr('transform', 'translate(' + transform.x + ',' + transform.y + ') scale(' + transform.k + ')');
    this.zoomScale = transform.k;
    this.store.dispatch(graphVisualisationActions.UpdateZoomScale({ scale: transform.k }));
  }

  /** A method to bind a pan and zoom behaviour to an svg element */
  applyZoomableBehaviour(svgElement: any, containerElement: any) {
    this.svg = d3.select(svgElement.nativeElement);
    this.container = d3.select(containerElement);
    this.zoomObject = d3.zoom().filter(event => { return !event.shiftKey }).scaleExtent([0.1, 4]).on('zoom', this.zoomed);
    this.svg.call(this.zoomObject).on("dblclick.zoom", null); //the last part prevents double clicks to happen
  }

  applyBrush() {
    var that = this;
    this.brush = (d3.brush().filter(event => { return event.shiftKey })
      .extent([[-4000, -4000], [4000, 4000]])
      .on("start", this.brushStart)
      .on("brush", this.brushed)
      .on("end", function (event: any) {
        // Reset styles and pointer events after brushing
        if (!event.sourceEvent) return;
        d3.select(this).call(event.target.move, null)
        d3.select('.overlay')
          .attr("cursor", "default")
          .attr("pointer-events", "none")
      }))
    this.brush.keyModifiers(false)

    // When shift is pressed pointer events need to be turned on for brush
    d3.select(window)
      .on("keydown", this.keydown)
      .on("keyup", this.keyup)
      .on('click', function (event: any) {
        // if clicked on the background but a node the selection should clear
        if (event.srcElement.localName == "rect") {
          that.nodes.forEach(node => node.selected = false)
        }
      })

    this.brushArea = this.container.append("g")
      .attr("class", "brush")
      .attr("cursor", "default")
      .call(this.brush)

    // Reset styles to default when first applying
    d3.select('.overlay')
      .attr("cursor", "default")
      .attr("pointer-events", "none")
  }

  brushStart = (event: any) => {
    d3.select('.overlay').attr("pointer-events", "all")
  }

  brushed = (event: any) => {
    var selection: any = event.selection;
    if (selection != null) {
      this.nodes.forEach(node => {
        if (selection[0][0] <= node.fx && node.fx < selection[1][0] && selection[0][1] <= node.fy && node.fy < selection[1][1]) {
          node.selected = true;
        } else {
          node.selected = false;
        }
      })
    }
  }

  keyup(event: any) {
    this.shiftKey = event.shiftKey;
    d3.select('.overlay').attr("pointer-events", "none")
    d3.select('.overlay').attr("cursor", "default");
  }

  keydown(event: any) {
    this.shiftKey = event.shiftKey;
    if (this.shiftKey) {
      d3.select('.overlay').attr("pointer-events", "all");
      d3.select('.overlay').attr("cursor", "crosshair");
    } else {
      d3.select('.overlay').attr("pointer-events", "none");
    }
  }

  /** A method to bind a draggable behaviour to an svg element */
  applyDraggableBehaviour(element: any, node: Node, graph: ForceDirectedGraph) {
    const d3element = d3.select(element);
    var that = this;

    function started(event: any) {
      /** Preventing propagation of dragstart to parent elements */
      event.sourceEvent.stopPropagation();
      that.store.dispatch(graphVisualisationActions.toggleDragging({ draggingActive: true }))

      if (!event.active) {
        graph.simulation.alphaTarget(0.3).restart();

      }
      event.on('drag', dragged).on('end', ended);

      function dragged(event: any) {
        // If node being dragged is selected, all selected ndoes should move
        if (node.selected) {
          that.nodes.forEach(node => {
            if (node.selected) {
              node.fx += event.dx;
              node.fy += event.dy;
            }
          })
        } else {
          that.nodes.forEach(node => node.selected = false)
          node.fx += event.dx;
          node.fy += event.dy;
        }
      }

      function round(p: number, n: number): number {
        return p % n < n / 2 ? p - (p % n) : p + n - (p % n);
      }

      function ended(event: any) {
        that.store.dispatch(graphVisualisationActions.toggleDragging({ draggingActive: false }))
        if (!event.active) {
          graph.simulation.alphaTarget(0);
        }
      }
    }

    d3element.call(d3.drag()
      .on('start', started));
  }

  gatherNodes(node: Node) {
    this.nodes.push(node)
  }

}
