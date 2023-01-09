import { Directive, Input, ElementRef, OnInit } from '@angular/core';
import { D3Service } from '../d3.service';

@Directive({
  selector: '[zoomableOf]'
})
export class ZoomableDirective implements OnInit {
  @Input('zoomableOf')
  zoomableOf!: ElementRef;
  @Input('translateX') translateX: number;
  @Input('translateY') translateY: number;

  constructor(private d3Service: D3Service, private _element: ElementRef) {
  }

  ngOnInit() {
    this.d3Service.setContainer(this._element.nativeElement, this.translateX, this.translateY);
    this.d3Service.applyZoomableBehaviour(this.zoomableOf, this._element.nativeElement);
    this.d3Service.applyBrush();
  }
}
