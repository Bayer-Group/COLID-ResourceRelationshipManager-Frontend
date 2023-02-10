import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SaveConfirmationDialogComponent } from './save-confirmation-dialog.component';

describe('SaveConfirmationDialogComponent', () => {
  let component: SaveConfirmationDialogComponent;
  let fixture: ComponentFixture<SaveConfirmationDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SaveConfirmationDialogComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SaveConfirmationDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
