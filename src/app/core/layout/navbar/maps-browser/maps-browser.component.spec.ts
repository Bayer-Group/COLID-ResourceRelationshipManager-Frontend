import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MapsBrowserComponent } from './maps-browser.component';

describe('MapsBrowserComponent', () => {
  let component: MapsBrowserComponent;
  let fixture: ComponentFixture<MapsBrowserComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MapsBrowserComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MapsBrowserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
