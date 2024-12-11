import { GridOptions } from '@ag-grid-community/core';

export const DEFAULT_GRID_OPTIONS: GridOptions = {
  defaultColDef: {
    sortable: true,
    unSortIcon: true,
    editable: false,
    filter: true,
    autoHeight: false,
    wrapHeaderText: true,
    autoHeaderHeight: true
  },

  enableCellTextSelection: true,
  rowSelection: 'single',
  rowMultiSelectWithClick: false,

  suppressRowDrag: true,
  suppressRowClickSelection: true,

  tooltipShowDelay: 500
};
