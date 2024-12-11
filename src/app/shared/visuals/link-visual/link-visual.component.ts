import { Component, DoCheck, Input } from '@angular/core';
import { Link } from '../../../core/d3';
import { v4 as uuidv4 } from 'uuid';

@Component({
  selector: '[linkVisual]',
  templateUrl: './link-visual.component.html',
  styleUrls: ['./link-visual.component.css']
})
export class LinkVisualComponent implements DoCheck {
  @Input('linkVisual') link: Link = new Link();
  @Input() showConnectionLinkName!: boolean;
  uuid = uuidv4();
  endMarker: string = `url(#${this.uuid})`;

  rectWidth: number = 0;
  rectHeight: number = 0;
  rectX: number = 0;
  rectY: number = 0;
  pathClass: string = 'link standard';
  textClass: string = 'text standard';
  arrowClass: string = 'arrow standard';

  ngDoCheck(): void {
    const isHighlighted =
      this.link.target.selected || this.link.source.selected;
    if (isHighlighted) {
      this.pathClass = 'link highlighted';
      this.textClass = 'text highlighted';
      this.arrowClass = 'arrow highlighted';
    } else {
      this.pathClass = 'link standard';
      this.textClass = 'text standard';
      this.arrowClass = 'arrow standard';
    }
  }
}
