import { AfterViewInit, Component, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { Link } from '../../../core/d3';

@Component({
  selector: '[linkVisual]',
  templateUrl: './link-visual.component.html',
  styleUrls: ['./link-visual.component.css']
})
export class LinkVisualComponent implements AfterViewInit {
  @Input('linkVisual') link: Link = new Link();
  @Input('linkVisual2') link2: Link = new Link();
  @Input('showConnectionLinkName') showConnectionLinkName!: boolean;

  rectWidth: number = 0;
  rectHeight: number = 0;
  rectX: number = 0;
  rectY: number = 0;

  ngAfterViewInit() {

  }

}
