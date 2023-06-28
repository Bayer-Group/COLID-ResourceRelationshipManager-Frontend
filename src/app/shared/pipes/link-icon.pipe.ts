import { Pipe, PipeTransform } from '@angular/core';
import { Link } from '../../core/d3';

@Pipe({ name: 'linkicon' })
export class LinkIconPipe implements PipeTransform {
  constructor() {}

  transform(link: Link): string {
    if (link.outbound) {
      return link.targetType;
    } else {
      return link.sourceType;
    }
  }
}
