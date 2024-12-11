import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddLinkDialogComponent } from './add-link-dialog.component';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef
} from '@angular/material/dialog';
import { ResourceRelationshipManagerService } from 'src/app/shared/services/resource-relationship-manager.service';
import { NgxsModule } from '@ngxs/store';
import { InfiniteScrollDirective } from 'ngx-infinite-scroll';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';

describe('AddLinkDialogComponent', () => {
  let component: AddLinkDialogComponent;
  let fixture: ComponentFixture<AddLinkDialogComponent>;

  class MockMatDialogRef {
    close() {}
  }

  class MockResourceRelationshipManagerService {
    getLinkTypes() {}
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AddLinkDialogComponent],
      imports: [
        NgxsModule.forRoot(),
        MatDialogModule,
        InfiniteScrollDirective,
        MatProgressBarModule,
        MatTableModule
      ],
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

    fixture = TestBed.createComponent(AddLinkDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
