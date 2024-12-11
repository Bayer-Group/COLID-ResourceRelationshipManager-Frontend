import { GridApi } from '@ag-grid-community/core';
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-ag-grid-filtering-bar',
  standalone: true,
  imports: [FormsModule, MatButtonModule, MatIconModule, MatTooltipModule],
  templateUrl: './ag-grid-filtering-bar.component.html',
  styleUrl: './ag-grid-filtering-bar.component.scss'
})
export class AgGridFilteringBarComponent implements OnChanges {
  @Input() gridApi: GridApi;

  quickFilterValue = '';

  ngOnChanges(changes: SimpleChanges): void {
    if (changes?.gridApi?.currentValue) {
      this.gridApi = changes.gridApi.currentValue;
    }
  }

  applyQuickFilter(): void {
    this.gridApi.setGridOption('quickFilterText', this.quickFilterValue);
  }

  resetAllFilters(): void {
    this.quickFilterValue = '';
    this.applyQuickFilter();

    this.gridApi.setFilterModel(null);
    this.gridApi.onFilterChanged();

    this.gridApi.applyColumnState({ defaultState: { sort: null } });
    this.gridApi.onSortChanged();
  }
}
