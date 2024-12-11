import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SimpleInformationDialogComponent } from './simple-information-dialog.component';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';

describe('SimpleInformationDialogComponent', () => {
  let component: SimpleInformationDialogComponent;
  let fixture: ComponentFixture<SimpleInformationDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SimpleInformationDialogComponent, MatDialogModule],
      providers: [
        {
          provide: MAT_DIALOG_DATA,
          useValue: {}
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SimpleInformationDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
