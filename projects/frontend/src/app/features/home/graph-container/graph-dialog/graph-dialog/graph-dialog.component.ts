import { Component, ElementRef, Inject, ViewChild } from '@angular/core';
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { Link, Node } from '../../../../../core/d3';
import { GraphComponent } from '../../graph/graph.component';
import { Constants } from '../../../../../shared/constants';
import { IconTypes } from '../../../../../shared/icons/models/icon-types';
import { SelectionModel } from '@angular/cdk/collections';
import { MatTable } from '@angular/material/table';
import { Sort } from '@angular/material/sort';
import { HistoryItemTableEntry } from 'projects/frontend/src/app/shared/link-history-dialog/link-history-dialog.component';
import { LinkDto } from 'projects/frontend/src/app/shared/models/link-dto';

@Component({
  selector: 'colid-graph-dialog',
  templateUrl: './graph-dialog.component.html',
  styleUrls: ['./graph-dialog.component.scss'],
})
export class GraphDialogComponent {
  resourcePidUri: string;
  resourceName: string;
  links: LinkDto[] = [];
  newLinks: LinkDto[] = [];
  selectedTabIndex = 0;
  inputSearchEnabled: boolean = false;
  currentInputFilter: string = '';
  currentSorting: { column: string; sortDirection: string } = {
    column: '',
    sortDirection: '',
  };

  constants = Constants;

  selection = new SelectionModel<LinkDto>(true, []);

  S3: IconTypes = IconTypes.S3;

  displayedColumns = [
    'select',
    'outbound',
    'targetType',
    'linkType',
    'targetName',
  ];

  @ViewChild(MatTable) table!: MatTable<any>;

  constructor(
    public dialogRef: MatDialogRef<GraphComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.resourcePidUri = this.data.pidUri;
    this.resourceName = this.data.resourceLabel;
    this.links = [...this.data.links];
    this.selection.select(...this.links.filter((l) => l.isRendered));
  }

  isOverflow(el: HTMLElement): boolean {
    let curOverflow = el.style.overflow;
    if (!curOverflow || curOverflow === 'visible') el.style.overflow = 'hidden';
    let isOverflowing =
      el.clientWidth < el.scrollWidth || el.clientHeight < el.scrollHeight;
    el.style.overflow = curOverflow;
    return isOverflowing;
  }

  onInputChange(event) {
    this.currentInputFilter = event.target.value;
    this.applyFilter(this.currentInputFilter);
    if (this.currentSorting.column) {
      this.applySorting(
        this.currentSorting.column,
        this.currentSorting.sortDirection
      );
      this.table.renderRows();
    }
  }

  applyFilter(searchString: string) {
    if (searchString) {
      this.links = this.data.links.filter((item) =>
        item.targetName
          .toLowerCase()
          .includes(searchString.trim().toLowerCase())
      );
    } else {
      this.links = this.data.links.slice();
      this.inputSearchEnabled = false;
    }
  }

  onSortChange(sort: Sort) {
    const { active, direction } = sort;
    this.currentSorting.column = active;
    this.currentSorting.sortDirection = direction;
    if (this.currentInputFilter) {
      this.applyFilter(this.currentInputFilter);
    }
    this.applySorting(active, direction);
    this.table.renderRows();
  }

  applySorting(sortColumn: string, sortDirection: string) {
    if (sortDirection === '') {
      this.links = this.data.links.slice();
    } else {
      this.links.sort((a, b) => {
        let result = 0;

        if (sortColumn === 'outbound') {
          result = Number(a.outbound) - Number(b.outbound);
        }

        if (sortColumn === 'targetType') {
          const firstTargetType = a.outbound
            ? a.sourceType.toUpperCase()
            : a.targetType.toUpperCase();
          const secondTargetType = b.outbound
            ? b.sourceType.toUpperCase()
            : b.targetType.toUpperCase();
          if (firstTargetType < secondTargetType) {
            result = -1;
          }
          if (firstTargetType > secondTargetType) {
            result = 1;
          }
        }

        if (sortColumn === 'linkType') {
          const firstLinkType = a.linkType.value.toUpperCase();
          const secondLinkType = b.linkType.value.toUpperCase();
          if (firstLinkType < secondLinkType) {
            result = -1;
          }
          if (firstLinkType > secondLinkType) {
            result = 1;
          }
        }

        if (sortDirection === 'desc') {
          result *= -1;
        }

        return result;
      });
    }
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
    this.data.links = [...this.data.links, link];
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
