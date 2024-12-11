import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GraphDialogComponent } from './graph-dialog.component';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef
} from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { Component, Input } from '@angular/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { LinkDto } from 'src/app/shared/models/link-dto';

describe('GraphDialogComponent', () => {
  let component: GraphDialogComponent;
  let fixture: ComponentFixture<GraphDialogComponent>;

  const mockData = {
    links: [
      { targetName: 'test1' } as LinkDto,
      { targetName: 'test2' } as LinkDto
    ]
  };

  class MockMatDialogRef {
    close(): void {}
  }

  @Component({
    selector: 'app-links-visibility-tab',
    template: ''
  })
  class MockLinksVisibilityTabComponent {
    @Input() links: Array<LinkDto> = [];
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

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [
        GraphDialogComponent,
        MockLinksVisibilityTabComponent,
        MockLinkHistoryComponent
      ],
      imports: [
        NoopAnimationsModule,
        MatDialogModule,
        MatIconModule,
        MatTabsModule,
        MatButtonModule
      ],
      providers: [
        {
          provide: MatDialogRef,
          useClass: MockMatDialogRef
        },
        {
          provide: MAT_DIALOG_DATA,
          useValue: mockData
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(GraphDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should process selected links', () => {
    expect(component.links).toEqual(mockData.links);
    expect(component.linksToDisplay.length).toBe(0);

    component.processSelectedLinks([mockData.links[0]]);

    expect(component.linksToDisplay).toEqual([mockData.links[0]]);
  });

  it('should call dialog close with updated links', () => {
    component.linksToDisplay = [mockData.links[0]];

    const expectedLinksToShow = [mockData.links[0]];
    const expectedLinksToHide = [mockData.links[1]];
    const expectedRestoredLinks = [];

    const spy = spyOn(component.dialogRef, 'close').and.stub();

    component.updateLinks();

    expect(spy).toHaveBeenCalledOnceWith({
      displayedLinks: expectedLinksToShow,
      hiddenLinks: expectedLinksToHide,
      restoredLinks: expectedRestoredLinks
    });
  });
});
