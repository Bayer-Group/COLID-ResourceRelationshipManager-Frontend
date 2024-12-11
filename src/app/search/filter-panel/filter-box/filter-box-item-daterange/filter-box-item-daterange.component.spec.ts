import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FilterBoxItemDaterangeComponent } from './filter-box-item-daterange.component';
import { NgxsModule } from '@ngxs/store';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';

describe('FilterBoxItemDaterangeComponent', () => {
  let component: FilterBoxItemDaterangeComponent;
  let fixture: ComponentFixture<FilterBoxItemDaterangeComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [FilterBoxItemDaterangeComponent],
      imports: [
        NgxsModule.forRoot(),
        FormsModule,
        MatFormFieldModule,
        MatDatepickerModule,
        MatButtonModule,
        MatTooltipModule
      ],
      providers: [DatePipe]
    }).compileComponents();

    fixture = TestBed.createComponent(FilterBoxItemDaterangeComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  // TODO: need to provide proper input values
  xit('should create', () => {
    expect(component).toBeTruthy();
  });
});
