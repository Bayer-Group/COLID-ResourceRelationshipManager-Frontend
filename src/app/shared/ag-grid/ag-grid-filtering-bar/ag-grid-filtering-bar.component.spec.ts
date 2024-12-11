import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgGridFilteringBarComponent } from './ag-grid-filtering-bar.component';
import { GridApi } from '@ag-grid-community/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

describe('AgGridFilteringBarComponent', () => {
  let component: AgGridFilteringBarComponent;
  let fixture: ComponentFixture<AgGridFilteringBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        AgGridFilteringBarComponent,
        FormsModule,
        MatButtonModule,
        MatIconModule,
        MatTooltipModule
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AgGridFilteringBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should apply quick filter', () => {
    const mockGridApi = {
      // Reason: necessary to mock the method
      // eslint-disable-next-line
      setGridOption: (option: string, value: string) => {}
    } as GridApi;

    component.ngOnChanges({
      gridApi: {
        currentValue: mockGridApi,
        previousValue: null,
        firstChange: true,
        isFirstChange: () => true
      }
    });

    spyOn(component.gridApi, 'setGridOption');

    component.quickFilterValue = 'test';
    component.applyQuickFilter();

    expect(component.gridApi.setGridOption).toHaveBeenCalledWith(
      'quickFilterText',
      'test'
    );
  });

  it('should remove all filters and sorting on button press', () => {
    const mockGridApi = {
      // Reason: necessary to mock the method
      // eslint-disable-next-line
      setFilterModel: (model: any) => {},
      onFilterChanged: () => {},
      // Reason: necessary to mock the method
      // eslint-disable-next-line
      applyColumnState: (state: any) => {},
      onSortChanged: () => {},
      // Reason: necessary to mock the method
      // eslint-disable-next-line
      setGridOption: (option: string, value: string) => {},
      getColumnState: () => {}
    } as GridApi;

    component.ngOnChanges({
      gridApi: {
        currentValue: mockGridApi,
        previousValue: null,
        firstChange: true,
        isFirstChange: () => true
      }
    });

    spyOn(component.gridApi, 'setFilterModel').and.stub();
    spyOn(component.gridApi, 'onFilterChanged').and.stub();
    spyOn(component.gridApi, 'applyColumnState').and.stub();
    spyOn(component.gridApi, 'onSortChanged').and.stub();

    component.resetAllFilters();

    expect(component.quickFilterValue).toBe('');
    expect(component.gridApi.setFilterModel).toHaveBeenCalledWith(null);
    expect(component.gridApi.onFilterChanged).toHaveBeenCalled();
    expect(component.gridApi.applyColumnState).toHaveBeenCalledWith({
      defaultState: { sort: null }
    });
    expect(component.gridApi.onSortChanged).toHaveBeenCalled();
  });
});
