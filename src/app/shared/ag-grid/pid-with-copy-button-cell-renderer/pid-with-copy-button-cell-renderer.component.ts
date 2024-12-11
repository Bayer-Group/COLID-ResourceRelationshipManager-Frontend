import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { ICellRendererParams } from '@ag-grid-community/core';
import { CdkCopyToClipboard } from '@angular/cdk/clipboard';
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-pid-with-copy-button-cell-renderer',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    CdkCopyToClipboard
  ],
  templateUrl: './pid-with-copy-button-cell-renderer.component.html',
  styleUrl: './pid-with-copy-button-cell-renderer.component.scss'
})
export class PidWithCopyButtonCellRendererComponent
  implements ICellRendererAngularComp
{
  pid: string;

  agInit(params: ICellRendererParams<any, any, any>): void {
    this.pid = params.value;
  }

  refresh(): boolean {
    return true;
  }
}
