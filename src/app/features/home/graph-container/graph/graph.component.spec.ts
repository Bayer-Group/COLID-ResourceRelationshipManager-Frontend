import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GraphComponent } from './graph.component';
import { NgxsModule } from '@ngxs/store';
import { MatDialogModule } from '@angular/material/dialog';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from 'src/app/modules/authentication/services/auth.service';
import { ResourceRelationshipManagerService } from 'src/app/shared/services/resource-relationship-manager.service';
import { NotificationService } from 'src/app/shared/services/notification.service';
import { CookieService } from 'ngx-cookie';
import { EMPTY, of } from 'rxjs';

describe('GraphComponent', () => {
  let component: GraphComponent;
  let fixture: ComponentFixture<GraphComponent>;

  class MockAuthService {
    isAuthenticated() {}

    getDecodedToken() {}
  }

  class MockResourceRelationshipManagerService {
    getResources() {}

    pidUrisToLoadResources$ = EMPTY;
  }

  class MockNotificationService {}

  class MockCookieService {
    getObject() {}
  }

  const mockActivatedRoute = {
    snapshot: {
      paramMap: {
        get: () => 'mockValue'
      }
    },
    queryParams: of({ key: 'value' })
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [GraphComponent],
      imports: [
        NgxsModule.forRoot(),
        MatDialogModule,
        RouterModule,
        MatSnackBarModule
      ],
      providers: [
        {
          provide: AuthService,
          useClass: MockAuthService
        },
        {
          provide: ResourceRelationshipManagerService,
          useClass: MockResourceRelationshipManagerService
        },
        {
          provide: NotificationService,
          useClass: MockNotificationService
        },
        {
          provide: CookieService,
          useClass: MockCookieService
        },
        {
          provide: ActivatedRoute,
          useValue: mockActivatedRoute
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(GraphComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should reinitialize graph when browser window is resized');

  it('should initialize graph');

  it('should subscribe to linking properties');

  it('should subscribe to map data properties');

  it('should subscribe to saving trigger listener');

  it('should subscribe to graph data changes');

  it('should subscribe to sidebar state');

  it('should load resources and expand nodes if start URI is present');

  it('should load resources provided by dialogs in the service storage var');

  it(
    'should load selected resources stored in cookie if viewSelectedResources is set'
  );

  it(
    'should open dialog with all incoming and outgoing links of a node, without duplicates'
  );

  it('should draw deleted links restored in the dialog');

  it('should draw links selected in the dialog');

  it('should hide links deselected in the dialog');

  it('should show link context menu for directional links');

  it('should not show link context menu for version links');

  it('should show main context menu for multiple selected nodes');

  it('should show node context menu for single node');

  it('should call state to add node to be linked');

  it('should call state to remove directional link and add link history entry');

  it('should not call state to remove a version link');

  it('should open link history dialog');

  it('should expand a node');

  it('should count all links of a node');

  it('should expand all links of a node');

  it('should count all incoming links of a node');

  it('should expand all incoming links of a node');

  it('should count all outgoing links of a node');

  it('should expand all outgoing links of a node');

  it('should count links of a given relationship type of a node');

  it('should count links of a given linked resource type of a node');

  it('should create a list of relationship types of a node for context menu');

  it('should expand links of a given relationship type of a node');

  it(
    'should create a list of linked resource types of a node for context menu, and count them'
  );

  it('should expand links of a given linked resource type of a node');

  it('should select linked nodes');

  it('should hide node');

  it('should hide all highlighted nodes');

  it('should delete all highlighted links');

  it('should load second map');

  it('should load new map');

  it('should set double click X position');

  it('should apply filter: no filter set');

  it('should apply filter: outbound only');

  it('should apply filter: inbound only');

  it('should apply filter: link type only');

  it('should apply filter: resource type only');
});
