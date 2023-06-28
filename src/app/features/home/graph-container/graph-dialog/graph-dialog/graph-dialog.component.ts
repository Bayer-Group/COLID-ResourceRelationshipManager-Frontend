import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { GraphComponent } from '../../graph/graph.component';
import { SelectionModel } from '@angular/cdk/collections';
import { HistoryItemTableEntry } from 'src/app/shared/link-history/link-history.component';
import { LinkDto } from 'src/app/shared/models/link-dto';

@Component({
  selector: 'colid-graph-dialog',
  templateUrl: './graph-dialog.component.html',
  styleUrls: ['./graph-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GraphDialogComponent {
  resourcePidUri: string;
  resourceName: string;
  links: LinkDto[] = [];
  selection = new SelectionModel<LinkDto>(true, []);
  newLinks: LinkDto[] = [];
  selectedTabIndex = 0;

  constructor(
    public dialogRef: MatDialogRef<GraphComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.resourcePidUri = this.data.pidUri;
    this.resourceName = this.data.resourceLabel;
    this.links = [...this.data.links];
    this.selection.select(...this.links.filter((l) => l.isRendered));
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
      targetType: item.outbound ? item.targetType : item.sourceType,
    };
    this.data.links = [link, ...this.data.links];
    this.links = [...this.data.links];
    this.newLinks.push(link);
    this.selectedTabIndex = 0;
  }

  loadLinks() {
    const linksToDisplay = [];
    const linksToHide = [];
    this.links.forEach((l) => {
      //loop through all links and update the isRendered property to correct value
      const linkIndex = this.selection.selected.findIndex(
        (s) =>
          s.source == l.source &&
          s.target == l.target &&
          s.linkType == l.linkType
      );
      if (linkIndex > -1) {
        linksToDisplay.push(l);
      } else {
        linksToHide.push(l);
      }
    });
    this.dialogRef.close({
      displayedLinks: linksToDisplay,
      hiddenLinks: linksToHide,
      newLinks: this.newLinks,
    });
  }
}
