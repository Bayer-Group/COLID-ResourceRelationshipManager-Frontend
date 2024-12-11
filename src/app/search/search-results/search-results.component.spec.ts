import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchResultsComponent } from './search-results.component';
import { LogService } from 'src/app/shared/services/log.service';
import { NgxsModule } from '@ngxs/store';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { Component, Input } from '@angular/core';
import { SearchHit, DocumentMap } from 'src/app/shared/models/search-result';
import { MatDividerModule } from '@angular/material/divider';

describe('SearchResultsComponent', () => {
  let component: SearchResultsComponent;
  let fixture: ComponentFixture<SearchResultsComponent>;

  class MockLogService {
    info() {}
  }

  @Component({
    selector: 'app-search-result',
    template: ''
  })
  class MockSearchResultComponent {
    @Input() set result(value: SearchHit) {}
    @Input() set source(value: DocumentMap) {}
    @Input() metadata: any;
    @Input() collapsible: boolean = true;
    @Input() expandByDefault: boolean = false;
    @Input() hideCheckbox: boolean = true;
    @Input() resourceLinkedLifecycleStatus: string | null;
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
        SearchResultsComponent,
        MockSearchResultComponent,
        MockColidSpinnerComponent
      ],
      imports: [
        NgxsModule.forRoot(),
        CommonModule,
        MatIconModule,
        MatCheckboxModule,
        MatDividerModule
      ],
      providers: [
        {
          provide: LogService,
          useClass: MockLogService
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SearchResultsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
