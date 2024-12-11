import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { FilterBoxItemSwitchComponent } from './filter-box-item-switch.component';

describe('FilterBoxItemSwitchComponent', () => {
  let component: FilterBoxItemSwitchComponent;
  let fixture: ComponentFixture<FilterBoxItemSwitchComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [FilterBoxItemSwitchComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FilterBoxItemSwitchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should toggle active state', () => {
    component.active = false;

    let spy = spyOn(component.changeFilterBucket, 'emit');

    component.changeFilterItem();
    expect(component.active).toBeTrue();
    expect(spy).toHaveBeenCalledWith(true);

    component.changeFilterItem();
    expect(component.active).toBeFalse();
    expect(spy).toHaveBeenCalledWith(false);
  });
});
