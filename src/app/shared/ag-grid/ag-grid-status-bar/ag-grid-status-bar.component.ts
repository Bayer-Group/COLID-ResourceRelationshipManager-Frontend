import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-ag-grid-status-bar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ag-grid-status-bar.component.html',
  styleUrl: './ag-grid-status-bar.component.scss'
})
export class AgGridStatusBarComponent implements OnChanges {
  @Input() totalRowsCount: number;
  @Input() filteredRowsCount: number;
  @Input() selectedRowsCount: number; // Optional, will not show the selected rows count if not provided

  ngOnChanges(changes: SimpleChanges): void {
    if (changes?.totalRowsCount?.currentValue) {
      this.totalRowsCount = changes.totalRowsCount.currentValue;
    }

    if (changes?.filteredRowsCount?.currentValue) {
      this.filteredRowsCount = changes.filteredRowsCount.currentValue;
    }

    if (changes?.selectedRowsCount?.currentValue) {
      this.selectedRowsCount = changes.selectedRowsCount.currentValue;
    }
  }
}
