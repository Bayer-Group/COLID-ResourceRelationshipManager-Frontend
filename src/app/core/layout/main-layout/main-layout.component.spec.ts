import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MainLayoutComponent } from './main-layout.component';
import { NgxsModule } from '@ngxs/store';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDrawer, MatDrawerContainer } from '@angular/material/sidenav';
import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

describe('MainLayoutComponent', () => {
  let component: MainLayoutComponent;
  let fixture: ComponentFixture<MainLayoutComponent>;

  @Component({
    selector: 'colid-navbar',
    template: ''
  })
  class MockNavbarComponent {}

  @Component({
    selector: 'app-search-result-standalone-container',
    template: ''
  })
  class MockSearchResultStandaloneContainerComponent {}

  @Component({
    selector: 'app-support-feedback-bar',
    template: ''
  })
  class MockSupportFeedbackBarComponent {}

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        MainLayoutComponent,
        MockNavbarComponent,
        MockSearchResultStandaloneContainerComponent,
        MockSupportFeedbackBarComponent
      ],
      imports: [
        NoopAnimationsModule,
        CommonModule,
        RouterModule,
        NgxsModule.forRoot(),
        MatProgressBarModule,
        MatDrawer,
        MatDrawerContainer,
        MatIconModule
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MainLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
