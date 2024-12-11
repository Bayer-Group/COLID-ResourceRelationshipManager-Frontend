import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MapDetailsDialogComponent } from './map-details-dialog.component';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { DatePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { GraphMapMetadata } from 'src/app/shared/models/graph-map-metadata';

// TODO: to be fixed in separate story
xdescribe('MapDetailsDialogComponent', () => {
  let component: MapDetailsDialogComponent;
  let fixture: ComponentFixture<MapDetailsDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        MapDetailsDialogComponent,
        MatDividerModule,
        MatIconModule,
        MatButtonModule,
        MatTooltipModule,
        MatDialogModule,
        DatePipe,
        ClipboardModule
      ],
      providers: [
        {
          provide: MAT_DIALOG_DATA,
          useValue: {} as GraphMapMetadata
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MapDetailsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
