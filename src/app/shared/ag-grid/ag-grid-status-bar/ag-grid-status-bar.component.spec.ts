import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgGridStatusBarComponent } from './ag-grid-status-bar.component';
import { CommonModule } from '@angular/common';

describe('AgGridStatusBarComponent', () => {
  let component: AgGridStatusBarComponent;
  let fixture: ComponentFixture<AgGridStatusBarComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [AgGridStatusBarComponent, CommonModule]
    }).compileComponents();

    fixture = TestBed.createComponent(AgGridStatusBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should only show select rows count if value is provided');
});
