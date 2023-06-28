import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SaveMapDialogComponent } from './save-map-dialog.component';

describe('SaveMapDialogComponent', () => {
  let component: SaveMapDialogComponent;
  let fixture: ComponentFixture<SaveMapDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SaveMapDialogComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SaveMapDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
