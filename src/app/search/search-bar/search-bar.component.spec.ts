import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchBarComponent } from './search-bar.component';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatOptionModule } from '@angular/material/core';
import { FormsModule } from '@angular/forms';
import { Directive, Input } from '@angular/core';

describe('SearchBarComponent', () => {
  let component: SearchBarComponent;
  let fixture: ComponentFixture<SearchBarComponent>;

  @Directive({
    selector: '[debounce]'
  })
  class MockDebounceDirective {
    @Input('debounce')
    public debounceTime = 500;
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SearchBarComponent, MockDebounceDirective],
      imports: [
        NoopAnimationsModule,
        CommonModule,
        FormsModule,
        MatAutocompleteModule,
        MatIconModule,
        MatInputModule,
        MatFormFieldModule,
        MatOptionModule
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SearchBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
