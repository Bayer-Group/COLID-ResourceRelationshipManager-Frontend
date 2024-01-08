import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MapDetailsDialogComponent } from './map-details-dialog.component';

describe('MapDetailsDialogComponent', () => {
  let component: MapDetailsDialogComponent;
  let fixture: ComponentFixture<MapDetailsDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MapDetailsDialogComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MapDetailsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
