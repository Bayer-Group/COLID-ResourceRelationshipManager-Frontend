import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { SidebarComponent } from './sidebar.component';
import { Component } from '@angular/core';

describe('SidebarComponent', () => {
  let component: SidebarComponent;
  let fixture: ComponentFixture<SidebarComponent>;

  @Component({
    selector: 'app-filter-panel',
    template: ''
  })
  class MockFilterPanelComponent {}

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [SidebarComponent, MockFilterPanelComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
