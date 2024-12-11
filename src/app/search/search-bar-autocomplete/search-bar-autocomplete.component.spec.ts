import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchBarAutocompleteComponent } from './search-bar-autocomplete.component';
import { NgxsModule } from '@ngxs/store';
import { Component, Input } from '@angular/core';
import { Observable } from 'rxjs';

describe('SearchBarAutocompleteComponent', () => {
  let component: SearchBarAutocompleteComponent;
  let fixture: ComponentFixture<SearchBarAutocompleteComponent>;

  @Component({
    selector: 'app-search-bar',
    template: ''
  })
  class MockSearchBarComponent {
    @Input() initialSearchText: string;
    @Input() autocompleteResult: Observable<string[]>;
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SearchBarAutocompleteComponent, MockSearchBarComponent],
      imports: [NgxsModule.forRoot([])]
    }).compileComponents();

    fixture = TestBed.createComponent(SearchBarAutocompleteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
