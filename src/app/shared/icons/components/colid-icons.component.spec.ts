import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ColidIconsComponent } from './colid-icons.component';

describe('ColidIconsComponent', () => {
  let component: ColidIconsComponent;
  let fixture: ComponentFixture<ColidIconsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ColidIconsComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ColidIconsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
