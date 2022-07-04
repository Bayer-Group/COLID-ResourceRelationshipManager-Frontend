import { Component, Input, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { D3Service } from 'projects/frontend/src/app/core/d3';
import { GraphState } from 'projects/frontend/src/app/state/store-items';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import * as graphActions from '../../../../state/graph-visualisation/graph-visualisation.actions';

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
  zoomDeepValue$: Observable<number>;
  ButtonTreeDeepDecrease: HTMLElement | null | undefined;
  ButtonTreeDeepIncrease: HTMLElement | null | undefined;
  ButtonZoomDeepIn: HTMLElement | null | undefined;
  ButtonZoomDeepOut: HTMLElement | null | undefined;

  constructor(private store: Store<GraphState>, private d3Service: D3Service) {
    this.zoomDeepValue$ = this.store.select('graphVisualisation').pipe(
      map((g) => {
        return Math.round(g.zoomScale * 100);
      })
    );
  }

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
    //this.changeZoomButtonColor();
    this.store.dispatch(graphActions.ZoomOut());
  };

  zoomIn = (): void => {
    //this.changeZoomButtonColor();
    this.store.dispatch(graphActions.ZoomIn());
  };

  goToCenter(): void {
    this.store.dispatch(graphActions.CenterGraph());
  }

  resetZoom(): void {
    this.store.dispatch(graphActions.UpdateZoomScale({ scale: 1 }));
    this.store.dispatch(graphActions.ResetTransform({ reset: true }));
  }
}
