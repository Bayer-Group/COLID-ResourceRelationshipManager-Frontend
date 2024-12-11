import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchFilterDialogComponent } from './search-filter-dialog.component';
import { NgxsModule } from '@ngxs/store';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef
} from '@angular/material/dialog';
import { ResourceRelationshipManagerService } from 'src/app/shared/services/resource-relationship-manager.service';
import { Component, Input } from '@angular/core';

describe('SearchFilterDialogComponent', () => {
  let component: SearchFilterDialogComponent;
  let fixture: ComponentFixture<SearchFilterDialogComponent>;

  class MockMatDialogRef {
    close() {}
  }

  class MockResourceRelationshipManagerService {}

  @Component({
    selector: 'app-sidebar',
    template: ''
  })
  class MockSidebarComponent {}

  @Component({
    selector: 'app-search-bar-autocomplete',
    template: ''
  })
  class MockSearchBarAutocompleteComponent {
    @Input() initialSearchText;
  }

  @Component({
    selector: 'app-search-results',
    template: ''
  })
  class MockSearchResultsComponent {}

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        SearchFilterDialogComponent,
        MockSidebarComponent,
        MockSearchBarAutocompleteComponent,
        MockSearchResultsComponent
      ],
      imports: [NgxsModule.forRoot(), MatDialogModule],
      providers: [
        {
          provide: MatDialogRef,
          useClass: MockMatDialogRef
        },
        {
          provide: MAT_DIALOG_DATA,
          useValue: {}
        },
        {
          provide: ResourceRelationshipManagerService,
          useClass: MockResourceRelationshipManagerService
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SearchFilterDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
