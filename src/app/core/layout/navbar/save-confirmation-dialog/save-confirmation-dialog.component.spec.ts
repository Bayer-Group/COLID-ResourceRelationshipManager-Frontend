import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SaveConfirmationDialogComponent } from './save-confirmation-dialog.component';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';

describe('SaveConfirmationDialogComponent', () => {
  let component: SaveConfirmationDialogComponent;
  let fixture: ComponentFixture<SaveConfirmationDialogComponent>;

  class MockMatDialogRef {
    close() {}
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SaveConfirmationDialogComponent],
      imports: [MatDialogModule],
      providers: [
        {
          provide: MatDialogRef,
          useClass: MockMatDialogRef
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SaveConfirmationDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
