import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SaveMapDialogComponent } from './save-map-dialog.component';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';

describe('SaveMapDialogComponent', () => {
  let component: SaveMapDialogComponent;
  let fixture: ComponentFixture<SaveMapDialogComponent>;

  class MockMatDialogRef {
    close() {}
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SaveMapDialogComponent],
      imports: [
        NoopAnimationsModule,
        FormsModule,
        MatDialogModule,
        MatFormFieldModule,
        MatInputModule
      ],
      providers: [
        {
          provide: MatDialogRef,
          useClass: MockMatDialogRef
        },
        {
          provide: MAT_DIALOG_DATA,
          useValue: {}
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SaveMapDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
