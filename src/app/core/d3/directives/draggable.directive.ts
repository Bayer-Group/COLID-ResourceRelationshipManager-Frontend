import { Directive, Input, ElementRef, OnInit, OnDestroy } from '@angular/core';
import { Node, ForceDirectedGraph } from '../models';
import { D3Service } from '../../../shared/services/d3.service';

@Directive({
  selector: '[draggableNode]'
})
export class DraggableDirective implements OnInit, OnDestroy {
  @Input()
  draggableNode!: Node;
  @Input()
  draggableInGraph!: ForceDirectedGraph;

  constructor(
    private d3Service: D3Service,
    private _element: ElementRef
  ) {}

  ngOnInit() {
    this.d3Service.applyDraggableBehaviour(
      this._element.nativeElement,
      this.draggableNode,
      this.draggableInGraph
    );
    this.d3Service.gatherNodes(this.draggableNode);
  }

  ngOnDestroy(): void {
    this.d3Service.removeNode(this.draggableNode);
  }
}
