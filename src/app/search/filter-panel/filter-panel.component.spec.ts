import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FilterPanelComponent } from './filter-panel.component';
import { NgxsModule } from '@ngxs/store';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { of } from 'rxjs';
import { Component, Input } from '@angular/core';
import { Aggregation } from 'src/app/shared/models/aggregation';
import { MatAccordion, MatExpansionModule } from '@angular/material/expansion';
import {
  RangeFilter,
  RangeFilterSelection
} from 'src/app/shared/models/range-filter';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

describe('FilterPanelComponent', () => {
  let component: FilterPanelComponent;
  let fixture: ComponentFixture<FilterPanelComponent>;

  const mockActivatedRoute = {
    snapshot: {
      paramMap: {
        get: () => 'mockValue'
      }
    },
    queryParams: of({ key: 'value' })
  };

  @Component({
    selector: 'app-filter-box',
    template: ''
  })
  class MockFilterBoxComponent {
    @Input() aggregation: Aggregation;
    @Input() activeAggregationBuckets: string[] = [];

    @Input() filterType:
      | 'taxonomy'
      | 'checkbox'
      | 'checkBoxHierarchy'
      | 'select' = 'checkbox';
  }

  @Component({
    selector: 'app-range-box',
    template: ''
  })
  class MockRangeBoxComponent {
    @Input() rangeFilter: RangeFilter;
    @Input() set activeRangeFilter(rangeFilter: RangeFilterSelection) {}
    @Input() initialRangeBox: boolean = false;
    @Input() last: boolean = false;
  }

  @Component({
    selector: 'app-colid-spinner',
    template: ''
  })
  class MockColidSpinnerComponent {
    @Input() diameter: number = 100;
    @Input() strokeWidth: number = 5;
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [
        FilterPanelComponent,
        MockFilterBoxComponent,
        MockRangeBoxComponent,
        MockColidSpinnerComponent
      ],
      imports: [
        NgxsModule.forRoot(),
        RouterModule,
        MatAccordion,
        MatExpansionModule,
        MatButtonModule,
        MatIconModule
      ],
      providers: [{ provide: ActivatedRoute, useValue: mockActivatedRoute }]
    }).compileComponents();

    fixture = TestBed.createComponent(FilterPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // TODO: needs proper data mocking
  xit('should create', () => {
    expect(component).toBeTruthy();
  });
});
