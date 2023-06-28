import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SupportFeedbackBarComponent } from './support-feedback-bar.component';

describe('SupportFeedbackBarComponent', () => {
  let component: SupportFeedbackBarComponent;
  let fixture: ComponentFixture<SupportFeedbackBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SupportFeedbackBarComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SupportFeedbackBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
