import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SimilarityModalComponent } from './similarity-modal.component';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef
} from '@angular/material/dialog';
import { DocumentService } from 'src/app/shared/services/document.service';
import { SimilarityService } from 'src/app/shared/services/similarity.service';
import { NgxsModule } from '@ngxs/store';
import { MatIconModule } from '@angular/material/icon';
import { Component, Input } from '@angular/core';
import { SearchHit, DocumentMap } from 'src/app/shared/models/search-result';

describe('SimilarityModalComponent', () => {
  let component: SimilarityModalComponent;
  let fixture: ComponentFixture<SimilarityModalComponent>;

  class MockMatDialogRef {
    close() {}
  }

  class MockDocumentService {}

  class MockSimilarityService {}

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
    selector: 'app-feedback',
    template: ''
  })
  class MockFeedbackComponent {
    @Input() payload: object;
    @Input() feature: string;
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
        SimilarityModalComponent,
        MockSearchResultComponent,
        MockFeedbackComponent,
        MockColidSpinnerComponent
      ],
      imports: [NgxsModule.forRoot(), MatDialogModule, MatIconModule],
      providers: [
        { provide: MatDialogRef, useClass: MockMatDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: {} },
        { provide: DocumentService, useClass: MockDocumentService },
        { provide: SimilarityService, useClass: MockSimilarityService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SimilarityModalComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
