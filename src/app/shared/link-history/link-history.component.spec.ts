import { Component, Input } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { LinkHistoryDialogComponent } from 'src/app/features/home/link-history-dialog/link-history-dialog.component';

describe('LinkHistoryDialogComponent', () => {
  let component: LinkHistoryDialogComponent;
  let fixture: ComponentFixture<LinkHistoryDialogComponent>;

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
          useValue: {}
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
