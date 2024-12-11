import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { NgxsModule } from '@ngxs/store';
import { EMPTY } from 'rxjs';
import { AuthService } from './modules/authentication/services/auth.service';
import { ColidIconsService } from './shared/icons/services/colid-icons.service';
import { NotificationService } from './shared/services/notification.service';
import { Component } from '@angular/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;

  class MockColidIconsService {
    getCustomMaterialIcons() {
      return [];
    }
  }

  class MockAuthService {
    isLoggedIn$ = EMPTY;
    currentIdentity$ = EMPTY;
    currentEmail$ = EMPTY;
    cleanup() {}
  }

  class MockNotificationService {
    notification$ = EMPTY;
  }

  @Component({
    selector: 'colid-main-layout',
    template: ''
  })
  class MockMainLayoutComponent {}

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AppComponent, MockMainLayoutComponent],
      imports: [
        NoopAnimationsModule,
        NgxsModule.forRoot(),
        MatSnackBarModule,
        HttpClientModule
      ],
      providers: [
        { provide: ColidIconsService, useClass: MockColidIconsService },
        { provide: AuthService, useClass: MockAuthService },
        { provide: NotificationService, useClass: MockNotificationService },
        { provide: MatSnackBar, useValue: {} }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
