import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchResultAttachmentComponent } from './search-result-attachment.component';
import { MatTooltipModule } from '@angular/material/tooltip';

describe('SearchResultAttachmentComponent', () => {
  let component: SearchResultAttachmentComponent;
  let fixture: ComponentFixture<SearchResultAttachmentComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SearchResultAttachmentComponent],
      imports: [MatTooltipModule]
    }).compileComponents();

    fixture = TestBed.createComponent(SearchResultAttachmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
