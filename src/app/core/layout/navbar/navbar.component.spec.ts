import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { NavbarComponent } from './navbar.component';
import { Store } from '@ngxs/store';
import { StatusApiService } from 'src/app/shared/services/status.api.service';
import { MatDialog } from '@angular/material/dialog';
import { Observable, of } from 'rxjs';
import { HelpComponent } from './help/help.component';
import { ResetAll } from 'src/app/state/graph-data.state';
import { ResetLinking } from 'src/app/state/graph-linking.state';
import { SetCurrentMap } from 'src/app/state/map-data.state';
import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { StatusBuildInformationDto } from 'src/app/shared/models/dto/status-build-information-dto';

describe('NavbarComponent', () => {
  let component: NavbarComponent;
  let fixture: ComponentFixture<NavbarComponent>;

  let store: jasmine.SpyObj<Store>;
  let dialog: jasmine.SpyObj<MatDialog>;

  @Component({
    selector: 'colid-map',
    template: ''
  })
  class StubMapComponent {}

  @Component({
    selector: 'colid-view',
    template: ''
  })
  class StubViewComponent {}

  @Component({
    selector: 'colid-resource',
    template: ''
  })
  class StubResourceComponent {}

  @Component({
    selector: 'colid-linking',
    template: ''
  })
  class StubLinkingComponent {}

  @Component({
    selector: 'colid-authentication',
    template: ''
  })
  class StubAuthenticationComponent {}

  const mockBuildInfo: StatusBuildInformationDto = {
    versionNumber: 'mock',
    latestReleaseDate: new Date('2024-12-11'),
    imageTags: ['hello', 'world']
  };

  class MockStatusApiService {
    getBuildInformation(): Observable<StatusBuildInformationDto> {
      return of(mockBuildInfo);
    }
  }

  beforeEach(async () => {
    const storeSpy = jasmine.createSpyObj('Store', ['dispatch']);
    const dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);

    await TestBed.configureTestingModule({
      declarations: [
        NavbarComponent,
        StubMapComponent,
        StubViewComponent,
        StubResourceComponent,
        StubLinkingComponent,
        StubAuthenticationComponent
      ],
      imports: [MatIconModule],
      providers: [
        { provide: Store, useValue: storeSpy },
        { provide: StatusApiService, useClass: MockStatusApiService },
        { provide: MatDialog, useValue: dialogSpy }
      ]
    }).compileComponents();

    store = TestBed.inject(Store) as jasmine.SpyObj<Store>;
    dialog = TestBed.inject(MatDialog) as jasmine.SpyObj<MatDialog>;
    fixture = TestBed.createComponent(NavbarComponent);

    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load build information', waitForAsync(() => {
    component.ngOnInit();

    component.buildInformation$.subscribe((data) => {
      expect(data).toEqual(mockBuildInfo);
    });
  }));

  it('should do a reset for a new map', () => {
    component.newMap();

    expect(store.dispatch).toHaveBeenCalledWith(new SetCurrentMap(null));
    expect(store.dispatch).toHaveBeenCalledWith(new ResetAll());
    expect(store.dispatch).toHaveBeenCalledWith(new ResetLinking());
  });

  it('should open help dialog with build information', () => {
    component.openHelpDialog();

    expect(dialog.open).toHaveBeenCalledWith(HelpComponent, {
      data: {
        buildInformation$: component.buildInformation$
      }
    });
  });
});
