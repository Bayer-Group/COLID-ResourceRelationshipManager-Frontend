import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { ICellRendererParams } from '@ag-grid-community/core';
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ColidIconsModule } from '../../icons/colid-icons.module';
import { IconTypes } from '../../icons/models/icon-types';

/**
 * Displays an icon in a cell, with an optional tooltip.
 * The icon can be a font-based MatIcon or an svg image.
 *
 * Hint: Set column's valueGetter to be able to use AG-Grid's sorting and filtering functions:
 * valueGetter: (params) => {
 *    return this.methodToGetValue(params.data.myField);
 * },
 *
 * @param fontIcon name of the font icon to display, optional if another is set
 * @param svgIcon SVG image to display as icon, optional if another is set
 * @param s3Icon Resource type string to match to an S3 icon, optional if another is set
 * @param tooltipText text to display as tooltip, optional
 *
 */
export interface IconCellRendererParams extends ICellRendererParams {
  fontIcon?: string;
  svgIcon?: string;
  s3Icon?: string;
  tooltipText?: string;
}

@Component({
  selector: 'app-icon-cell-renderer',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatTooltipModule, ColidIconsModule],
  templateUrl: './icon-cell-renderer.component.html',
  styleUrl: './icon-cell-renderer.component.scss'
})
export class IconCellRendererComponent implements ICellRendererAngularComp {
  fontIcon: string;
  svgIcon: string;
  s3Icon: string;
  tooltipText: string;

  S3: IconTypes = IconTypes.S3;

  agInit(params: IconCellRendererParams): void {
    if (!params?.fontIcon && !params?.svgIcon && !params?.s3Icon) {
      throw new Error(
        'IconCellRenderer: no icon values are provided, set exactly one value of "fontIcon", "svgIcon" OR "s3Icon".'
      );
    }

    if (
      [params?.fontIcon, params?.svgIcon, params?.s3Icon].filter(Boolean)
        .length > 1
    ) {
      throw new Error(
        'IconCellRenderer: more than one icon value provided, set exactly one value of "fontIcon", "svgIcon" OR "s3Icon"'
      );
    }

    this.fontIcon = params?.fontIcon;
    this.svgIcon = params?.svgIcon;
    this.s3Icon = params?.s3Icon;
    this.tooltipText = params?.tooltipText;
  }

  refresh(): boolean {
    return true;
  }
}
