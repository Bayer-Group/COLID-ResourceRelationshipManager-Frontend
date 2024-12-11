import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchResultStandaloneContainerComponent } from './search-result-standalone-container.component';
import { NgxsModule } from '@ngxs/store';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

describe('SearchResultStandaloneContainerComponent', () => {
  let component: SearchResultStandaloneContainerComponent;
  let fixture: ComponentFixture<SearchResultStandaloneContainerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SearchResultStandaloneContainerComponent],
      imports: [NgxsModule.forRoot([]), MatProgressSpinnerModule]
    }).compileComponents();

    fixture = TestBed.createComponent(SearchResultStandaloneContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
