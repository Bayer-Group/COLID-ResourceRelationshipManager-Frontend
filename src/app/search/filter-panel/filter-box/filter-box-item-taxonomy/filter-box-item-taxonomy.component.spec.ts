import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { FilterBoxItemTaxonomyComponent } from './filter-box-item-taxonomy.component';
import { NgxsModule } from '@ngxs/store';

describe('FilterBoxItemTaxonomyComponent', () => {
  let component: FilterBoxItemTaxonomyComponent;
  let fixture: ComponentFixture<FilterBoxItemTaxonomyComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [NgxsModule.forRoot()],
      declarations: [FilterBoxItemTaxonomyComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FilterBoxItemTaxonomyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
