import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { ICellRendererParams } from '@ag-grid-community/core';
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

class IconButtonMetadata {
  fontIcon: string;
  tooltipText?: string;
  actionFunction: Function;
}

export interface IconButtonsCellRendererParams extends ICellRendererParams {
  actions: Array<IconButtonMetadata>;
}

@Component({
  selector: 'app-icon-buttons-cell-renderer',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatTooltipModule],
  templateUrl: './icon-buttons-cell-renderer.component.html',
  styleUrl: './icon-buttons-cell-renderer.component.scss'
})
export class IconButtonsCellRendererComponent
  implements ICellRendererAngularComp
{
  params: IconButtonsCellRendererParams;
  actions: Array<IconButtonMetadata>;
  fontIcon: string;
  tooltipText: string;

  agInit(params: IconButtonsCellRendererParams): void {
    this.params = params;
    this.actions = params.actions;
  }

  onButtonClick(action: IconButtonMetadata): void {
    action.actionFunction(this.params);
  }

  refresh(): boolean {
    return true;
  }
}
