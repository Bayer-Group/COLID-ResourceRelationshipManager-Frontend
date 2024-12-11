import { ModuleRegistry } from '@ag-grid-community/core';
import { AgGridAngular } from '@ag-grid-community/angular';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import {
  ColDef,
  GridApi,
  GridOptions,
  GridReadyEvent,
  IRowNode,
  ITooltipParams
} from '@ag-grid-community/core';
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LinkDto } from 'src/app/shared/models/link-dto';
import {
  IconCellRendererComponent,
  IconCellRendererParams
} from 'src/app/shared/ag-grid/icon-cell-renderer/icon-cell-renderer.component';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DEFAULT_GRID_OPTIONS } from 'src/app/shared/ag-grid/default-grid-options';
import { AgGridFilteringBarComponent } from 'src/app/shared/ag-grid/ag-grid-filtering-bar/ag-grid-filtering-bar.component';
import { AgGridStatusBarComponent } from '../../../../../../shared/ag-grid/ag-grid-status-bar/ag-grid-status-bar.component';

// AG-Grid module registration
ModuleRegistry.registerModules([ClientSideRowModelModule]);

@Component({
  selector: 'app-links-visibility-tab',
  templateUrl: './links-visibility-tab.component.html',
  styleUrl: './links-visibility-tab.component.scss',
  standalone: true,
  imports: [
    AgGridAngular,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    AgGridFilteringBarComponent,
    AgGridStatusBarComponent
  ]
})
export class LinksVisibilityTabComponent implements OnChanges {
  @Input() links: Array<LinkDto> = [];

  @Output() selectedLinks = new EventEmitter<Array<LinkDto>>();

  colDefs: Array<ColDef> = [
    {
      pinned: 'left',
      headerName: '',
      field: 'selected',
      checkboxSelection: true,
      headerCheckboxSelection: true,
      headerCheckboxSelectionFilteredOnly: true,
      width: 50,
      resizable: false,
      sortable: false,
      suppressColumnsToolPanel: true,
      suppressHeaderMenuButton: true,
      suppressHeaderFilterButton: true
    },
    {
      headerName: 'Direction',
      width: 135,
      valueGetter: (params) => {
        // Text value is used for sorting and filtering
        return this.getLinkTypeTextValue(params.data.originalLink);
      },
      cellRenderer: 'iconCellRenderer',
      cellRendererParams: (params) => {
        // Icon object is used for rendering
        return this.getLinkTypeIconParams(params.data.originalLink);
      }
    },
    {
      headerName: 'Type',
      field: 'targetType',
      width: 104,
      valueGetter: (params) => {
        // Text value is used for sorting and filtering
        return this.getTargetTypeTextValue(params.data.originalLink);
      },
      cellRenderer: 'iconCellRenderer',
      cellRendererParams: (params) => {
        // Icon object is used for rendering
        return this.getTargetTypeIconParams(params.data.originalLink);
      }
    },
    {
      headerName: 'Link type',
      field: 'linkType'
    },
    {
      headerName: 'Resource Name',
      field: 'targetName',
      flex: 3,
      tooltipValueGetter: (p: ITooltipParams) =>
        p.data.targetName.length > 50 ? p.data.targetName : null
    }
  ];

  gridApi: GridApi;

  gridOptions: GridOptions = {
    ...DEFAULT_GRID_OPTIONS,
    rowSelection: 'multiple',

    components: { iconCellRenderer: IconCellRendererComponent }
  };

  rowData = [];
  selectedRows = [];
  filteredRowsCount = 0;

  private readonly outboundLinkText = 'Outbound link';
  private readonly inboundLinkText = 'Inbound link';
  private readonly versionLinkText = 'Version link';

  ngOnChanges(changes: SimpleChanges): void {
    if (changes?.links?.currentValue) {
      this.rowData = this.generateRows(changes.links.currentValue);
      this.filteredRowsCount = this.rowData.length;
    }
  }

  onGridReady(params: GridReadyEvent): void {
    this.gridApi = params.api;
  }

  onFirstDataRendered(): void {
    const nodesToSelect: IRowNode[] = [];

    this.gridApi.forEachNode((node: IRowNode) => {
      if (node?.data?.selected) {
        nodesToSelect.push(node);
      }
    });

    this.gridApi.setNodesSelected({ nodes: nodesToSelect, newValue: true });
  }

  onSelectionChanged(): void {
    this.selectedRows = this.gridApi.getSelectedRows();
    this.selectedLinks.emit(this.selectedRows.map((r) => r.originalLink));
  }

  onFilterChanged(): void {
    let counter = 0;

    if (this?.gridApi) {
      this.gridApi.forEachNodeAfterFilter(() => {
        counter++;
      });
    }

    this.filteredRowsCount = counter;
  }

  private generateRows(links: Array<LinkDto>): Array<any> {
    var rows: Array<any> = [];

    links.forEach((link) => {
      const row = {
        selected: link.isRendered,
        targetType: link.targetType,
        linkType: link.linkType.value,
        targetName: link.targetName,
        originalLink: link
      };

      rows.push(row);
    });

    return rows;
  }

  private getLinkTypeIconParams(link: LinkDto): IconCellRendererParams {
    return link.isVersionLink
      ? ({
          fontIcon: 'link',
          tooltipText: this.versionLinkText
        } as IconCellRendererParams)
      : link.outbound
        ? ({
            svgIcon: 'assets/outgoing.svg',
            tooltipText: this.outboundLinkText
          } as IconCellRendererParams)
        : ({
            svgIcon: 'assets/incoming.svg',
            tooltipText: this.inboundLinkText
          } as IconCellRendererParams);
  }

  private getLinkTypeTextValue(link: LinkDto): string {
    return link.isVersionLink
      ? this.versionLinkText
      : link.outbound
        ? this.outboundLinkText
        : this.inboundLinkText;
  }

  private getTargetTypeIconParams(link: LinkDto): IconCellRendererParams {
    return {
      s3Icon: link.targetType
    } as IconCellRendererParams;
  }

  private getTargetTypeTextValue(link: LinkDto): string {
    return link.targetType;
  }
}
