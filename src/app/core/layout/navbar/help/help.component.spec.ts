import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HelpComponent } from './help.component';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { Component } from '@angular/core';

describe('HelpComponent', () => {
  let component: HelpComponent;
  let fixture: ComponentFixture<HelpComponent>;

  @Component({
    selector: 'app-support-feedback-bar',
    template: ''
  })
  class MockSupportFeedbackBarComponent {}

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [HelpComponent, MockSupportFeedbackBarComponent],
      imports: [MatDialogModule, MatIconModule],
      providers: [
        {
          provide: MAT_DIALOG_DATA,
          useValue: {}
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(HelpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
