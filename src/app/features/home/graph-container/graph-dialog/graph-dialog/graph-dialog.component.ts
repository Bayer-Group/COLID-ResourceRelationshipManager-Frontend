import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { HistoryItemTableEntry } from 'src/app/shared/link-history/link-history.component';
import { LinkDto } from 'src/app/shared/models/link-dto';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { GraphComponent } from '../../graph/graph.component';

export interface GraphDialogResultData {
  displayedLinks: Array<LinkDto>;
  hiddenLinks: Array<LinkDto>;
  restoredLinks: Array<LinkDto>;
}

@Component({
  selector: 'colid-graph-dialog',
  templateUrl: './graph-dialog.component.html',
  styleUrls: ['./graph-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GraphDialogComponent {
  resourcePidUri: string;
  resourceName: string;

  links: Array<LinkDto> = [];
  linksToDisplay: Array<LinkDto> = [];
  restoredLinks: Array<LinkDto> = [];

  selectedTabIndex = 0;

  constructor(
    public dialogRef: MatDialogRef<GraphComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.resourcePidUri = this.data.pidUri;
    this.resourceName = this.data.resourceLabel;
    this.links = [...this.data.links];
  }

  onRestoredLink(item: HistoryItemTableEntry) {
    const link: LinkDto = {
      display: true,
      isRendered: false,
      isVersionLink: false,
      linkType: item.linkType,
      outbound: item.outbound,
      source: item.outbound ? item.source : item.target,
      sourceName: item.outbound ? item.sourceName : item.targetName,
      sourceType: item.outbound ? item.sourceType : item.targetType,
      target: item.outbound ? item.target : item.source,
      targetName: item.outbound ? item.targetName : item.sourceName,
      targetType: item.outbound ? item.targetType : item.sourceType
    };
    this.data.links = [link, ...this.data.links];
    this.links = [...this.data.links];
    this.restoredLinks.push(link);
    this.selectedTabIndex = 0;
  }

  updateLinks(): void {
    this.dialogRef.close({
      displayedLinks: this.linksToDisplay,
      hiddenLinks: this.links.filter((l) => !this.linksToDisplay.includes(l)),
      restoredLinks: this.restoredLinks
    } as GraphDialogResultData);
  }

  processSelectedLinks(selectedLinks: Array<LinkDto>): void {
    this.linksToDisplay = selectedLinks;
  }
}
