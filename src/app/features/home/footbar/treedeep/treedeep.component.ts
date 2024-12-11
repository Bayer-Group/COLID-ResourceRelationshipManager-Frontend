import { Component, Input, OnInit } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import {
  GraphVisualisationState,
  ResetTransform,
  UpdateZoomScale,
  ZoomIn,
  ZoomOut
} from 'src/app/state/graph-visualisation.state';
import { Observable } from 'rxjs';

@Component({
  selector: 'colid-treedeep',
  templateUrl: './treedeep.component.html',
  styleUrls: ['./treedeep.component.scss']
})
export class TreedeepComponent implements OnInit {
  @Input() initialValue = 1;
  @Input() step = 1;
  @Input() stepZoom = 5;
  @Input() min = 10;
  @Input() max = 400;
  @Input() minDeep = 0;
  @Input() maxDeep = 3;
  @Input() symbol = '%';
  @Input() ariaLabelLess: string | undefined;
  @Input() ariaLabelMore: string | undefined;
  treeDeep: string | undefined;
  treeDeepValue = 0;
  @Select(GraphVisualisationState.getZoomDeepValue)
  zoomDeepValue$: Observable<number>;
  ButtonTreeDeepDecrease: HTMLElement | null | undefined;
  ButtonTreeDeepIncrease: HTMLElement | null | undefined;
  ButtonZoomDeepIn: HTMLElement | null | undefined;
  ButtonZoomDeepOut: HTMLElement | null | undefined;

  constructor(private store: Store) {}

  ngOnInit(): void {
    this.treeDeepValue = 1;
    this.treeDeep = this.treeDeepValue.toString();
    this.ButtonTreeDeepDecrease = document.getElementById(
      'btn_treepDeepDecrease'
    );
    this.ButtonTreeDeepIncrease = document.getElementById(
      'btn_treepDeepIncrease'
    );
    this.ButtonZoomDeepIn = document.getElementById('btn_zoomDeepIn');
    this.ButtonZoomDeepOut = document.getElementById('btn_zoomDeepOut');
  }

  treeDeepIncrease = (): void => {
    if (this.step + this.treeDeepValue <= this.maxDeep) {
      this.treeDeepValue = this.treeDeepValue + this.step;
      this.treeDeep = this.treeDeepValue.toString();
    }
    this.changeTreeDeepButtonColor();
  };

  treeDeepDecrease = (): void => {
    if (this.treeDeepValue - this.step >= this.minDeep) {
      this.treeDeepValue = this.treeDeepValue - this.step;
      this.treeDeep = this.treeDeepValue.toString();
    }
    this.changeTreeDeepButtonColor();
  };

  changeTreeDeepButtonColor(): void {
    if (
      this.ButtonTreeDeepDecrease != null &&
      this.ButtonTreeDeepIncrease != null
    ) {
      this.ButtonTreeDeepDecrease.style['color'] = '#00AAE5';
      this.ButtonTreeDeepIncrease.style['color'] = '#00AAE5';
      if (this.treeDeepValue - this.step < this.minDeep) {
        this.ButtonTreeDeepDecrease.style['color'] = '#e5e7e9';
      }
      if (this.treeDeepValue + this.step > this.maxDeep) {
        this.ButtonTreeDeepIncrease.style['color'] = '#e5e7e9';
      }
    }
  }

  zoomOut = (): void => {
    this.store.dispatch(new ZoomOut());
  };

  zoomIn = (): void => {
    this.store.dispatch(new ZoomIn());
  };

  resetZoom(): void {
    this.store.dispatch(new UpdateZoomScale(1));
    this.store.dispatch(new ResetTransform(true));
  }
}
