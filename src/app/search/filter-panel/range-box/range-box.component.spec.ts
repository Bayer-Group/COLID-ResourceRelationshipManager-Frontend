import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RangeBoxComponent } from './range-box.component';
import { NgxsModule } from '@ngxs/store';
import { Component, Input } from '@angular/core';
import {
  RangeFilter,
  RangeFilterSelection
} from 'src/app/shared/models/range-filter';

describe('RangeBoxComponent', () => {
  let component: RangeBoxComponent;
  let fixture: ComponentFixture<RangeBoxComponent>;

  @Component({
    selector: 'app-filter-box-item-daterange',
    template: ''
  })
  class MockFilterBoxItemDaterangeComponent {
    @Input() key: string;
    @Input() rangeFilter: RangeFilter;
    @Input() set selection(rangeFilter: RangeFilterSelection) {}
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RangeBoxComponent, MockFilterBoxItemDaterangeComponent],
      imports: [NgxsModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(RangeBoxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
