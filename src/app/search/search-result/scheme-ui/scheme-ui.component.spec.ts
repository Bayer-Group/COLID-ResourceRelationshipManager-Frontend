import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SchemeUIComponent } from './scheme-ui.component';
import { NgxsModule } from '@ngxs/store';
import { DatePipe } from '@angular/common';
import { MatDialogModule } from '@angular/material/dialog';
import { MatAccordion, MatExpansionModule } from '@angular/material/expansion';
import { Component, Input } from '@angular/core';

describe('SchemeUIComponent', () => {
  let component: SchemeUIComponent;
  let fixture: ComponentFixture<SchemeUIComponent>;

  @Component({
    selector: 'app-colid-spinner',
    template: ''
  })
  class MockColidSpinnerComponent {
    @Input() diameter: number = 100;
    @Input() strokeWidth: number = 5;
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SchemeUIComponent, MockColidSpinnerComponent],
      imports: [
        NgxsModule.forRoot(),
        MatDialogModule,
        MatAccordion,
        MatExpansionModule
      ],
      providers: [DatePipe]
    }).compileComponents();

    fixture = TestBed.createComponent(SchemeUIComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
