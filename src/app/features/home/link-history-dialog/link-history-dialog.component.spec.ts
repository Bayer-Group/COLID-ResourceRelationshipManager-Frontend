import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LinkHistoryDialogComponent } from './link-history-dialog.component';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef
} from '@angular/material/dialog';
import { Component, Input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

describe('LinkHistoryDialogComponent', () => {
  let component: LinkHistoryDialogComponent;
  let fixture: ComponentFixture<LinkHistoryDialogComponent>;

  class MockMatDialogRef {
    close() {}
  }

  @Component({
    selector: 'colid-link-history',
    template: ''
  })
  class MockLinkHistoryComponent {
    @Input() startPidUri: string;
    @Input() endPidUri: string;
    @Input() isNodeLinkHistory = true;
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LinkHistoryDialogComponent, MockLinkHistoryComponent],
      imports: [MatDialogModule, MatIconModule],
      providers: [
        {
          provide: MAT_DIALOG_DATA,
          useValue: {
            startPidUri: 'http://pid.start',
            endPidUri: 'http://pid.end'
          }
        },
        {
          provide: MatDialogRef,
          useClass: MockMatDialogRef
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LinkHistoryDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
