import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SupportFeedbackBarComponent } from './support-feedback-bar.component';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

describe('SupportFeedbackBarComponent', () => {
  let component: SupportFeedbackBarComponent;
  let fixture: ComponentFixture<SupportFeedbackBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SupportFeedbackBarComponent],
      imports: [MatIconModule, MatButtonModule]
    }).compileComponents();

    fixture = TestBed.createComponent(SupportFeedbackBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
