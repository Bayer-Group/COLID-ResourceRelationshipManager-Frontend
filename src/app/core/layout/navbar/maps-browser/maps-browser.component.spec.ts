import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MapsBrowserComponent } from './maps-browser.component';
import { AgGridAngular } from '@ag-grid-community/angular';
import { CdkTrapFocus } from '@angular/cdk/a11y';
import { CdkCopyToClipboard } from '@angular/cdk/clipboard';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef
} from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { InfiniteScrollDirective } from 'ngx-infinite-scroll';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { NgxsModule } from '@ngxs/store';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { ResourceRelationshipManagerService } from 'src/app/shared/services/resource-relationship-manager.service';
import { NotificationService } from 'src/app/shared/services/notification.service';
import { AuthService } from 'src/app/modules/authentication/services/auth.service';
import { GraphMapInfo } from 'src/app/shared/models/graph-map-info';
import { ResetLinkEditHistory } from 'src/app/state/graph-linking.state';
import { EMPTY, of } from 'rxjs';
import {
  LoadMap,
  LoadSecondMap,
  SetIsOwner
} from 'src/app/state/map-data.state';
import { GridApi } from '@ag-grid-community/core';

describe('MapsBrowserComponent', () => {
  let component: MapsBrowserComponent;
  let fixture: ComponentFixture<MapsBrowserComponent>;

  const mockMap: GraphMapInfo = {
    id: 'mockId',
    description: 'mockDesc',
    name: 'mockName',
    nodeCount: 1,
    modifiedBy: 'mock@user.com',
    modifiedAt: '2024-08-27T19:43:57.76794',
    pidUri: 'mockUri'
  };

  const mockData = {};

  class MockMatDialogRef {
    close(): void {}
  }

  class MockAuthService {
    hasSuperAdminPrivilege$ = EMPTY;
  }

  class MockNotificationService {}

  class MockResourceRelationshipManagerService {}

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        MapsBrowserComponent,
        CommonModule,
        NoopAnimationsModule,
        NgxsModule.forRoot(),
        AgGridAngular,
        FormsModule,
        MatDialogModule,
        MatTableModule,
        MatButtonModule,
        MatIconModule,
        MatTooltipModule,
        MatProgressBarModule,
        MatSnackBarModule,
        CdkTrapFocus,
        CdkCopyToClipboard,
        InfiniteScrollDirective
      ],
      providers: [
        {
          provide: MatDialogRef,
          useClass: MockMatDialogRef
        },
        {
          provide: MAT_DIALOG_DATA,
          useValue: mockData
        },
        {
          provide: AuthService,
          useClass: MockAuthService
        },
        {
          provide: NotificationService,
          useClass: MockNotificationService
        },
        {
          provide: ResourceRelationshipManagerService,
          useClass: MockResourceRelationshipManagerService
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MapsBrowserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should count filtered rows', () => {
    component.gridApi = {
      forEachNodeAfterFilter(callback: (rowNode: any, index: number) => void) {
        callback({}, 0);
        callback({}, 1);
      }
    } as GridApi;

    component.onFilterChanged();

    expect(component.filteredRowsCount).toBe(2);
  });

  it('should generate table rows', () => {
    const expectedRows = [
      {
        name: 'mockName',
        description: 'mockDesc',
        nodeCount: 1,
        modifiedAt: '2024-08-27T19:43:57.76794',
        modifiedBy: 'mock@user.com',
        browsableUri: 'mockUri',
        originalMap: mockMap
      }
    ];

    const result = component['generateRows']([mockMap]);

    expect(result).toEqual(expectedRows);
  });

  it('should open own map and set owner', () => {
    const mockResetLinkEditHistoryAction: ResetLinkEditHistory =
      new ResetLinkEditHistory();
    const mockLoadMapAction: LoadMap = new LoadMap(mockMap.id);
    const mockSetIsOwnerAction = new SetIsOwner(true); // current user is map owner

    const spyOnDispatch = spyOn(component['store'], 'dispatch').and.returnValue(
      of(true)
    );
    const spyOnDialogRef = spyOn(component.dialogRef, 'close').and.stub();

    component.currentUser = mockMap.modifiedBy;
    component['openMap'](mockMap);

    expect(spyOnDispatch).toHaveBeenCalledWith(mockResetLinkEditHistoryAction);
    expect(spyOnDispatch).toHaveBeenCalledWith(mockLoadMapAction);
    expect(spyOnDispatch).toHaveBeenCalledWith(mockSetIsOwnerAction);
    expect(spyOnDialogRef).toHaveBeenCalled();
  });

  it("should open someone else's map and NOT set owner", () => {
    const mockResetLinkEditHistoryAction: ResetLinkEditHistory =
      new ResetLinkEditHistory();
    const mockLoadMapAction: LoadMap = new LoadMap(mockMap.id);
    const mockSetIsOwnerAction = new SetIsOwner(false); // current user is not map owner

    const spyOnDispatch = spyOn(component['store'], 'dispatch').and.returnValue(
      of(true)
    );
    const spyOnDialogRef = spyOn(component.dialogRef, 'close').and.stub();

    component.currentUser = 'different@user.com';
    component['openMap'](mockMap);

    expect(spyOnDispatch).toHaveBeenCalledWith(mockResetLinkEditHistoryAction);
    expect(spyOnDispatch).toHaveBeenCalledWith(mockLoadMapAction);
    expect(spyOnDispatch).toHaveBeenCalledWith(mockSetIsOwnerAction);
    expect(spyOnDialogRef).toHaveBeenCalled();
  });

  it('should load map in current map, if second map flag is set', () => {
    const mockLoadSecondMapAction: LoadSecondMap = new LoadSecondMap(
      mockMap.id
    );

    const spyOnDispatch = spyOn(component['store'], 'dispatch').and.returnValue(
      of(true)
    );
    const spyOnDialogRef = spyOn(component.dialogRef, 'close').and.stub();

    component.data = { secondMap: true };
    component['openMap'](mockMap);

    expect(spyOnDispatch).toHaveBeenCalledWith(mockLoadSecondMapAction);
    expect(spyOnDialogRef).toHaveBeenCalled();
  });

  it('should close dialog on cancel button click', () => {
    const spyOnDialogRef = spyOn(component.dialogRef, 'close').and.stub();

    component.cancel();

    expect(spyOnDialogRef).toHaveBeenCalled();
  });

  it('should delete map on delete button click, if user is map owner or admin');

  it('should provide delete button params if user is map owner', () => {
    component.currentUser = mockMap.modifiedBy;
    component.isSuperAdmin = false;

    const result = component['getDeleteMapButtonParams'](mockMap.modifiedBy);

    expect(result.actions.length).toBe(1);
  });

  it('should provide delete button params if user is SuperAdmin', () => {
    component.currentUser = 'not the author';
    component.isSuperAdmin = true;

    const result = component['getDeleteMapButtonParams'](mockMap.modifiedBy);

    expect(result.actions.length).toBe(1);
  });

  it('should NOT provide delete button params if user is not a map owner or a SuperAdmin', () => {
    component.currentUser = 'not the author';
    component.isSuperAdmin = false;

    const result = component['getDeleteMapButtonParams'](mockMap.modifiedBy);

    expect(result.actions.length).toBe(0);
  });
});
