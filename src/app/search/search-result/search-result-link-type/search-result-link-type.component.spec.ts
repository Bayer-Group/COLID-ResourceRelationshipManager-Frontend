import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchResultLinkTypeComponent } from './search-result-link-type.component';
import { LogService } from 'src/app/shared/services/log.service';
import { Component, Input } from '@angular/core';
import { IconTypes } from 'src/app/shared/icons/models/icon-types';

describe('SearchResultLinkTypeComponent', () => {
  let component: SearchResultLinkTypeComponent;
  let fixture: ComponentFixture<SearchResultLinkTypeComponent>;

  class MockLogService {
    info() {}
  }

  @Component({
    selector: 'ds-icon',
    template: ''
  })
  class MockColidIconsComponent {
    @Input() icon: string = '';
    @Input() delay: number = 0;
    @Input() tooltip: string = '';
    @Input() tooltipDisabled: boolean = true;
    @Input() iconType: IconTypes = IconTypes.Default;
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SearchResultLinkTypeComponent, MockColidIconsComponent],
      providers: [{ provide: LogService, useClass: MockLogService }]
    }).compileComponents();

    fixture = TestBed.createComponent(SearchResultLinkTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // TODO: need to provide proper input values
  xit('should create', () => {
    expect(component).toBeTruthy();
  });
});
