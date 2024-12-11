import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FeedbackComponent } from './feedback.component';
import { LogService } from 'src/app/shared/services/log.service';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';

describe('FeedbackComponent', () => {
  let component: FeedbackComponent;
  let fixture: ComponentFixture<FeedbackComponent>;

  class MockLogService {
    info() {}
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [FeedbackComponent],
      imports: [
        MatButtonModule,
        MatIconModule,
        FormsModule,
        MatFormFieldModule
      ],
      providers: [
        {
          provide: LogService,
          useClass: MockLogService
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(FeedbackComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
